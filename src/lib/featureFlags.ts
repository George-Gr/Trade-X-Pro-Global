/**
 * Secure Feature Flag Management System
 * 
 * Provides secure feature flag management with server-side validation
 * to prevent client-side manipulation of feature flags.
 */

import React from 'react';
import { z } from 'zod';

/**
 * Feature flag types
 */
export type FeatureFlagKey =
  | 'advanced_charts'
  | 'copy_trading'
  | 'api_access'
  | 'real_time_data'
  | 'advanced_analytics'
  | 'risk_management_tools'
  | 'portfolio_optimization'
  | 'algorithmic_trading';

/**
 * Feature flag schema
 */
export const featureFlagSchema = z.object({
  key: z.enum([
    'advanced_charts',
    'copy_trading',
    'api_access',
    'real_time_data',
    'advanced_analytics',
    'risk_management_tools',
    'portfolio_optimization',
    'algorithmic_trading'
  ] as const),
  enabled: z.boolean(),
  rolloutPercentage: z.number().min(0).max(100),
  environments: z.array(z.enum(['development', 'staging', 'production'] as const)),
  dependencies: z.array(z.string()).optional(),
  description: z.string().optional(),
});

/**
 * Feature flag configuration
 */
export type FeatureFlag = z.infer<typeof featureFlagSchema>;

/**
 * Server-side feature flag response
 */
export interface ServerFeatureFlags {
  flags: FeatureFlag[];
  timestamp: string;
  version: string;
  checksum: string; // SHA-256 checksum for integrity verification
}

/**
 * Server response schema for validation
 */
export const serverFeatureFlagsSchema = z.object({
  flags: z.array(featureFlagSchema),
  timestamp: z.string(),
  version: z.string(),
  checksum: z.string(),
});

/**
 * Feature flag state
 */
export interface FeatureFlagState {
  [key: string]: boolean;
}

/**
 * Feature flag service for server-side validation
 */
class FeatureFlagService {
  private flags: FeatureFlagState = {};
  private lastUpdated: number = 0;
  private updateInterval: number = 30 * 60 * 1000; // 30 minutes
  private updateTimer: number | null = null;

  /**
   * Initialize feature flags from server
   */
  async initialize(): Promise<void> {
    try {
      // Fetch feature flags from server
      const response = await fetch('/api/feature-flags', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getUserToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch feature flags: ${response.status}`);
      }

      const data = await response.json();
      await this.validateAndApplyFlags(data);

      // Start periodic updates
      this.startPeriodicUpdates();
    } catch (error) {
      console.warn('Failed to initialize feature flags, using defaults:', error);
      this.applyDefaultFlags();
    }
  }

  /**
   * Validate and apply server-side feature flags
   */
  private async validateAndApplyFlags(data: unknown): Promise<void> {
    try {
      // Validate server response
      const validatedData: ServerFeatureFlags = this.validateServerResponse(data);

      // Verify checksum for integrity
      if (!this.verifyChecksum(validatedData)) {
        throw new Error('Feature flags checksum verification failed');
      }

      // Apply validated flags
      const flags: FeatureFlagState = {};
      validatedData.flags.forEach(flag => {
        if (this.shouldEnableFlag(flag)) {
          flags[flag.key] = true;
        }
      });

      this.flags = flags;
      this.lastUpdated = Date.now();

      // Dispatch event for components to react
      window.dispatchEvent(new CustomEvent('feature-flags:updated', {
        detail: { flags: this.flags }
      }));
    } catch (error) {
      console.error('Error validating feature flags:', error);
      throw error;
    }
  }

  /**
   * Validate server response schema
   */
  private validateServerResponse(data: unknown): ServerFeatureFlags {
    const result = serverFeatureFlagsSchema.safeParse(data);
    if (!result.success) {
      throw new Error(`Invalid server response: ${result.error.message}`);
    }
    const validated = result.data as unknown as ServerFeatureFlags;
    if (!Array.isArray(validated.flags)) {
      throw new Error('Invalid response: flags must be an array');
    }
    return validated;
  }

  /**
   * Verify checksum for data integrity
   */
  private async verifyChecksum(data: ServerFeatureFlags): Promise<boolean> {
    try {
      // Create data string for checksum verification
      const dataString = JSON.stringify({
        flags: data.flags,
        timestamp: data.timestamp,
        version: data.version,
      });

      // Calculate SHA-256 hash
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(dataString);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const calculatedChecksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      return calculatedChecksum === data.checksum;
    } catch (error) {
      console.error('Checksum verification failed:', error);
      return false;
    }
  }

  /**
   * Determine if a flag should be enabled based on various criteria
   */
  private shouldEnableFlag(flag: FeatureFlag): boolean {
    // Check if current environment is allowed
    const currentEnv = import.meta.env.MODE as 'development' | 'staging' | 'production';
    if (!flag.environments.includes(currentEnv)) {
      return false;
    }

    // Check dependencies
    if (flag.dependencies) {
      for (const dep of flag.dependencies) {
        if (!this.flags[dep]) {
          return false;
        }
      }
    }

    // Check rollout percentage (deterministic based on user ID)
    if (flag.rolloutPercentage < 100) {
      const userId = this.getUserId();
      if (userId) {
        const hash = this.hashString(userId + flag.key);
        const percentage = (hash % 100) + 1;
        if (percentage > flag.rolloutPercentage) {
          return false;
        }
      } else {
        // No user ID, use session-based rollout
        const sessionId = this.getSessionId();
        const hash = this.hashString(sessionId + flag.key);
        const percentage = (hash % 100) + 1;
        if (percentage > flag.rolloutPercentage) {
          return false;
        }
      }
    }

    return flag.enabled;
  }

  /**
   * Apply default feature flags for fallback
   */
  private applyDefaultFlags(): void {
    this.flags = {
      advanced_charts: import.meta.env.MODE === 'development',
      copy_trading: false,
      api_access: false,
      real_time_data: true,
      advanced_analytics: false,
      risk_management_tools: true,
      portfolio_optimization: false,
      algorithmic_trading: false,
    };

    window.dispatchEvent(new CustomEvent('feature-flags:updated', {
      detail: { flags: this.flags }
    }));
  }

  /**
   * Start periodic updates
   */
  private startPeriodicUpdates(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }

    this.updateTimer = setInterval(async () => {
      try {
        await this.initialize();
      } catch (error) {
        console.warn('Failed to update feature flags:', error);
      }
    }, this.updateInterval);
  }

  /**
   * Get feature flag state
   */
  isEnabled(flag: FeatureFlagKey): boolean {
    return this.flags[flag] || false;
  }

  /**
   * Get all feature flags
   */
  getAllFlags(): FeatureFlagState {
    return { ...this.flags };
  }

  /**
   * Check if feature flags are initialized
   */
  isInitialized(): boolean {
    return Object.keys(this.flags).length > 0;
  }

  /**
   * Get user token for authentication
   */
  private getUserToken(): string | null {
    // Get token from localStorage or sessionStorage
    return localStorage.getItem('sb-oaegicsinxhpilsihjxv-auth-token') ||
      sessionStorage.getItem('sb-oaegicsinxhpilsihjxv-auth-token');
  }

  /**
   * Get user ID for deterministic rollout
   */
  private getUserId(): string | null {
    try {
      const token = this.getUserToken();
      if (!token) return null;

      // Decode JWT to get user ID
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get session ID for session-based rollout
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('feature-flag-session-id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('feature-flag-session-id', sessionId);
    }
    return sessionId;
  }

  /**
   * Simple hash function for deterministic rollout
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }
}

// Global feature flag service instance
export const featureFlags = new FeatureFlagService();

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  featureFlags.initialize();
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    featureFlags.destroy();
  });
}

/**
 * React hook for feature flags
 */
export function useFeatureFlag(flag: FeatureFlagKey): boolean {
  const [enabled, setEnabled] = React.useState<boolean>(() => featureFlags.isEnabled(flag));

  React.useEffect(() => {
    const handler = () => {
      setEnabled(featureFlags.isEnabled(flag));
    };

    window.addEventListener('feature-flags:updated', handler);
    return () => window.removeEventListener('feature-flags:updated', handler);
  }, [flag]);

  return enabled;
}

/**
 * HOC for feature flag gating
 */
export function withFeatureFlag<P extends object>(
  Component: React.ComponentType<P>,
  flag: FeatureFlagKey,
  FallbackComponent?: React.ComponentType<P>
) {
  return React.memo(function FeatureFlaggedComponent(props: P) {
    const enabled = useFeatureFlag(flag);

    if (!enabled) {
      if (FallbackComponent) {
        return React.createElement(FallbackComponent, { ...props });
      }
      return null;
    }

    return React.createElement(Component, { ...props });
  });
}

/**
 * Feature flag provider for React context
 */
export const FeatureFlagContext = React.createContext<FeatureFlagState>({});

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = React.useState<FeatureFlagState>(() => featureFlags.getAllFlags());

  React.useEffect(() => {
    const handler = (event: Event) => {
      const ce = event as CustomEvent<{ flags: FeatureFlagState }>;
      setFlags(ce.detail.flags);
    };

    window.addEventListener('feature-flags:updated', handler);
    return () => window.removeEventListener('feature-flags:updated', handler);
  }, []);

  return React.createElement(FeatureFlagContext.Provider, { value: flags }, children);
}

export default featureFlags;