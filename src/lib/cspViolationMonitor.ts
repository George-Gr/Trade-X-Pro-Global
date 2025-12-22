/**
 * CSP Violation Monitor
 *
 * This module provides comprehensive monitoring and alerting for Content Security Policy violations.
 * It processes violation reports, analyzes patterns, and triggers appropriate alerts based on severity.
 */

import { logger } from './logger';

export interface CSPViolation {
  id: string;
  timestamp: string;
  documentUri: string;
  referrer: string;
  violatedDirective: string;
  effectiveDirective: string;
  originalPolicy: string;
  blockedUri: string;
  sourceFile: string;
  lineNumber: number;
  columnNumber: number;
  statusCode: number;
  scriptSample: string;
  userAgent: string;
  clientIP: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category:
    | 'xss_attempt'
    | 'malicious_script'
    | 'misconfiguration'
    | 'third_party'
    | 'unknown';
  count: number;
  lastSeen: string;
  occurrences: string[];
}

export interface CSPViolationReport {
  violations: CSPViolation[];
  summary: {
    total: number;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
    byDirective: Record<string, number>;
    uniqueSources: number;
  };
  patterns: {
    frequentBlockedUris: string[];
    suspiciousUserAgents: string[];
    attackPatterns: string[];
  };
}

export interface AlertConfig {
  enabled: boolean;
  thresholds: {
    violationsPerHour: number;
    criticalViolationsPerHour: number;
    uniqueSourcesPerHour: number;
  };
  alertChannels: {
    email: string[];
    slack: string[];
    webhook: string[];
  };
  escalation: {
    immediate: string[];
    hourly: string[];
    daily: string[];
  };
}

export interface CSPReport {
  'document-uri': string;
  referrer: string;
  'violated-directive': string;
  'effective-directive': string;
  'original-policy': string;
  'blocked-uri': string;
  'source-file': string;
  'line-number': number;
  'column-number': number;
  'status-code': number;
  'script-sample': string;
}

export interface RawCSPReport {
  'csp-report': CSPReport;
  userAgent?: string;
  clientIP?: string;
}

export interface AlertMessage extends Record<string, unknown> {
  title: string;
  severity: string;
  message: string;
  details: Record<string, unknown>;
}

class CSPViolationMonitor {
  private violations: Map<string, CSPViolation> = new Map();
  private alertConfig: AlertConfig;
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
  private readonly MAX_VIOLATIONS = 10000;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config?: Partial<AlertConfig>) {
    this.alertConfig = {
      enabled: true,
      thresholds: {
        violationsPerHour: 100,
        criticalViolationsPerHour: 10,
        uniqueSourcesPerHour: 50,
      },
      alertChannels: {
        email: [],
        slack: [],
        webhook: [],
      },
      escalation: {
        immediate: [],
        hourly: [],
        daily: [],
      },
      ...config,
    };
  }

  /**
   * Process a CSP violation report
   */
  async processViolation(report: RawCSPReport): Promise<void> {
    try {
      const violation = this.parseViolation(report);
      this.storeViolation(violation);

      // Analyze and trigger alerts
      await this.analyzeViolation(violation);

      // Log the violation
      logger.warn('CSP Violation Detected', {
        metadata: {
          id: violation.id,
          severity: violation.severity,
          category: violation.category,
          violatedDirective: violation.violatedDirective,
          blockedUri: violation.blockedUri,
          clientIP: violation.clientIP,
          userAgent: violation.userAgent,
        },
      });
    } catch (error) {
      logger.error('Failed to process CSP violation:', error);
    }
  }

  /**
   * Parse CSP violation report into structured format
   */
  private parseViolation(report: RawCSPReport): CSPViolation {
    const cspReport = report['csp-report'];
    const timestamp = new Date().toISOString();

    return {
      id: this.generateViolationId(cspReport),
      timestamp,
      documentUri: cspReport['document-uri'],
      referrer: cspReport.referrer,
      violatedDirective: cspReport['violated-directive'],
      effectiveDirective: cspReport['effective-directive'],
      originalPolicy: cspReport['original-policy'],
      blockedUri: cspReport['blocked-uri'],
      sourceFile: cspReport['source-file'],
      lineNumber: cspReport['line-number'],
      columnNumber: cspReport['column-number'],
      statusCode: cspReport['status-code'],
      scriptSample: cspReport['script-sample'],
      userAgent: report.userAgent || 'Unknown',
      clientIP: report.clientIP || 'Unknown',
      severity: this.calculateSeverity(cspReport),
      category: this.categorizeViolation(cspReport),
      count: 1,
      lastSeen: timestamp,
      occurrences: [timestamp],
    };
  }

  /**
   * Calculate violation severity
   */
  private calculateSeverity(
    cspReport: CSPReport
  ): 'low' | 'medium' | 'high' | 'critical' {
    const directive = cspReport['violated-directive'];
    const blockedUri = cspReport['blocked-uri'];
    const scriptSample = cspReport['script-sample'];

    // Critical: Script violations with suspicious content
    if (
      directive.includes('script-src') &&
      this.isSuspiciousScript(scriptSample)
    ) {
      return 'critical';
    }

    // High: Script violations or data exfiltration attempts
    if (
      directive.includes('script-src') ||
      (directive.includes('connect-src') && blockedUri.includes('data:'))
    ) {
      return 'high';
    }

    // Medium: Style or image violations that could be malicious
    if (directive.includes('style-src') || directive.includes('img-src')) {
      return 'medium';
    }

    // Low: Other violations (fonts, media, etc.)
    return 'low';
  }

  /**
   * Categorize violation type
   */
  private categorizeViolation(
    cspReport: CSPReport
  ):
    | 'xss_attempt'
    | 'malicious_script'
    | 'misconfiguration'
    | 'third_party'
    | 'unknown' {
    const blockedUri = cspReport['blocked-uri'];
    const scriptSample = cspReport['script-sample'];
    const sourceFile = cspReport['source-file'];

    // XSS attempts
    if (this.isSuspiciousScript(scriptSample)) {
      return 'xss_attempt';
    }

    // Malicious scripts
    if (
      blockedUri.includes('javascript:') ||
      blockedUri.includes('data:text/javascript')
    ) {
      return 'malicious_script';
    }

    // Third-party violations
    if (this.isThirdPartyDomain(blockedUri)) {
      return 'third_party';
    }

    // Misconfiguration
    if (
      this.isInternalResource(blockedUri) ||
      this.isDevelopmentResource(sourceFile)
    ) {
      return 'misconfiguration';
    }

    return 'unknown';
  }

  /**
   * Check if script sample is suspicious
   */
  private isSuspiciousScript(scriptSample: string): boolean {
    if (!scriptSample) return false;

    const suspiciousPatterns = [
      /eval\s*\(/i,
      /document\.write/i,
      /innerHTML\s*=/i,
      /outerHTML\s*=/i,
      /document\.location/i,
      /window\.location/i,
      /XMLHttpRequest/i,
      /fetch\s*\(/i,
      /script\s*src/i,
      /iframe\s*src/i,
      /javascript:/i,
      /data:text\/javascript/i,
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(scriptSample));
  }

  /**
   * Check if domain is third-party
   */
  private isThirdPartyDomain(uri: string): boolean {
    const knownDomains = [
      'localhost',
      '127.0.0.1',
      'tradingview.com',
      'supabase.co',
      'cdn.jsdelivr.net',
      'fonts.googleapis.com',
      'fonts.gstatic.com',
    ];

    return !knownDomains.some((domain) => uri.includes(domain));
  }

  /**
   * Check if resource is internal
   */
  private isInternalResource(uri: string): boolean {
    const hostname =
      typeof window !== 'undefined'
        ? window.location.hostname
        : process.env.HOSTNAME || '';
    return (
      (hostname !== '' && uri.includes(hostname)) ||
      uri.startsWith('/') ||
      uri.startsWith('./') ||
      uri.startsWith('../')
    );
  }

  /**
   * Check if resource is development-related
   */
  private isDevelopmentResource(sourceFile: string): boolean {
    return (
      sourceFile.includes('node_modules') ||
      sourceFile.includes('webpack') ||
      sourceFile.includes('vite') ||
      sourceFile.includes('devtools')
    );
  }

  /**
   * Generate unique violation ID
   */
  private generateViolationId(cspReport: CSPReport): string {
    const hashInput = `${cspReport['violated-directive']}-${cspReport['blocked-uri']}-${cspReport['source-file']}`;
    return this.hashString(hashInput);
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Store violation in memory
   */
  private storeViolation(violation: CSPViolation): void {
    const newTimestamp = new Date().toISOString();
    if (this.violations.has(violation.id)) {
      const existing = this.violations.get(violation.id)!;
      existing.occurrences.push(newTimestamp);
      existing.lastSeen = newTimestamp;
      existing.count++;
    } else {
      violation.occurrences = [violation.timestamp];
      violation.lastSeen = violation.timestamp;
      violation.count = 1;
      this.violations.set(violation.id, violation);
    }

    // Limit memory usage
    if (this.violations.size > this.MAX_VIOLATIONS) {
      let minKey: string | null = null;
      let minTimestamp: string | null = null;

      for (const [key, violation] of this.violations.entries()) {
        const lastSeen = violation.lastSeen;
        if (lastSeen && (minTimestamp === null || lastSeen < minTimestamp)) {
          minTimestamp = lastSeen;
          minKey = key;
        }
      }

      if (minKey) {
        this.violations.delete(minKey);
      }
    }
  }

  /**
   * Analyze violation and trigger alerts
   */
  private async analyzeViolation(violation: CSPViolation): Promise<void> {
    if (!this.alertConfig.enabled) return;

    // Check immediate alerts for critical violations
    if (violation.severity === 'critical') {
      await this.sendImmediateAlert(violation);
    }

    // Check threshold-based alerts
    await this.checkThresholdAlerts();
  }

  /**
   * Send immediate alert for critical violations
   */
  private async sendImmediateAlert(violation: CSPViolation): Promise<void> {
    const alertMessage = {
      title: '🚨 Critical CSP Violation Detected',
      severity: 'critical',
      message: `XSS attempt blocked: ${violation.violatedDirective}`,
      details: {
        blockedUri: violation.blockedUri,
        scriptSample: violation.scriptSample,
        clientIP: violation.clientIP,
        userAgent: violation.userAgent,
        timestamp: violation.timestamp,
      },
    };

    await this.sendAlert(alertMessage, 'immediate');
  }

  /**
   * Check threshold-based alerts
   */
  private async checkThresholdAlerts(): Promise<void> {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    const recentViolations = Array.from(this.violations.values()).filter((v) =>
      v.occurrences.some((ts) => new Date(ts).getTime() > oneHourAgo)
    );

    const totalRecentCount = recentViolations.reduce(
      (sum, v) =>
        sum +
        v.occurrences.filter((ts) => new Date(ts).getTime() > oneHourAgo)
          .length,
      0
    );
    const criticalRecentCount = recentViolations
      .filter((v) => v.severity === 'critical')
      .reduce(
        (sum, v) =>
          sum +
          v.occurrences.filter((ts) => new Date(ts).getTime() > oneHourAgo)
            .length,
        0
      );
    const uniqueSources = new Set(recentViolations.map((v) => v.clientIP)).size;

    // Check violation count threshold
    if (totalRecentCount > this.alertConfig.thresholds.violationsPerHour) {
      await this.sendThresholdAlert('violations', totalRecentCount);
    }

    // Check critical violation threshold
    if (
      criticalRecentCount >
      this.alertConfig.thresholds.criticalViolationsPerHour
    ) {
      await this.sendThresholdAlert('critical_violations', criticalRecentCount);
    }

    // Check unique sources threshold
    if (uniqueSources > this.alertConfig.thresholds.uniqueSourcesPerHour) {
      await this.sendThresholdAlert('unique_sources', uniqueSources);
    }
  }

  /**
   * Send threshold-based alert
   */
  private async sendThresholdAlert(type: string, count: number): Promise<void> {
    const alertMessage = {
      title: `⚠️ High Volume CSP Violations`,
      severity: 'warning',
      message: `${type.replace('_', ' ')} threshold exceeded: ${count}`,
      details: {
        threshold: this.getThreshold(type),
        currentCount: count,
        timeWindow: '1 hour',
      },
    };

    await this.sendAlert(alertMessage, 'hourly');
  }

  /**
   * Get threshold value
   */
  private getThreshold(type: string): number {
    switch (type) {
      case 'violations':
        return this.alertConfig.thresholds.violationsPerHour;
      case 'critical_violations':
        return this.alertConfig.thresholds.criticalViolationsPerHour;
      case 'unique_sources':
        return this.alertConfig.thresholds.uniqueSourcesPerHour;
      default:
        return 0;
    }
  }

  /**
   * Send alert to configured channels
   */
  private async sendAlert(
    message: AlertMessage,
    escalationLevel: string
  ): Promise<void> {
    try {
      // Send to email
      if (this.alertConfig.alertChannels.email.length > 0) {
        await this.sendEmailAlert(message);
      }

      // Send to Slack
      if (this.alertConfig.alertChannels.slack.length > 0) {
        await this.sendSlackAlert(message);
      }

      // Send to webhook
      if (this.alertConfig.alertChannels.webhook.length > 0) {
        await this.sendWebhookAlert(message);
      }

      logger.info('CSP alert sent', { metadata: { message, escalationLevel } });
    } catch (error) {
      logger.error('Failed to send CSP alert:', error);
    }
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(message: AlertMessage): Promise<void> {
    // This would integrate with your email service
    // Examples: SendGrid, AWS SES, custom SMTP
    logger.info('Email alert would be sent:', { metadata: message });
  }

  /**
   * Send Slack alert
   */
  private async sendSlackAlert(message: AlertMessage): Promise<void> {
    if (!process.env.SLACK_WEBHOOK_URL) return;

    try {
      const payload = {
        text: message.title,
        attachments: [
          {
            color: message.severity === 'critical' ? 'danger' : 'warning',
            fields: [
              { title: 'Message', value: message.message, short: false },
              { title: 'Severity', value: message.severity, short: true },
              { title: 'Time', value: new Date().toISOString(), short: true },
            ],
            footer: 'TradePro Security Monitoring',
          },
        ],
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      logger.error('Failed to send Slack alert:', error);
    }
  }

  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(message: AlertMessage): Promise<void> {
    for (const webhookUrl of this.alertConfig.alertChannels.webhook) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
          signal: controller.signal,
        });
      } catch (error) {
        logger.error(`Failed to send webhook alert to ${webhookUrl}:`, error);
      } finally {
        clearTimeout(timeoutId);
      }
    }
  }

  /**
   * Get violation report
   */
  getViolationReport(hours: number = 24): CSPViolationReport {
    const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
    const violations = Array.from(this.violations.values()).filter((v) =>
      v.occurrences.some((ts) => new Date(ts).getTime() > cutoffTime)
    );

    const summary = {
      total: violations.reduce(
        (sum, v) =>
          sum +
          v.occurrences.filter((ts) => new Date(ts).getTime() > cutoffTime)
            .length,
        0
      ),
      bySeverity: this.groupBy(violations, 'severity', cutoffTime),
      byCategory: this.groupBy(violations, 'category', cutoffTime),
      byDirective: this.groupBy(violations, 'violatedDirective', cutoffTime),
      uniqueSources: new Set(violations.map((v) => v.clientIP)).size,
    };

    const patterns = {
      frequentBlockedUris: this.getFrequentItems(
        violations.flatMap((v) =>
          v.occurrences
            .filter((ts) => new Date(ts).getTime() > cutoffTime)
            .map(() => v.blockedUri)
        ),
        5
      ),
      suspiciousUserAgents: this.getFrequentItems(
        violations.flatMap((v) =>
          v.occurrences
            .filter((ts) => new Date(ts).getTime() > cutoffTime)
            .map(() => v.userAgent)
        ),
        5
      ),
      attackPatterns: this.detectAttackPatterns(violations, cutoffTime),
    };

    return {
      violations,
      summary,
      patterns,
    };
  }

  /**
   * Group violations by property
   */
  private groupBy(
    violations: CSPViolation[],
    property: keyof CSPViolation,
    cutoffTime?: number
  ): Record<string, number> {
    return violations.reduce((acc, violation) => {
      const key = violation[property] as string;
      const countInWindow = cutoffTime
        ? violation.occurrences.filter(
            (ts) => new Date(ts).getTime() > cutoffTime
          ).length
        : violation.occurrences.length;
      acc[key] = (acc[key] || 0) + countInWindow;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Get frequent items
   */
  private getFrequentItems(items: string[], limit: number): string[] {
    const counts = items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([item]) => item);
  }

  /**
   * Detect attack patterns
   */
  private detectAttackPatterns(
    violations: CSPViolation[],
    cutoffTime?: number
  ): string[] {
    const patterns: string[] = [];

    // Check for XSS patterns
    const xssCount = violations
      .filter((v) => v.category === 'xss_attempt')
      .reduce(
        (sum, v) =>
          sum +
          (cutoffTime
            ? v.occurrences.filter((ts) => new Date(ts).getTime() > cutoffTime)
                .length
            : v.occurrences.length),
        0
      );
    if (xssCount > 0) {
      patterns.push(`XSS attempts: ${xssCount}`);
    }

    // Check for script injection patterns
    const scriptCount = violations
      .filter((v) => v.violatedDirective.includes('script-src'))
      .reduce(
        (sum, v) =>
          sum +
          (cutoffTime
            ? v.occurrences.filter((ts) => new Date(ts).getTime() > cutoffTime)
                .length
            : v.occurrences.length),
        0
      );
    if (scriptCount > 0) {
      patterns.push(`Script injection attempts: ${scriptCount}`);
    }

    // Check for data exfiltration patterns
    const exfiltrationCount = violations
      .filter(
        (v) =>
          v.violatedDirective.includes('connect-src') &&
          v.blockedUri.includes('data:')
      )
      .reduce(
        (sum, v) =>
          sum +
          (cutoffTime
            ? v.occurrences.filter((ts) => new Date(ts).getTime() > cutoffTime)
                .length
            : v.occurrences.length),
        0
      );
    if (exfiltrationCount > 0) {
      patterns.push(`Data exfiltration attempts: ${exfiltrationCount}`);
    }

    return patterns;
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupOldViolations();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Cleanup old violations
   */
  private cleanupOldViolations(): void {
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours

    for (const [id, violation] of this.violations.entries()) {
      if (
        violation.occurrences.every((ts) => new Date(ts).getTime() < cutoffTime)
      ) {
        this.violations.delete(id);
      }
    }
  }

  /**
   * Update alert configuration
   */
  updateConfig(config: Partial<AlertConfig>): void {
    this.alertConfig = { ...this.alertConfig, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): AlertConfig {
    return { ...this.alertConfig };
  }

  /**
   * Start the cleanup timer
   */
  start(): void {
    this.startCleanupTimer();
  }

  /**
   * Stop the cleanup timer
   */
  stop(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Destroy monitor
   */
  destroy(): void {
    this.stop();
    this.violations.clear();
  }
}

/**
 * Lazy singleton getter for CSPViolationMonitor
 */
let _instance: CSPViolationMonitor | null = null;

export function getCspViolationMonitor(): CSPViolationMonitor {
  if (!_instance) {
    _instance = new CSPViolationMonitor();
    _instance.start();
  }
  return _instance;
}

/**
 * CSP monitoring utilities
 */
export const cspMonitoringUtils = {
  /**
   * Initialize monitoring with configuration
   */
  init(config?: Partial<AlertConfig>): void {
    getCspViolationMonitor().updateConfig(config || {});
  },

  /**
   * Get violation statistics
   */
  getStats(hours: number = 24): CSPViolationReport {
    return getCspViolationMonitor().getViolationReport(hours);
  },

  /**
   * Export violation data
   */
  exportData(format: 'json' | 'csv' = 'json'): string {
    const report = getCspViolationMonitor().getViolationReport(24 * 7); // Last 7 days

    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    } else {
      // Simple CSV export
      const escapeCSV = (value: unknown): string => {
        const stringValue = String(value);
        if (/[",\n\r]/.test(stringValue) || /^[=+\-@]/.test(stringValue)) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      const headers = [
        'firstSeen',
        'lastSeen',
        'count',
        'severity',
        'category',
        'violatedDirective',
        'blockedUri',
        'clientIP',
      ];
      const rows = report.violations.map((v) => [
        escapeCSV(v.timestamp),
        escapeCSV(v.lastSeen),
        escapeCSV(v.count),
        escapeCSV(v.severity),
        escapeCSV(v.category),
        escapeCSV(v.violatedDirective),
        escapeCSV(v.blockedUri),
        escapeCSV(v.clientIP),
      ]);

      return [headers, ...rows].map((row) => row.join(',')).join('\n');
    }
  },
};
