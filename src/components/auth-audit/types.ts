/**
 * Represents authentication audit metrics for monitoring security events and user activity.
 * @property {number} totalEvents - Total number of authentication events logged.
 * @property {number} criticalEvents - Number of critical security events.
 * @property {number} warningEvents - Number of warning-level events.
 * @property {number} loginAttempts - Total login attempts.
 * @property {number} successfulLogins - Number of successful login attempts.
 * @property {number} failedLogins - Number of failed login attempts.
 * @property {number} activeSessions - Current number of active user sessions.
 * @property {number} uniqueUsers - Number of unique users involved in events.
 * @property {'low' | 'medium' | 'high' | 'critical'} riskLevel - Overall risk assessment level: 'low' (minimal risk), 'medium' (moderate risk), 'high' (significant risk), 'critical' (requires immediate attention).
 */
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
