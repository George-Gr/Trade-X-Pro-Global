/**
 * Liquidation Engine - Comprehensive Test Suite
 *
 * Tests for TASK 1.3.2: Liquidation Execution Logic
 * Total: 35+ test cases covering unit, integration, and edge cases
 *
 * Test Categories:
 * 1. Liquidation Necessity (6 tests)
 * 2. Position Selection (8 tests)
 * 3. Price Calculation (6 tests)
 * 4. PnL Calculation (5 tests)
 * 5. Safety Checks (4 tests)
 * 6. Metrics & Reporting (4 tests)
 * 7. Edge Cases (6 tests)
 */

import { describe, it, expect } from "vitest";
import {
  calculateLiquidationNeeded,
  calculateLiquidationPriority,
  selectPositionsForLiquidation,
  calculateLiquidationSlippage,
  calculateLiquidationPrice,
  calculateRealizedPnL,
  validateLiquidationPreConditions,
  checkLiquidationSafety,
  generateLiquidationNotification,
  calculateLiquidationMetrics,
  formatLiquidationReason,
  formatLiquidationStatus,
  estimateExecutionTime,
  validateLiquidationEvent,
  LiquidationStatus,
  LiquidationReason,
  type PositionForLiquidation,
  type LiquidationEvent,
} from "../liquidationEngine";

// ============================================================================
// Test Category 1: Liquidation Necessity (6 tests)
// ============================================================================

describe("Liquidation Engine - Liquidation Necessity", () => {
  it("should determine liquidation needed when margin < 50%", () => {
    const result = calculateLiquidationNeeded(4000, 10000); // 40% margin level

    expect(result.isNeeded).toBe(true);
    expect(result.marginLevel).toBe(40);
    expect(result.marginToFree).toBeGreaterThan(0);
  });

  it("should determine liquidation not needed when margin >= 50%", () => {
    const result = calculateLiquidationNeeded(10000, 8000);

    expect(result.isNeeded).toBe(false);
    expect(result.marginLevel).toBe(125);
  });

  it("should handle critical margin < 30%", () => {
    const result = calculateLiquidationNeeded(2000, 10000);

    expect(result.isNeeded).toBe(true);
    expect(result.marginLevel).toBe(20);
    expect(result.marginToFree).toBeGreaterThan(5000);
  });

  it("should calculate correct margin to free", () => {
    const result = calculateLiquidationNeeded(5000, 8000);

    // Target: 5000 equity = 5000 margin (100% margin)
    // Current: 8000 margin
    // To free: 3000
    expect(result.marginToFree).toBeCloseTo(3000, 0);
  });

  it("should handle zero margin used", () => {
    const result = calculateLiquidationNeeded(10000, 0);

    expect(result.isNeeded).toBe(false);
    expect(result.marginLevel).toBe(Infinity);
  });

  it("should handle very low equity", () => {
    const result = calculateLiquidationNeeded(100, 5000);

    expect(result.isNeeded).toBe(true);
    expect(result.marginLevel).toBe(2);
    expect(result.marginToFree).toBeGreaterThan(4000);
  });
});

// ============================================================================
// Test Category 2: Position Selection (8 tests)
// ============================================================================

describe("Liquidation Engine - Position Selection", () => {
  const testPositions: PositionForLiquidation[] = [
    {
      id: "pos-1",
      symbol: "AAPL",
      side: "buy",
      quantity: 100,
      entryPrice: 150,
      currentPrice: 140,
      unrealizedPnL: -1000, // Loss
      marginRequired: 1500,
      notionalValue: 14000,
      leverage: 10,
    },
    {
      id: "pos-2",
      symbol: "GOOGL",
      side: "sell",
      quantity: 50,
      entryPrice: 140,
      currentPrice: 145,
      unrealizedPnL: -250, // Loss
      marginRequired: 725,
      notionalValue: 7250,
      leverage: 10,
    },
    {
      id: "pos-3",
      symbol: "MSFT",
      side: "buy",
      quantity: 200,
      currentPrice: 380,
      unrealizedPnL: 4000, // Profit - should not liquidate first
      marginRequired: 3800,
      notionalValue: 76000,
      leverage: 20,
      entryPrice: 370,
    },
  ];

  it("should select positions by highest priority (loss × size)", () => {
    const selected = selectPositionsForLiquidation(testPositions, 2000);

    // Should pick AAPL first (1000 loss × 14000 value = highest priority)
    expect(selected[0].symbol).toBe("AAPL");
  });

  it("should select enough positions to free target margin", () => {
    const selected = selectPositionsForLiquidation(testPositions, 3000);

    const totalMarginFreed = selected.reduce(
      (sum, p) => sum + p.marginRequired,
      0,
    );
    expect(totalMarginFreed).toBeGreaterThanOrEqual(3000);
  });

  it("should prioritize loss-making positions", () => {
    const selected = selectPositionsForLiquidation(testPositions, 5000);

    // AAPL and GOOGL both have losses, should come before MSFT
    const aaplIndex = selected.findIndex((p) => p.symbol === "AAPL");
    const msftIndex = selected.findIndex((p) => p.symbol === "MSFT");
    expect(aaplIndex).toBeLessThan(msftIndex);
  });

  it("should handle empty position list", () => {
    const selected = selectPositionsForLiquidation([], 5000);
    expect(selected).toHaveLength(0);
  });

  it("should handle zero margin to free", () => {
    const selected = selectPositionsForLiquidation(testPositions, 0);
    expect(selected).toHaveLength(0);
  });

  it("should select all positions if needed", () => {
    const selected = selectPositionsForLiquidation(testPositions, 10000);
    expect(selected.length).toBeGreaterThan(0);
  });

  it("should calculate priority correctly", () => {
    const priority = calculateLiquidationPriority(1000, 14000);
    expect(priority).toBe(14000000);
  });

  it("should handle positions with zero loss", () => {
    const position: PositionForLiquidation = {
      id: "pos-4",
      symbol: "XYZ",
      side: "buy",
      quantity: 100,
      entryPrice: 100,
      currentPrice: 100,
      unrealizedPnL: 0,
      marginRequired: 1000,
      notionalValue: 10000,
      leverage: 10,
    };

    const selected = selectPositionsForLiquidation([position], 500);
    expect(selected.length).toBe(1);
    expect(selected[0].id).toBe("pos-4");
  });
});

// ============================================================================
// Test Category 3: Price Calculation (6 tests)
// ============================================================================

describe("Liquidation Engine - Price Calculation", () => {
  it("should apply 1.5x slippage multiplier", () => {
    const normalSlippage = 2; // 2%
    const liqSlippage = calculateLiquidationSlippage(normalSlippage);

    expect(liqSlippage).toBe(3); // 2 × 1.5
  });

  it("should calculate buy position liquidation price (sell at lower)", () => {
    const price = calculateLiquidationPrice(100, "buy", 3); // 3% slippage

    // For buy positions, sell at lower price (slippage disadvantage)
    expect(price).toBeLessThan(100);
    expect(price).toBeCloseTo(97, 0);
  });

  it("should calculate sell position liquidation price (buy at higher)", () => {
    const price = calculateLiquidationPrice(100, "sell", 3); // 3% slippage

    // For sell positions, buy at higher price (slippage disadvantage)
    expect(price).toBeGreaterThan(100);
    expect(price).toBeCloseTo(103, 0);
  });

  it("should handle zero slippage", () => {
    const buyPrice = calculateLiquidationPrice(100, "buy", 0);
    const sellPrice = calculateLiquidationPrice(100, "sell", 0);

    expect(buyPrice).toBe(100);
    expect(sellPrice).toBe(100);
  });

  it("should handle high slippage", () => {
    const price = calculateLiquidationPrice(100, "buy", 10); // 10% slippage

    expect(price).toBeLessThanOrEqual(90);
  });

  it("should be symmetric for same absolute slippage", () => {
    const buyPrice = calculateLiquidationPrice(100, "buy", 5); // 5% slippage
    const sellPrice = calculateLiquidationPrice(100, "sell", 5); // 5% slippage

    // Absolute distance from 100 should be same
    expect(Math.abs(100 - buyPrice)).toBeCloseTo(Math.abs(sellPrice - 100), 1);
  });
});

// ============================================================================
// Test Category 4: PnL Calculation (5 tests)
// ============================================================================

describe("Liquidation Engine - PnL Calculation", () => {
  it("should calculate loss for buy position", () => {
    const pnl = calculateRealizedPnL("buy", 100, 50, 40);

    expect(pnl.amount).toBe(-1000); // (40 - 50) × 100
    expect(pnl.percentage).toBeCloseTo(-20, 1); // -20%
  });

  it("should calculate loss for sell position", () => {
    const pnl = calculateRealizedPnL("sell", 100, 50, 60);

    expect(pnl.amount).toBe(-1000); // -(60 - 50) × 100
    expect(pnl.percentage).toBeCloseTo(-20, 1);
  });

  it("should calculate profit for buy position", () => {
    const pnl = calculateRealizedPnL("buy", 100, 50, 60);

    expect(pnl.amount).toBe(1000);
    expect(pnl.percentage).toBeCloseTo(20, 1);
  });

  it("should calculate profit for sell position", () => {
    const pnl = calculateRealizedPnL("sell", 100, 50, 40);

    expect(pnl.amount).toBe(1000);
    expect(pnl.percentage).toBeCloseTo(20, 1);
  });

  it("should handle zero PnL", () => {
    const pnl = calculateRealizedPnL("buy", 100, 50, 50);

    expect(pnl.amount).toBe(0);
    expect(pnl.percentage).toBe(0);
  });
});

// ============================================================================
// Test Category 5: Safety Checks (4 tests)
// ============================================================================

describe("Liquidation Engine - Safety Checks", () => {
  it("should validate liquidation preconditions met", () => {
    const result = validateLiquidationPreConditions(40, 5, 35);

    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("should reject if margin level above 50%", () => {
    const result = validateLiquidationPreConditions(60, 5, 35);

    expect(result.valid).toBe(false);
    expect(result.issues[0]).toContain("below 50%");
  });

  it("should reject if no positions to liquidate", () => {
    const result = validateLiquidationPreConditions(40, 0, 35);

    expect(result.valid).toBe(false);
    expect(result.issues).toContain("No positions to liquidate");
  });

  it("should check market safety for liquidation", () => {
    const positions: PositionForLiquidation[] = [
      {
        id: "pos-1",
        symbol: "AAPL",
        side: "buy",
        quantity: 100,
        entryPrice: 150,
        currentPrice: 140,
        unrealizedPnL: -1000,
        marginRequired: 1500,
        notionalValue: 14000,
        leverage: 10,
      },
    ];

    const prices = {
      AAPL: { bid: 139, ask: 141 },
    };

    const check = checkLiquidationSafety(positions, prices);

    expect(check.isSafe).toBe(true);
    expect(check.positionsToClose).toBe(1);
  });
});

// ============================================================================
// Test Category 6: Metrics & Reporting (4 tests)
// ============================================================================

describe("Liquidation Engine - Metrics & Reporting", () => {
  it("should format liquidation reason", () => {
    const formatted = formatLiquidationReason(
      LiquidationReason.MARGIN_CALL_TIMEOUT,
    );

    expect(formatted).toContain("Margin Call Timeout");
  });

  it("should format liquidation status with color", () => {
    const formatted = formatLiquidationStatus(LiquidationStatus.COMPLETED);

    expect(formatted.label).toBe("Completed");
    expect(formatted.color).toContain("red");
  });

  it("should estimate execution time", () => {
    const time = estimateExecutionTime(5);

    // 5 * 50 + 500 = 750ms
    expect(time).toBe(750);
  });

  it("should calculate liquidation metrics", () => {
    const event: LiquidationEvent = {
      id: "event-1",
      userId: "user-1",
      marginCallEventId: "call-1",
      reason: LiquidationReason.MARGIN_CALL_TIMEOUT,
      status: LiquidationStatus.COMPLETED,
      initiatedAt: new Date(),
      completedAt: new Date(),
      initialMarginLevel: 40,
      finalMarginLevel: 105,
      initialEquity: 5000,
      finalEquity: 4500,
      positionsLiquidated: 3,
      total_realized_pnl: -750,
      totalSlippageApplied: 250,
      details: {
        closedPositions: [
          {
            positionId: "p1",
            symbol: "AAPL",
            side: "buy",
            quantity: 100,
            entryPrice: 150,
            liquidationPrice: 145,
            slippage: 3.33,
            realizedPnL: -500,
            pnlPercentage: -3.33,
            closureReason: "Liquidation",
            closedAt: new Date(),
          },
        ],
        failedPositions: [],
      },
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const metrics = calculateLiquidationMetrics(event);

    expect(metrics.positionsLiquidated).toBe(1); // 1 closed position in details
    expect(metrics.marginRecovery).toBeCloseTo(65, 0); // 105 - 40
  });
});

// ============================================================================
// Test Category 7: Edge Cases (6 tests)
// ============================================================================

describe("Liquidation Engine - Edge Cases", () => {
  it("should handle liquidation at exactly 50% margin", () => {
    const result = calculateLiquidationNeeded(5000, 10000);

    expect(result.isNeeded).toBe(false); // < 50%, not <=, so 50% is not liquidation
    expect(result.marginLevel).toBe(50);
  });

  it("should handle liquidation at exactly 30% margin (critical)", () => {
    const result = calculateLiquidationNeeded(3000, 10000);

    expect(result.isNeeded).toBe(true);
    expect(result.marginLevel).toBe(30);
  });

  it("should handle very large position quantities", () => {
    const position: PositionForLiquidation = {
      id: "pos-large",
      symbol: "BTC",
      side: "buy",
      quantity: 1000000,
      entryPrice: 50000,
      currentPrice: 48000,
      unrealizedPnL: -2000000000,
      marginRequired: 500000000,
      notionalValue: 48000000000,
      leverage: 100,
    };

    const selected = selectPositionsForLiquidation([position], 100000000);
    expect(selected).toHaveLength(1);
  });

  it("should handle very small position quantities", () => {
    const position: PositionForLiquidation = {
      id: "pos-small",
      symbol: "AAPL",
      side: "buy",
      quantity: 0.001,
      entryPrice: 150,
      currentPrice: 140,
      unrealizedPnL: -0.01,
      marginRequired: 0.15,
      notionalValue: 0.14,
      leverage: 1,
    };

    const selected = selectPositionsForLiquidation([position], 1);
    // Even small positions count toward margin target
    expect(selected).toHaveLength(1);
  });

  it("should handle rapid margin recovery", () => {
    const result = calculateLiquidationNeeded(10000, 8000);

    // Market recovered, margin now safe
    expect(result.isNeeded).toBe(false);
  });

  it("should generate notification for completed liquidation", () => {
    const event: LiquidationEvent = {
      id: "event-1",
      userId: "user-1",
      marginCallEventId: "call-1",
      reason: LiquidationReason.CRITICAL_THRESHOLD,
      status: LiquidationStatus.COMPLETED,
      initiatedAt: new Date(),
      completedAt: new Date(),
      initialMarginLevel: 25,
      finalMarginLevel: 110,
      initialEquity: 2500,
      finalEquity: 2300,
      positionsLiquidated: 5,
      total_realized_pnl: -200,
      totalSlippageApplied: 500,
      details: {
        closedPositions: [],
        failedPositions: [],
      },
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const notification = generateLiquidationNotification(event, {
      success: true,
      liquidationEventId: event.id,
      totalPositionsClosed: 5,
      totalPositionsFailed: 0,
      initialMarginLevel: 25,
      finalMarginLevel: 110,
      totalLossRealized: -200,
      totalSlippageApplied: 500,
      averageLiquidationPrice: 142,
      executionTimeMs: 750,
      closedPositions: [],
      failedPositions: [],
      message: "5 positions liquidated",
    });

    expect(notification.type).toBe("LIQUIDATION");
    expect(notification.priority).toBe("CRITICAL");
    expect(notification.message).toContain("5 positions liquidated");
  });
});

// ============================================================================
// Test Category 8: Validation (3 tests)
// ============================================================================

describe("Liquidation Engine - Validation", () => {
  it("should validate complete liquidation event", () => {
    const event: LiquidationEvent = {
      id: "event-1",
      userId: "user-1",
      marginCallEventId: null,
      reason: LiquidationReason.MARGIN_CALL_TIMEOUT,
      status: LiquidationStatus.COMPLETED,
      initiatedAt: new Date(),
      completedAt: new Date(),
      initialMarginLevel: 40,
      finalMarginLevel: 105,
      initialEquity: 5000,
      finalEquity: 4500,
      positionsLiquidated: 3,
      total_realized_pnl: -500,
      totalSlippageApplied: 150,
      details: {
        closedPositions: [],
        failedPositions: [],
      },
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(validateLiquidationEvent(event)).toBe(true);
  });

  it("should reject invalid status", () => {
    const event = {
      id: "event-1",
      userId: "user-1",
      marginCallEventId: null,
      reason: LiquidationReason.MARGIN_CALL_TIMEOUT,
      status: "invalid_status",
      initiatedAt: new Date(),
      completedAt: new Date(),
      initialMarginLevel: 40,
      finalMarginLevel: 105,
      initialEquity: 5000,
      finalEquity: 4500,
      positionsLiquidated: 3,
      total_realized_pnl: -500,
      totalSlippageApplied: 150,
      details: {
        closedPositions: [],
        failedPositions: [],
      },
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(validateLiquidationEvent(event as unknown as LiquidationEvent)).toBe(
      false,
    );
  });

  it("should reject negative margin levels", () => {
    const event = {
      id: "event-1",
      userId: "user-1",
      marginCallEventId: null,
      reason: LiquidationReason.MARGIN_CALL_TIMEOUT,
      status: LiquidationStatus.COMPLETED,
      initiatedAt: new Date(),
      completedAt: new Date(),
      initialMarginLevel: -40,
      finalMarginLevel: 105,
      initialEquity: 5000,
      finalEquity: 4500,
      positionsLiquidated: 3,
      total_realized_pnl: -500,
      totalSlippageApplied: 150,
      details: {
        closedPositions: [],
        failedPositions: [],
      },
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(validateLiquidationEvent(event as unknown as LiquidationEvent)).toBe(
      false,
    );
  });
});
