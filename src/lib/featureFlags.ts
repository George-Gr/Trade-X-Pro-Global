/**
 * Feature Flag System for Authentication Flow Migration
 *
 * This module provides feature flags to safely rollout the PKCE authentication
 * flow migration from the implicit flow. It allows for gradual deployment
 * and easy rollback if issues are detected.
 */

import { logger } from './logger';

interface FeatureFlags {
  pkceAuthFlow: boolean;
  secureStorage: boolean;
  enhancedSecurityHeaders: boolean;
}

class FeatureFlagManager {
  private flags: FeatureFlags;
  private readonly STORAGE_KEY = 'trade_x_pro_feature_flags';
  private readonly DEFAULT_FLAGS: FeatureFlags = {
    pkceAuthFlow: true, // Force PKCE authentication (remove implicit fallback)
    secureStorage: true, // Force secure storage for sensitive data
    enhancedSecurityHeaders: true, // This is safe to enable immediately
  };

  constructor() {
    this.flags = this.loadFlags();
  }

  /**
   * Load feature flags from localStorage or use defaults
   */
  private loadFlags(): FeatureFlags {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const flags = { ...this.DEFAULT_FLAGS, ...parsed };

        // Enforce strict security capabilities in production
        if (import.meta.env.MODE === 'production') {
          return {
            ...flags,
            pkceAuthFlow: true,
            secureStorage: true,
            enhancedSecurityHeaders: true,
          };
        }

        return flags;
      }
    } catch (error: unknown) {
      logger.warn('Failed to load feature flags', {
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
    return { ...this.DEFAULT_FLAGS };
  }

  /**
   * Save feature flags to localStorage
   */
  private saveFlags(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.flags));
    } catch (error: unknown) {
      logger.warn('Failed to save feature flags', {
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  /**
   * Check if PKCE auth flow is enabled
   */
  isPkceAuthFlowEnabled(): boolean {
    if (import.meta.env.MODE === 'production') return true;
    return this.flags.pkceAuthFlow;
  }

  /**
   * Check if secure storage is enabled
   */
  isSecureStorageEnabled(): boolean {
    if (import.meta.env.MODE === 'production') return true;
    return this.flags.secureStorage;
  }

  /**
   * Check if enhanced security headers are enabled
   */
  isEnhancedSecurityHeadersEnabled(): boolean {
    if (import.meta.env.MODE === 'production') return true;
    return this.flags.enhancedSecurityHeaders;
  }

  /**
   * Enable PKCE auth flow
   */
  enablePkceAuthFlow(): void {
    this.flags.pkceAuthFlow = true;
    this.saveFlags();
    logger.info('PKCE auth flow enabled');
  }

  /**
   * Disable PKCE auth flow (rollback to implicit)
   * PKCE is mandatory in production
   */
  disablePkceAuthFlow(): void {
    if (import.meta.env.MODE === 'production') {
      logger.error(
        'Cannot disable PKCE auth flow - PKCE is mandatory in production'
      );
      throw new Error(
        'PKCE authentication is required for security compliance'
      );
    }

    this.flags.pkceAuthFlow = false;
    this.saveFlags();
    logger.warn('PKCE auth flow disabled (DEV/TEST ONLY)');
  }

  /**
   * Enable secure storage
   */
  enableSecureStorage(): void {
    this.flags.secureStorage = true;
    this.saveFlags();
    logger.info('Secure storage enabled');
  }

  /**
   * Disable secure storage (rollback to localStorage)
   * Secure storage is mandatory in production
   */
  disableSecureStorage(): void {
    if (import.meta.env.MODE === 'production') {
      logger.error(
        'Cannot disable secure storage - secure storage is mandatory in production'
      );
      throw new Error(
        'Secure storage is required for sensitive data protection'
      );
    }

    this.flags.secureStorage = false;
    this.saveFlags();
    logger.warn('Secure storage disabled (DEV/TEST ONLY)');
  }

  /**
   * Enable enhanced security headers
   */
  enableEnhancedSecurityHeaders(): void {
    this.flags.enhancedSecurityHeaders = true;
    this.saveFlags();
    logger.info('Enhanced security headers enabled');
  }

  /**
   * Disable enhanced security headers
   */
  disableEnhancedSecurityHeaders(): void {
    this.flags.enhancedSecurityHeaders = false;
    this.saveFlags();
    logger.info('Enhanced security headers disabled');
  }

  /**
   * Get current feature flag state
   * Returns effective flag values (consistent with individual getter methods)
   */
  getFlags(): FeatureFlags {
    return {
      pkceAuthFlow: this.isPkceAuthFlowEnabled(),
      secureStorage: this.isSecureStorageEnabled(),
      enhancedSecurityHeaders: this.isEnhancedSecurityHeadersEnabled(),
    };
  }

  /**
   * Reset all flags to defaults
   */
  resetToDefaults(): void {
    this.flags = { ...this.DEFAULT_FLAGS };
    this.saveFlags();
    logger.info(
      'Feature flags reset to security-compliant defaults (PKCE and secure storage enforced)'
    );
  }

  /**
   * Enable all PKCE-related features for testing
   */
  enableAllPkceFeatures(): void {
    this.flags.pkceAuthFlow = true;
    this.flags.secureStorage = true;
    this.saveFlags();
    logger.info('All PKCE features enabled (already enforced by default)');
  }

  /**
   * Disable all PKCE-related features (full rollback)
   * PKCE and secure storage are mandatory in production
   */
  disableAllPkceFeatures(): void {
    if (import.meta.env.MODE === 'production') {
      logger.error(
        'Cannot disable PKCE features - PKCE and secure storage are mandatory in production'
      );
      throw new Error(
        'PKCE authentication and secure storage are required for security compliance'
      );
    }

    this.flags.pkceAuthFlow = false;
    this.flags.secureStorage = false;
    this.saveFlags();
    logger.warn('All PKCE features disabled (DEV/TEST ONLY)');
  }
}

/**
 * Singleton instance that manages feature flags across the application.
 * Provides methods to check, enable, disable, and reset feature flags.
 * Persists flag states in localStorage for consistency across sessions.
 * @type {FeatureFlagManager}
 * @example
 * import { featureFlags } from './lib/featureFlags';
 * if (featureFlags.isPkceAuthFlowEnabled()) {
 *   // Enable PKCE authentication flow
 * }
 * @see {@link project_resources/security/AUTH_UPGRADE_PLAN.md}
 */
// Export singleton instance
export const featureFlags = new FeatureFlagManager();

// Export type for external use
export type { FeatureFlags };
