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

    it('should return 0 for empty or undefined userId', async () => {
      const countEmpty = await (system as any).getRecentAuthFailures('');
      expect(countEmpty).toBe(0);

      const countUndefined = await (system as any).getRecentAuthFailures(
        undefined as any
      );
      expect(countUndefined).toBe(0);
    });

    it('should handle large number of failures and trim storage correctly', async () => {
      const event: AuditEvent = {
        timestamp: new Date().toISOString(),
        eventType: 'AUTH_LOGIN_FAILED',
        userId: 'user1',
        ipAddress: '192.168.1.1',
        userAgent: 'test',
        metadata: { reason: 'invalid password' },
        severity: 'warning',
      };

      // Process more than MAX_ENTRIES_PER_KEY (100) events
      for (let i = 0; i < 150; i++) {
        await system.processAuthEvent(event);
      }

      // Check that storage is trimmed to MAX_ENTRIES_PER_KEY
      const timestamps = (system as any).authFailureTimestamps.get('user1');
      expect(timestamps).toHaveLength(100);

      // Verify the count is correct (all within 1 hour)
      const count = await (system as any).getRecentAuthFailures('user1');
      expect(count).toBe(100);
    });

    it('should handle concurrent AUTH_LOGIN_FAILED events correctly', async () => {
      const event: AuditEvent = {
        timestamp: new Date().toISOString(),
        eventType: 'AUTH_LOGIN_FAILED',
        userId: 'user1',
        ipAddress: '192.168.1.1',
        userAgent: 'test',
        metadata: { reason: 'invalid password' },
        severity: 'warning',
      };

      // Process 10 events concurrently
      await Promise.all(
        Array.from({ length: 10 }, () => system.processAuthEvent(event))
      );

      // Verify the final count is correct
      const count = await (system as any).getRecentAuthFailures('user1');
      expect(count).toBe(10);
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

    it('should not create incident when auth failure count is below threshold', async () => {
      const event: AuditEvent = {
        timestamp: new Date().toISOString(),
        eventType: 'AUTH_LOGIN_FAILED',
        userId: 'user1',
        ipAddress: '192.168.1.1',
        userAgent: 'test',
        metadata: { reason: 'invalid password' },
        severity: 'warning',
      };

      // Process 4 failures (one less than threshold of 5)
      for (let i = 0; i < 4; i++) {
        await system.processAuthEvent(event);
      }

      const report = system.getIncidentsReport();
      expect(report.total).toBe(0);
    });

    it('should not create incident when XSS attempt count is below threshold', async () => {
      const timestamp = new Date().toISOString();
      const violation: CSPViolation = {
        id: 'test4',
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

      // Process 2 attempts (one less than threshold of 3)
      for (let i = 0; i < 2; i++) {
        await system.processCSPViolation(violation);
      }

      const report = system.getIncidentsReport();
      expect(report.total).toBe(0);
    });

    it('should prevent duplicate incidents within cooldown period', async () => {
      const event: AuditEvent = {
        timestamp: new Date().toISOString(),
        eventType: 'AUTH_LOGIN_FAILED',
        userId: 'user1',
        ipAddress: '192.168.1.1',
        userAgent: 'test',
        metadata: { reason: 'invalid password' },
        severity: 'warning',
      };

      // First trigger: Process 5 failures to create incident
      for (let i = 0; i < 5; i++) {
        await system.processAuthEvent(event);
      }

      let report = system.getIncidentsReport();
      expect(report.total).toBe(1);
      expect(report.recent[0]!.type).toBe('MULTIPLE_FAILED_LOGINS');

      // Immediately trigger again: Process another 5 failures
      for (let i = 0; i < 5; i++) {
        await system.processAuthEvent(event);
      }

      // Incident count should remain 1 due to cooldown
      report = system.getIncidentsReport();
      expect(report.total).toBe(1);
    });
  });
});
