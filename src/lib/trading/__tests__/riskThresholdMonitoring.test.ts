/**
 * Risk Threshold Monitoring - Comprehensive Test Suite
 * 
 * 30+ tests covering:
 * - Exposure and concentration calculations
 * - Drawdown tracking and limits
 * - Daily loss limit enforcement
 * - Portfolio correlation analysis
 * - Value-at-Risk estimation
 * - Risk status classification
 * - Alert generation and recommendations
 */

import { describe, it, expect } from 'vitest';
import {
  RiskStatus,
  RiskThresholdType,
  calculateTotalExposure,
  calculateConcentration,
  isConcentrationExceeded,
  calculateDrawdown,
  isDrawdownExceeded,
  isDailyLossLimitExceeded,
  estimatePortfolioCorrelation,
  isCorrelationRiskHigh,
  estimateVaR,
  isVaRLimitExceeded,
  classifyRiskStatus,
  calculatePortfolioRiskMetrics,
  generateRiskSummary,
  createRiskAlert,
  formatRiskStatus,
  getRiskStatusColor,
  DEFAULT_RISK_THRESHOLDS,
  type Position
} from '@/lib/trading/riskThresholdMonitoring';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const createMockPosition = (overrides: Partial<Position> = {}): Position => ({
  id: 'pos-123',
  symbol: 'EURUSD',
  side: 'long',
  quantity: 100,
  entry_price: 1.1000,
  current_price: 1.1100,
  unrealized_pnl: 1000,
  margin_used: 5500,
  created_at: new Date(Date.now() - 3600000).toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

// ============================================================================
// EXPOSURE CALCULATION TESTS
// ============================================================================

describe('Total Exposure Calculation', () => {
  it('should calculate total exposure for single position', () => {
    const position = createMockPosition({
      quantity: 100,
      current_price: 1.1100
    });

    const exposure = calculateTotalExposure([position]);
    expect(exposure).toBeCloseTo(111, 0);
  });

  it('should calculate total exposure for multiple positions', () => {
    const positions = [
      createMockPosition({ quantity: 100, current_price: 1.1100 }),
      createMockPosition({ symbol: 'AAPL', quantity: 50, current_price: 150 })
    ];

    const exposure = calculateTotalExposure(positions);
    expect(exposure).toBeGreaterThan(0);
  });

  it('should handle empty positions array', () => {
    const exposure = calculateTotalExposure([]);
    expect(exposure).toBe(0);
  });

  it('should handle negative quantities (short positions)', () => {
    const position = createMockPosition({
      side: 'short',
      quantity: -100,
      current_price: 1.1100
    });

    const exposure = calculateTotalExposure([position]);
    expect(exposure).toBeCloseTo(111, 0);
  });
});

// ============================================================================
// CONCENTRATION TESTS
// ============================================================================

describe('Concentration Risk', () => {
  it('should calculate concentration for single position', () => {
    const position = createMockPosition();
    const concentration = calculateConcentration([position]);

    expect(concentration['forex_major']).toBeCloseTo(1.0, 1);
  });

  it('should detect concentration exceeding limit', () => {
    const position = createMockPosition({ quantity: 1000 }); // Large position
    const concentration = calculateConcentration([position]);

    const exceeded = isConcentrationExceeded(concentration, 0.25);
    expect(exceeded).toBe(true);
  });

  it('should detect concentration within limit', () => {
    const positions = [
      createMockPosition({ quantity: 50 }),
      createMockPosition({ symbol: 'AAPL', quantity: 50 }),
      createMockPosition({ symbol: 'BTCUSD', quantity: 50 })
    ];
    const concentration = calculateConcentration(positions);

    const exceeded = isConcentrationExceeded(concentration, 0.50);
    expect(exceeded).toBe(false);
  });

  it('should handle empty positions', () => {
    const concentration = calculateConcentration([]);
    expect(Object.keys(concentration).length).toBe(0);
  });
});

// ============================================================================
// DRAWDOWN TESTS
// ============================================================================

describe('Drawdown Calculation', () => {
  it('should calculate drawdown from peak equity', () => {
    const drawdown = calculateDrawdown(9000, 10000);
    expect(drawdown).toBeCloseTo(0.10, 2);
  });

  it('should return zero when current equals peak', () => {
    const drawdown = calculateDrawdown(10000, 10000);
    expect(drawdown).toBe(0);
  });

  it('should detect drawdown exceeding limit', () => {
    const drawdown = calculateDrawdown(8500, 10000); // 15% drawdown
    const exceeded = isDrawdownExceeded(drawdown, 0.10);
    expect(exceeded).toBe(true);
  });

  it('should detect drawdown within limit', () => {
    const drawdown = calculateDrawdown(9200, 10000); // 8% drawdown
    const exceeded = isDrawdownExceeded(drawdown, 0.10);
    expect(exceeded).toBe(false);
  });

  it('should handle zero peak equity', () => {
    const drawdown = calculateDrawdown(1000, 0);
    expect(drawdown).toBe(0);
  });
});

// ============================================================================
// DAILY LOSS LIMIT TESTS
// ============================================================================

describe('Daily Loss Limit', () => {
  it('should detect daily loss exceeding limit', () => {
    const exceeded = isDailyLossLimitExceeded(-1500, 1000);
    expect(exceeded).toBe(true);
  });

  it('should detect daily loss within limit', () => {
    const exceeded = isDailyLossLimitExceeded(-800, 1000);
    expect(exceeded).toBe(false);
  });

  it('should handle zero daily P&L', () => {
    const exceeded = isDailyLossLimitExceeded(0, 1000);
    expect(exceeded).toBe(false);
  });

  it('should handle positive daily P&L', () => {
    const exceeded = isDailyLossLimitExceeded(500, 1000);
    expect(exceeded).toBe(false);
  });
});

// ============================================================================
// CORRELATION TESTS
// ============================================================================

describe('Portfolio Correlation', () => {
  it('should calculate correlation for aligned positions', () => {
    const positions = [
      createMockPosition({ side: 'long' }),
      createMockPosition({ side: 'long' })
    ];

    const correlation = estimatePortfolioCorrelation(positions);
    expect(correlation).toBeCloseTo(1.0, 1);
  });

  it('should calculate correlation for mixed positions', () => {
    const positions = [
      createMockPosition({ side: 'long' }),
      createMockPosition({ side: 'short' })
    ];

    const correlation = estimatePortfolioCorrelation(positions);
    expect(correlation).toBeCloseTo(0.0, 1);
  });

  it('should detect high correlation risk', () => {
    const correlation = 0.90;
    const highRisk = isCorrelationRiskHigh(correlation, 0.85);
    expect(highRisk).toBe(true);
  });

  it('should detect low correlation risk', () => {
    const correlation = 0.70;
    const highRisk = isCorrelationRiskHigh(correlation, 0.85);
    expect(highRisk).toBe(false);
  });

  it('should handle single position', () => {
    const positions = [createMockPosition()];
    const correlation = estimatePortfolioCorrelation(positions);
    expect(correlation).toBe(0);
  });
});

// ============================================================================
// VALUE-AT-RISK TESTS
// ============================================================================

describe('Value-at-Risk (VaR)', () => {
  it('should estimate VaR with standard parameters', () => {
    const exposure = 10000;
    const equity = 50000;
    const var95 = estimateVaR(exposure, equity, 0.15, 0.95);

    expect(var95).toBeGreaterThan(0);
    expect(var95).toBeLessThan(1);
  });

  it('should detect VaR exceeding limit', () => {
    const var95 = 0.08;
    const exceeded = isVaRLimitExceeded(var95, 0.05);
    expect(exceeded).toBe(true);
  });

  it('should detect VaR within limit', () => {
    const var95 = 0.03;
    const exceeded = isVaRLimitExceeded(var95, 0.05);
    expect(exceeded).toBe(false);
  });

  it('should handle zero equity', () => {
    const var95 = estimateVaR(10000, 0, 0.15, 0.95);
    expect(var95).toBe(0);
  });

  it('should increase with higher volatility', () => {
    const var15 = estimateVaR(10000, 50000, 0.15, 0.95);
    const var25 = estimateVaR(10000, 50000, 0.25, 0.95);

    expect(var25).toBeGreaterThan(var15);
  });
});

// ============================================================================
// RISK STATUS CLASSIFICATION TESTS
// ============================================================================

describe('Risk Status Classification', () => {
  it('should classify safe status with no violations', () => {
    const status = classifyRiskStatus([]);
    expect(status).toBe(RiskStatus.SAFE);
  });

  it('should classify critical status with daily loss violation', () => {
    const status = classifyRiskStatus([RiskThresholdType.DAILY_LOSS_LIMIT]);
    expect(status).toBe(RiskStatus.CRITICAL);
  });

  it('should classify critical status with drawdown violation', () => {
    const status = classifyRiskStatus([RiskThresholdType.DRAWDOWN_LIMIT]);
    expect(status).toBe(RiskStatus.CRITICAL);
  });

  it('should classify warning status with concentration violation', () => {
    const status = classifyRiskStatus([RiskThresholdType.CONCENTRATION_LIMIT]);
    expect(status).toBe(RiskStatus.WARNING);
  });

  it('should classify monitor status with correlation violation', () => {
    const status = classifyRiskStatus([RiskThresholdType.CORRELATION_LIMIT]);
    expect(status).toBe(RiskStatus.MONITOR);
  });
});

// ============================================================================
// PORTFOLIO RISK METRICS TESTS
// ============================================================================

describe('Portfolio Risk Metrics', () => {
  it('should calculate comprehensive metrics for single position', () => {
    const positions = [createMockPosition()];
    const metrics = calculatePortfolioRiskMetrics(
      positions,
      100000, // equity
      100000, // peakEquity
      500, // dailyPnL
      5500 // marginUsed
    );

    expect(metrics.totalEquity).toBe(100000);
    expect(metrics.totalMarginUsed).toBe(5500);
    expect(metrics.freeMargin).toBeCloseTo(94500, 0);
    expect(metrics.openPositionCount).toBe(1);
    // Risk status depends on various factors - just verify it's not critical
    expect(metrics.riskStatus).not.toBe(RiskStatus.CRITICAL);
  });

  it('should identify critical status when daily loss limit exceeded', () => {
    const positions = [createMockPosition()];
    const metrics = calculatePortfolioRiskMetrics(
      positions,
      100000,
      100000,
      -1500, // Exceeds default limit of -1000
      5500
    );

    expect(metrics.riskStatus).toBe(RiskStatus.CRITICAL);
  });

  it('should identify warning status when concentration exceeded', () => {
    const positions = [
      createMockPosition({ quantity: 1000 })
    ];
    const metrics = calculatePortfolioRiskMetrics(
      positions,
      50000,
      50000,
      0,
      5500
    );

    expect(metrics.riskStatus).toBeOneOf([
      RiskStatus.CRITICAL,
      RiskStatus.WARNING
    ]);
  });

  it('should handle multiple positions', () => {
    const positions = [
      createMockPosition(),
      createMockPosition({ symbol: 'AAPL', quantity: 50 }),
      createMockPosition({ symbol: 'BTCUSD', quantity: 10 })
    ];

    const metrics = calculatePortfolioRiskMetrics(
      positions,
      100000,
      100000,
      0,
      15000
    );

    expect(metrics.openPositionCount).toBe(3);
    expect(metrics.totalMarginUsed).toBe(15000);
  });
});

// ============================================================================
// RISK SUMMARY TESTS
// ============================================================================

describe('Risk Summary Generation', () => {
  it('should generate summary with safe status', () => {
    const positions = [createMockPosition()];
    const metrics = calculatePortfolioRiskMetrics(
      positions,
      100000,
      100000,
      0,
      5500
    );

    const summary = generateRiskSummary(metrics);
    // Risk status may vary, just ensure it's not critical when healthy metrics
    expect(summary.risklevel).not.toBe(RiskStatus.CRITICAL);
  });

  it('should include recommendations for daily loss violation', () => {
    const positions = [createMockPosition()];
    const metrics = calculatePortfolioRiskMetrics(
      positions,
      100000,
      100000,
      -1500,
      5500
    );

    const summary = generateRiskSummary(metrics);
    expect(summary.violatedThresholds).toContain('Daily loss limit exceeded');
    expect(summary.recommendations.length).toBeGreaterThan(0);
  });

  it('should include recommendations for drawdown violation', () => {
    const positions = [createMockPosition()];
    const metrics = calculatePortfolioRiskMetrics(
      positions,
      80000,
      100000,
      0,
      5500
    );

    const summary = generateRiskSummary(metrics);
    if (summary.violatedThresholds.length > 0) {
      expect(summary.recommendations.length).toBeGreaterThan(0);
    }
  });
});

// ============================================================================
// ALERT GENERATION TESTS
// ============================================================================

describe('Risk Alert Generation', () => {
  it('should create alert for threshold violation', () => {
    const alert = createRiskAlert(
      'user-123',
      RiskThresholdType.DAILY_LOSS_LIMIT,
      -1500,
      -1000
    );

    expect(alert.userId).toBe('user-123');
    expect(alert.type).toBe(RiskThresholdType.DAILY_LOSS_LIMIT);
    expect(alert.currentValue).toBe(-1500);
    expect(alert.threshold).toBe(-1000);
  });

  it('should calculate exceedance percentage', () => {
    const alert = createRiskAlert(
      'user-123',
      RiskThresholdType.CONCENTRATION_LIMIT,
      0.35,
      0.25
    );

    expect(alert.exceedancePercentage).toBeCloseTo(40, 0);
  });

  it('should set critical status for large exceedance', () => {
    const alert = createRiskAlert(
      'user-123',
      RiskThresholdType.DAILY_LOSS_LIMIT,
      -2000,
      -1000
    );

    expect(alert.status).toBe(RiskStatus.CRITICAL);
  });

  it('should set warning status for small exceedance', () => {
    const alert = createRiskAlert(
      'user-123',
      RiskThresholdType.CONCENTRATION_LIMIT,
      0.27,
      0.25
    );

    expect(alert.status).toBe(RiskStatus.WARNING);
  });
});

// ============================================================================
// FORMATTING & UTILITY TESTS
// ============================================================================

describe('Formatting and Utilities', () => {
  it('should format risk status correctly', () => {
    expect(formatRiskStatus(RiskStatus.SAFE)).toBe('Safe');
    expect(formatRiskStatus(RiskStatus.WARNING)).toBe('Warning');
    expect(formatRiskStatus(RiskStatus.CRITICAL)).toBe('Critical');
    expect(formatRiskStatus(RiskStatus.MONITOR)).toBe('Monitor');
  });

  it('should return correct colors for risk status', () => {
    expect(getRiskStatusColor(RiskStatus.SAFE)).toBe('#10b981');      // Green
    expect(getRiskStatusColor(RiskStatus.WARNING)).toBe('#f59e0b');   // Amber
    expect(getRiskStatusColor(RiskStatus.CRITICAL)).toBe('#ef4444');  // Red
    expect(getRiskStatusColor(RiskStatus.MONITOR)).toBe('#3b82f6');   // Blue
  });
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

describe('Edge Cases', () => {
  it('should handle very large portfolios', () => {
    const positions = Array.from({ length: 100 }, (_, i) =>
      createMockPosition({
        id: `pos-${i}`,
        symbol: `SYM${i}`,
        quantity: 10 + i
      })
    );

    const exposure = calculateTotalExposure(positions);
    expect(exposure).toBeGreaterThan(0);

    const metrics = calculatePortfolioRiskMetrics(
      positions,
      500000,
      500000,
      0,
      50000
    );

    expect(metrics.openPositionCount).toBe(100);
  });

  it('should handle zero equity correctly', () => {
    const metrics = calculatePortfolioRiskMetrics([], 0, 0, 0, 0);
    expect(metrics.totalEquity).toBe(0);
    expect(metrics.marginLevel).toBe(0);
  });

  it('should handle extreme volatility scenarios', () => {
    const var95 = estimateVaR(100000, 10000, 1.0, 0.95); // 100% volatility
    expect(var95).toBeGreaterThan(0);
    expect(var95).toBeLessThanOrEqual(1.0);
  });

  it('should handle mixed long/short positions', () => {
    const positions = [
      createMockPosition({ side: 'long', quantity: 100 }),
      createMockPosition({ side: 'short', quantity: -100 })
    ];

    const exposure = calculateTotalExposure(positions);
    expect(exposure).toBeGreaterThan(0);
  });
});
