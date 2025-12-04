/**
 * Security Event Logging Module
 * 
 * Provides comprehensive security event logging for authentication, authorization,
 * and suspicious activity monitoring.
 */

import { logger } from './logger';

/**
 * Security event types
 */
export type SecurityEventType =
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'session_timeout'
  | 'rate_limit_exceeded'
  | 'suspicious_activity';

/**
 * Security event details
 */
export interface SecurityEventDetails {
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  reason?: string;
  attempts?: number;
  blockedDuration?: number;
}

/**
 * Security event severity levels
 */
export type SecurityEventSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Get severity level for security events
 */
function getSecurityEventSeverity(eventType: SecurityEventType): SecurityEventSeverity {
  switch (eventType) {
    case 'rate_limit_exceeded':
    case 'suspicious_activity':
      return 'high';
    case 'login_failure':
      return 'medium';
    case 'login_attempt':
    case 'logout':
    case 'session_timeout':
      return 'low';
    case 'login_success':
      return 'low';
    default:
      return 'medium';
  }
}

/**
 * Log a security event
 */
export function logSecurityEvent(
  eventType: SecurityEventType,
  details: SecurityEventDetails,
  context?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();

  // Add to breadcrumbs
  logger.addBreadcrumb('security', `${eventType}: ${details.email || details.userId || 'unknown'}`, 'info');

  if (import.meta.env.MODE === 'development') {
    console.log(`[SECURITY] ${eventType}`, {
      timestamp,
      ...details,
      ...context?.metadata,
    });
  }

  // Log to Sentry if active
  if (typeof window !== 'undefined') {
    // Sentry logging would be handled by the main logger
    logger.info(`Security Event: ${eventType}`, {
      ...context,
      metadata: {
        ...context?.metadata,
        security: {
          eventType,
          timestamp,
          ...details,
        },
      },
    });
  }

  // Store in security events array for monitoring (handled by main logger)
}

/**
 * Log failed authentication attempts for security monitoring
 */
export function logFailedAuth(
  email: string,
  reason: string,
  ip?: string,
  userAgent?: string,
  context?: Record<string, unknown>
): void {
  logSecurityEvent('login_failure', {
    email,
    reason,
    ip,
    userAgent,
  }, context);
}

/**
 * Log successful authentication
 */
export function logSuccessfulAuth(
  userId: string,
  email: string,
  ip?: string,
  userAgent?: string,
  context?: Record<string, unknown>
): void {
  logSecurityEvent('login_success', {
    userId,
    email,
    ip,
    userAgent,
  }, context);
}

/**
 * Log rate limiting events
 */
export function logRateLimitExceeded(
  identifier: string,
  attempts: number,
  blockedDuration: number,
  context?: Record<string, unknown>
): void {
  logSecurityEvent('rate_limit_exceeded', {
    reason: `Too many attempts (${attempts})`,
    attempts,
    blockedDuration,
  }, context);
}

/**
 * Log suspicious activity
 */
export function logSuspiciousActivity(
  activity: string,
  details: Record<string, unknown>,
  context?: Record<string, unknown>
): void {
  logSecurityEvent('suspicious_activity', {
    reason: activity,
    ...details,
  }, context);
}

/**
 * Security monitoring utilities
 */
export const securityMonitor = {
  /**
   * Check if an IP has too many failed login attempts
   */
  checkFailedAttempts(ip: string, threshold: number = 5): boolean {
    // This would integrate with a real monitoring system
    // For now, just log the check
    logger.debug(`Checking failed attempts for IP: ${ip}`);
    return false; // Placeholder
  },

  /**
   * Log potential brute force attack
   */
  logBruteForceAttempt(ip: string, attempts: number, timeWindow: number) {
    logSuspiciousActivity('brute_force_attack', {
      ip,
      attempts,
      timeWindow,
      severity: 'high',
    });
  },

  /**
   * Log potential credential stuffing attack
   */
  logCredentialStuffing(email: string, ip: string) {
    logSuspiciousActivity('credential_stuffing', {
      email,
      ip,
      severity: 'high',
    });
  },

  /**
   * Log potential session hijacking
   */
  logSessionHijacking(userId: string, oldIP: string, newIP: string) {
    logSuspiciousActivity('session_hijacking', {
      userId,
      oldIP,
      newIP,
      severity: 'critical',
    });
  },
};