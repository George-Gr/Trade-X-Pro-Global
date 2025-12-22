/**
 * Security Incident Alert System
 *
 * This module provides comprehensive security incident detection, alerting, and escalation
 * for the TradePro trading platform. It monitors multiple security domains and triggers
 * appropriate responses based on incident severity and type.
 */

import { AuditEvent } from './authAuditLogger';
import { CSPViolation } from './cspViolationMonitor';
import { logger } from './logger';

export interface SecurityIncident {
  id: string;
  timestamp: string;
  type: SecurityIncidentType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedUsers: string[];
  sourceIPs: string[];
  metadata: Record<string, unknown>;
  status: 'detected' | 'investigating' | 'mitigated' | 'resolved';
  assignedTo?: string;
  escalatedAt?: string;
}

export type SecurityIncidentType =
  | 'AUTH_BREACH' // Authentication compromise
  | 'XSS_ATTACK' // Cross-site scripting
  | 'CSRF_ATTACK' // Cross-site request forgery
  | 'DDOS_ATTACK' // Distributed denial of service
  | 'DATA_EXFILTRATION' // Unauthorized data access
  | 'PRIVILEGE_ESCALATION' // Unauthorized privilege increase
  | 'MALWARE_DETECTION' // Malicious software detected
  | 'SUSPICIOUS_ACTIVITY' // Unusual user behavior
  | 'GEOLOCATION_ANOMALY' // Geographic access anomaly
  | 'MULTIPLE_FAILED_LOGINS' // Brute force attack
  | 'TOKEN_THEFT' // Authentication token compromise
  | 'SYSTEM_COMPROMISE'; // System integrity violation;

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  incidentType: SecurityIncidentType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  conditions: AlertCondition[];
  enabled: boolean;
  cooldownMinutes: number;
  escalationLevel: 'immediate' | 'hourly' | 'daily';
}

export interface AlertCondition {
  type: 'threshold' | 'pattern' | 'time_window' | 'user_behavior';
  operator: 'gt' | 'lt' | 'eq' | 'contains' | 'regex';
  value: number | string | string[];
  field: string;
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';
  config: {
    webhookUrl?: string;
    timeout?: number;
    [key: string]: unknown;
  };
  enabled: boolean;
  recipients: string[];
}

export interface SecurityAlertConfig {
  enabled: boolean;
  rules: AlertRule[];
  channels: AlertChannel[];
  escalation: {
    immediate: string[];
    hourly: string[];
    daily: string[];
  };
  autoMitigation: {
    enabled: boolean;
    actions: SecurityAction[];
  };
}

export interface SecurityAction {
  type:
    | 'block_ip'
    | 'lock_account'
    | 'force_logout'
    | 'disable_user'
    | 'alert_only';
  description: string;
  requiresApproval: boolean;
  timeoutMinutes?: number;
}

export interface AlertMessage {
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  incidentId: string;
  type: SecurityIncidentType;
  affectedUsers: string[];
  sourceIPs: string[];
  timestamp: string;
  status: 'detected' | 'investigating' | 'mitigated' | 'resolved';
  metadata: Record<string, unknown>;
}

export interface SecurityReport {
  total: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  recent: SecurityIncident[];
}

export class SecurityIncidentAlertSystem {
  private incidents: Map<string, SecurityIncident> = new Map();
  private alertRules: Map<string, AlertRule> = new Map();
  private alertChannels: Map<string, AlertChannel> = new Map();
  private config: SecurityAlertConfig;
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
  private readonly MAX_ENTRIES_PER_KEY = 100;
  private readonly MAX_KEYS = 10000;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private cooldowns: Map<string, number> = new Map();
  private authFailureTimestamps: Map<string, number[]> = new Map();
  private xssAttemptTimestamps: Map<string, number[]> = new Map();

  constructor(config?: Partial<SecurityAlertConfig>) {
    this.config = {
      enabled: true,
      rules: [],
      channels: [],
      escalation: {
        immediate: [],
        hourly: [],
        daily: [],
      },
      autoMitigation: {
        enabled: false,
        actions: [],
      },
      ...config,
    };

    this.initializeDefaultRules();
    this.startCleanupTimer();
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'rule_001',
        name: 'Multiple Failed Login Attempts',
        description: 'Detects potential brute force attacks',
        incidentType: 'MULTIPLE_FAILED_LOGINS',
        severity: 'high',
        conditions: [
          {
            type: 'threshold',
            operator: 'gt',
            value: 5,
            field: 'failed_logins_per_hour',
          },
          {
            type: 'time_window',
            operator: 'lt',
            value: 60,
            field: 'time_window_minutes',
          },
        ],
        enabled: true,
        cooldownMinutes: 15,
        escalationLevel: 'immediate',
      },
      {
        id: 'rule_002',
        name: 'Geographic Anomaly Detection',
        description: 'Detects logins from unusual geographic locations',
        incidentType: 'GEOLOCATION_ANOMALY',
        severity: 'critical',
        conditions: [
          {
            type: 'pattern',
            operator: 'contains',
            value: ['AUTH_GEOLOCATION_ANOMALY'],
            field: 'auth_event_types',
          },
        ],
        enabled: true,
        cooldownMinutes: 60,
        escalationLevel: 'immediate',
      },
      {
        id: 'rule_003',
        name: 'XSS Attack Detection',
        description: 'Detects cross-site scripting attempts',
        incidentType: 'XSS_ATTACK',
        severity: 'critical',
        conditions: [
          {
            type: 'threshold',
            operator: 'gt',
            value: 3,
            field: 'xss_violations_per_hour',
          },
        ],
        enabled: true,
        cooldownMinutes: 30,
        escalationLevel: 'immediate',
      },
      {
        id: 'rule_004',
        name: 'Suspicious User Activity',
        description: 'Detects unusual user behavior patterns',
        incidentType: 'SUSPICIOUS_ACTIVITY',
        severity: 'medium',
        conditions: [
          {
            type: 'threshold',
            operator: 'gt',
            value: 10,
            field: 'suspicious_events_per_hour',
          },
        ],
        enabled: true,
        cooldownMinutes: 45,
        escalationLevel: 'hourly',
      },
      {
        id: 'rule_005',
        name: 'Privilege Escalation Attempt',
        description: 'Detects unauthorized privilege increases',
        incidentType: 'PRIVILEGE_ESCALATION',
        severity: 'critical',
        conditions: [
          {
            type: 'pattern',
            operator: 'contains',
            value: ['AUTH_PRIVILEGE_ESCALATION'],
            field: 'auth_event_types',
          },
        ],
        enabled: true,
        cooldownMinutes: 120,
        escalationLevel: 'immediate',
      },
    ];

    defaultRules.forEach((rule) => this.alertRules.set(rule.id, rule));
  }

  /**
   * Process authentication event for security analysis
   */
  async processAuthEvent(event: AuditEvent): Promise<void> {
    if (!this.config.enabled) return;

    try {
      // Update counters first
      if (event.eventType === 'AUTH_LOGIN_FAILED' && event.userId) {
        let timestamps = this.authFailureTimestamps.get(event.userId);
        if (!timestamps) {
          if (this.authFailureTimestamps.size >= this.MAX_KEYS) {
            const firstKey = this.authFailureTimestamps.keys().next().value;
            this.authFailureTimestamps.delete(firstKey);
          }
          timestamps = [];
        }
        if (timestamps.length >= this.MAX_ENTRIES_PER_KEY) {
          timestamps.shift();
        }
        timestamps.push(Date.now());
        this.authFailureTimestamps.set(event.userId, timestamps);
      }

      // Analyze event for security patterns
      const incidents = await this.analyzeAuthEvent(event);

      // Create and process incidents
      for (const incident of incidents) {
        await this.createSecurityIncident(incident);
      }
    } catch (error) {
      logger.error('Failed to process auth event:', error);
    }
  }

  /**
   * Process CSP violation for security analysis
   */
  async processCSPViolation(violation: CSPViolation): Promise<void> {
    if (!this.config.enabled) return;

    try {
      // Update counters first
      if (
        (violation.category === 'xss_attempt' ||
          violation.category === 'malicious_script') &&
        violation.clientIP
      ) {
        let timestamps = this.xssAttemptTimestamps.get(violation.clientIP);
        if (!timestamps) {
          if (this.xssAttemptTimestamps.size >= this.MAX_KEYS) {
            const firstKey = this.xssAttemptTimestamps.keys().next().value;
            this.xssAttemptTimestamps.delete(firstKey);
          }
          timestamps = [];
        }
        if (timestamps.length >= this.MAX_ENTRIES_PER_KEY) {
          timestamps.shift();
        }
        timestamps.push(Date.now());
        this.xssAttemptTimestamps.set(violation.clientIP, timestamps);
      }

      // Analyze violation for security patterns
      const incidents = await this.analyzeCSPViolation(violation);

      // Create and process incidents
      for (const incident of incidents) {
        await this.createSecurityIncident(incident);
      }
    } catch (error) {
      logger.error('Failed to process CSP violation:', error);
    }
  }

  /**
   * Analyze authentication event for security incidents
   */
  private async analyzeAuthEvent(
    event: AuditEvent
  ): Promise<SecurityIncident[]> {
    const incidents: SecurityIncident[] = [];

    // Check for failed login patterns
    if (
      event.eventType === 'AUTH_LOGIN_FAILED' &&
      event.userId &&
      event.ipAddress
    ) {
      const recentFailures = await this.getRecentAuthFailures(event.userId);
      if (recentFailures >= 5) {
        incidents.push({
          id: this.generateIncidentId('MULTIPLE_FAILED_LOGINS'),
          timestamp: new Date().toISOString(),
          type: 'MULTIPLE_FAILED_LOGINS',
          severity: 'high',
          title: 'Multiple Failed Login Attempts Detected',
          description: `User ${event.userId} has ${recentFailures} failed login attempts in the last hour`,
          affectedUsers: [event.userId],
          sourceIPs: [event.ipAddress],
          metadata: { failedAttempts: recentFailures, timeWindow: '1 hour' },
          status: 'detected',
        });
      }
    }

    // Check for geolocation anomalies
    if (
      event.eventType === 'AUTH_GEOLOCATION_ANOMALY' &&
      event.userId &&
      event.ipAddress
    ) {
      incidents.push({
        id: this.generateIncidentId('GEOLOCATION_ANOMALY'),
        timestamp: new Date().toISOString(),
        type: 'GEOLOCATION_ANOMALY',
        severity: 'critical',
        title: 'Geographic Anomaly Detected',
        description: `User ${event.userId} logged in from unusual location`,
        affectedUsers: [event.userId],
        sourceIPs: [event.ipAddress],
        metadata: event.metadata,
        status: 'detected',
      });
    }

    // Check for suspicious activity
    if (
      event.eventType === 'AUTH_SUSPICIOUS_ACTIVITY' &&
      event.userId &&
      event.ipAddress
    ) {
      const message =
        typeof event.metadata.message === 'string'
          ? event.metadata.message
          : 'Suspicious activity detected';
      incidents.push({
        id: this.generateIncidentId('SUSPICIOUS_ACTIVITY'),
        timestamp: new Date().toISOString(),
        type: 'SUSPICIOUS_ACTIVITY',
        severity: 'medium',
        title: 'Suspicious Activity Detected',
        description: message,
        affectedUsers: [event.userId],
        sourceIPs: [event.ipAddress],
        metadata: event.metadata,
        status: 'detected',
      });
    }

    return incidents;
  }

  /**
   * Analyze CSP violation for security incidents
   */
  private async analyzeCSPViolation(
    violation: CSPViolation
  ): Promise<SecurityIncident[]> {
    const incidents: SecurityIncident[] = [];

    // Check for XSS attempts
    if (
      violation.category === 'xss_attempt' ||
      violation.category === 'malicious_script'
    ) {
      const recentXSS = await this.getRecentXSSAttempts(violation.clientIP);
      if (recentXSS >= 3) {
        incidents.push({
          id: this.generateIncidentId('XSS_ATTACK'),
          timestamp: new Date().toISOString(),
          type: 'XSS_ATTACK',
          severity: 'critical',
          title: 'XSS Attack Detected',
          description: `Multiple XSS attempts detected from ${violation.clientIP}`,
          affectedUsers: [],
          sourceIPs: [violation.clientIP],
          metadata: {
            violations: recentXSS,
            blockedUri: violation.blockedUri,
            scriptSample: violation.scriptSample,
          },
          status: 'detected',
        });
      }
    }

    return incidents;
  }

  /**
   * Create security incident
   */
  private async createSecurityIncident(
    incident: SecurityIncident
  ): Promise<void> {
    // Check cooldown
    const cooldownKey = `${incident.type}_${incident.sourceIPs.join('_')}`;
    const lastIncident = this.cooldowns.get(cooldownKey);
    const cooldownMinutes = this.getRuleCooldown(incident.type);

    if (
      lastIncident &&
      Date.now() - lastIncident < cooldownMinutes * 60 * 1000
    ) {
      return; // Skip due to cooldown
    }

    // Store incident
    this.incidents.set(incident.id, incident);
    this.cooldowns.set(cooldownKey, Date.now());

    // Trigger alerts
    await this.triggerAlerts(incident);

    // Auto-mitigation
    if (this.config.autoMitigation.enabled) {
      await this.executeAutoMitigation(incident);
    }

    // Log incident
    logger.warn('Security Incident Detected', {
      metadata: {
        id: incident.id,
        type: incident.type,
        severity: incident.severity,
        title: incident.title,
        affectedUsers: incident.affectedUsers,
        sourceIPs: incident.sourceIPs,
      },
    });
  }

  /**
   * Trigger alerts for security incident
   */
  private async triggerAlerts(incident: SecurityIncident): Promise<void> {
    try {
      // Send to configured channels (use dynamic channels if available, fallback to config)
      const channelsToUse =
        this.alertChannels.size > 0
          ? Array.from(this.alertChannels.values())
          : this.config.channels;
      for (const channel of channelsToUse) {
        if (channel.enabled) {
          await this.sendAlertToChannel(incident, channel);
        }
      }

      // Send to escalation channels
      const escalationLevel = this.getEscalationLevel(incident.severity);
      const escalationRecipients = this.config.escalation[escalationLevel];

      if (escalationRecipients.length > 0) {
        await this.sendEscalationAlert(incident, escalationRecipients);
      }
    } catch (error) {
      logger.error('Failed to trigger alerts:', error);
    }
  }

  /**
   * Send alert to specific channel
   */
  private async sendAlertToChannel(
    incident: SecurityIncident,
    channel: AlertChannel
  ): Promise<void> {
    try {
      const alertMessage = this.formatAlertMessage(incident);

      switch (channel.type) {
        case 'email':
          await this.sendEmailAlert(channel, alertMessage);
          break;
        case 'slack':
          await this.sendSlackAlert(channel, alertMessage);
          break;
        case 'webhook':
          await this.sendWebhookAlert(channel, alertMessage);
          break;
        case 'sms':
          await this.sendSMSAlert(channel, alertMessage);
          break;
        case 'pagerduty':
          await this.sendPagerDutyAlert(channel, alertMessage);
          break;
      }
    } catch (error) {
      logger.error(`Failed to send alert to ${channel.type}:`, error);
    }
  }

  /**
   * Format alert message
   */
  private formatAlertMessage(incident: SecurityIncident): AlertMessage {
    return {
      title: `🚨 Security Incident: ${incident.title}`,
      severity: incident.severity,
      description: incident.description,
      incidentId: incident.id,
      type: incident.type,
      affectedUsers: incident.affectedUsers,
      sourceIPs: incident.sourceIPs,
      timestamp: incident.timestamp,
      status: incident.status,
      metadata: incident.metadata,
    };
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(
    channel: AlertChannel,
    message: AlertMessage
  ): Promise<void> {
    // Implementation would integrate with email service
    logger.info('Email alert sent:', { metadata: { channel, message } });
  }

  /**
   * Send Slack alert
   */
  private async sendSlackAlert(
    _channel: AlertChannel,
    message: AlertMessage
  ): Promise<void> {
    if (!process.env.SLACK_WEBHOOK_URL) return;

    const payload = {
      text: message.title,
      attachments: [
        {
          color: this.getSeverityColor(message.severity),
          fields: [
            { title: 'Incident ID', value: message.incidentId, short: true },
            { title: 'Type', value: message.type, short: true },
            {
              title: 'Severity',
              value: message.severity.toUpperCase(),
              short: true,
            },
            {
              title: 'Affected Users',
              value: message.affectedUsers.join(', ') || 'None',
              short: true,
            },
            {
              title: 'Source IPs',
              value: message.sourceIPs.join(', '),
              short: false,
            },
            {
              title: 'Description',
              value: message.description,
              short: false,
            },
          ],
          footer: 'TradePro Security Monitoring',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (error) {
      logger.error('Failed to send Slack alert:', error);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async sendWebhookAlert(
    channel: AlertChannel,
    message: AlertMessage
  ): Promise<void> {
    if (!channel.config.webhookUrl) return;

    const timeout = channel.config.timeout || 10000; // Default to 10 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      await fetch(channel.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        logger.warn(
          `Webhook alert request timed out after ${timeout}ms for channel: ${channel.type}`
        );
      } else {
        logger.error('Failed to send webhook alert:', error);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Send SMS alert
   */
  private async sendSMSAlert(
    channel: AlertChannel,
    message: AlertMessage
  ): Promise<void> {
    // Implementation would integrate with SMS service
    logger.info('SMS alert sent:', { metadata: { channel, message } });
  }

  /**
   * Send PagerDuty alert
   */
  private async sendPagerDutyAlert(
    channel: AlertChannel,
    message: AlertMessage
  ): Promise<void> {
    // Implementation would integrate with PagerDuty API
    logger.info('PagerDuty alert sent:', { metadata: { channel, message } });
  }

  /**
   * Send escalation alert
   */
  private async sendEscalationAlert(
    incident: SecurityIncident,
    recipients: string[]
  ): Promise<void> {
    const escalationMessage = {
      title: `🚨 ESCALATION: ${incident.title}`,
      severity: incident.severity,
      description: `This incident requires immediate attention: ${incident.description}`,
      incidentId: incident.id,
      type: incident.type,
      affectedUsers: incident.affectedUsers,
      sourceIPs: incident.sourceIPs,
      timestamp: incident.timestamp,
      status: incident.status,
      escalationLevel: this.getEscalationLevel(incident.severity),
    };

    // Send to escalation channels
    for (const recipient of recipients) {
      // Implementation would send to escalation recipients
      logger.info('Escalation alert sent:', {
        metadata: { recipient, message: escalationMessage },
      });
    }
  }

  /**
   * Execute auto-mitigation actions
   */
  private async executeAutoMitigation(
    incident: SecurityIncident
  ): Promise<void> {
    try {
      const actions = this.getMitigationActions(incident.type);

      for (const action of actions) {
        await this.executeMitigationAction(incident, action);
      }
    } catch (error) {
      logger.error('Failed to execute auto-mitigation:', error);
    }
  }

  /**
   * Check if mitigation should abort due to approval requirement
   */
  private shouldAbortForApproval(
    action: SecurityAction,
    incident: SecurityIncident
  ): boolean {
    if (action.requiresApproval) {
      logger.warn('Approval required for mitigation action:', {
        metadata: { incidentId: incident.id, action },
      });
      return action.type !== 'alert_only';
    }
    return false;
  }

  /**
   * Execute specific mitigation action
   */
  private async executeMitigationAction(
    incident: SecurityIncident,
    action: SecurityAction
  ): Promise<void> {
    logger.info('Executing mitigation action:', {
      metadata: { incidentId: incident.id, action },
    });

    if (this.shouldAbortForApproval(action, incident)) return;

    switch (action.type) {
      case 'block_ip':
        await this.blockIPs(incident.sourceIPs);
        break;
      case 'lock_account':
        await this.lockAccounts(incident.affectedUsers);
        break;
      case 'force_logout':
        await this.forceLogoutUsers(incident.affectedUsers);
        break;
      case 'disable_user':
        await this.disableUsers(incident.affectedUsers);
        break;
      case 'alert_only':
        // Only send alerts, no automatic action
        break;
    }
  }

  /**
   * Block IP addresses
   */
  private async blockIPs(ips: string[]): Promise<void> {
    // Implementation would integrate with firewall/security system
    logger.info('IPs blocked:', { metadata: { ips } });
  }

  /**
   * Lock user accounts
   */
  private async lockAccounts(userIds: string[]): Promise<void> {
    // Implementation would integrate with authentication system
    logger.info('Accounts locked:', { metadata: { userIds } });
  }

  /**
   * Force logout users
   */
  private async forceLogoutUsers(userIds: string[]): Promise<void> {
    // Implementation would integrate with session management
    logger.info('Users logged out:', { metadata: { userIds } });
  }

  /**
   * Disable users
   */
  private async disableUsers(userIds: string[]): Promise<void> {
    // Implementation would integrate with user management system
    logger.info('Users disabled:', { metadata: { userIds } });
  }

  /**
   * Get recent authentication failures for user
   */
  private async getRecentAuthFailures(userId: string): Promise<number> {
    const timestamps = this.authFailureTimestamps.get(userId) || [];
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return timestamps.filter((t) => t > oneHourAgo).length;
  }

  /**
   * Get recent XSS attempts from IP
   */
  private async getRecentXSSAttempts(ip: string): Promise<number> {
    const timestamps = this.xssAttemptTimestamps.get(ip) || [];
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return timestamps.filter((t) => t > oneHourAgo).length;
  }

  /**
   * Get rule cooldown for incident type
   */
  private getRuleCooldown(incidentType: SecurityIncidentType): number {
    for (const rule of this.alertRules.values()) {
      if (rule.incidentType === incidentType) {
        return rule.cooldownMinutes;
      }
    }
    return 60; // Default cooldown
  }

  /**
   * Get escalation level based on severity
   */
  private getEscalationLevel(
    severity: string
  ): 'immediate' | 'hourly' | 'daily' {
    switch (severity) {
      case 'critical':
        return 'immediate';
      case 'high':
        return 'immediate';
      case 'medium':
        return 'hourly';
      case 'low':
        return 'daily';
      default:
        return 'daily';
    }
  }

  /**
   * Get severity color for alerts
   */
  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'warning';
      case 'low':
        return 'good';
      default:
        return 'good';
    }
  }

  /**
   * Get mitigation actions for incident type and severity
   */
  private getMitigationActions(
    incidentType: SecurityIncidentType
  ): SecurityAction[] {
    const actions: SecurityAction[] = [];

    switch (incidentType) {
      case 'MULTIPLE_FAILED_LOGINS':
        actions.push({
          type: 'block_ip',
          description: 'Block source IP',
          requiresApproval: false,
        });
        break;
      case 'XSS_ATTACK':
        actions.push({
          type: 'block_ip',
          description: 'Block malicious IP',
          requiresApproval: false,
        });
        break;
      case 'GEOLOCATION_ANOMALY':
        actions.push({
          type: 'force_logout',
          description: 'Force user logout',
          requiresApproval: true,
        });
        break;
      case 'PRIVILEGE_ESCALATION':
        actions.push({
          type: 'disable_user',
          description: 'Disable user account',
          requiresApproval: true,
        });
        break;
    }

    return actions;
  }

  /**
   * Generate unique incident ID
   */
  private generateIncidentId(type: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 11);
    return `${type}_${timestamp}_${random}`;
  }

  /**
   * Get security incidents report
   */
  getIncidentsReport(hours: number = 24): SecurityReport {
    const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
    const incidents = Array.from(this.incidents.values()).filter(
      (i) => new Date(i.timestamp).getTime() > cutoffTime
    );

    return {
      total: incidents.length,
      bySeverity: this.groupBy(incidents, 'severity'),
      byType: this.groupBy(incidents, 'type'),
      byStatus: this.groupBy(incidents, 'status'),
      recent: incidents.slice(0, 10),
    };
  }

  /**
   * Group incidents by property
   */
  private groupBy(
    incidents: SecurityIncident[],
    property: keyof SecurityIncident
  ): Record<string, number> {
    return incidents.reduce((acc, incident) => {
      const key = incident[property] as string;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupOldIncidents();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Cleanup old incidents
   */
  private cleanupOldIncidents(): void {
    const cutoffTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days

    for (const [id, incident] of this.incidents.entries()) {
      if (new Date(incident.timestamp).getTime() < cutoffTime) {
        this.incidents.delete(id);
      }
    }

    // Cleanup auth failure timestamps
    for (const [userId, timestamps] of this.authFailureTimestamps.entries()) {
      const filtered = timestamps.filter((t) => t > cutoffTime);
      if (filtered.length === 0) {
        this.authFailureTimestamps.delete(userId);
      } else {
        this.authFailureTimestamps.set(userId, filtered);
      }
    }

    // Cleanup XSS attempt timestamps
    for (const [ip, timestamps] of this.xssAttemptTimestamps.entries()) {
      const filtered = timestamps.filter((t) => t > cutoffTime);
      if (filtered.length === 0) {
        this.xssAttemptTimestamps.delete(ip);
      } else {
        this.xssAttemptTimestamps.set(ip, filtered);
      }
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SecurityAlertConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Add alert rule
   */
  addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
  }

  /**
   * Remove alert rule
   */
  removeAlertRule(ruleId: string): void {
    this.alertRules.delete(ruleId);
  }

  /**
   * Add alert channel
   */
  addAlertChannel(channel: AlertChannel): void {
    this.alertChannels.set(channel.type, channel);
  }

  /**
   * Remove alert channel
   */
  removeAlertChannel(channelType: string): void {
    this.alertChannels.delete(channelType);
  }

  /**
   * Destroy system
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.incidents.clear();
    this.alertRules.clear();
    this.alertChannels.clear();
    this.cooldowns.clear();
    this.authFailureTimestamps.clear();
    this.xssAttemptTimestamps.clear();
  }
}

/**
 * Lazy-initialized instance of SecurityIncidentAlertSystem
 */
let _securityAlertSystem: SecurityIncidentAlertSystem | null = null;

/**
 * Security alerting utilities
 */
export const securityAlertUtils = {
  /**
   * Initialize security alerting (lazy initialization)
   */
  init(config?: Partial<SecurityAlertConfig>): SecurityIncidentAlertSystem {
    if (!_securityAlertSystem) {
      _securityAlertSystem = new SecurityIncidentAlertSystem(config);
    }
    return _securityAlertSystem;
  },

  /**
   * Get the initialized security alert system instance
   */
  get instance(): SecurityIncidentAlertSystem {
    if (!_securityAlertSystem) {
      throw new Error(
        'Security alert system not initialized. Call init() first.'
      );
    }
    return _securityAlertSystem;
  },

  /**
   * Get security incidents report
   */
  getReport(hours: number = 24): SecurityReport {
    return this.instance.getIncidentsReport(hours);
  },

  /**
   * Process authentication event
   */
  async processAuthEvent(event: AuditEvent): Promise<void> {
    await this.instance.processAuthEvent(event);
  },

  /**
   * Process CSP violation
   */
  async processCSPViolation(violation: CSPViolation): Promise<void> {
    await this.instance.processCSPViolation(violation);
  },
};
