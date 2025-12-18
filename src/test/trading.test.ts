/**
 * Example Unit Test for Trading Logic
 */

import { describe, it, expect, vi } from "vitest";

// Mock PnL calculation
const calculateUnrealizedPnL = (
  entryPrice: number,
  currentPrice: number,
  quantity: number,
  side: "long" | "short",
) => {
  const priceDiff =
    side === "long" ? currentPrice - entryPrice : entryPrice - currentPrice;
  const pnl = priceDiff * quantity * 100000; // Standard lot size
  return {
    pnl,
    pnlPercentage: entryPrice > 0 ? (priceDiff / entryPrice) * 100 : 0,
    isProfit: pnl > 0,
    isBreakeven: pnl === 0,
  };
};

describe("PnL Calculations", () => {
  describe("calculateUnrealizedPnL", () => {
    it("calculates profit for long position when price increases", () => {
      const result = calculateUnrealizedPnL(1.1, 1.105, 1, "long");

      expect(result.pnl).toBeCloseTo(500, 2); // 50 pips * $10/pip = $500
      expect(result.isProfit).toBe(true);
      expect(result.pnlPercentage).toBeCloseTo(0.4545, 2);
    });

    it("calculates loss for long position when price decreases", () => {
      const result = calculateUnrealizedPnL(1.1, 1.095, 1, "long");

      expect(result.pnl).toBeCloseTo(-500, 2);
      expect(result.isProfit).toBe(false);
    });

    it("calculates profit for short position when price decreases", () => {
      const result = calculateUnrealizedPnL(1.1, 1.095, 1, "short");

      expect(result.pnl).toBeCloseTo(500, 2);
      expect(result.isProfit).toBe(true);
    });

    it("calculates loss for short position when price increases", () => {
      const result = calculateUnrealizedPnL(1.1, 1.105, 1, "short");

      expect(result.pnl).toBeCloseTo(-500, 2);
      expect(result.isProfit).toBe(false);
    });

    it("returns breakeven when prices are equal", () => {
      const result = calculateUnrealizedPnL(1.1, 1.1, 1, "long");

      expect(result.pnl).toBe(0);
      expect(result.isBreakeven).toBe(true);
    });

    it("scales with quantity", () => {
      const result1 = calculateUnrealizedPnL(1.1, 1.105, 1, "long");
      const result2 = calculateUnrealizedPnL(1.1, 1.105, 2, "long");

      expect(result2.pnl).toBe(result1.pnl * 2);
    });
  });
});

describe("Risk Calculations", () => {
  const calculateMarginLevel = (equity: number, marginUsed: number) => {
    if (marginUsed === 0) return Infinity;
    return (equity / marginUsed) * 100;
  };

  it("calculates margin level correctly", () => {
    expect(calculateMarginLevel(10000, 5000)).toBe(200);
    expect(calculateMarginLevel(5000, 5000)).toBe(100);
    expect(calculateMarginLevel(2500, 5000)).toBe(50);
  });

  it("returns Infinity when no margin used", () => {
    expect(calculateMarginLevel(10000, 0)).toBe(Infinity);
  });

  const isMarginCallLevel = (marginLevel: number, threshold = 100) => {
    return marginLevel < threshold;
  };

  it("detects margin call correctly", () => {
    expect(isMarginCallLevel(50, 100)).toBe(true);
    expect(isMarginCallLevel(100, 100)).toBe(false);
    expect(isMarginCallLevel(150, 100)).toBe(false);
  });
});

describe("Input Validation", () => {
  const validateOrderInput = (input: {
    symbol?: string;
    quantity?: number;
    price?: number;
  }) => {
    const errors: string[] = [];

    if (!input.symbol || input.symbol.length < 3) {
      errors.push("Invalid symbol");
    }
    if (!input.quantity || input.quantity <= 0) {
      errors.push("Quantity must be positive");
    }
    if (input.price !== undefined && input.price <= 0) {
      errors.push("Price must be positive");
    }

    return { valid: errors.length === 0, errors };
  };

  it("validates correct input", () => {
    const result = validateOrderInput({
      symbol: "EURUSD",
      quantity: 1,
      price: 1.1,
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects invalid symbol", () => {
    const result = validateOrderInput({ symbol: "", quantity: 1 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Invalid symbol");
  });

  it("rejects negative quantity", () => {
    const result = validateOrderInput({ symbol: "EURUSD", quantity: -1 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Quantity must be positive");
  });

  it("rejects zero price", () => {
    const result = validateOrderInput({
      symbol: "EURUSD",
      quantity: 1,
      price: 0,
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Price must be positive");
  });
});
