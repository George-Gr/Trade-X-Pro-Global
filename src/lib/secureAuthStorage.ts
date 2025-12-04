/**
 * Secure Authentication Storage
 * 
 * Provides encrypted storage for sensitive authentication data
 * using the encryption service to protect user credentials and tokens.
 */

import { SecureStorage } from './encryption';
import { logger } from './logger';

/**
 * Secure auth storage keys
 */
const SECURE_AUTH_KEYS = {
  USER_PROFILE: 'secure_user_profile',
  USER_PREFERENCES: 'secure_user_preferences',
  API_KEYS: 'secure_api_keys',
  TRADING_SETTINGS: 'secure_trading_settings',
  RISK_SETTINGS: 'secure_risk_settings',
};

/**
 * User profile data structure
 */
export interface SecureUserProfile {
  id: string;
  email: string;
  full_name: string;
  kyc_status: string;
  created_at: string;
  last_login: string;
  risk_level: string;
  account_type: string;
}

/**
 * User preferences structure
 */
export interface SecureUserPreferences {
  theme: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  trading: {
    default_leverage: number;
    default_quantity: number;
    confirm_trades: boolean;
    show_advanced_charts: boolean;
  };
  privacy: {
    analytics_enabled: boolean;
    marketing_emails: boolean;
  };
}

/**
 * API keys structure
 */
export interface SecureAPIKeys {
  exchange_keys: {
    [exchange: string]: {
      key: string;
      secret: string;
      permissions: string[];
      last_used: string;
    };
  };
  webhook_urls: string[];
}

/**
 * Trading settings structure
 */
export interface SecureTradingSettings {
  risk_management: {
    max_position_size: number;
    max_daily_loss: number;
    stop_loss_default: number;
    take_profit_default: number;
  };
  automation: {
    trailing_stop_enabled: boolean;
    auto_liquidation_enabled: boolean;
    copy_trading_enabled: boolean;
  };
  alerts: {
    price_alerts_enabled: boolean;
    margin_call_alerts: boolean;
    email_notifications: boolean;
  };
}

/**
 * Risk settings structure
 */
export interface SecureRiskSettings {
  margin_requirements: {
    initial_margin: number;
    maintenance_margin: number;
    liquidation_threshold: number;
  };
  exposure_limits: {
    max_leverage: number;
    max_positions: number;
    max_concentration: number;
  };
  monitoring: {
    real_time_monitoring: boolean;
    auto_liquidation: boolean;
    margin_call_threshold: number;
  };
}

/**
 * Secure authentication storage service
 */
export class SecureAuthStorage {
  /**
   * Store user profile securely
   */
  static async setUserProfile(profile: SecureUserProfile): Promise<void> {
    try {
      await SecureStorage.setUserData(SECURE_AUTH_KEYS.USER_PROFILE, profile);
      logger.logSecurityEvent('secure_profile_saved', {
        userId: profile.id,
        reason: 'User profile encrypted and stored',
      });
    } catch (error) {
      logger.logSecurityEvent('secure_profile_save_failed', {
        reason: 'Failed to save encrypted user profile',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Retrieve user profile securely
   */
  static async getUserProfile(): Promise<SecureUserProfile | null> {
    try {
      return await SecureStorage.getUserData<SecureUserProfile>(SECURE_AUTH_KEYS.USER_PROFILE);
    } catch (error) {
      logger.logSecurityEvent('secure_profile_retrieval_failed', {
        reason: 'Failed to retrieve encrypted user profile',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Remove user profile
   */
  static removeUserProfile(): void {
    try {
      SecureStorage.removeUserData(SECURE_AUTH_KEYS.USER_PROFILE);
      logger.logSecurityEvent('secure_profile_removed', {
        reason: 'User profile removed from secure storage',
      });
    } catch (error) {
      logger.logSecurityEvent('secure_profile_removal_failed', {
        reason: 'Failed to remove encrypted user profile',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Store user preferences securely
   */
  static async setUserPreferences(preferences: SecureUserPreferences): Promise<void> {
    try {
      await SecureStorage.setUserData(SECURE_AUTH_KEYS.USER_PREFERENCES, preferences);
      logger.logSecurityEvent('secure_preferences_saved', {
        reason: 'User preferences encrypted and stored',
      });
    } catch (error) {
      logger.logSecurityEvent('secure_preferences_save_failed', {
        reason: 'Failed to save encrypted user preferences',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Retrieve user preferences securely
   */
  static async getUserPreferences(): Promise<SecureUserPreferences | null> {
    try {
      return await SecureStorage.getUserData<SecureUserPreferences>(SECURE_AUTH_KEYS.USER_PREFERENCES);
    } catch (error) {
      logger.logSecurityEvent('secure_preferences_retrieval_failed', {
        reason: 'Failed to retrieve encrypted user preferences',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Store API keys securely
   */
  static async setAPIKeys(apiKeys: SecureAPIKeys): Promise<void> {
    try {
      await SecureStorage.setUserData(SECURE_AUTH_KEYS.API_KEYS, apiKeys);
      logger.logSecurityEvent('secure_api_keys_saved', {
        reason: 'API keys encrypted and stored',
      });
    } catch (error) {
      logger.logSecurityEvent('secure_api_keys_save_failed', {
        reason: 'Failed to save encrypted API keys',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Retrieve API keys securely
   */
  static async getAPIKeys(): Promise<SecureAPIKeys | null> {
    try {
      return await SecureStorage.getUserData<SecureAPIKeys>(SECURE_AUTH_KEYS.API_KEYS);
    } catch (error) {
      logger.logSecurityEvent('secure_api_keys_retrieval_failed', {
        reason: 'Failed to retrieve encrypted API keys',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Remove API keys
   */
  static removeAPIKeys(): void {
    try {
      SecureStorage.removeUserData(SECURE_AUTH_KEYS.API_KEYS);
      logger.logSecurityEvent('secure_api_keys_removed', {
        reason: 'API keys removed from secure storage',
      });
    } catch (error) {
      logger.logSecurityEvent('secure_api_keys_removal_failed', {
        reason: 'Failed to remove encrypted API keys',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Store trading settings securely
   */
  static async setTradingSettings(settings: SecureTradingSettings): Promise<void> {
    try {
      await SecureStorage.setUserData(SECURE_AUTH_KEYS.TRADING_SETTINGS, settings);
      logger.logSecurityEvent('secure_trading_settings_saved', {
        reason: 'Trading settings encrypted and stored',
      });
    } catch (error) {
      logger.logSecurityEvent('secure_trading_settings_save_failed', {
        reason: 'Failed to save encrypted trading settings',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Retrieve trading settings securely
   */
  static async getTradingSettings(): Promise<SecureTradingSettings | null> {
    try {
      return await SecureStorage.getUserData<SecureTradingSettings>(SECURE_AUTH_KEYS.TRADING_SETTINGS);
    } catch (error) {
      logger.logSecurityEvent('secure_trading_settings_retrieval_failed', {
        reason: 'Failed to retrieve encrypted trading settings',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Store risk settings securely
   */
  static async setRiskSettings(settings: SecureRiskSettings): Promise<void> {
    try {
      await SecureStorage.setUserData(SECURE_AUTH_KEYS.RISK_SETTINGS, settings);
      logger.logSecurityEvent('secure_risk_settings_saved', {
        reason: 'Risk settings encrypted and stored',
      });
    } catch (error) {
      logger.logSecurityEvent('secure_risk_settings_save_failed', {
        reason: 'Failed to save encrypted risk settings',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Retrieve risk settings securely
   */
  static async getRiskSettings(): Promise<SecureRiskSettings | null> {
    try {
      return await SecureStorage.getUserData<SecureRiskSettings>(SECURE_AUTH_KEYS.RISK_SETTINGS);
    } catch (error) {
      logger.logSecurityEvent('secure_risk_settings_retrieval_failed', {
        reason: 'Failed to retrieve encrypted risk settings',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Clear all secure authentication data
   */
  static clearAllSecureData(): void {
    try {
      SecureStorage.clearAll();
      logger.logSecurityEvent('secure_data_cleared', {
        reason: 'All encrypted authentication data cleared',
      });
    } catch (error) {
      logger.logSecurityEvent('secure_data_clear_failed', {
        reason: 'Failed to clear encrypted authentication data',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Migrate existing localStorage data to secure storage
   */
  static async migrateExistingData(): Promise<void> {
    try {
      // This would be called during app initialization
      // to migrate any existing unencrypted data to secure storage
      
      logger.logSecurityEvent('secure_migration_started', {
        reason: 'Starting migration of existing data to secure storage',
      });

      // Example migration logic (would need to be customized based on existing data)
      // const oldProfile = localStorage.getItem('user_profile');
      // if (oldProfile) {
      //   await this.setUserProfile(JSON.parse(oldProfile));
      //   localStorage.removeItem('user_profile');
      // }

      logger.logSecurityEvent('secure_migration_completed', {
        reason: 'Migration of existing data to secure storage completed',
      });
    } catch (error) {
      logger.logSecurityEvent('secure_migration_failed', {
        reason: 'Failed to migrate existing data to secure storage',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}

/**
 * React hook for secure authentication storage
 */
export function useSecureAuthStorage() {
  const setUserProfile = async (profile: SecureUserProfile): Promise<void> => {
    await SecureAuthStorage.setUserProfile(profile);
  };

  const getUserProfile = async (): Promise<SecureUserProfile | null> => {
    return SecureAuthStorage.getUserProfile();
  };

  const setUserPreferences = async (preferences: SecureUserPreferences): Promise<void> => {
    await SecureAuthStorage.setUserPreferences(preferences);
  };

  const getUserPreferences = async (): Promise<SecureUserPreferences | null> => {
    return SecureAuthStorage.getUserPreferences();
  };

  const setAPIKeys = async (apiKeys: SecureAPIKeys): Promise<void> => {
    await SecureAuthStorage.setAPIKeys(apiKeys);
  };

  const getAPIKeys = async (): Promise<SecureAPIKeys | null> => {
    return SecureAuthStorage.getAPIKeys();
  };

  const setTradingSettings = async (settings: SecureTradingSettings): Promise<void> => {
    await SecureAuthStorage.setTradingSettings(settings);
  };

  const getTradingSettings = async (): Promise<SecureTradingSettings | null> => {
    return SecureAuthStorage.getTradingSettings();
  };

  const setRiskSettings = async (settings: SecureRiskSettings): Promise<void> => {
    await SecureAuthStorage.setRiskSettings(settings);
  };

  const getRiskSettings = async (): Promise<SecureRiskSettings | null> => {
    return SecureAuthStorage.getRiskSettings();
  };

  const clearAll = (): void => {
    SecureAuthStorage.clearAllSecureData();
  };

  return {
    setUserProfile,
    getUserProfile,
    setUserPreferences,
    getUserPreferences,
    setAPIKeys,
    getAPIKeys,
    setTradingSettings,
    getTradingSettings,
    setRiskSettings,
    getRiskSettings,
    clearAll,
  };
}