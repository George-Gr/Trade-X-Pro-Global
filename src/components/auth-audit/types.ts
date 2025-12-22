export interface AuthMetrics {
  totalEvents: number;
  criticalEvents: number;
  warningEvents: number;
  loginAttempts: number;
  successfulLogins: number;
  failedLogins: number;
  activeSessions: number;
  uniqueUsers: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}
