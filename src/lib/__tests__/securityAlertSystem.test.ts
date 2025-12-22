/**
 * Tests for SecurityIncidentAlertSystem
 */

import { AuditEvent } from '../authAuditLogger';
import { CSPViolation } from '../cspViolationMonitor';
import { SecurityIncidentAlertSystem } from '../securityAlertSystem';

describe('SecurityIncidentAlertSystem', () => {
  let system: SecurityIncidentAlertSystem;

  beforeEach(() => {
    system = new SecurityIncidentAlertSystem();
  });

  afterEach(() => {
    system.destroy();
  });

  describe('getRecentAuthFailures', () => {
    it('should return 0 for user with no failures', async () => {
      const count = await (system as any).getRecentAuthFailures('user1');
      expect(count).toBe(0);
    });

    it('should count recent failures within time window', async () => {
      // Simulate failures
      const event: AuditEvent = {
        timestamp: new Date().toISOString(),
        eventType: 'AUTH_LOGIN_FAILED',
        userId: 'user1',
        ipAddress: '192.168.1.1',
        userAgent: 'test',
        metadata: { reason: 'invalid password' },
        severity: 'warning',
      };

      // Process 3 failures
      await system.processAuthEvent(event);
      await system.processAuthEvent(event);
      await system.processAuthEvent(event);

      const count = await (system as any).getRecentAuthFailures('user1');
      expect(count).toBe(3);
    });

    it('should not count failures older than 1 hour', async () => {
      // Mock old timestamp
      const oldTime = Date.now() - 2 * 60 * 60 * 1000; // 2 hours ago
      (system as any).authFailureTimestamps.set('user1', [oldTime]);

      const event: AuditEvent = {
        timestamp: new Date().toISOString(),
        eventType: 'AUTH_LOGIN_FAILED',
        userId: 'user1',
        ipAddress: '192.168.1.1',
        userAgent: 'test',
        metadata: { reason: 'invalid password' },
        severity: 'warning',
      };

      await system.processAuthEvent(event);

      const count = await (system as any).getRecentAuthFailures('user1');
      expect(count).toBe(1); // Only the new one
    });
  });

  describe('getRecentXSSAttempts', () => {
    it('should return 0 for IP with no attempts', async () => {
      const count = await (system as any).getRecentXSSAttempts('192.168.1.1');
      expect(count).toBe(0);
    });

    it('should count recent XSS attempts within time window', async () => {
      const timestamp = new Date().toISOString();
      const violation: CSPViolation = {
        id: 'test1',
        timestamp,
        documentUri: 'http://example.com',
        referrer: '',
        violatedDirective: 'script-src',
        effectiveDirective: 'script-src',
        originalPolicy: "script-src 'self'",
        blockedUri: 'javascript:alert(1)',
        sourceFile: '',
        lineNumber: 1,
        columnNumber: 1,
        statusCode: 200,
        scriptSample: 'alert(1)',
        userAgent: 'test',
        clientIP: '192.168.1.1',
        severity: 'critical',
        category: 'xss_attempt',
        count: 1,
        lastSeen: timestamp,
        occurrences: [timestamp],
      };

      // Process 2 attempts
      await system.processCSPViolation(violation);
      await system.processCSPViolation(violation);

      const count = await (system as any).getRecentXSSAttempts('192.168.1.1');
      expect(count).toBe(2);
    });

    it('should not count attempts older than 1 hour', async () => {
      const oldTime = Date.now() - 2 * 60 * 60 * 1000;
      (system as any).xssAttemptTimestamps.set('192.168.1.1', [oldTime]);

      const timestamp = new Date().toISOString();
      const violation: CSPViolation = {
        id: 'test2',
        timestamp,
        documentUri: 'http://example.com',
        referrer: '',
        violatedDirective: 'script-src',
        effectiveDirective: 'script-src',
        originalPolicy: "script-src 'self'",
        blockedUri: 'javascript:alert(1)',
        sourceFile: '',
        lineNumber: 1,
        columnNumber: 1,
        statusCode: 200,
        scriptSample: 'alert(1)',
        userAgent: 'test',
        clientIP: '192.168.1.1',
        severity: 'critical',
        category: 'xss_attempt',
        count: 1,
        lastSeen: timestamp,
        occurrences: [timestamp],
      };

      await system.processCSPViolation(violation);

      const count = await (system as any).getRecentXSSAttempts('192.168.1.1');
      expect(count).toBe(1);
    });
  });

  describe('threshold-based incident detection', () => {
    it('should create incident when auth failure threshold is met', async () => {
      const event: AuditEvent = {
        timestamp: new Date().toISOString(),
        eventType: 'AUTH_LOGIN_FAILED',
        userId: 'user1',
        ipAddress: '192.168.1.1',
        userAgent: 'test',
        metadata: { reason: 'invalid password' },
        severity: 'warning',
      };

      // Process 5 failures to trigger threshold
      for (let i = 0; i < 5; i++) {
        await system.processAuthEvent(event);
      }

      const report = system.getIncidentsReport();
      expect(report.total).toBe(1);
      expect(report.recent[0]!.type).toBe('MULTIPLE_FAILED_LOGINS');
    });

    it('should create incident when XSS attempt threshold is met', async () => {
      const timestamp = new Date().toISOString();
      const violation: CSPViolation = {
        id: 'test3',
        timestamp,
        documentUri: 'http://example.com',
        referrer: '',
        violatedDirective: 'script-src',
        effectiveDirective: 'script-src',
        originalPolicy: "script-src 'self'",
        blockedUri: 'javascript:alert(1)',
        sourceFile: '',
        lineNumber: 1,
        columnNumber: 1,
        statusCode: 200,
        scriptSample: 'alert(1)',
        userAgent: 'test',
        clientIP: '192.168.1.1',
        severity: 'critical',
        category: 'xss_attempt',
        count: 1,
        lastSeen: timestamp,
        occurrences: [timestamp],
      };

      // Process 3 attempts to trigger threshold
      for (let i = 0; i < 3; i++) {
        await system.processCSPViolation(violation);
      }

      const report = system.getIncidentsReport();
      expect(report.total).toBe(1);
      expect(report.recent[0]!.type).toBe('XSS_ATTACK');
    });
  });
});
