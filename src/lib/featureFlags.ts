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
        return { ...this.DEFAULT_FLAGS, ...parsed };
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
    return this.flags.pkceAuthFlow;
  }

  /**
   * Check if secure storage is enabled
   */
  isSecureStorageEnabled(): boolean {
    return this.flags.secureStorage;
  }

  /**
   * Check if enhanced security headers are enabled
   */
  isEnhancedSecurityHeadersEnabled(): boolean {
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
   * Disable PKCE auth flow (rollback to implicit) - DEPRECATED
   * PKCE is now mandatory for security compliance
   */
  disablePkceAuthFlow(): void {
    logger.error(
      'Cannot disable PKCE auth flow - PKCE is now mandatory for security compliance'
    );
    throw new Error('PKCE authentication is required for security compliance');
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
   * Disable secure storage (rollback to localStorage) - DEPRECATED
   * Secure storage is now mandatory for sensitive data protection
   */
  disableSecureStorage(): void {
    logger.error(
      'Cannot disable secure storage - secure storage is now mandatory for sensitive data protection'
    );
    throw new Error('Secure storage is required for sensitive data protection');
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
   */
  getFlags(): FeatureFlags {
    return { ...this.flags };
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
   * Disable all PKCE-related features (full rollback) - DEPRECATED
   * PKCE and secure storage are now mandatory
   */
  disableAllPkceFeatures(): void {
    logger.error(
      'Cannot disable PKCE features - PKCE and secure storage are now mandatory for security compliance'
    );
    throw new Error(
      'PKCE authentication and secure storage are required for security compliance'
    );
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
