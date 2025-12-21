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
    pkceAuthFlow: false, // Start with implicit flow disabled
    secureStorage: false,
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
    } catch (error) {
      logger.warn('Failed to load feature flags', { error });
    }
    return { ...this.DEFAULT_FLAGS };
  }

  /**
   * Save feature flags to localStorage
   */
  private saveFlags(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.flags));
    } catch (error) {
      logger.warn('Failed to save feature flags', { error });
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
    logger.warn('PKCE auth flow enabled');
  }

  /**
   * Disable PKCE auth flow (rollback to implicit)
   */
  disablePkceAuthFlow(): void {
    this.flags.pkceAuthFlow = false;
    this.saveFlags();
    logger.warn('PKCE auth flow disabled, rolling back to implicit flow');
  }

  /**
   * Enable secure storage
   */
  enableSecureStorage(): void {
    this.flags.secureStorage = true;
    this.saveFlags();
    logger.warn('Secure storage enabled');
  }

  /**
   * Disable secure storage (rollback to localStorage)
   */
  disableSecureStorage(): void {
    this.flags.secureStorage = false;
    this.saveFlags();
    logger.warn('Secure storage disabled, rolling back to localStorage');
  }

  /**
   * Enable enhanced security headers
   */
  enableEnhancedSecurityHeaders(): void {
    this.flags.enhancedSecurityHeaders = true;
    this.saveFlags();
    logger.warn('Enhanced security headers enabled');
  }

  /**
   * Disable enhanced security headers
   */
  disableEnhancedSecurityHeaders(): void {
    this.flags.enhancedSecurityHeaders = false;
    this.saveFlags();
    logger.warn('Enhanced security headers disabled');
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
    logger.warn('Feature flags reset to defaults');
  }

  /**
   * Enable all PKCE-related features for testing
   */
  enableAllPkceFeatures(): void {
    this.flags.pkceAuthFlow = true;
    this.flags.secureStorage = true;
    this.saveFlags();
    logger.warn('All PKCE features enabled');
  }

  /**
   * Disable all PKCE-related features (full rollback)
   */
  disableAllPkceFeatures(): void {
    this.flags.pkceAuthFlow = false;
    this.flags.secureStorage = false;
    this.saveFlags();
    logger.warn('All PKCE features disabled');
  }
}

// Export singleton instance
export const featureFlags = new FeatureFlagManager();

// Export type for external use
export type { FeatureFlags };
