/**
 * Secure Session Manager
 * 
 * Manages encrypted session storage for sensitive authentication data
 * while maintaining compatibility with Supabase's session management.
 */

import { SecureStorage } from './encryption';
import { logger } from './logger';
import { SecureAuthStorage, SecureUserProfile } from './secureAuthStorage';

/**
 * Session storage keys
 */
const SESSION_KEYS = {
  USER_SESSION: 'secure_user_session',
  AUTH_TOKEN: 'secure_auth_token',
  REFRESH_TOKEN: 'secure_refresh_token',
  SESSION_EXPIRY: 'secure_session_expiry',
  LAST_ACTIVITY: 'secure_last_activity',
};

/**
 * Secure session data structure
 */
export interface SecureSessionData {
  userId: string;
  email: string;
  loginTime: number;
  expiryTime: number;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Secure session manager
 */
export class SecureSessionManager {
  private static readonly SESSION_TIMEOUT = 55 * 60 * 1000; // 55 minutes
  private static readonly ACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

  /**
   * Store session data securely
   */
  static async storeSession(sessionData: SecureSessionData): Promise<void> {
    try {
      await SecureStorage.setSessionData(SESSION_KEYS.USER_SESSION, sessionData);
      await SecureStorage.setSessionData(SESSION_KEYS.LAST_ACTIVITY, Date.now());

      logger.logSecurityEvent('secure_session_stored', {
        userId: sessionData.userId,
        sessionId: sessionData.sessionId,
        reason: 'Session data encrypted and stored',
      });
    } catch (error) {
      logger.logSecurityEvent('secure_session_store_failed', {
        reason: 'Failed to store encrypted session data',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Retrieve session data securely
   */
  static async getSession(): Promise<SecureSessionData | null> {
    try {
      const session = await SecureStorage.getSessionData<SecureSessionData>(SESSION_KEYS.USER_SESSION);
      if (!session) {
        return null;
      }

      // Check session expiry
      if (Date.now() > session.expiryTime) {
        await this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      logger.logSecurityEvent('secure_session_retrieval_failed', {
        reason: 'Failed to retrieve encrypted session data',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Store authentication token securely
   */
  static async storeAuthToken(token: string): Promise<void> {
    try {
      await SecureStorage.setSessionData(SESSION_KEYS.AUTH_TOKEN, token);
      logger.logSecurityEvent('secure_auth_token_stored', {
        reason: 'Authentication token encrypted and stored',
      });
    } catch (error) {
      logger.logSecurityEvent('secure_auth_token_store_failed', {
        reason: 'Failed to store encrypted authentication token',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Retrieve authentication token securely
   */
  static async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStorage.getSessionData<string>(SESSION_KEYS.AUTH_TOKEN);
    } catch (error) {
      logger.logSecurityEvent('secure_auth_token_retrieval_failed', {
        reason: 'Failed to retrieve encrypted authentication token',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Store refresh token securely
   */
  static async storeRefreshToken(token: string): Promise<void> {
    try {
      await SecureStorage.setSessionData(SESSION_KEYS.REFRESH_TOKEN, token);
      logger.logSecurityEvent('secure_refresh_token_stored', {
        reason: 'Refresh token encrypted and stored',
      });
    } catch (error) {
      logger.logSecurityEvent('secure_refresh_token_store_failed', {
        reason: 'Failed to store encrypted refresh token',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Retrieve refresh token securely
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStorage.getSessionData<string>(SESSION_KEYS.REFRESH_TOKEN);
    } catch (error) {
      logger.logSecurityEvent('secure_refresh_token_retrieval_failed', {
        reason: 'Failed to retrieve encrypted refresh token',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Update last activity time
   */
  static async updateLastActivity(): Promise<void> {
    try {
      await SecureStorage.setSessionData(SESSION_KEYS.LAST_ACTIVITY, Date.now());
    } catch (error) {
      logger.logSecurityEvent('secure_activity_update_failed', {
        reason: 'Failed to update last activity time',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check if session is active and not expired
   */
  static async isSessionActive(): Promise<boolean> {
    try {
      const session = await this.getSession();
      if (!session) {
        return false;
      }

      // Check if session has timed out due to inactivity
      const lastActivity = await SecureStorage.getSessionData<number>(SESSION_KEYS.LAST_ACTIVITY);
      if (lastActivity && Date.now() - lastActivity > this.ACTIVITY_TIMEOUT) {
        await this.clearSession();
        return false;
      }

      return true;
    } catch (error) {
      logger.logSecurityEvent('secure_session_check_failed', {
        reason: 'Failed to check session status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Clear all session data
   */
  static async clearSession(): Promise<void> {
    try {
      SecureStorage.removeSessionData(SESSION_KEYS.USER_SESSION);
      SecureStorage.removeSessionData(SESSION_KEYS.AUTH_TOKEN);
      SecureStorage.removeSessionData(SESSION_KEYS.REFRESH_TOKEN);
      SecureStorage.removeSessionData(SESSION_KEYS.SESSION_EXPIRY);
      SecureStorage.removeSessionData(SESSION_KEYS.LAST_ACTIVITY);

      logger.logSecurityEvent('secure_session_cleared', {
        reason: 'Session data cleared from secure storage',
      });
    } catch (error) {
      logger.logSecurityEvent('secure_session_clear_failed', {
        reason: 'Failed to clear session data',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Handle session timeout
   */
  static async handleSessionTimeout(): Promise<void> {
    try {
      await this.clearSession();
      SecureAuthStorage.clearAllSecureData();

      logger.logSecurityEvent('secure_session_timeout', {
        reason: 'Session timed out and was cleared',
      });

      // Dispatch custom event for components to handle
      window.dispatchEvent(new CustomEvent('session:timeout', {
        detail: { message: 'Your session has expired. Please log in again.' }
      }));
    } catch (error) {
      logger.logSecurityEvent('secure_session_timeout_failed', {
        reason: 'Failed to handle session timeout',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Start session monitoring
   */
  static startSessionMonitoring(): void {
    // Monitor for user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const resetActivityTimer = () => {
      this.updateLastActivity();
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, resetActivityTimer, { passive: true });
    });

    // Check session status periodically
    setInterval(async () => {
      const isActive = await this.isSessionActive();
      if (!isActive) {
        await this.handleSessionTimeout();
      }
    }, 60000); // Check every minute
  }

  /**
   * Initialize secure session
   */
  static async initializeSession(userData: {
    userId: string;
    email: string;
    token: string;
    refreshToken: string;
    expiryTime: number;
  }): Promise<SecureSessionData> {
    try {
      const sessionData: SecureSessionData = {
        userId: userData.userId,
        email: userData.email,
        loginTime: Date.now(),
        expiryTime: userData.expiryTime,
        sessionId: crypto.randomUUID(),
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
      };

      // Store session data
      await this.storeSession(sessionData);
      await this.storeAuthToken(userData.token);
      await this.storeRefreshToken(userData.refreshToken);

      // Start monitoring
      this.startSessionMonitoring();

      logger.logSecurityEvent('secure_session_initialized', {
        userId: userData.userId,
        sessionId: sessionData.sessionId,
        reason: 'Secure session initialized',
      });

      return sessionData;
    } catch (error) {
      logger.logSecurityEvent('secure_session_initialization_failed', {
        reason: 'Failed to initialize secure session',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get client IP address (approximate)
   */
  private static async getClientIP(): Promise<string> {
    try {
      // This would typically be handled by the server
      // For client-side, we can use a public API or just return a placeholder
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'client_ip_not_available';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Refresh session tokens
   */
  static async refreshSession(newToken: string, newRefreshToken: string, newExpiryTime: number): Promise<void> {
    try {
      await this.storeAuthToken(newToken);
      await this.storeRefreshToken(newRefreshToken);

      // Update session expiry
      const session = await this.getSession();
      if (session) {
        session.expiryTime = newExpiryTime;
        await this.storeSession(session);
      }

      logger.logSecurityEvent('secure_session_refreshed', {
        reason: 'Session tokens refreshed',
      });
    } catch (error) {
      logger.logSecurityEvent('secure_session_refresh_failed', {
        reason: 'Failed to refresh session tokens',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}

/**
 * React hook for secure session management
 */
export function useSecureSession() {
  const storeSession = async (sessionData: SecureSessionData): Promise<void> => {
    await SecureSessionManager.storeSession(sessionData);
  };

  const getSession = async (): Promise<SecureSessionData | null> => {
    return SecureSessionManager.getSession();
  };

  const storeAuthToken = async (token: string): Promise<void> => {
    await SecureSessionManager.storeAuthToken(token);
  };

  const getAuthToken = async (): Promise<string | null> => {
    return SecureSessionManager.getAuthToken();
  };

  const storeRefreshToken = async (token: string): Promise<void> => {
    await SecureSessionManager.storeRefreshToken(token);
  };

  const getRefreshToken = async (): Promise<string | null> => {
    return SecureSessionManager.getRefreshToken();
  };

  const isSessionActive = async (): Promise<boolean> => {
    return SecureSessionManager.isSessionActive();
  };

  const clearSession = async (): Promise<void> => {
    await SecureSessionManager.clearSession();
  };

  const handleSessionTimeout = async (): Promise<void> => {
    await SecureSessionManager.handleSessionTimeout();
  };

  const initializeSession = async (userData: {
    userId: string;
    email: string;
    token: string;
    refreshToken: string;
    expiryTime: number;
  }): Promise<SecureSessionData> => {
    return SecureSessionManager.initializeSession(userData);
  };

  const refreshSession = async (newToken: string, newRefreshToken: string, newExpiryTime: number): Promise<void> => {
    await SecureSessionManager.refreshSession(newToken, newRefreshToken, newExpiryTime);
  };

  return {
    storeSession,
    getSession,
    storeAuthToken,
    getAuthToken,
    storeRefreshToken,
    getRefreshToken,
    isSessionActive,
    clearSession,
    handleSessionTimeout,
    initializeSession,
    refreshSession,
  };
}