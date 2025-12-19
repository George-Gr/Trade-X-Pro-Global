import { describe, it, expect } from 'vitest';
import {
  calculateUnrealizedPnL,
  calculateRealizedPnL,
  calculatePnLPercentage,
  calculateROI,
  calculatePositionPnL,
  calculatePortfolioPnL,
  calculateDailyPnL,
  calculatePnLByAssetClass,
  calculateRunningPnL,
  getWinLossStats,
  formatPnL,
  getPnLTrend,
  getPnLIcon,
  type Position,
  type OrderFill,
} from '../pnlCalculation';

// ============================================================================
// UNIT TESTS: CORE CALCULATIONS
// ============================================================================

describe('calculateUnrealizedPnL', () => {
  it('should calculate profit for long position when price increases', () => {
    const result = calculateUnrealizedPnL(100, 110, 10, 'long');
    expect(result.pnl).toBe(100);
    expect(result.pnlPercentage).toBe(10);
    expect(result.isProfit).toBe(true);
    expect(result.isBreakeven).toBe(false);
  });

  it('should calculate loss for long position when price decreases', () => {
    const result = calculateUnrealizedPnL(100, 90, 10, 'long');
    expect(result.pnl).toBe(-100);
    expect(result.pnlPercentage).toBe(-10);
    expect(result.isProfit).toBe(false);
    expect(result.isBreakeven).toBe(false);
  });

  it('should calculate profit for short position when price decreases', () => {
    const result = calculateUnrealizedPnL(100, 90, 10, 'short');
    expect(result.pnl).toBe(100);
    expect(result.pnlPercentage).toBe(10);
    expect(result.isProfit).toBe(true);
  });

  it('should calculate loss for short position when price increases', () => {
    const result = calculateUnrealizedPnL(100, 110, 10, 'short');
    expect(result.pnl).toBe(-100);
    expect(result.pnlPercentage).toBe(-10);
    expect(result.isProfit).toBe(false);
  });

  it('should handle breakeven scenario', () => {
    const result = calculateUnrealizedPnL(100, 100, 10, 'long');
    expect(result.pnl).toBe(0);
    expect(result.pnlPercentage).toBe(0);
    expect(result.isBreakeven).toBe(true);
  });

  it('should handle zero quantity', () => {
    const result = calculateUnrealizedPnL(100, 110, 0, 'long');
    expect(result.pnl).toBe(0);
    expect(result.pnlPercentage).toBe(0);
    expect(result.isBreakeven).toBe(true);
  });

  it('should maintain 4 decimal precision', () => {
    const result = calculateUnrealizedPnL(100.5555, 110.3333, 10.7777, 'long');
    const pnlString = result.pnl.toString();
    const decimalPart = pnlString.split('.')[1] || '';
    expect(decimalPart.length).toBeLessThanOrEqual(4);
  });
});

describe('calculateRealizedPnL', () => {
  it('should calculate profit for closed long position', () => {
    const result = calculateRealizedPnL(100, 110, 10, 'long');
    expect(result.pnl).toBe(100);
    expect(result.pnlPercentage).toBe(10);
    expect(result.isProfit).toBe(true);
  });

  it('should calculate loss for closed long position', () => {
    const result = calculateRealizedPnL(100, 90, 10, 'long');
    expect(result.pnl).toBe(-100);
    expect(result.pnlPercentage).toBe(-10);
    expect(result.isProfit).toBe(false);
  });

  it('should calculate profit for closed short position', () => {
    const result = calculateRealizedPnL(100, 90, 10, 'short');
    expect(result.pnl).toBe(100);
    expect(result.pnlPercentage).toBe(10);
    expect(result.isProfit).toBe(true);
  });

  it('should calculate loss for closed short position', () => {
    const result = calculateRealizedPnL(100, 110, 10, 'short');
    expect(result.pnl).toBe(-100);
    expect(result.pnlPercentage).toBe(-10);
    expect(result.isProfit).toBe(false);
  });

  it('should handle zero quantity', () => {
    const result = calculateRealizedPnL(100, 110, 0, 'long');
    expect(result.pnl).toBe(0);
    expect(result.isBreakeven).toBe(true);
  });
});

describe('calculatePnLPercentage', () => {
  it('should calculate percentage correctly', () => {
    const percentage = calculatePnLPercentage(100, 1000);
    expect(percentage).toBe(10);
  });

  it('should handle negative P&L', () => {
    const percentage = calculatePnLPercentage(-50, 1000);
    expect(percentage).toBe(-5);
  });

  it('should return 0 for zero base cost', () => {
    const percentage = calculatePnLPercentage(100, 0);
    expect(percentage).toBe(0);
  });

  it('should maintain 4 decimal precision', () => {
    const percentage = calculatePnLPercentage(33.3333, 1000);
    expect(percentage).toBe(3.3333);
  });
});

describe('calculateROI', () => {
  it('should calculate ROI correctly', () => {
    const roi = calculateROI(500, 1000);
    expect(roi).toBe(50);
  });

  it('should handle zero margin', () => {
    const roi = calculateROI(500, 0);
    expect(roi).toBe(0);
  });

  it('should handle negative ROI', () => {
    const roi = calculateROI(-200, 1000);
    expect(roi).toBe(-20);
  });

  it('should maintain 4 decimal precision', () => {
    const roi = calculateROI(123.4567, 1000);
    expect(roi).toBe(12.3457);
  });
});

// ============================================================================
// UNIT TESTS: AGGREGATION FUNCTIONS
// ============================================================================

describe('calculatePositionPnL', () => {
  const position: Position = {
    id: 'pos-1',
    symbol: 'EURUSD',
    side: 'long' as const,
    quantity: 10,
    entryPrice: 1.1,
    currentPrice: 1.11,
  };

  it('should calculate comprehensive P&L details', () => {
    const details = calculatePositionPnL(position, 1.11, 5, 2, 500);
    expect(details.positionId).toBe('pos-1');
    expect(details.symbol).toBe('EURUSD');
    expect(details.unrealizedPnL).toBeGreaterThan(0);
    expect(details.status).toBe('profit');
  });

  it('should handle short positions', () => {
    const shortPos: Position = { ...position, side: 'short' };
    const details = calculatePositionPnL(shortPos, 1.09);
    expect(details.unrealizedPnL).toBeGreaterThan(0);
    expect(details.status).toBe('profit');
  });

  it('should calculate margin level', () => {
    const details = calculatePositionPnL(position, 1.11, 0, 0, 100);
    expect(details.marginLevel).toBeGreaterThan(0);
  });

  it('should calculate ROI correctly', () => {
    const details = calculatePositionPnL(position, 1.11, 0, 0, 500);
    expect(details.roi).toBeLessThan(100); // Should be positive but less than 100%
  });
});

describe('calculatePortfolioPnL', () => {
  const positions: Position[] = [
    {
      id: 'pos-1',
      symbol: 'BTC/USD',
      side: 'long',
      quantity: 1,
      entryPrice: 50000,
      currentPrice: 51000,
    },
    {
      id: 'pos-2',
      symbol: 'ETH/USD',
      side: 'long',
      quantity: 10,
      entryPrice: 3000,
      currentPrice: 2950,
    },
  ];

  const prices = new Map([
    ['BTC/USD', 51000],
    ['ETH/USD', 2950],
  ]);

  it('should aggregate unrealized P&L across positions', () => {
    const summary = calculatePortfolioPnL(positions, prices);
    expect(summary.totalUnrealizedPnL).toBe(1000 - 500); // 500
    expect(summary.positionCount).toBe(2);
  });

  it('should count profitable and losing positions', () => {
    const summary = calculatePortfolioPnL(positions, prices);
    expect(summary.profitablePositions).toBe(1);
    expect(summary.losingPositions).toBe(1);
  });

  it('should calculate win rate', () => {
    const summary = calculatePortfolioPnL(positions, prices);
    expect(summary.winRate).toBe(50); // 1 out of 2
  });
});

describe('calculateDailyPnL', () => {
  const fills: OrderFill[] = [
    {
      id: 'fill-1',
      symbol: 'AAPL',
      side: 'buy' as const,
      quantity: 100,
      executionPrice: 150,
      commission: 10,
      timestamp: new Date('2025-11-13'),
    },
    {
      id: 'fill-2',
      symbol: 'AAPL',
      side: 'sell' as const,
      quantity: 100,
      executionPrice: 155,
      commission: 10,
      timestamp: new Date('2025-11-13'),
    },
  ];

  it('should calculate daily P&L breakdown', () => {
    const daily = calculateDailyPnL(fills);
    expect(daily).toHaveLength(1);
    expect(daily[0].tradesCount).toBe(2);
  });

  it('should group fills by date', () => {
    const fills2: OrderFill[] = [
      ...fills,
      {
        id: 'fill-3',
        symbol: 'GOOGL',
        side: 'buy' as const,
        quantity: 50,
        executionPrice: 100,
        timestamp: new Date('2025-11-14'),
      },
    ];

    const daily = calculateDailyPnL(fills2);
    expect(daily).toHaveLength(2);
  });
});

describe('calculatePnLByAssetClass', () => {
  const positions: Position[] = [
    {
      id: 'pos-1',
      symbol: 'EURUSD',
      side: 'long',
      quantity: 100000,
      entryPrice: 1.1,
      currentPrice: 1.11,
      assetClass: 'Forex',
    },
    {
      id: 'pos-2',
      symbol: 'AAPL',
      side: 'long',
      quantity: 100,
      entryPrice: 150,
      currentPrice: 155,
      assetClass: 'Stock',
    },
  ];

  const prices = new Map([
    ['EURUSD', 1.11],
    ['AAPL', 155],
  ]);

  it('should aggregate P&L by asset class', () => {
    const byClass = calculatePnLByAssetClass(positions, prices);
    expect(byClass['Forex']).toBeDefined();
    expect(byClass['Stock']).toBeDefined();
  });

  it('should calculate P&L percentage per asset class', () => {
    const byClass = calculatePnLByAssetClass(positions, prices);
    expect(byClass['Stock'].pnlPercentage).toBeGreaterThan(0);
  });
});

describe('getWinLossStats', () => {
  const fills: OrderFill[] = [
    // Winning trade
    {
      id: 'fill-1',
      symbol: 'BTC',
      side: 'buy',
      quantity: 1,
      executionPrice: 50000,
      timestamp: new Date('2025-11-13'),
    },
    {
      id: 'fill-2',
      symbol: 'BTC',
      side: 'sell',
      quantity: 1,
      executionPrice: 52000,
      timestamp: new Date('2025-11-13'),
    },
    // Losing trade
    {
      id: 'fill-3',
      symbol: 'ETH',
      side: 'buy',
      quantity: 10,
      executionPrice: 3000,
      timestamp: new Date('2025-11-13'),
    },
    {
      id: 'fill-4',
      symbol: 'ETH',
      side: 'sell',
      quantity: 10,
      executionPrice: 2900,
      timestamp: new Date('2025-11-13'),
    },
  ];

  it('should calculate win count', () => {
    const stats = getWinLossStats(fills);
    expect(stats.winningTrades).toBe(1);
    expect(stats.losingTrades).toBe(1);
  });

  it('should calculate win rate', () => {
    const stats = getWinLossStats(fills);
    expect(stats.winRate).toBe(50);
  });

  it('should calculate profit factor', () => {
    const stats = getWinLossStats(fills);
    expect(stats.profitFactor).toBeGreaterThan(0);
  });
});

// ============================================================================
// UNIT TESTS: FORMATTING & UTILITIES
// ============================================================================

describe('formatPnL', () => {
  it('should format positive P&L with plus sign', () => {
    const formatted = formatPnL(100);
    expect(formatted).toBe('+$100.00');
  });

  it('should format negative P&L with minus sign', () => {
    const formatted = formatPnL(-100);
    expect(formatted).toBe('-$100.00');
  });

  it('should format zero P&L', () => {
    const formatted = formatPnL(0);
    expect(formatted).toBe('$0.00');
  });

  it('should support custom currency', () => {
    const formatted = formatPnL(100, 'EUR');
    expect(formatted).toContain('EUR');
  });
});

describe('getPnLTrend', () => {
  it('should return profit for positive P&L', () => {
    expect(getPnLTrend(100)).toBe('profit');
  });

  it('should return loss for negative P&L', () => {
    expect(getPnLTrend(-100)).toBe('loss');
  });

  it('should return breakeven for zero P&L', () => {
    expect(getPnLTrend(0)).toBe('breakeven');
  });
});

describe('getPnLIcon', () => {
  it('should return + for profit', () => {
    expect(getPnLIcon(100)).toBe('+');
  });

  it('should return - for loss', () => {
    expect(getPnLIcon(-100)).toBe('-');
  });

  it('should return = for breakeven', () => {
    expect(getPnLIcon(0)).toBe('=');
  });
});

// ============================================================================
// INTEGRATION TESTS: COMPLETE WORKFLOWS
// ============================================================================

describe('Integration: Complete Long Position Cycle', () => {
  it('should track position from entry to exit', () => {
    const position: Position = {
      id: 'pos-long-1',
      symbol: 'BTCUSD',
      side: 'long',
      quantity: 1,
      entryPrice: 45000,
      currentPrice: 45000,
    };

    // Entry point
    const entryDetails = calculatePositionPnL(position, 45000);
    expect(entryDetails.unrealizedPnL).toBe(0);
    expect(entryDetails.status).toBe('breakeven');

    // Price moves up
    const profitDetails = calculatePositionPnL(position, 48000);
    expect(profitDetails.unrealizedPnL).toBe(3000);
    expect(profitDetails.status).toBe('profit');

    // Exit
    const exitResult = calculateRealizedPnL(45000, 48000, 1, 'long');
    expect(exitResult.pnl).toBe(3000);
    expect(exitResult.pnlPercentage).toBe(6.6667);
  });
});

describe('Integration: Complete Short Position Cycle', () => {
  it('should track short position from entry to exit', () => {
    const position: Position = {
      id: 'pos-short-1',
      symbol: 'ETHUSD',
      side: 'short',
      quantity: 10,
      entryPrice: 3000,
      currentPrice: 3000,
    };

    // Entry at breakeven
    const entryDetails = calculatePositionPnL(position, 3000);
    expect(entryDetails.unrealizedPnL).toBe(0);

    // Price goes down (profit for short)
    const profitDetails = calculatePositionPnL(position, 2800);
    expect(profitDetails.unrealizedPnL).toBeGreaterThan(0);
    expect(profitDetails.status).toBe('profit');

    // Exit
    const exitResult = calculateRealizedPnL(3000, 2800, 10, 'short');
    expect(exitResult.pnl).toBe(2000);
  });
});

describe('Integration: Multiple Positions Portfolio', () => {
  it('should aggregate multiple open positions correctly', () => {
    const positions: Position[] = [
      {
        id: 'pos-1',
        symbol: 'BTC',
        side: 'long',
        quantity: 0.5,
        entryPrice: 50000,
        currentPrice: 52000,
      },
      {
        id: 'pos-2',
        symbol: 'ETH',
        side: 'long',
        quantity: 5,
        entryPrice: 3000,
        currentPrice: 3100,
      },
      {
        id: 'pos-3',
        symbol: 'GOLD',
        side: 'short',
        quantity: 100,
        entryPrice: 2000,
        currentPrice: 1950,
      },
    ];

    const prices = new Map([
      ['BTC', 52000],
      ['ETH', 3100],
      ['GOLD', 1950],
    ]);

    const portfolio = calculatePortfolioPnL(positions, prices);
    expect(portfolio.positionCount).toBe(3);
    expect(portfolio.profitablePositions).toBe(3);
    expect(portfolio.winRate).toBe(100);
    expect(portfolio.totalUnrealizedPnL).toBeGreaterThan(0);
  });
});

describe('Integration: Daily P&L Accuracy', () => {
  it('should calculate daily totals matching manual calculation', () => {
    const fills: OrderFill[] = [
      {
        id: 'fill-1',
        symbol: 'AAPL',
        side: 'buy',
        quantity: 100,
        executionPrice: 150,
        commission: 0,
        timestamp: new Date('2025-11-13'),
      },
      {
        id: 'fill-2',
        symbol: 'AAPL',
        side: 'sell',
        quantity: 100,
        executionPrice: 155,
        commission: 0,
        timestamp: new Date('2025-11-13'),
      },
    ];

    const daily = calculateDailyPnL(fills);
    expect(daily[0].dailyPnL).toBe(500); // (155-150) * 100
  });
});

describe('Integration: Partial Fills Aggregation', () => {
  it('should correctly aggregate partially filled positions', () => {
    const fills: OrderFill[] = [
      // First purchase
      {
        id: 'fill-1',
        symbol: 'TSLA',
        side: 'buy',
        quantity: 50,
        executionPrice: 200,
        timestamp: new Date('2025-11-13'),
      },
      // Add to position
      {
        id: 'fill-2',
        symbol: 'TSLA',
        side: 'buy',
        quantity: 50,
        executionPrice: 205,
        timestamp: new Date('2025-11-13'),
      },
      // Partial exit
      {
        id: 'fill-3',
        symbol: 'TSLA',
        side: 'sell',
        quantity: 75,
        executionPrice: 210,
        timestamp: new Date('2025-11-13'),
      },
    ];

    const daily = calculateDailyPnL(fills);
    expect(daily).toHaveLength(1);
    expect(daily[0].tradesCount).toBe(3);
  });
});

describe('Edge Cases: Boundary Conditions', () => {
  it('should handle extreme leverage scenarios', () => {
    const result = calculateUnrealizedPnL(100, 100.01, 10000, 'long');
    expect(result.pnl).toBeGreaterThan(0);
    expect(result.pnlPercentage).toBeGreaterThan(0);
  });

  it('should handle minimum lot size positions', () => {
    const result = calculateUnrealizedPnL(100, 110, 0.01, 'long');
    expect(result.pnl).toBeGreaterThan(0);
    expect(result.pnl).toBeLessThan(1);
  });

  it('should handle large position with small entry price (penny stocks)', () => {
    const result = calculateUnrealizedPnL(0.01, 0.015, 1000000, 'long');
    expect(result.pnl).toBe(5000);
    expect(result.pnlPercentage).toBe(50);
  });

  it('should handle fractional shares', () => {
    const result = calculateUnrealizedPnL(150.5555, 155.3333, 10.7777, 'long');
    expect(result.pnl).toBeGreaterThan(0);
    expect(result.pnlPercentage).toBeGreaterThan(0);
  });
});

describe('Decimal Precision Validation', () => {
  it('should maintain 4 decimal precision throughout calculations', () => {
    const positions: Position[] = [
      {
        id: 'pos-1',
        symbol: 'EURUSD',
        side: 'long',
        quantity: 100000.3333,
        entryPrice: 1.1111,
        currentPrice: 1.2222,
      },
    ];

    const prices = new Map([['EURUSD', 1.2222]]);
    const portfolio = calculatePortfolioPnL(positions, prices);

    // Check precision in results
    const pnlStr = portfolio.totalUnrealizedPnL.toString().split('.')[1] || '';
    expect(pnlStr.length).toBeLessThanOrEqual(4);

    const pnlPercStr = portfolio.pnlPercentage.toString().split('.')[1] || '';
    expect(pnlPercStr.length).toBeLessThanOrEqual(4);
  });

  it('should not introduce floating point errors', () => {
    // Test case that often causes floating point errors
    const result = calculateUnrealizedPnL(0.1 + 0.2, 0.4, 100, 'long');
    expect(result.pnl).toBe(10); // Should be exactly 10, not 9.999... or 10.000...1
  });
});
