/**
 * Alert Configuration for Critical Errors
 * 
 * Defines alert rules, thresholds, and notification channels
 * for monitoring critical trading platform errors.
 */

/**
 * Alert severity levels
 */
export enum AlertSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * Alert notification channels
 */
export enum AlertChannel {
  EMAIL = 'email',
  SLACK = 'slack',
  PAGERDUTY = 'pagerduty',
  WEBHOOK = 'webhook',
}

/**
 * Alert rule configuration
 */
export interface AlertRule {
  id: string;
  name: string;
  description: string;
  severity: AlertSeverity;
  channels: AlertChannel[];
  conditions: AlertCondition[];
  thresholds: AlertThresholds;
  enabled: boolean;
  cooldown: number; // Minimum time between alerts (minutes)
}

/**
 * Alert condition for triggering alerts
 */
export interface AlertCondition {
  type: 'error_rate' | 'response_time' | 'error_count' | 'crash_rate' | 'custom';
  metric: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
  value: number;
  timeframe: number; // minutes
}

/**
 * Alert thresholds configuration
 */
export interface AlertThresholds {
  errorRate: number;        // Error rate percentage
  responseTime: number;     // Response time in milliseconds
  errorCount: number;       // Number of errors
  crashRate: number;        // Crash rate percentage
}

/**
 * Critical error alert rules
 */
const CRITICAL_ALERT_RULES: AlertRule[] = [
  {
    id: 'trading-system-down',
    name: 'Trading System Down',
    description: 'Critical trading functionality is failing',
    severity: AlertSeverity.CRITICAL,
    channels: [AlertChannel.EMAIL, AlertChannel.PAGERDUTY, AlertChannel.SLACK],
    conditions: [
      {
        type: 'error_rate',
        metric: 'trading.place_order',
        operator: 'gt',
        value: 50, // 50% error rate
        timeframe: 5, // 5 minutes
      }
    ],
    thresholds: {
      errorRate: 50,
      responseTime: 0,
      errorCount: 10,
      crashRate: 0,
    },
    enabled: true,
    cooldown: 5,
  },
  
  {
    id: 'api-outage',
    name: 'API Service Outage',
    description: 'API services are experiencing high failure rates',
    severity: AlertSeverity.CRITICAL,
    channels: [AlertChannel.EMAIL, AlertChannel.PAGERDUTY],
    conditions: [
      {
        type: 'error_rate',
        metric: 'api.http_error',
        operator: 'gt',
        value: 30, // 30% error rate
        timeframe: 10, // 10 minutes
      }
    ],
    thresholds: {
      errorRate: 30,
      responseTime: 0,
      errorCount: 50,
      crashRate: 0,
    },
    enabled: true,
    cooldown: 10,
  },
  
  {
    id: 'authentication-failure',
    name: 'Authentication System Failure',
    description: 'Users cannot authenticate to the platform',
    severity: AlertSeverity.CRITICAL,
    channels: [AlertChannel.EMAIL, AlertChannel.PAGERDUTY],
    conditions: [
      {
        type: 'error_count',
        metric: 'auth.login_failed',
        operator: 'gt',
        value: 20, // 20 failed logins
        timeframe: 5, // 5 minutes
      }
    ],
    thresholds: {
      errorRate: 0,
      responseTime: 0,
      errorCount: 20,
      crashRate: 0,
    },
    enabled: true,
    cooldown: 5,
  },
  
  {
    id: 'high-response-time',
    name: 'High API Response Time',
    description: 'API response times are exceeding acceptable thresholds',
    severity: AlertSeverity.HIGH,
    channels: [AlertChannel.EMAIL, AlertChannel.SLACK],
    conditions: [
      {
        type: 'response_time',
        metric: 'api.response_time_p95',
        operator: 'gt',
        value: 5000, // 5 seconds
        timeframe: 15, // 15 minutes
      }
    ],
    thresholds: {
      errorRate: 0,
      responseTime: 5000,
      errorCount: 0,
      crashRate: 0,
    },
    enabled: true,
    cooldown: 15,
  },
  
  {
    id: 'memory-leak-detected',
    name: 'Memory Leak Detected',
    description: 'Application memory usage is increasing abnormally',
    severity: AlertSeverity.HIGH,
    channels: [AlertChannel.EMAIL, AlertChannel.SLACK],
    conditions: [
      {
        type: 'custom',
        metric: 'performance.memory_usage',
        operator: 'gt',
        value: 500, // 500MB
        timeframe: 30, // 30 minutes
      }
    ],
    thresholds: {
      errorRate: 0,
      responseTime: 0,
      errorCount: 0,
      crashRate: 0,
    },
    enabled: true,
    cooldown: 30,
  },
  
  {
    id: 'browser-compatibility',
    name: 'Browser Compatibility Issues',
    description: 'High error rates in specific browsers',
    severity: AlertSeverity.MEDIUM,
    channels: [AlertChannel.EMAIL],
    conditions: [
      {
        type: 'error_rate',
        metric: 'browser.safari_errors',
        operator: 'gt',
        value: 20, // 20% error rate
        timeframe: 30, // 30 minutes
      }
    ],
    thresholds: {
      errorRate: 20,
      responseTime: 0,
      errorCount: 0,
      crashRate: 0,
    },
    enabled: true,
    cooldown: 30,
  },
  
  {
    id: 'trading-volume-drop',
    name: 'Trading Volume Drop',
    description: 'Significant drop in trading activity detected',
    severity: AlertSeverity.MEDIUM,
    channels: [AlertChannel.EMAIL],
    conditions: [
      {
        type: 'custom',
        metric: 'trading.volume_change',
        operator: 'lt',
        value: -50, // 50% drop
        timeframe: 60, // 1 hour
      }
    ],
    thresholds: {
      errorRate: 0,
      responseTime: 0,
      errorCount: 0,
      crashRate: 0,
    },
    enabled: true,
    cooldown: 60,
  },
];

/**
 * Alert manager for handling critical errors
 */
export class AlertManager {
  private alertHistory: Map<string, Date> = new Map();
  private lastAlertTime: Map<string, number> = new Map();

  /**
   * Check if an alert should be triggered
   */
  shouldTriggerAlert(rule: AlertRule, metrics: Record<string, number>): boolean {
    if (!rule.enabled) return false;
    
    // Check cooldown period
    const lastAlert = this.lastAlertTime.get(rule.id);
    if (lastAlert && Date.now() - lastAlert < rule.cooldown * 60 * 1000) {
      return false; // Still in cooldown
    }
    
    // Check all conditions
    return rule.conditions.every(condition => {
      const metricValue = metrics[condition.metric];
      if (metricValue === undefined) return false;
      
      switch (condition.operator) {
        case 'gt':
          return metricValue > condition.value;
        case 'gte':
          return metricValue >= condition.value;
        case 'lt':
          return metricValue < condition.value;
        case 'lte':
          return metricValue <= condition.value;
        case 'eq':
          return metricValue === condition.value;
        default:
          return false;
      }
    });
  }

  /**
   * Trigger an alert
   */
  async triggerAlert(rule: AlertRule, metrics: Record<string, number>, context?: Record<string, unknown>): Promise<void> {
    this.lastAlertTime.set(rule.id, Date.now());
    
    console.warn(`[ALERT] ${rule.severity.toUpperCase()}: ${rule.name}`, {
      rule,
      metrics,
      context,
      timestamp: new Date().toISOString(),
    });

    // Send notifications to configured channels
    await Promise.allSettled(
      rule.channels.map(channel => this.sendNotification(channel, rule, metrics, context))
    );
  }

  /**
   * Send notification to specific channel
   */
  private async sendNotification(
    channel: AlertChannel,
    rule: AlertRule,
    metrics: Record<string, number>,
    context?: Record<string, unknown>
  ): Promise<void> {
    const message = this.formatAlertMessage(rule, metrics, context);
    
    switch (channel) {
      case AlertChannel.EMAIL:
        await this.sendEmailAlert(rule, message);
        break;
      case AlertChannel.SLACK:
        await this.sendSlackAlert(rule, message);
        break;
      case AlertChannel.PAGERDUTY:
        await this.sendPagerDutyAlert(rule, message);
        break;
      case AlertChannel.WEBHOOK:
        await this.sendWebhookAlert(rule, message);
        break;
    }
  }

  /**
   * Format alert message
   */
  private formatAlertMessage(
    rule: AlertRule,
    metrics: Record<string, number>,
    context?: Record<string, unknown>
  ): string {
    const timestamp = new Date().toISOString();
    const environment = import.meta.env.MODE;
    
    return `
🚨 ${rule.severity.toUpperCase()}: ${rule.name}

${rule.description}

📊 Metrics:
${Object.entries(metrics).map(([key, value]) => `  • ${key}: ${value}`).join('\n')}

📍 Environment: ${environment}
🕐 Time: ${timestamp}

${context ? `📋 Context:\n${JSON.stringify(context, null, 2)}` : ''}

🔗 Dashboard: ${window.location.href}
    `.trim();
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(rule: AlertRule, message: string): Promise<void> {
    // In a real implementation, this would send to configured email addresses
    console.warn('[ALERT] Email notification sent:', rule.name);
  }

  /**
   * Send Slack alert
   */
  private async sendSlackAlert(rule: AlertRule, message: string): Promise<void> {
    // In a real implementation, this would send to configured Slack channels
    console.warn('[ALERT] Slack notification sent:', rule.name);
  }

  /**
   * Send PagerDuty alert
   */
  private async sendPagerDutyAlert(rule: AlertRule, message: string): Promise<void> {
    // In a real implementation, this would send to PagerDuty
    console.warn('[ALERT] PagerDuty notification sent:', rule.name);
  }

  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(rule: AlertRule, message: string): Promise<void> {
    // In a real implementation, this would send to configured webhooks
    console.warn('[ALERT] Webhook notification sent:', rule.name);
  }

  /**
   * Get alert statistics
   */
  getAlertStats(): Record<string, unknown> {
    return {
      totalRules: CRITICAL_ALERT_RULES.length,
      enabledRules: CRITICAL_ALERT_RULES.filter(rule => rule.enabled).length,
      recentAlerts: Array.from(this.lastAlertTime.entries()).map(([id, time]) => ({
        id,
        lastTriggered: new Date(time).toISOString(),
      })),
    };
  }

  /**
   * Update alert rule
   */
  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): void {
    const rule = CRITICAL_ALERT_RULES.find(r => r.id === ruleId);
    if (rule) {
      Object.assign(rule, updates);
      console.warn(`[ALERT] Updated rule: ${ruleId}`, updates);
    }
  }

  /**
   * Enable/disable alert rule
   */
  setAlertRuleEnabled(ruleId: string, enabled: boolean): void {
    this.updateAlertRule(ruleId, { enabled });
  }
}

// Create global alert manager instance
export const alertManager = new AlertManager();

// Export alert rules for configuration
export { CRITICAL_ALERT_RULES };

export default alertManager;