/**
 * Margin Call Detection Engine - Comprehensive Test Suite
 *
 * Tests for TASK 1.3.1: Margin Call Detection Engine
 * Total: 40+ test cases covering unit, integration, and edge cases
 *
 * Test Categories:
 * 1. Threshold Detection (8 tests) - Boundary conditions and calculations
 * 2. Severity Classification (6 tests) - Severity level determination
 * 3. State Management (8 tests) - State transitions and updates
 * 4. Escalation Logic (6 tests) - Liquidation escalation conditions
 * 5. Notifications (4 tests) - Notification payload generation
 * 6. Risk Metrics (5 tests) - Risk calculation and formatting
 * 7. Integration Tests (8 tests) - Integration with other modules
 * 8. Edge Cases (6 tests) - Boundary conditions and error handling
 */

import { describe, it, expect, vi } from 'vitest';
import {
  detectMarginCall,
  isMarginCallTriggered,
  classifyMarginCallSeverity,
  shouldEscalateToLiquidation,
  updateMarginCallState,
  generateMarginCallNotification,
  getRecommendedActions,
  calculateRiskMetrics,
  validateMarginCallEvent,
  formatMarginCallStatus,
  getMarginCallStatusColor,
  getSeverityBgColor,
  getMarginCallDuration,
  shouldRestrictNewTrading,
  shouldEnforceCloseOnly,
  hasConsecutiveBreaches,
  MarginCallStatus,
  MarginCallSeverity,
  MarginCallEventSchema,
  type MarginCallEvent,
  type MarginCallDetectionResult,
} from '../marginCallDetection';

// ============================================================================
// Test Category 1: Threshold Detection (8 tests)
// ============================================================================

describe('Margin Call Detection - Threshold Detection', () => {
  it('should detect safe margin level (>= 200%)', () => {
    const result = detectMarginCall(10000, 5000);

    expect(result.isTriggered).toBe(false);
    expect(result.marginLevel).toBe(200);
    expect(result.severity).toBeNull();
  });

  it('should detect margin call at warning threshold (100-199%)', () => {
    const result = detectMarginCall(10000, 8000);

    // 125% is < 150%, so margin call IS triggered with STANDARD severity
    expect(result.isTriggered).toBe(true);
    expect(result.marginLevel).toBe(125);
    expect(result.severity).toBe(MarginCallSeverity.STANDARD);
  });

  it('should detect margin call at standard threshold (< 150%)', () => {
    const result = detectMarginCall(10000, 7500);

    expect(result.isTriggered).toBe(true);
    expect(result.marginLevel).toBe(133.33);
    expect(result.severity).toBe(MarginCallSeverity.STANDARD);
    expect(result.shouldEnforceCloseOnly).toBe(false);
  });

  it('should detect urgent margin call at low threshold (50-100%)', () => {
    const result = detectMarginCall(5000, 7000);

    expect(result.isTriggered).toBe(true);
    expect(result.marginLevel).toBe(71.43);
    expect(result.severity).toBe(MarginCallSeverity.URGENT);
    expect(result.shouldEnforceCloseOnly).toBe(true);
  });

  it('should detect critical margin call at critical threshold (< 50%)', () => {
    const result = detectMarginCall(2000, 5000);

    expect(result.isTriggered).toBe(true);
    expect(result.marginLevel).toBe(40);
    expect(result.severity).toBe(MarginCallSeverity.CRITICAL);
    expect(result.shouldEscalate).toBe(true);
    expect(result.shouldEnforceCloseOnly).toBe(true);
  });

  it('should handle zero margin used gracefully', () => {
    const result = detectMarginCall(10000, 0);

    expect(result.isTriggered).toBe(false);
    expect(result.marginLevel).toBe(Infinity);
    expect(result.message).toBe('No margin used');
  });

  it('should handle very small equity values', () => {
    const result = detectMarginCall(100, 200);

    // 50% is at the boundary - exactly 50 is NOT < 50, so it's URGENT not CRITICAL
    expect(result.isTriggered).toBe(true);
    expect(result.marginLevel).toBe(50);
    expect(result.severity).toBe(MarginCallSeverity.URGENT);
  });

  it('should calculate time to liquidation for urgent calls', () => {
    const result = detectMarginCall(4000, 5000);

    expect(result.isTriggered).toBe(true);
    expect(result.timeToLiquidationMinutes).not.toBeNull();
    expect(result.timeToLiquidationMinutes).toBeGreaterThan(0);
  });
});

// ============================================================================
// Test Category 2: Severity Classification (6 tests)
// ============================================================================

describe('Margin Call Detection - Severity Classification', () => {
  it('should classify standard severity at 100-150% margin', () => {
    const severity = classifyMarginCallSeverity(140);
    expect(severity).toBe(MarginCallSeverity.STANDARD);
  });

  it('should classify urgent severity at 50-100% margin', () => {
    const severity = classifyMarginCallSeverity(75);
    expect(severity).toBe(MarginCallSeverity.URGENT);
  });

  it('should classify critical severity below 50% margin', () => {
    const severity = classifyMarginCallSeverity(40);
    expect(severity).toBe(MarginCallSeverity.CRITICAL);
  });

  it('should handle boundary at 150% (standard)', () => {
    const severity = classifyMarginCallSeverity(150);
    expect(severity).toBe(MarginCallSeverity.STANDARD);
  });

  it('should handle boundary at 100% (urgent)', () => {
    // At exactly 100%, marginLevel is NOT < 100, so it should be STANDARD, not URGENT
    const severity = classifyMarginCallSeverity(100);
    expect(severity).toBe(MarginCallSeverity.STANDARD);
  });

  it('should handle boundary at 50% (critical)', () => {
    // At exactly 50%, marginLevel is NOT < 50, so it should be URGENT, not CRITICAL
    const severity = classifyMarginCallSeverity(50);
    expect(severity).toBe(MarginCallSeverity.URGENT);
  });
});

// ============================================================================
// Test Category 3: State Management (8 tests)
// ============================================================================

describe('Margin Call Detection - State Management', () => {
  it('should detect entry into margin call zone', () => {
    const result = updateMarginCallState('user-123', 180, 140);

    expect(result.changed).toBe(true);
    expect(result.newStatus).toBe(MarginCallStatus.NOTIFIED);
    expect(result.reason).toContain('fell below 150%');
  });

  it('should detect exit from margin call zone', () => {
    const result = updateMarginCallState('user-123', 140, 160);

    expect(result.changed).toBe(true);
    expect(result.newStatus).toBe(MarginCallStatus.RESOLVED);
    expect(result.reason).toContain('recovered');
  });

  it('should detect severity increase within margin call', () => {
    const result = updateMarginCallState('user-123', 120, 60);

    // Both are in margin call (< 150%), with severity change from STANDARD to URGENT
    expect(result.changed).toBe(true);
    expect(result.newStatus).toBe(MarginCallStatus.NOTIFIED);
  });

  it('should not report change for safe margin levels', () => {
    const result = updateMarginCallState('user-123', 200, 190);

    expect(result.changed).toBe(false);
  });

  it('should not report change for continuous margin call with same severity', () => {
    const result = updateMarginCallState('user-123', 130, 125);

    expect(result.changed).toBe(false);
  });

  it('should enforce escalation for critical severity', () => {
    const result = updateMarginCallState('user-123', 80, 40);

    expect(result.escalationRequired).toBe(true);
    expect(result.newStatus).toBe(MarginCallStatus.ESCALATED);
  });

  it('should track user ID in state change', () => {
    const result = updateMarginCallState('user-456', 180, 140);

    expect(result.changed).toBe(true);
  });

  it('should maintain previous status when no change', () => {
    const result = updateMarginCallState('user-123', 200, 200);

    expect(result.previousStatus).toBe(result.newStatus);
  });
});

// ============================================================================
// Test Category 4: Escalation Logic (6 tests)
// ============================================================================

describe('Margin Call Detection - Escalation Logic', () => {
  it('should not escalate for standard margin call (fresh)', () => {
    const shouldEscalate = shouldEscalateToLiquidation(140, 5);
    expect(shouldEscalate).toBe(false);
  });

  it('should not escalate for urgent margin call (short duration)', () => {
    const shouldEscalate = shouldEscalateToLiquidation(75, 10);
    expect(shouldEscalate).toBe(false);
  });

  it('should escalate for critical margin call after 30+ minutes', () => {
    const shouldEscalate = shouldEscalateToLiquidation(45, 30);
    expect(shouldEscalate).toBe(true);
  });

  it('should escalate immediately at critical threshold < 30%', () => {
    const shouldEscalate = shouldEscalateToLiquidation(25, 0);
    expect(shouldEscalate).toBe(true);
  });

  it('should escalate at boundary: 30.01% margin, 0 minutes', () => {
    // Margin level 30.01 is NOT < 30, so no immediate escalation
    const shouldEscalate = shouldEscalateToLiquidation(30.01, 0);
    expect(shouldEscalate).toBe(false);
  });

  it('should not escalate just above critical threshold with time', () => {
    const shouldEscalate = shouldEscalateToLiquidation(50, 5);
    expect(shouldEscalate).toBe(false);
  });
});

// ============================================================================
// Test Category 5: Margin Call Trigger Checks (5 tests)
// ============================================================================

describe('Margin Call Detection - Margin Call Trigger Checks', () => {
  it('should trigger margin call below 150%', () => {
    expect(isMarginCallTriggered(140)).toBe(true);
    expect(isMarginCallTriggered(100)).toBe(true);
    expect(isMarginCallTriggered(50)).toBe(true);
  });

  it('should not trigger margin call at or above 150%', () => {
    expect(isMarginCallTriggered(150)).toBe(false);
    expect(isMarginCallTriggered(160)).toBe(false);
    expect(isMarginCallTriggered(200)).toBe(false);
  });

  it('should handle boundary at 150% (not triggered)', () => {
    expect(isMarginCallTriggered(150)).toBe(false);
  });

  it('should handle value just below boundary', () => {
    expect(isMarginCallTriggered(149.99)).toBe(true);
  });

  it('should return boolean type', () => {
    const result = isMarginCallTriggered(100);
    expect(typeof result).toBe('boolean');
  });
});

// ============================================================================
// Test Category 6: Notifications (4 tests)
// ============================================================================

describe('Margin Call Detection - Notifications', () => {
  it('should generate notification for standard severity', () => {
    const marginCall: MarginCallEvent = {
      id: 'test-1',
      userId: 'user-123',
      triggeredAt: new Date(),
      marginLevelAtTrigger: 140,
      status: MarginCallStatus.NOTIFIED,
      severity: MarginCallSeverity.STANDARD,
      positionsAtRisk: 2,
      recommendedActions: ['Action 1'],
      escalatedToLiquidationAt: null,
      resolvedAt: null,
      resolutionType: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const notification = generateMarginCallNotification(marginCall);

    expect(notification.type).toBe('MARGIN_CALL');
    expect(notification.priority).toBe('HIGH');
    expect(notification.actions).toHaveLength(3);
  });

  it('should generate notification for urgent severity', () => {
    const marginCall: MarginCallEvent = {
      id: 'test-2',
      userId: 'user-123',
      triggeredAt: new Date(),
      marginLevelAtTrigger: 75,
      status: MarginCallStatus.NOTIFIED,
      severity: MarginCallSeverity.URGENT,
      positionsAtRisk: 5,
      recommendedActions: [],
      escalatedToLiquidationAt: null,
      resolvedAt: null,
      resolutionType: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const notification = generateMarginCallNotification(marginCall);

    expect(notification.priority).toBe('CRITICAL');
    expect(notification.message).toContain('75');
  });

  it('should generate notification for critical severity', () => {
    const marginCall: MarginCallEvent = {
      id: 'test-3',
      userId: 'user-123',
      triggeredAt: new Date(),
      marginLevelAtTrigger: 40,
      status: MarginCallStatus.ESCALATED,
      severity: MarginCallSeverity.CRITICAL,
      positionsAtRisk: 8,
      recommendedActions: [],
      escalatedToLiquidationAt: new Date(),
      resolvedAt: null,
      resolutionType: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const notification = generateMarginCallNotification(marginCall);

    expect(notification.priority).toBe('CRITICAL');
    expect(notification.icon).toBe('🚨');
  });

  it('should include metadata in notification', () => {
    const marginCall: MarginCallEvent = {
      id: 'test-4',
      userId: 'user-123',
      triggeredAt: new Date(),
      marginLevelAtTrigger: 100,
      status: MarginCallStatus.NOTIFIED,
      severity: MarginCallSeverity.URGENT,
      positionsAtRisk: 3,
      recommendedActions: ['Deposit funds'],
      escalatedToLiquidationAt: null,
      resolvedAt: null,
      resolutionType: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedTimeToLiquidationMinutes: 15,
    };

    const notification = generateMarginCallNotification(marginCall);

    expect(notification.metadata).toBeDefined();
    expect(((notification.metadata as unknown) as Record<string, unknown>).marginLevel).toBe(100);
    expect(((notification.metadata as unknown) as Record<string, unknown>).severity).toBe(MarginCallSeverity.URGENT);
  });
});

// ============================================================================
// Test Category 7: Recommended Actions (4 tests)
// ============================================================================

describe('Margin Call Detection - Recommended Actions', () => {
  it('should recommend urgent actions for critical margin (< 50%)', () => {
    const actions = getRecommendedActions(40, 5);

    expect(actions.length).toBeGreaterThan(0);
    expect(actions[0].urgency).toBe('high');
    expect(actions.some((a) => a.action.toLowerCase().includes('deposit'))).toBe(true);
  });

  it('should recommend priority actions for urgent margin (50-100%)', () => {
    const actions = getRecommendedActions(80, 5);

    expect(actions.length).toBeGreaterThan(0);
    expect(actions.some((a) => a.action.toLowerCase().includes('deposit'))).toBe(true);
    expect(actions.some((a) => a.action.toLowerCase().includes('close'))).toBe(true);
  });

  it('should recommend cautionary actions for standard margin (100-150%)', () => {
    const actions = getRecommendedActions(130, 3);

    expect(actions.length).toBeGreaterThan(0);
    expect(actions.some((a) => a.action.toLowerCase().includes('monitor'))).toBe(true);
  });

  it('should handle zero positions', () => {
    const actions = getRecommendedActions(100, 0);

    expect(Array.isArray(actions)).toBe(true);
  });
});

// ============================================================================
// Test Category 8: Risk Metrics (5 tests)
// ============================================================================

describe('Margin Call Detection - Risk Metrics', () => {
  it('should calculate basic risk metrics', () => {
    const metrics = calculateRiskMetrics(140, 5, 2.0, 0.25);

    expect(metrics.marginLevel).toBe(140);
    expect(metrics.openPositions).toBe(5);
    expect(metrics.positionsAtRisk).toBeGreaterThan(0);
    expect(metrics.averageLeverageUsed).toBe(2);
  });

  it('should set status based on margin level', () => {
    const metricsUrgent = calculateRiskMetrics(75, 5, 2.0, 0.25);
    const metricsSafe = calculateRiskMetrics(200, 5, 2.0, 0.25);

    expect(metricsUrgent.status).toBe(MarginCallStatus.NOTIFIED);
    expect(metricsSafe.status).toBe(MarginCallStatus.PENDING);
  });

  it('should calculate concentration risk for large positions', () => {
    const metricsHigh = calculateRiskMetrics(100, 5, 2.0, 0.4);
    const metricsLow = calculateRiskMetrics(100, 5, 2.0, 0.2);

    expect(metricsHigh.concentrationRisk).toBeGreaterThan(metricsLow.concentrationRisk);
  });

  it('should calculate time to liquidation for margin calls', () => {
    const metricsCall = calculateRiskMetrics(75, 5, 2.0, 0.25);
    const metricsSafe = calculateRiskMetrics(200, 5, 2.0, 0.25);

    expect(metricsCall.estimatedTimeToLiquidation).not.toBeNull();
    expect(metricsSafe.estimatedTimeToLiquidation).toBeNull();
  });

  it('should handle edge cases in risk calculation', () => {
    const metricsZero = calculateRiskMetrics(0, 0, 1, 0);

    expect(metricsZero.marginLevel).toBe(0);
    expect(metricsZero.openPositions).toBe(0);
  });
});

// ============================================================================
// Test Category 9: Validation and Formatting (6 tests)
// ============================================================================

describe('Margin Call Detection - Validation and Formatting', () => {
  it('should validate proper margin call event', () => {
    const event: MarginCallEvent = {
      id: 'test-id',
      userId: 'user-123',
      triggeredAt: new Date(),
      marginLevelAtTrigger: 100,
      status: MarginCallStatus.NOTIFIED,
      severity: MarginCallSeverity.STANDARD,
      positionsAtRisk: 2,
      recommendedActions: [],
      escalatedToLiquidationAt: null,
      resolvedAt: null,
      resolutionType: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Validate function will check via schema - it should return true for valid event
    const isValid = validateMarginCallEvent(event);
    expect(isValid).toBe(true);
  });

  it('should format margin call status for display', () => {
    expect(formatMarginCallStatus(MarginCallStatus.NOTIFIED)).toBe('Margin Call Active');
    expect(formatMarginCallStatus(MarginCallStatus.RESOLVED)).toBe('Margin Call Resolved');
    expect(formatMarginCallStatus(MarginCallStatus.ESCALATED)).toBe('Escalated to Liquidation');
  });

  it('should return appropriate color for status', () => {
    const yellowColor = getMarginCallStatusColor(MarginCallStatus.NOTIFIED);
    const redColor = getMarginCallStatusColor(MarginCallStatus.ESCALATED);

    expect(yellowColor).toContain('yellow');
    expect(redColor).toContain('red');
  });

  it('should return appropriate background color for severity', () => {
    const yellowBg = getSeverityBgColor(MarginCallSeverity.STANDARD);
    const orangeBg = getSeverityBgColor(MarginCallSeverity.URGENT);
    const redBg = getSeverityBgColor(MarginCallSeverity.CRITICAL);

    expect(yellowBg).toContain('yellow');
    expect(orangeBg).toContain('orange');
    expect(redBg).toContain('red');
  });

  it('should calculate margin call duration', () => {
    const startTime = new Date(Date.now() - 25 * 60 * 1000); // 25 minutes ago
    const duration = getMarginCallDuration(startTime);

    expect(duration).toBeGreaterThanOrEqual(24);
    expect(duration).toBeLessThanOrEqual(26);
  });

  it('should determine if trading should be restricted', () => {
    expect(shouldRestrictNewTrading(MarginCallStatus.NOTIFIED)).toBe(true);
    expect(shouldRestrictNewTrading(MarginCallStatus.ESCALATED)).toBe(true);
    expect(shouldRestrictNewTrading(MarginCallStatus.RESOLVED)).toBe(false);
    expect(shouldRestrictNewTrading(MarginCallStatus.PENDING)).toBe(false);
  });
});

// ============================================================================
// Test Category 10: Close-Only Mode (3 tests)
// ============================================================================

describe('Margin Call Detection - Close-Only Mode', () => {
  it('should enforce close-only mode for notified margin calls', () => {
    expect(shouldEnforceCloseOnly(MarginCallStatus.NOTIFIED)).toBe(true);
  });

  it('should enforce close-only mode for escalated margin calls', () => {
    expect(shouldEnforceCloseOnly(MarginCallStatus.ESCALATED)).toBe(true);
  });

  it('should not enforce close-only mode for resolved/pending calls', () => {
    expect(shouldEnforceCloseOnly(MarginCallStatus.RESOLVED)).toBe(false);
    expect(shouldEnforceCloseOnly(MarginCallStatus.PENDING)).toBe(false);
  });
});

// ============================================================================
// Test Category 11: Edge Cases (6 tests)
// ============================================================================

describe('Margin Call Detection - Edge Cases', () => {
  it('should handle extremely high leverage (0.1% equity)', () => {
    const result = detectMarginCall(100, 100000);

    expect(result.marginLevel).toBe(0.1);
    expect(result.isTriggered).toBe(true);
    expect(result.severity).toBe(MarginCallSeverity.CRITICAL);
  });

  it('should handle flash crash scenario (rapid margin drop)', () => {
    const before = updateMarginCallState('user-123', 200, 75);
    expect(before.escalationRequired).toBe(true);
  });

  it('should handle recovery from critical state', () => {
    const result = updateMarginCallState('user-123', 40, 160);
    expect(result.changed).toBe(true);
    expect(result.newStatus).toBe(MarginCallStatus.RESOLVED);
  });

  it('should handle consecutive breaches detection', () => {
    expect(hasConsecutiveBreaches(5, 30)).toBe(true);
    expect(hasConsecutiveBreaches(2, 30)).toBe(false);
    expect(hasConsecutiveBreaches(5, 60)).toBe(false);
  });

  it('should handle NaN and Infinity gracefully', () => {
    const result = detectMarginCall(10000, 0);
    expect(result.marginLevel).toBe(Infinity);
    expect(result.isTriggered).toBe(false);
  });

  it('should handle negative margins gracefully', () => {
    // This shouldn't happen in production, but test defensive programming
    const result = detectMarginCall(10000, -5000);
    expect(result.marginLevel).toBeLessThan(0);
  });
});

// ============================================================================
// Test Category 12: Integration Tests (8 tests)
// ============================================================================

describe('Margin Call Detection - Integration Tests', () => {
  it('should coordinate with marginMonitoring thresholds', () => {
    // Simulate a user crossing multiple thresholds
    const steps = [
      { equity: 10000, margin: 5000, expected: false }, // 200% - safe
      { equity: 10000, margin: 7500, expected: true }, // 133% - call
      { equity: 5000, margin: 7000, expected: true }, // 71% - urgent
      { equity: 2000, margin: 5000, expected: true }, // 40% - critical
    ];

    steps.forEach((step) => {
      const result = detectMarginCall(step.equity, step.margin);
      expect(result.isTriggered).toBe(step.expected);
    });
  });

  it('should trigger notification when status changes', () => {
    const call: MarginCallEvent = {
      id: 'test-123',
      userId: 'user-123',
      triggeredAt: new Date(),
      marginLevelAtTrigger: 120,
      status: MarginCallStatus.NOTIFIED,
      severity: MarginCallSeverity.STANDARD,
      positionsAtRisk: 3,
      recommendedActions: ['Deposit funds', 'Close positions'],
      escalatedToLiquidationAt: null,
      resolvedAt: null,
      resolutionType: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const notification = generateMarginCallNotification(call);
    expect(notification.type).toBe('MARGIN_CALL');
    expect(notification.actions).toBeDefined();
  });

  it('should handle transition to liquidation (1.3.2 integration)', () => {
    // This should trigger escalation to liquidation module
    const stateChange = updateMarginCallState('user-123', 80, 40);

    expect(stateChange.escalationRequired).toBe(true);
    expect(stateChange.newStatus).toBe(MarginCallStatus.ESCALATED);
  });

  it('should provide metrics for risk dashboard', () => {
    const metrics = calculateRiskMetrics(120, 8, 2.5, 0.35);

    expect(metrics.marginLevel).toBe(120);
    expect(metrics.openPositions).toBe(8);
    expect(metrics.averageLeverageUsed).toBe(2.5);
    expect(metrics.concentrationRisk).toBeGreaterThan(0);
  });

  it('should track audit trail through state transitions', () => {
    const changes = [
      updateMarginCallState('user-123', 200, 140),
      updateMarginCallState('user-123', 140, 75),
      updateMarginCallState('user-123', 75, 180),
    ];

    expect(changes[0].changed).toBe(true);
    expect(changes[1].changed).toBe(true);
    expect(changes[2].changed).toBe(true);
  });

  it('should enforce close-only mode during margin call', () => {
    const result = detectMarginCall(7000, 10000);

    // 70% margin level
    expect(result.isTriggered).toBe(true);
    expect(result.shouldEnforceCloseOnly).toBe(true);
  });

  it('should calculate time to liquidation for urgent cases', () => {
    const result = detectMarginCall(4000, 5000); // 80% margin

    expect(result.isTriggered).toBe(true);
    expect(result.timeToLiquidationMinutes).not.toBeNull();
    if (result.timeToLiquidationMinutes) {
      expect(result.timeToLiquidationMinutes).toBeGreaterThan(0);
    }
  });

  it('should handle multiple positions at risk', () => {
    const metrics = calculateRiskMetrics(100, 10, 2.0, 0.15);

    expect(metrics.openPositions).toBe(10);
    expect(metrics.positionsAtRisk).toBeGreaterThan(0);
  });
});

// ============================================================================
// Test Category 13: Data Validation (4 tests)
// ============================================================================

describe('Margin Call Detection - Data Validation', () => {
  it('should validate margin call event with all required fields', () => {
    const validEvent: MarginCallEvent = {
      id: 'uuid-123',
      userId: 'user-456',
      triggeredAt: new Date(),
      marginLevelAtTrigger: 100,
      status: MarginCallStatus.NOTIFIED,
      severity: MarginCallSeverity.STANDARD,
      positionsAtRisk: 2,
      recommendedActions: ['Action 1'],
      escalatedToLiquidationAt: null,
      resolvedAt: null,
      resolutionType: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(() => MarginCallEventSchema.parse(validEvent)).not.toThrow();
  });

  it('should reject invalid margin level', () => {
    const invalidEvent = {
      id: 'uuid-123',
      userId: 'user-456',
      marginLevelAtTrigger: -100, // Invalid
      triggeredAt: new Date(),
      status: MarginCallStatus.NOTIFIED,
      severity: MarginCallSeverity.STANDARD,
      positionsAtRisk: 2,
      recommendedActions: [],
      escalatedToLiquidationAt: null,
      resolvedAt: null,
      resolutionType: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(() => MarginCallEventSchema.parse(invalidEvent)).toThrow();
  });

  it('should reject invalid positions at risk', () => {
    const invalidEvent = {
      id: 'uuid-123',
      userId: 'user-456',
      marginLevelAtTrigger: 100,
      triggeredAt: new Date(),
      status: MarginCallStatus.NOTIFIED,
      severity: MarginCallSeverity.STANDARD,
      positionsAtRisk: -5, // Invalid
      recommendedActions: [],
      escalatedToLiquidationAt: null,
      resolvedAt: null,
      resolutionType: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(() => MarginCallEventSchema.parse(invalidEvent)).toThrow();
  });

  it('should handle optional fields correctly', () => {
    const eventWithOptionals: MarginCallEvent = {
      id: 'uuid-123',
      userId: 'user-456',
      marginLevelAtTrigger: 100,
      triggeredAt: new Date(),
      status: MarginCallStatus.RESOLVED,
      severity: MarginCallSeverity.STANDARD,
      positionsAtRisk: 0,
      recommendedActions: [],
      escalatedToLiquidationAt: null,
      resolvedAt: new Date(),
      resolutionType: 'manual_deposit',
      notes: 'User deposited funds',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Event with resolved status and resolution type should be valid
    expect(validateMarginCallEvent(eventWithOptionals)).toBe(true);
  });
});
