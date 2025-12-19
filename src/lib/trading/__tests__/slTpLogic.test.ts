import { describe, it, expect } from 'vitest';

/**
 * Determine if a stop loss should be triggered for a position
 *
 * Buy positions: trigger when price <= stop_loss
 * Sell positions: trigger when price >= stop_loss
 */
function shouldTriggerStopLoss(
  side: 'long' | 'short',
  currentPrice: number,
  stopLoss: number | undefined
): boolean {
  if (!stopLoss) return false;

  if (side === 'long') {
    return currentPrice <= stopLoss;
  } else if (side === 'short') {
    return currentPrice >= stopLoss;
  }

  return false;
}

/**
 * Determine if a take profit should be triggered for a position
 *
 * Buy positions: trigger when price >= take_profit
 * Sell positions: trigger when price <= take_profit
 */
function shouldTriggerTakeProfit(
  side: 'long' | 'short',
  currentPrice: number,
  takeProfit: number | undefined
): boolean {
  if (!takeProfit) return false;

  if (side === 'long') {
    return currentPrice >= takeProfit;
  } else if (side === 'short') {
    return currentPrice <= takeProfit;
  }

  return false;
}

describe('SL/TP Trigger Logic', () => {
  /**
   * Test 1: Buy position SL triggers at exact threshold
   */
  it('should trigger buy position stop loss at exact threshold', () => {
    const result = shouldTriggerStopLoss('long', 1.085, 1.085);
    expect(result).toBe(true);
  });

  /**
   * Test 2: Buy position SL triggers below threshold
   */
  it('should trigger buy position stop loss below threshold', () => {
    const result = shouldTriggerStopLoss('long', 1.0849, 1.085);
    expect(result).toBe(true);
  });

  /**
   * Test 3: Buy position SL does not trigger above threshold
   */
  it('should not trigger buy position stop loss above threshold', () => {
    const result = shouldTriggerStopLoss('long', 1.0851, 1.085);
    expect(result).toBe(false);
  });

  /**
   * Test 4: Sell position SL triggers at exact threshold
   */
  it('should trigger sell position stop loss at exact threshold', () => {
    const result = shouldTriggerStopLoss('short', 1.095, 1.095);
    expect(result).toBe(true);
  });

  /**
   * Test 5: Sell position SL triggers above threshold
   */
  it('should trigger sell position stop loss above threshold', () => {
    const result = shouldTriggerStopLoss('short', 1.0951, 1.095);
    expect(result).toBe(true);
  });

  /**
   * Test 6: Sell position SL does not trigger below threshold
   */
  it('should not trigger sell position stop loss below threshold', () => {
    const result = shouldTriggerStopLoss('short', 1.0949, 1.095);
    expect(result).toBe(false);
  });

  /**
   * Test 7: Buy position TP triggers at exact threshold
   */
  it('should trigger buy position take profit at exact threshold', () => {
    const result = shouldTriggerTakeProfit('long', 1.095, 1.095);
    expect(result).toBe(true);
  });

  /**
   * Test 8: Buy position TP triggers above threshold
   */
  it('should trigger buy position take profit above threshold', () => {
    const result = shouldTriggerTakeProfit('long', 1.0951, 1.095);
    expect(result).toBe(true);
  });

  /**
   * Test 9: Buy position TP does not trigger below threshold
   */
  it('should not trigger buy position take profit below threshold', () => {
    const result = shouldTriggerTakeProfit('long', 1.0949, 1.095);
    expect(result).toBe(false);
  });

  /**
   * Test 10: Sell position TP triggers at exact threshold
   */
  it('should trigger sell position take profit at exact threshold', () => {
    const result = shouldTriggerTakeProfit('short', 1.085, 1.085);
    expect(result).toBe(true);
  });

  /**
   * Test 11: Sell position TP triggers below threshold
   */
  it('should trigger sell position take profit below threshold', () => {
    const result = shouldTriggerTakeProfit('short', 1.0849, 1.085);
    expect(result).toBe(true);
  });

  /**
   * Test 12: Sell position TP does not trigger above threshold
   */
  it('should not trigger sell position take profit above threshold', () => {
    const result = shouldTriggerTakeProfit('short', 1.0851, 1.085);
    expect(result).toBe(false);
  });

  /**
   * Test 13: No trigger without stop loss set
   */
  it('should not trigger stop loss when undefined', () => {
    const result = shouldTriggerStopLoss('long', 1.0849, undefined);
    expect(result).toBe(false);
  });

  /**
   * Test 14: No trigger without take profit set
   */
  it('should not trigger take profit when undefined', () => {
    const result = shouldTriggerTakeProfit('long', 1.0951, undefined);
    expect(result).toBe(false);
  });

  /**
   * Test 15: Multiple rapid price checks
   */
  it('should handle rapid price movements correctly', () => {
    // Position with SL at 1.0850, TP at 1.0950
    const prices = [1.09, 1.089, 1.087, 1.0849, 1.0851];
    const expectedSLTriggered = [false, false, false, true, false];

    prices.forEach((price, index) => {
      const triggered = shouldTriggerStopLoss('long', price, 1.085);
      expect(triggered).toBe(expectedSLTriggered[index]);
    });
  });

  /**
   * Test 16: Edge case with very small price difference
   */
  it('should handle very small price differences correctly', () => {
    const sl = 1.085;

    expect(shouldTriggerStopLoss('long', sl + 0.00001, sl)).toBe(false);
    expect(shouldTriggerStopLoss('long', sl - 0.00001, sl)).toBe(true);
    expect(shouldTriggerStopLoss('long', sl, sl)).toBe(true);
  });
});
