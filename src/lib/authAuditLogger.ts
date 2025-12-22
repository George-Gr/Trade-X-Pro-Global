/**
 * Authentication Audit Logger
 *
 * This module provides comprehensive audit logging for authentication events,
 * session management, and security-related activities. All logs are structured
 * for security monitoring and compliance requirements.
 */

import { logger } from '@/lib/logger';

export interface AuditEvent {
  timestamp: string;
  eventType: AuditEventType;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata: Record<string, unknown>;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export type AuditEventType =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILED'
  | 'AUTH_LOGOUT'
  | 'AUTH_TOKEN_REFRESH'
  | 'AUTH_TOKEN_REFRESH_FAILED'
  | 'AUTH_SESSION_TIMEOUT'
  | 'AUTH_SESSION_EXPIRED'
  | 'AUTH_FORCED_LOGOUT'
  | 'AUTH_PASSWORD_CHANGE'
  | 'AUTH_PASSWORD_RESET'
  | 'AUTH_2FA_ENABLED'
  | 'AUTH_2FA_DISABLED'
  | 'AUTH_SUSPICIOUS_ACTIVITY'
  | 'AUTH_ACCOUNT_LOCKED'
  | 'AUTH_ACCOUNT_UNLOCKED'
  | 'AUTH_PRIVILEGE_ESCALATION'
  | 'AUTH_ACCESS_DENIED'
  | 'AUTH_TOKEN_THEFT_DETECTED'
  | 'AUTH_MULTIPLE_SESSIONS'
  | 'AUTH_GEOLOCATION_ANOMALY';

export interface AuditConfig {
  enabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  includeStackTrace: boolean;
  maxLogSize: number;
  retentionDays: number;
}

class AuthAuditLogger {
  private config: AuditConfig;
  private readonly DEFAULT_CONFIG: AuditConfig = {
    enabled: true,
    logLevel: 'info',
    includeStackTrace: false,
    maxLogSize: 10000,
    retentionDays: 90,
  };

  constructor(config?: Partial<AuditConfig>) {
    this.config = { ...this.DEFAULT_CONFIG, ...config };
  }

  /**
   * Log an authentication event
   */
  async logAuthEvent(event: AuditEvent): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    try {
      // Add standard metadata
      const auditData = {
        ...event,
        timestamp: event.timestamp || new Date().toISOString(),
        source: 'AUTH_AUDIT',
        version: '1.0',
      };

      // Log to console/logger
      this.logToConsole(auditData);

      // Send to security monitoring service
      await this.sendToSecurityMonitoring(auditData);

      // Store in audit database (if configured)
      await this.storeInAuditDatabase(auditData);
    } catch (error) {
      logger.error('Failed to log audit event:', error);
    }
  }

  /**
   * Log to console with structured format
   */
  private logToConsole(event: AuditEvent): void {
    const logLevel = this.getLogLevel(event.severity);
    const message = `Auth Audit: ${event.eventType}`;
    const context = {
      metadata: {
        ...event.metadata,
        userId: event.userId,
        sessionId: event.sessionId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        severity: event.severity,
      },
    };

    switch (logLevel) {
      case 'debug':
        logger.debug(message, context);
        break;
      case 'info':
        logger.info(message, context);
        break;
      case 'warn':
        logger.warn(message, context);
        break;
      case 'error':
        logger.error(message, undefined, context);
        break;
    }
  }

  /**
   * Send to security monitoring service
   */
  private async sendToSecurityMonitoring(event: AuditEvent): Promise<void> {
    try {
      // In production, this would integrate with your security monitoring service
      // Examples: Datadog, Splunk, ELK Stack, custom SIEM

      if (process.env.NODE_ENV === 'production') {
        // Example integration with Datadog
        if (process.env.DATADOG_API_KEY) {
          await this.sendToDatadog(event);
        }

        // Example integration with custom SIEM
        if (process.env.SIEM_ENDPOINT) {
          await this.sendToSIEM(event);
        }

        // Example integration with Slack for critical events
        if (event.severity === 'critical' && process.env.SLACK_WEBHOOK_URL) {
          await this.sendToSlack(event);
        }
      }
    } catch (error) {
      logger.error('Failed to send audit event to security monitoring:', error);
    }
  }

  /**
   * Send to Datadog
   */
  private async sendToDatadog(_event: AuditEvent): Promise<void> {
    try {
      // This would be implemented with actual Datadog API client
      // const payload = {
      //   title: `Auth Audit: ${event.eventType}`,
      //   text: this.formatAuditMessage(event),
      //   alert_type: this.getDatadogAlertType(event.severity),
      //   tags: [
      //     'security',
      //     'authentication',
      //     `event_type:${event.eventType}`,
      //     `severity:${event.severity}`,
      //     event.userId ? `user_id:${event.userId}` : '',
      //     event.sessionId ? `session_id:${event.sessionId}` : '',
      //   ].filter(Boolean),
      //   timestamp: Math.floor(Date.parse(event.timestamp) / 1000),
      // };
      // await datadog.sendEvent(payload);
    } catch (error) {
      logger.error('Failed to send to Datadog:', error);
    }
  }

  /**
   * Send to custom SIEM
   */
  private async sendToSIEM(_event: AuditEvent): Promise<void> {
    try {
      // This would be implemented with your SIEM integration
      // const payload = {
      //   timestamp: event.timestamp,
      //   event_type: event.eventType,
      //   severity: event.severity,
      //   source: 'trade_x_pro_auth',
      //   user_id: event.userId,
      //   session_id: event.sessionId,
      //   ip_address: event.ipAddress,
      //   user_agent: event.userAgent,
      //   details: event.metadata,
      // };
      // await siemClient.logEvent(payload);
    } catch (error) {
      logger.error('Failed to send to SIEM:', error);
    }
  }

  /**
   * Send critical events to Slack
   */
  private async sendToSlack(_event: AuditEvent): Promise<void> {
    try {
      // This would be implemented with actual Slack webhook
      // const message = {
      //   text: `🚨 Critical Auth Event: ${event.eventType}`,
      //   attachments: [
      //     {
      //       color: 'danger',
      //       fields: [
      //         {
      //           title: 'User ID',
      //           value: event.userId || 'Unknown',
      //           short: true,
      //         },
      //         {
      //           title: 'Session ID',
      //           value: event.sessionId || 'Unknown',
      //           short: true,
      //         },
      //         {
      //           title: 'IP Address',
      //           value: event.ipAddress || 'Unknown',
      //           short: true,
      //         },
      //         { title: 'Timestamp', value: event.timestamp, short: true },
      //         {
      //           title: 'Details',
      //           value: this.formatAuditMessage(event),
      //           short: false,
      //         },
      //       ],
      //     },
      //   ],
      // };
      // await fetch(process.env.SLACK_WEBHOOK_URL!, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(message),
      // });
    } catch (error) {
      logger.error('Failed to send to Slack:', error);
    }
  }

  /**
   * Store in audit database
   */
  private async storeInAuditDatabase(_event: AuditEvent): Promise<void> {
    try {
      // This would integrate with your audit database
      // Examples: PostgreSQL audit table, MongoDB collection, etc.
      // const auditRecord = {
      //   timestamp: new Date(event.timestamp),
      //   event_type: event.eventType,
      //   user_id: event.userId,
      //   session_id: event.sessionId,
      //   ip_address: event.ipAddress,
      //   user_agent: event.userAgent,
      //   severity: event.severity,
      //   metadata: JSON.stringify(event.metadata),
      //   created_at: new Date(),
      // };
      // This would be implemented with your database client
      // await db.audit_logs.insert(auditRecord);
    } catch (error) {
      logger.error('Failed to store audit event in database:', error);
    }
  }

  /**
   * Get log level based on severity
   */
  private getLogLevel(severity: string): 'debug' | 'info' | 'warn' | 'error' {
    switch (severity) {
      case 'critical':
      case 'error':
        return 'error';
      case 'warning':
        return 'warn';
      default:
        return 'info';
    }
  }

  /**
   * Log login success
   */
  async logLoginSuccess(
    userId: string,
    sessionId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logAuthEvent({
      timestamp: new Date().toISOString(),
      eventType: 'AUTH_LOGIN_SUCCESS',
      userId,
      sessionId,
      ...(ipAddress && { ipAddress }),
      ...(userAgent && { userAgent }),
      metadata: {
        message: 'User login successful',
        method: 'pkce',
      },
      severity: 'info',
    });
  }

  /**
   * Log login failure
   */
  async logLoginFailure(
    userId: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logAuthEvent({
      timestamp: new Date().toISOString(),
      eventType: 'AUTH_LOGIN_FAILED',
      userId,
      ...(ipAddress && { ipAddress }),
      ...(userAgent && { userAgent }),
      metadata: {
        message: `Login failed: ${reason}`,
        reason,
      },
      severity: 'warning',
    });
  }

  /**
   * Log logout
   */
  async logLogout(
    userId: string,
    sessionId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logAuthEvent({
      timestamp: new Date().toISOString(),
      eventType: 'AUTH_LOGOUT',
      userId,
      sessionId,
      ...(ipAddress && { ipAddress }),
      ...(userAgent && { userAgent }),
      metadata: {
        message: 'User logout',
      },
      severity: 'info',
    });
  }

  /**
   * Log token refresh
   */
  async logTokenRefresh(
    userId: string,
    sessionId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logAuthEvent({
      timestamp: new Date().toISOString(),
      eventType: 'AUTH_TOKEN_REFRESH',
      userId,
      sessionId,
      ...(ipAddress && { ipAddress }),
      ...(userAgent && { userAgent }),
      metadata: {
        message: 'Token refresh successful',
      },
      severity: 'info',
    });
  }

  /**
   * Log suspicious activity
   */
  async logSuspiciousActivity(
    userId: string,
    activity: string,
    details: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logAuthEvent({
      timestamp: new Date().toISOString(),
      eventType: 'AUTH_SUSPICIOUS_ACTIVITY',
      userId,
      ...(ipAddress && { ipAddress }),
      ...(userAgent && { userAgent }),
      metadata: {
        message: `Suspicious activity: ${activity}`,
        activity,
        details,
      },
      severity: 'critical',
    });
  }

  /**
   * Log session timeout
   */
  async logSessionTimeout(
    userId: string,
    sessionId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logAuthEvent({
      timestamp: new Date().toISOString(),
      eventType: 'AUTH_SESSION_TIMEOUT',
      userId,
      sessionId,
      ...(ipAddress && { ipAddress }),
      ...(userAgent && { userAgent }),
      metadata: {
        message: 'Session timeout due to inactivity',
      },
      severity: 'warning',
    });
  }

  /**
   * Log multiple sessions
   */
  async logMultipleSessions(
    userId: string,
    sessionCount: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logAuthEvent({
      timestamp: new Date().toISOString(),
      eventType: 'AUTH_MULTIPLE_SESSIONS',
      userId,
      ...(ipAddress && { ipAddress }),
      ...(userAgent && { userAgent }),
      metadata: {
        message: `Multiple sessions detected: ${sessionCount}`,
        sessionCount,
      },
      severity: 'warning',
    });
  }

  /**
   * Log geolocation anomaly
   */
  async logGeolocationAnomaly(
    userId: string,
    previousLocation: string,
    currentLocation: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logAuthEvent({
      timestamp: new Date().toISOString(),
      eventType: 'AUTH_GEOLOCATION_ANOMALY',
      userId,
      ...(ipAddress && { ipAddress }),
      ...(userAgent && { userAgent }),
      metadata: {
        message: 'Geolocation anomaly detected',
        previousLocation,
        currentLocation,
      },
      severity: 'critical',
    });
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AuditConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Singleton instance of AuthAuditLogger
 */
export const authAuditLogger = new AuthAuditLogger();

/**
 * Audit logging utilities
 */
export const auditUtils = {
  /**
   * Get client IP address from request
   */
  getClientIP(req: {
    headers: Record<string, string | string[] | undefined>;
    connection?: {
      remoteAddress?: string;
      socket?: { remoteAddress?: string };
    };
    socket?: { remoteAddress?: string };
  }): string | undefined {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.connection?.socket?.remoteAddress
    );
  },

  /**
   * Get user agent from request
   */
  getUserAgent(req: {
    headers: Record<string, string | string[] | undefined>;
  }): string | undefined {
    return req.headers['user-agent'] as string;
  },

  /**
   * Sanitize sensitive data from metadata
   */
  sanitizeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
    const sanitized = { ...metadata };

    Object.keys(sanitized).forEach((key) => {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  },
};
