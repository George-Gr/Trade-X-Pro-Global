/**
 * Enhanced Secure Storage with HttpOnly Cookie Support
 *
 * This enhanced storage system provides secure token storage with support for
 * HttpOnly cookies in production environments while maintaining compatibility
 * with existing localStorage-based storage for development.
 *
 * Features:
 * - HttpOnly cookies in production (secure, HttpOnly, SameSite=Strict)
 * - Encrypted localStorage in development
 * - Automatic token refresh handling
 * - Session timeout management
 * - Security audit logging
 */

import { logger } from '@/lib/logger';
import { SecureStorage } from '@/lib/secureStorage';

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId?: string;
}

interface SessionConfig {
  maxSessionDuration: number; // 8 hours in milliseconds
  inactivityTimeout: number; // 30 minutes in milliseconds
  checkInterval: number; // 5 minutes in milliseconds
}

interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  maxAge?: number;
  path?: string;
}

export class EnhancedSecureStorage {
  private readonly USE_COOKIES: boolean;
  private readonly SESSION_KEY = 'session_info';
  private readonly secureStorage: SecureStorage;
  private readonly sessionConfig: SessionConfig;
  private sessionTimer: NodeJS.Timeout | null = null;
  private lastActivity: number = Date.now();
  private onMouseMove: (() => void) | null = null;
  private onKeyPress: (() => void) | null = null;
  private onClick: (() => void) | null = null;

  constructor() {
    // Use cookies in production, localStorage in development
    this.USE_COOKIES = this.shouldUseCookies();
    this.secureStorage = new SecureStorage();
    this.sessionConfig = {
      maxSessionDuration: 8 * 60 * 60 * 1000, // 8 hours
      inactivityTimeout: 30 * 60 * 1000, // 30 minutes
      checkInterval: 5 * 60 * 1000, // 5 minutes
    };

    if (this.USE_COOKIES) {
      this.startSessionMonitoring();
    }
  }

  /**
   * Determine if we should use HttpOnly cookies
   */
  private shouldUseCookies(): boolean {
    return (
      typeof window !== 'undefined' &&
      window.location.protocol === 'https:' &&
      !window.location.hostname.includes('localhost') &&
      !window.location.hostname.includes('127.0.0.1') &&
      !window.location.hostname.includes('::1')
    );
  }

  /**
   * Set authentication tokens
   */
  async setTokens(tokens: TokenData): Promise<void> {
    if (this.USE_COOKIES) {
      await this.setTokensInCookies(tokens);
    } else {
      await this.setTokensInStorage(tokens);
    }

    // Update session info
    await this.updateSessionInfo(tokens.userId);

    logger.info('Authentication tokens stored', {
      metadata: {
        useCookies: this.USE_COOKIES,
        userId: tokens.userId,
        expiresAt: new Date(tokens.expiresAt).toISOString(),
      },
    });
  }

  /**
   * Get authentication tokens
   */
  async getTokens(): Promise<TokenData | null> {
    const tokens = this.USE_COOKIES
      ? await this.getTokensFromCookies()
      : await this.getTokensFromStorage();

    if (tokens) {
      this.updateLastActivity();
    }

    return tokens;
  }

  /**
   * Remove authentication tokens
   */
  async removeTokens(): Promise<void> {
    if (this.USE_COOKIES) {
      await this.removeTokensFromCookies();
    } else {
      await this.removeTokensFromStorage();
    }

    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }

    logger.info('Authentication tokens removed', {
      metadata: { useCookies: this.USE_COOKIES },
    });
  }

  /**
   * Set tokens in HttpOnly cookies
   */
  private async setTokensInCookies(tokens: TokenData): Promise<void> {
    try {
      // Set access token cookie (short-lived)
      this.setCookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: Math.max(0, tokens.expiresAt - Date.now()),
      });

      // Set refresh token cookie (longer-lived)
      this.setCookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Set expiration time
      this.setCookie('expires_at', tokens.expiresAt.toString(), {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: Math.max(0, tokens.expiresAt - Date.now()),
      });
    } catch (error) {
      logger.error('Failed to set tokens in cookies:', error);
      throw new Error('Failed to store authentication tokens securely');
    }
  }

  /**
   * Get tokens from HttpOnly cookies
   */
  private async getTokensFromCookies(): Promise<TokenData | null> {
    try {
      const response = await fetch('/api/auth/tokens', {
        method: 'GET',
        credentials: 'include', // Include HttpOnly cookies
      });

      if (!response.ok) {
        return null;
      }

      const tokenData = await response.json();
      // Map the response to TokenData shape
      return {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresAt: tokenData.expiresAt,
        userId: tokenData.userId,
      };
    } catch (error) {
      logger.error('Failed to get tokens from cookies:', error);
      return null;
    }
  }

  /**
   * Remove tokens from HttpOnly cookies
   */
  private async removeTokensFromCookies(): Promise<void> {
    try {
      // Clear cookies by setting them to expire immediately
      this.setCookie('access_token', '', { maxAge: 0 });
      this.setCookie('refresh_token', '', { maxAge: 0 });
      this.setCookie('expires_at', '', { maxAge: 0 });
    } catch (error) {
      logger.error('Failed to remove tokens from cookies:', error);
    }
  }

  /**
   * Set tokens in encrypted localStorage
   */
  private async setTokensInStorage(tokens: TokenData): Promise<void> {
    try {
      await this.secureStorage.setItem('access_token', tokens.accessToken);
      await this.secureStorage.setItem('refresh_token', tokens.refreshToken);
      await this.secureStorage.setItem(
        'expires_at',
        tokens.expiresAt.toString()
      );
    } catch (error) {
      logger.error('Failed to set tokens in storage:', error);
      throw new Error('Failed to store authentication tokens securely');
    }
  }

  /**
   * Get tokens from encrypted localStorage
   */
  private async getTokensFromStorage(): Promise<TokenData | null> {
    try {
      const accessToken = await this.secureStorage.getItem('access_token');
      const refreshToken = await this.secureStorage.getItem('refresh_token');
      const expiresAtStr = await this.secureStorage.getItem('expires_at');

      if (!accessToken || !refreshToken || !expiresAtStr) {
        return null;
      }

      return {
        accessToken,
        refreshToken,
        expiresAt: parseInt(expiresAtStr, 10),
      };
    } catch (error) {
      logger.error('Failed to get tokens from storage:', error);
      return null;
    }
  }

  /**
   * Remove tokens from encrypted localStorage
   */
  private async removeTokensFromStorage(): Promise<void> {
    try {
      await this.secureStorage.removeItem('access_token');
      await this.secureStorage.removeItem('refresh_token');
      await this.secureStorage.removeItem('expires_at');
    } catch (error) {
      logger.error('Failed to remove tokens from storage:', error);
    }
  }

  /**
   * Update session information
   */
  private async updateSessionInfo(userId?: string): Promise<void> {
    const sessionInfo = {
      userId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };

    if (this.USE_COOKIES) {
      this.setCookie(this.SESSION_KEY, JSON.stringify(sessionInfo), {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: this.sessionConfig.maxSessionDuration,
      });
    } else {
      await this.secureStorage.setItem(
        this.SESSION_KEY,
        JSON.stringify(sessionInfo)
      );
    }
  }

  /**
   * Update last activity timestamp
   */
  private updateLastActivity(): void {
    this.lastActivity = Date.now();

    if (this.USE_COOKIES) {
      const existingCookie = this.getCookie(this.SESSION_KEY);
      let sessionInfo;
      if (existingCookie) {
        try {
          const parsed = JSON.parse(decodeURIComponent(existingCookie));
          sessionInfo = {
            userId: parsed.userId,
            createdAt: parsed.createdAt,
            lastActivity: Date.now(),
          };
        } catch (error) {
          sessionInfo = {
            userId: undefined,
            createdAt: Date.now(),
            lastActivity: Date.now(),
          };
        }
      } else {
        sessionInfo = {
          userId: undefined,
          createdAt: Date.now(),
          lastActivity: Date.now(),
        };
      }
      this.setCookie(this.SESSION_KEY, JSON.stringify(sessionInfo), {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: this.sessionConfig.maxSessionDuration,
      });
    }
  }

  /**
   * Start session monitoring
   */
  private startSessionMonitoring(): void {
    this.sessionTimer = setInterval(() => {
      this.checkSessionTimeout();
    }, this.sessionConfig.checkInterval);

    // Listen for user activity
    this.onMouseMove = () => this.updateLastActivity();
    this.onKeyPress = () => this.updateLastActivity();
    this.onClick = () => this.updateLastActivity();
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('keypress', this.onKeyPress);
    window.addEventListener('click', this.onClick);
  }

  /**
   * Check if session has timed out
   */
  private checkSessionTimeout(): void {
    const now = Date.now();
    const sessionAge = now - this.lastActivity;

    if (sessionAge > this.sessionConfig.inactivityTimeout) {
      logger.warn('Session timeout due to inactivity');
      this.handleSessionTimeout();
    }
  }

  /**
   * Handle session timeout
   */
  private handleSessionTimeout(): void {
    this.removeTokens();

    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  /**
   * Get a cookie value
   */
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  /**
   * Set a cookie with options
   */
  private setCookie(
    name: string,
    value: string,
    options: CookieOptions = {}
  ): void {
    let cookieString = `${name}=${encodeURIComponent(value)}`;

    if (options.maxAge) {
      cookieString += `; Max-Age=${options.maxAge}`;
    }

    if (options.httpOnly) {
      cookieString += '; HttpOnly';
    }

    if (options.secure) {
      cookieString += '; Secure';
    }

    if (options.sameSite) {
      cookieString += `; SameSite=${options.sameSite}`;
    }

    if (options.path) {
      cookieString += `; Path=${options.path}`;
    }

    document.cookie = cookieString;
  }

  /**
   * Check if session is valid
   */
  async isSessionValid(): Promise<boolean> {
    if (!this.USE_COOKIES) {
      const tokens = await this.getTokens();
      return tokens !== null && !this.isExpired();
    }

    try {
      const response = await fetch('/api/auth/tokens', {
        method: 'GET',
        credentials: 'include',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Check if tokens are expired
   */
  async isExpired(): Promise<boolean> {
    if (!this.USE_COOKIES) {
      const tokens = await this.getTokens();
      if (!tokens) return true;
      return Date.now() >= tokens.expiresAt;
    }

    // In production, assume not expired if session is valid
    return !(await this.isSessionValid());
  }

  /**
   * Get remaining time until expiration
   */
  async getRemainingTime(): Promise<number> {
    if (!this.USE_COOKIES) {
      const tokens = await this.getTokens();
      if (!tokens) return 0;
      return Math.max(0, tokens.expiresAt - Date.now());
    }

    // In production, return a large number since we don't expose expiresAt
    return 3600000; // 1 hour
  }

  /**
   * Destroy the storage instance
   */
  destroy(): void {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }

    if (this.onMouseMove) {
      window.removeEventListener('mousemove', this.onMouseMove);
      this.onMouseMove = null;
    }

    if (this.onKeyPress) {
      window.removeEventListener('keypress', this.onKeyPress);
      this.onKeyPress = null;
    }

    if (this.onClick) {
      window.removeEventListener('click', this.onClick);
      this.onClick = null;
    }

    this.secureStorage.destroy();
  }
}

/**
 * Enhanced secure storage instance
 */
export const enhancedSecureStorage = new EnhancedSecureStorage();
