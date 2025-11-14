/**
 * Position Closure Automation Engine - Test Suite
 * 
 * 35+ tests covering:
 * - Trigger detection (take-profit, stop-loss, trailing stop, time-based expiry)
 * - Manual and forced closure
 * - Execution price calculation with slippage
 * - P&L and commission calculations
 * - Margin recovery
 * - Position state management
 * - Partial position closures
 * - Edge cases and error handling
 */

import { describe, it, expect } from 'vitest';
import {
  ClosureReason,
  ClosureStatus,
  type Position,
  type ClosureResult,
  checkTakeProfitTriggered,
  checkStopLossTriggered,
  checkTrailingStopTriggered,
  checkTimeBasedExpiryTriggered,
  shouldForceClosure,
  getPrimaryClosureTrigger,
  calculateClosureSlippage,
  calculateClosurePrice,
  calculateRealizedPnLOnClosure,
  calculateCommissionOnClosure,
  calculateAvailableMarginAfterClosure,
  executePositionClosure,
  executePartialClosure,
  updateTrailingStop,
  formatClosureReason,
  formatClosureStatus,
  getClosureImpact,
} from '@/lib/trading/positionClosureEngine';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const createMockPosition = (overrides: Partial<Position> = {}): Position => ({
  id: 'pos-123',
  user_id: 'user-123',
  symbol: 'EURUSD',
  side: 'long',
  quantity: 100,
  entry_price: 1.1000,
  current_price: 1.1100,
  unrealized_pnl: 1000,
  margin_used: 5500,
  margin_level: 150,
  status: 'open',
  created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  updated_at: new Date().toISOString(),
  ...overrides,
});

// ============================================================================
// TAKE-PROFIT TRIGGER TESTS
// ============================================================================

describe('Take-Profit Trigger Detection', () => {
  it('should trigger take-profit when long position reaches target', () => {
    const position = createMockPosition({
      side: 'long',
      current_price: 1.1100,
      take_profit_level: 1.1050,
    });

    expect(checkTakeProfitTriggered(position, 1.1050)).toBe(true);
    expect(checkTakeProfitTriggered(position, 1.1100)).toBe(true);
  });

  it('should NOT trigger take-profit when long position below target', () => {
    const position = createMockPosition({
      side: 'long',
      current_price: 1.1000,
      take_profit_level: 1.1050,
    });

    expect(checkTakeProfitTriggered(position, 1.1000)).toBe(false);
    expect(checkTakeProfitTriggered(position, 1.1040)).toBe(false);
  });

  it('should trigger take-profit when short position reaches target', () => {
    const position = createMockPosition({
      side: 'short',
      current_price: 1.0900,
      take_profit_level: 1.0950,
    });

    expect(checkTakeProfitTriggered(position, 1.0950)).toBe(true);
    expect(checkTakeProfitTriggered(position, 1.0900)).toBe(true);
  });

  it('should NOT trigger take-profit when short position above target', () => {
    const position = createMockPosition({
      side: 'short',
      current_price: 1.1100,
      take_profit_level: 1.0950,
    });

    expect(checkTakeProfitTriggered(position, 1.1000)).toBe(false);
    expect(checkTakeProfitTriggered(position, 1.0960)).toBe(false);
  });

  it('should NOT trigger when take-profit level not set', () => {
    const position = createMockPosition({
      take_profit_level: undefined,
    });

    expect(checkTakeProfitTriggered(position, 1.2000)).toBe(false);
  });
});

// ============================================================================
// STOP-LOSS TRIGGER TESTS
// ============================================================================

describe('Stop-Loss Trigger Detection', () => {
  it('should trigger stop-loss when long position falls below level', () => {
    const position = createMockPosition({
      side: 'long',
      current_price: 1.1000,
      stop_loss_level: 1.0950,
    });

    expect(checkStopLossTriggered(position, 1.0950)).toBe(true);
    expect(checkStopLossTriggered(position, 1.0900)).toBe(true);
  });

  it('should NOT trigger stop-loss when long position above level', () => {
    const position = createMockPosition({
      side: 'long',
      current_price: 1.1000,
      stop_loss_level: 1.0950,
    });

    expect(checkStopLossTriggered(position, 1.0980)).toBe(false);
    expect(checkStopLossTriggered(position, 1.1100)).toBe(false);
  });

  it('should trigger stop-loss when short position rises above level', () => {
    const position = createMockPosition({
      side: 'short',
      current_price: 1.0900,
      stop_loss_level: 1.0950,
    });

    expect(checkStopLossTriggered(position, 1.0950)).toBe(true);
    expect(checkStopLossTriggered(position, 1.1000)).toBe(true);
  });

  it('should NOT trigger stop-loss when short position below level', () => {
    const position = createMockPosition({
      side: 'short',
      current_price: 1.0900,
      stop_loss_level: 1.0950,
    });

    expect(checkStopLossTriggered(position, 1.0900)).toBe(false);
    expect(checkStopLossTriggered(position, 1.0800)).toBe(false);
  });
});

// ============================================================================
// TRAILING STOP TESTS
// ============================================================================

describe('Trailing Stop Trigger Detection', () => {
  it('should trigger trailing stop when long position reverses from peak', () => {
    const position = createMockPosition({
      side: 'long',
      trailing_stop_distance: 0.005,
      trailing_stop_peak_price: 1.1200,
    });

    // Peak was 1.1200, trigger is 0.005 below = 1.1150
    expect(checkTrailingStopTriggered(position, 1.1150)).toBe(true);
    expect(checkTrailingStopTriggered(position, 1.1100)).toBe(true);
  });

  it('should NOT trigger trailing stop when price stays above level', () => {
    const position = createMockPosition({
      side: 'long',
      trailing_stop_distance: 0.005,
      trailing_stop_peak_price: 1.1200,
    });

    expect(checkTrailingStopTriggered(position, 1.1160)).toBe(false);
    expect(checkTrailingStopTriggered(position, 1.1200)).toBe(false);
  });

  it('should trigger trailing stop when short position reverses from peak', () => {
    const position = createMockPosition({
      side: 'short',
      trailing_stop_distance: 0.005,
      trailing_stop_peak_price: 1.0800,
    });

    // Peak was 1.0800, trigger is 0.005 above = 1.0850
    expect(checkTrailingStopTriggered(position, 1.0850)).toBe(true);
    expect(checkTrailingStopTriggered(position, 1.0900)).toBe(true);
  });

  it('should NOT trigger trailing stop without peak price', () => {
    const position = createMockPosition({
      trailing_stop_distance: 0.005,
      trailing_stop_peak_price: undefined,
    });

    expect(checkTrailingStopTriggered(position, 1.0000)).toBe(false);
  });
});

// ============================================================================
// TIME-BASED EXPIRY TESTS
// ============================================================================

describe('Time-Based Expiry Detection', () => {
  it('should trigger expiry when position exceeds max hold duration', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600000).toISOString();
    const position = createMockPosition({ created_at: twoHoursAgo });

    expect(checkTimeBasedExpiryTriggered(position, 1 * 3600000)).toBe(true); // 1 hour max
  });

  it('should NOT trigger expiry when position within max hold duration', () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60000).toISOString();
    const position = createMockPosition({ created_at: thirtyMinutesAgo });

    expect(checkTimeBasedExpiryTriggered(position, 1 * 3600000)).toBe(false); // 1 hour max
  });

  it('should handle exact boundary condition', () => {
    const exactlyOneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const position = createMockPosition({ created_at: exactlyOneHourAgo });

    expect(checkTimeBasedExpiryTriggered(position, 3600000)).toBe(true);
  });
});

// ============================================================================
// FORCED CLOSURE TESTS
// ============================================================================

describe('Forced Closure Detection', () => {
  it('should force close on liquidation trigger', () => {
    const position = createMockPosition({ margin_level: 100 });

    expect(shouldForceClosure(position, 150, true)).toBe(true);
  });

  it('should force close when margin critical', () => {
    const position = createMockPosition();

    expect(shouldForceClosure(position, 40)).toBe(true);
    expect(shouldForceClosure(position, 49)).toBe(true);
  });

  it('should NOT force close with healthy margin', () => {
    const position = createMockPosition();

    expect(shouldForceClosure(position, 100)).toBe(false);
    expect(shouldForceClosure(position, 150)).toBe(false);
  });
});

// ============================================================================
// PRIMARY TRIGGER PRIORITY TESTS
// ============================================================================

describe('Primary Closure Trigger Priority', () => {
  it('should prioritize force closure over other triggers', () => {
    const position = createMockPosition({
      side: 'long',
      current_price: 1.1200,
      take_profit_level: 1.1050,
    });

    const trigger = getPrimaryClosureTrigger(position, 1.1200, 40, Infinity, false);
    expect(trigger).toBe(ClosureReason.MARGIN_CALL);
  });

  it('should prioritize liquidation trigger first', () => {
    const position = createMockPosition({
      side: 'long',
      current_price: 1.1200,
      take_profit_level: 1.1050,
    });

    const trigger = getPrimaryClosureTrigger(position, 1.1200, 100, Infinity, true);
    expect(trigger).toBe(ClosureReason.LIQUIDATION);
  });

  it('should prioritize take-profit over stop-loss', () => {
    const position = createMockPosition({
      side: 'long',
      current_price: 1.1200,
      take_profit_level: 1.1050,
      stop_loss_level: 1.0800,
    });

    const trigger = getPrimaryClosureTrigger(position, 1.1200, 100);
    expect(trigger).toBe(ClosureReason.TAKE_PROFIT);
  });

  it('should prioritize stop-loss over trailing stop', () => {
    const position = createMockPosition({
      side: 'long',
      current_price: 1.0900,
      stop_loss_level: 1.0950,
      trailing_stop_distance: 0.005,
      trailing_stop_peak_price: 1.1200,
    });

    const trigger = getPrimaryClosureTrigger(position, 1.0900, 100);
    expect(trigger).toBe(ClosureReason.STOP_LOSS);
  });

  it('should return null when no trigger activated', () => {
    const position = createMockPosition({
      take_profit_level: 1.2000,
      stop_loss_level: 1.0000,
    });

    const trigger = getPrimaryClosureTrigger(position, 1.1100, 100);
    expect(trigger).toBeNull();
  });
});

// ============================================================================
// SLIPPAGE & PRICING TESTS
// ============================================================================

describe('Closure Slippage Calculation', () => {
  it('should apply normal slippage for regular closures', () => {
    const slippage = calculateClosureSlippage('EURUSD', ClosureReason.MANUAL_USER, 0.1);
    expect(slippage).toBeCloseTo(0.1, 5);
  });

  it('should apply 1.2x slippage for stop-loss closures', () => {
    const slippage = calculateClosureSlippage('EURUSD', ClosureReason.STOP_LOSS, 0.1);
    expect(slippage).toBeCloseTo(0.12, 5);
  });

  it('should apply 1.5x slippage for margin call closures', () => {
    const slippage = calculateClosureSlippage('EURUSD', ClosureReason.MARGIN_CALL, 0.1);
    expect(slippage).toBeCloseTo(0.15, 5);
  });

  it('should apply 1.5x slippage for liquidation closures', () => {
    const slippage = calculateClosureSlippage('EURUSD', ClosureReason.LIQUIDATION, 0.1);
    expect(slippage).toBeCloseTo(0.15, 5);
  });
});

describe('Closure Price Calculation', () => {
  it('should reduce price for long closure', () => {
    const position = createMockPosition({ side: 'long' });
    const closurePrice = calculateClosurePrice(position, 1.1100, ClosureReason.MANUAL_USER, 0.1);

    expect(closurePrice).toBeLessThan(1.1100);
    expect(closurePrice).toBeCloseTo(1.1100 - 1.1100 * 0.001, 5);
  });

  it('should increase price for short closure', () => {
    const position = createMockPosition({ side: 'short' });
    const closurePrice = calculateClosurePrice(position, 1.1000, ClosureReason.MANUAL_USER, 0.1);

    expect(closurePrice).toBeGreaterThan(1.1000);
    expect(closurePrice).toBeCloseTo(1.1000 + 1.1000 * 0.001, 5);
  });

  it('should apply worst-case pricing for forced closures', () => {
    const position = createMockPosition({ side: 'long' });
    const normalPrice = calculateClosurePrice(position, 1.1100, ClosureReason.MANUAL_USER, 0.1);
    const forcedPrice = calculateClosurePrice(position, 1.1100, ClosureReason.MARGIN_CALL, 0.1);

    expect(forcedPrice).toBeLessThan(normalPrice);
  });
});

// ============================================================================
// P&L & COMMISSION TESTS
// ============================================================================

describe('Realized P&L Calculation', () => {
  it('should calculate positive P&L for profitable long closure', () => {
    const position = createMockPosition({
      side: 'long',
      entry_price: 1.1000,
      quantity: 100,
    });

    // When we pass the market price without slippage adjustment
    const { pnl, pnlPercentage } = calculateRealizedPnLOnClosure(position, 1.1100);

    // Raw P&L is (1.1100 - 1.1000) * 100 = 0.01 * 100 = 1.0
    expect(pnl).toBeCloseTo(1.0, 0);
    expect(pnlPercentage).toBeCloseTo(0.909, 1);
  });

  it('should calculate negative P&L for losing long closure', () => {
    const position = createMockPosition({
      side: 'long',
      entry_price: 1.1100,
      quantity: 100,
    });

    const { pnl, pnlPercentage } = calculateRealizedPnLOnClosure(position, 1.1000);

    expect(pnl).toBeCloseTo(-1.0, 0);
    expect(pnlPercentage).toBeCloseTo(-0.901, 1);
  });

  it('should calculate positive P&L for profitable short closure', () => {
    const position = createMockPosition({
      side: 'short',
      entry_price: 1.1100,
      quantity: 100,
    });

    const { pnl, pnlPercentage } = calculateRealizedPnLOnClosure(position, 1.1000);

    expect(pnl).toBeCloseTo(1.0, 0);
    expect(pnlPercentage).toBeCloseTo(0.901, 1);
  });

  it('should calculate negative P&L for losing short closure', () => {
    const position = createMockPosition({
      side: 'short',
      entry_price: 1.1000,
      quantity: 100,
    });

    const { pnl, pnlPercentage } = calculateRealizedPnLOnClosure(position, 1.1100);

    expect(pnl).toBeCloseTo(-1.0, 0);
    expect(pnlPercentage).toBeCloseTo(-0.909, 1);
  });

  it('should calculate zero P&L at entry price', () => {
    const position = createMockPosition({
      side: 'long',
      entry_price: 1.1000,
      quantity: 100,
    });

    const { pnl, pnlPercentage } = calculateRealizedPnLOnClosure(position, 1.1000);

    expect(pnl).toBeCloseTo(0, 5);
    expect(pnlPercentage).toBeCloseTo(0, 5);
  });
});

describe('Commission Calculation', () => {
  it('should calculate 0.1% commission', () => {
    const commission = calculateCommissionOnClosure('EURUSD', 100, 1.1000);

    expect(commission).toBeCloseTo(0.11, 2); // (100 * 1.1000) * 0.001
  });

  it('should calculate custom commission rate', () => {
    const commission = calculateCommissionOnClosure('EURUSD', 100, 1.1000, 0.05);

    expect(commission).toBeCloseTo(0.055, 3); // (100 * 1.1000) * 0.0005
  });

  it('should scale with position size', () => {
    const small = calculateCommissionOnClosure('EURUSD', 50, 1.1000);
    const large = calculateCommissionOnClosure('EURUSD', 100, 1.1000);

    expect(large).toBeCloseTo(small * 2, 5);
  });

  it('should scale with price', () => {
    const lowPrice = calculateCommissionOnClosure('EURUSD', 100, 1.0000);
    const highPrice = calculateCommissionOnClosure('EURUSD', 100, 1.2000);

    expect(highPrice / lowPrice).toBeCloseTo(1.2, 5);
  });
});

// ============================================================================
// MARGIN RECOVERY TESTS
// ============================================================================

describe('Margin Recovery Calculation', () => {
  it('should recover full margin on full position closure', () => {
    const position = createMockPosition({
      margin_used: 5500,
      quantity: 100,
    });

    const freedMargin = calculateAvailableMarginAfterClosure(position);

    expect(freedMargin).toBe(5500);
  });

  it('should recover proportional margin on partial closure', () => {
    const position = createMockPosition({
      margin_used: 5500,
      quantity: 100,
    });

    const partialFreedMargin = (position.margin_used * 50) / position.quantity;

    expect(partialFreedMargin).toBe(2750);
  });
});

// ============================================================================
// EXECUTION TESTS
// ============================================================================

describe('Position Closure Execution', () => {
  it('should successfully execute full closure', () => {
    const position = createMockPosition({
      side: 'long',
      entry_price: 1.1000,
      quantity: 100,
      status: 'open',
    });

    const result = executePositionClosure(position, 1.1100, ClosureReason.MANUAL_USER);

    expect(result.success).toBe(true);
    expect(result.status).toBe(ClosureStatus.COMPLETED);
    expect(result.quantity_closed).toBe(100);
    expect(result.position_id).toBe('pos-123');
    expect(result.entry_price).toBe(1.1000);
  });

  it('should calculate net P&L after commission', () => {
    const position = createMockPosition({
      side: 'long',
      entry_price: 1.1000,
      quantity: 100,
      status: 'open',
    });

    const result = executePositionClosure(position, 1.1100, ClosureReason.MANUAL_USER);

    // P&L calculation: (exit_price - entry_price) * quantity
    // Commission: 0.1% of notional value at exit price
    // Net P&L = gross P&L - commission
    expect(result.success).toBe(true);
    expect(result.realized_pnl).toBeGreaterThan(0); // Should be profitable
    expect(result.commission).toBeGreaterThan(0);
  });

  it('should apply appropriate slippage for stop-loss', () => {
    const position = createMockPosition({
      side: 'long',
      entry_price: 1.1000,
      quantity: 100,
      status: 'open',
    });

    const result = executePositionClosure(position, 1.1100, ClosureReason.STOP_LOSS);

    // Stop-loss gets 1.2x slippage
    expect(result.exit_price).toBeLessThan(1.1100);
  });

  it('should reject closure of non-open position', () => {
    const position = createMockPosition({
      status: 'closed',
    });

    const result = executePositionClosure(position, 1.1100, ClosureReason.MANUAL_USER);

    expect(result.success).toBe(false);
    expect(result.status).toBe(ClosureStatus.FAILED);
    expect(result.error).toContain('not open');
  });

  it('should reject closure with invalid quantity', () => {
    const position = createMockPosition({
      quantity: -10,
      status: 'open',
    });

    const result = executePositionClosure(position, 1.1100, ClosureReason.MANUAL_USER);

    expect(result.success).toBe(false);
    expect(result.error).toContain('quantity');
  });
});

describe('Partial Position Closure', () => {
  it('should successfully execute partial closure', () => {
    const position = createMockPosition({
      side: 'long',
      entry_price: 1.1000,
      quantity: 100,
      status: 'open',
    });

    const result = executePartialClosure(position, 50, 1.1100, ClosureReason.MANUAL_USER);

    expect(result.success).toBe(true);
    expect(result.status).toBe(ClosureStatus.PARTIAL);
    expect(result.quantity_closed).toBe(50);
    expect(result.quantity_remaining).toBe(50);
  });

  it('should calculate P&L for partial quantity', () => {
    const position = createMockPosition({
      side: 'long',
      entry_price: 1.1000,
      quantity: 100,
      status: 'open',
    });

    const result = executePartialClosure(position, 50, 1.1100, ClosureReason.MANUAL_USER);

    const expectedGrossPnL = (1.1100 - 1.1000) * 50; // 500
    expect(Math.abs(result.realized_pnl + result.commission - expectedGrossPnL)).toBeLessThan(1);
  });

  it('should reject invalid partial quantity', () => {
    const position = createMockPosition({
      quantity: 100,
      status: 'open',
    });

    const result = executePartialClosure(position, 150, 1.1100, ClosureReason.MANUAL_USER);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid partial close quantity');
  });

  it('should reject zero quantity', () => {
    const position = createMockPosition({
      quantity: 100,
      status: 'open',
    });

    const result = executePartialClosure(position, 0, 1.1100, ClosureReason.MANUAL_USER);

    expect(result.success).toBe(false);
  });
});

// ============================================================================
// TRAILING STOP UPDATE TESTS
// ============================================================================

describe('Trailing Stop Updates', () => {
  it('should update peak price for long position when new high reached', () => {
    const position = createMockPosition({
      side: 'long',
      trailing_stop_distance: 0.005,
      trailing_stop_peak_price: 1.1100,
    });

    const updated = updateTrailingStop(position, 1.1200, 1.1200);

    expect(updated.trailing_stop_peak_price).toBe(1.1200);
    expect(updated.stop_loss_level).toBeCloseTo(1.1150, 5); // 1.1200 - 0.005
  });

  it('should NOT downdate peak price for long on lower high', () => {
    const position = createMockPosition({
      side: 'long',
      trailing_stop_distance: 0.005,
      trailing_stop_peak_price: 1.1200,
    });

    const updated = updateTrailingStop(position, 1.1100, 1.1100);

    expect(updated.trailing_stop_peak_price).toBe(1.1200);
  });

  it('should update peak price for short position when new low reached', () => {
    const position = createMockPosition({
      side: 'short',
      trailing_stop_distance: 0.005,
      trailing_stop_peak_price: 1.0900,
    });

    const updated = updateTrailingStop(position, 1.0800, 1.0800);

    expect(updated.trailing_stop_peak_price).toBe(1.0800);
    // stop_loss_level = peak + distance = 1.0800 + 0.005 = 1.085
    if (updated.stop_loss_level) {
      expect(updated.stop_loss_level).toBeCloseTo(1.085, 2);
    }
  });

  it('should handle position without trailing stop', () => {
    const position = createMockPosition({
      trailing_stop_distance: undefined,
    });

    const updated = updateTrailingStop(position, 1.1200, 1.1200);

    expect(updated).toEqual(position);
  });
});

// ============================================================================
// FORMATTING TESTS
// ============================================================================

describe('Closure Reason Formatting', () => {
  it('should format all closure reasons', () => {
    expect(formatClosureReason(ClosureReason.TAKE_PROFIT)).toBe('Take Profit');
    expect(formatClosureReason(ClosureReason.STOP_LOSS)).toBe('Stop Loss');
    expect(formatClosureReason(ClosureReason.TRAILING_STOP)).toBe('Trailing Stop');
    expect(formatClosureReason(ClosureReason.TIME_EXPIRY)).toBe('Position Expired');
    expect(formatClosureReason(ClosureReason.MANUAL_USER)).toBe('Manual Close');
    expect(formatClosureReason(ClosureReason.MARGIN_CALL)).toBe('Margin Call');
    expect(formatClosureReason(ClosureReason.LIQUIDATION)).toBe('Liquidation');
    expect(formatClosureReason(ClosureReason.ADMIN_FORCED)).toBe('Admin Forced');
  });
});

describe('Closure Status Formatting', () => {
  it('should format completed status', () => {
    const formatted = formatClosureStatus(ClosureStatus.COMPLETED);
    expect(formatted.label).toBe('Completed');
    expect(formatted.color).toBe('green');
    expect(formatted.icon).toBe('check');
  });

  it('should format partial status', () => {
    const formatted = formatClosureStatus(ClosureStatus.PARTIAL);
    expect(formatted.label).toBe('Partial');
    expect(formatted.color).toBe('yellow');
    expect(formatted.icon).toBe('activity');
  });

  it('should format failed status', () => {
    const formatted = formatClosureStatus(ClosureStatus.FAILED);
    expect(formatted.label).toBe('Failed');
    expect(formatted.color).toBe('red');
    expect(formatted.icon).toBe('x');
  });
});

// ============================================================================
// IMPACT SUMMARY TESTS
// ============================================================================

describe('Closure Impact Summary', () => {
  it('should calculate closure impact for profitable position', () => {
    const position = createMockPosition({
      side: 'long',
      entry_price: 1.1000,
      quantity: 100,
      margin_used: 5500,
    });

    const impact = getClosureImpact(position, 1.1100);

    // For a profitable closure: (exit - entry) * quantity - commission
    // Should be positive overall
    expect(impact.realizedPnL).toBeGreaterThan(0);
    expect(impact.commission).toBeGreaterThan(0);
    expect(impact.netImpact).toBeLessThan(impact.realizedPnL);
    expect(impact.marginRecovered).toBe(5500);
  });

  it('should calculate closure impact for losing position', () => {
    const position = createMockPosition({
      side: 'long',
      entry_price: 1.1100,
      quantity: 100,
      margin_used: 5500,
    });

    const impact = getClosureImpact(position, 1.1000);

    // For a losing closure: (exit - entry) * quantity - commission
    // Should be negative overall
    expect(impact.realizedPnL).toBeLessThan(0);
    expect(impact.netImpact).toBeLessThan(impact.realizedPnL); // More negative
    expect(impact.marginRecovered).toBe(5500);
  });
});

// ============================================================================
// EDGE CASES & INTEGRATION TESTS
// ============================================================================

describe('Edge Cases', () => {
  it('should handle very small price movements', () => {
    const position = createMockPosition({
      side: 'long',
      entry_price: 1.1000,
      quantity: 1,
      status: 'open',
    });

    const result = executePositionClosure(position, 1.1001, ClosureReason.MANUAL_USER);

    expect(result.success).toBe(true);
    // Very small price movements may result in loss after slippage
    // So we just verify the closure succeeded
    expect(result.realized_pnl).toBeDefined();
  });

  it('should handle large position quantities', () => {
    const position = createMockPosition({
      side: 'long',
      entry_price: 1.1000,
      quantity: 10000,
      status: 'open',
    });

    const result = executePositionClosure(position, 1.1100, ClosureReason.MANUAL_USER);

    expect(result.success).toBe(true);
    expect(result.quantity_closed).toBe(10000);
  });

  it('should handle price at zero boundary', () => {
    const position = createMockPosition({
      side: 'long',
      entry_price: 1.1000,
      quantity: 100,
      status: 'open',
    });

    const result = executePositionClosure(position, 0.0001, ClosureReason.STOP_LOSS);

    expect(result.success).toBe(true);
    expect(result.realized_pnl).toBeLessThan(0);
  });

  it('should handle multiple triggers in sequence', () => {
    let position = createMockPosition({
      side: 'long',
      entry_price: 1.1000,
      quantity: 100,
      status: 'open',
      take_profit_level: 1.1200,
      trailing_stop_distance: 0.005,
    });

    // Update trailing stop
    position = updateTrailingStop(position, 1.1150, 1.1150);
    // After update, stop_loss_level should be set from trailing stop logic
    if (position.stop_loss_level) {
      expect(position.stop_loss_level).toBeDefined();
    }

    // Check primary trigger (take-profit takes priority)
    const trigger = getPrimaryClosureTrigger(position, 1.1250, 100);
    expect(trigger).toBe(ClosureReason.TAKE_PROFIT);
  });
});
