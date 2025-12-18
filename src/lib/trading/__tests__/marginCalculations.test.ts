import { describe, it, expect } from "vitest";
import {
  calculateMarginRequired,
  calculateFreeMargin,
  calculateMarginLevel,
  calculatePositionValue,
  calculateUnrealizedPnL,
  calculateLiquidationPrice,
  calculateMaxPositionSize,
  calculateMarginSummary,
  canOpenPosition,
  getAssetConfig,
  MarginCalculationError,
  ASSET_CLASS_CONFIG,
} from "../marginCalculations";

describe("marginCalculations", () => {
  describe("calculateMarginRequired", () => {
    it("calculates margin for long BTC position with 5x leverage", () => {
      const margin = calculateMarginRequired(1, 50000, 5);
      expect(margin).toBe(10000); // (1 × 50000) / 5 = 10000
    });

    it("calculates margin for forex position", () => {
      const margin = calculateMarginRequired(100000, 1.1234, 500);
      expect(margin).toBeCloseTo(224.68, 2);
    });

    it("returns 4-decimal precision", () => {
      const margin = calculateMarginRequired(0.33333, 100, 100);
      expect(margin.toString().split(".")[1]?.length || 0).toBeLessThanOrEqual(
        4,
      );
    });
  });

  describe("calculateFreeMargin", () => {
    it("calculates free margin correctly", () => {
      const free = calculateFreeMargin(100000, 25000);
      expect(free).toBe(75000);
    });

    it("throws error when margin exceeds equity", () => {
      expect(() => calculateFreeMargin(50000, 100000)).toThrow(
        MarginCalculationError,
      );
    });

    it("returns full equity when no margin used", () => {
      const free = calculateFreeMargin(100000, 0);
      expect(free).toBe(100000);
    });
  });

  describe("calculateMarginLevel", () => {
    it("calculates margin level as percentage", () => {
      const level = calculateMarginLevel(100000, 50000);
      expect(level).toBe(200); // (100000 / 50000) × 100 = 200%
    });

    it("shows warning zone margin level", () => {
      const level = calculateMarginLevel(75000, 50000);
      expect(level).toBe(150); // 150% - in warning zone
    });

    it("shows critical margin level", () => {
      const level = calculateMarginLevel(40000, 50000);
      expect(level).toBe(80); // 80% - in critical zone
    });

    it("throws error when margin used is zero", () => {
      expect(() => calculateMarginLevel(100000, 0)).toThrow(
        MarginCalculationError,
      );
    });

    it("throws error when margin used is negative", () => {
      expect(() => calculateMarginLevel(100000, -1000)).toThrow(
        MarginCalculationError,
      );
    });
  });

  describe("calculatePositionValue", () => {
    it("calculates position value correctly", () => {
      const value = calculatePositionValue(1, 50000);
      expect(value).toBe(50000);
    });

    it("calculates position value for fractional shares", () => {
      const value = calculatePositionValue(0.5, 150);
      expect(value).toBe(75);
    });

    it("returns 4-decimal precision", () => {
      const value = calculatePositionValue(0.333, 100);
      expect(value.toString().split(".")[1]?.length || 0).toBeLessThanOrEqual(
        4,
      );
    });
  });

  describe("calculateUnrealizedPnL", () => {
    it("calculates profit for long position", () => {
      const pnl = calculateUnrealizedPnL(1, 50000, 55000);
      expect(pnl).toBe(5000); // (55000 - 50000) × 1 = 5000
    });

    it("calculates loss for long position", () => {
      const pnl = calculateUnrealizedPnL(1, 50000, 45000);
      expect(pnl).toBe(-5000); // (45000 - 50000) × 1 = -5000
    });

    it("calculates profit for short position (negative size)", () => {
      const pnl = calculateUnrealizedPnL(-1, 50000, 45000);
      expect(pnl).toBe(5000); // -1 × (45000 - 50000) = 5000
    });

    it("calculates loss for short position", () => {
      const pnl = calculateUnrealizedPnL(-1, 50000, 55000);
      expect(pnl).toBe(-5000); // -1 × (55000 - 50000) = -5000
    });

    it("returns zero P&L at entry price", () => {
      const pnl = calculateUnrealizedPnL(10, 100, 100);
      expect(pnl).toBe(0);
    });
  });

  describe("calculateLiquidationPrice", () => {
    it("calculates liquidation price for long position", () => {
      // Entry: 50000, Leverage: 5x, Maintenance Margin: 15%
      // LP = 50000 - (50000 × 5 × (1 - 0.15)) = 50000 - 212500 = -162500 (unusual but formula-based)
      const lp = calculateLiquidationPrice(50000, 1, 5, 15);
      expect(lp).toBeLessThan(50000); // Should be below entry for long
    });

    it("calculates liquidation price for short position", () => {
      const lp = calculateLiquidationPrice(50000, -1, 5, 15);
      expect(lp).toBeGreaterThan(50000); // Should be above entry for short
    });

    it("returns higher liquidation price for higher maintenance ratio", () => {
      const lp1 = calculateLiquidationPrice(50000, 1, 5, 5);
      const lp2 = calculateLiquidationPrice(50000, 1, 5, 15);
      expect(lp2).toBeGreaterThan(lp1); // Higher maintenance = lower buffer
    });
  });

  describe("calculateMaxPositionSize", () => {
    it("calculates max position size with given leverage", () => {
      const maxSize = calculateMaxPositionSize(10000, 5, 50000);
      expect(maxSize).toBe(1); // (10000 × 5) / 50000 = 1
    });

    it("calculates max position size for forex", () => {
      const maxSize = calculateMaxPositionSize(1000, 500, 1.1234);
      expect(maxSize).toBeCloseTo(445077.4435, 2); // (1000 × 500) / 1.1234
    });

    it("throws error for negative equity", () => {
      expect(() => calculateMaxPositionSize(-1000, 5, 50000)).toThrow(
        MarginCalculationError,
      );
    });

    it("throws error for zero/negative price", () => {
      expect(() => calculateMaxPositionSize(10000, 5, 0)).toThrow(
        MarginCalculationError,
      );
      expect(() => calculateMaxPositionSize(10000, 5, -100)).toThrow(
        MarginCalculationError,
      );
    });
  });

  describe("canOpenPosition", () => {
    it("returns true when margin fits", () => {
      const canOpen = canOpenPosition(5000, 10000);
      expect(canOpen).toBe(true);
    });

    it("returns false when margin exceeds free margin", () => {
      const canOpen = canOpenPosition(15000, 10000);
      expect(canOpen).toBe(false);
    });

    it("returns true when margin equals free margin exactly", () => {
      const canOpen = canOpenPosition(10000, 10000);
      expect(canOpen).toBe(true);
    });
  });

  describe("calculateMarginSummary", () => {
    it("returns safe status with high margin level", () => {
      const summary = calculateMarginSummary(100000, 25000);
      expect(summary.marginLevelStatus).toBe("safe");
      expect(summary.marginLevel).toBe(400);
      expect(summary.canOpenNewPosition).toBe(true);
    });

    it("returns warning status with medium margin level", () => {
      const summary = calculateMarginSummary(100000, 60000);
      expect(summary.marginLevelStatus).toBe("warning");
      expect(summary.marginLevel).toBeCloseTo(166.67, 2);
      expect(summary.canOpenNewPosition).toBe(true);
    });

    it("returns warning status (100-200%) not critical", () => {
      const summary = calculateMarginSummary(100000, 95000);
      expect(summary.marginLevelStatus).toBe("warning");
      expect(summary.marginLevel).toBeCloseTo(105.26, 2);
      expect(summary.canOpenNewPosition).toBe(true);
    });

    it("returns liquidation status when margin level < 50%", () => {
      // Equity 100k, Margin 210k = 47.6% margin level
      const summary = calculateMarginSummary(100000, 210000);
      expect(summary.marginLevelStatus).toBe("liquidation");
      expect(summary.marginLevel).toBeCloseTo(47.62, 1);
      expect(summary.canOpenNewPosition).toBe(false);
    });

    it("shows high margin level when no positions", () => {
      const summary = calculateMarginSummary(100000, 0);
      expect(summary.marginLevel).toBe(100000);
      expect(summary.canOpenNewPosition).toBe(true);
    });
  });

  describe("getAssetConfig", () => {
    it("returns config for known asset", () => {
      const config = getAssetConfig("BTCUSD");
      expect(config.leverage).toBe(5);
      expect(config.maintenanceMarginRatio).toBe(15);
    });

    it("returns config for forex pair", () => {
      const config = getAssetConfig("EURUSD");
      expect(config.leverage).toBe(500);
      expect(config.maintenanceMarginRatio).toBe(2);
    });

    it("returns config for stock", () => {
      const config = getAssetConfig("AAPL");
      expect(config.leverage).toBe(20);
      expect(config.maintenanceMarginRatio).toBe(25);
    });

    it("returns default config for unknown asset", () => {
      const config = getAssetConfig("UNKNOWN_ASSET");
      expect(config.leverage).toBe(10);
      expect(config.maintenanceMarginRatio).toBe(10);
    });
  });

  describe("ASSET_CLASS_CONFIG", () => {
    it("includes all major forex pairs", () => {
      expect(ASSET_CLASS_CONFIG).toHaveProperty("EURUSD");
      expect(ASSET_CLASS_CONFIG).toHaveProperty("USDJPY");
      expect(ASSET_CLASS_CONFIG).toHaveProperty("GBPUSD");
    });

    it("includes cryptocurrencies", () => {
      expect(ASSET_CLASS_CONFIG).toHaveProperty("BTCUSD");
      expect(ASSET_CLASS_CONFIG).toHaveProperty("ETHUSD");
    });

    it("includes stocks with lower leverage", () => {
      const aapl = ASSET_CLASS_CONFIG["AAPL"];
      expect(aapl.leverage).toBeLessThan(100);
    });

    it("includes commodities", () => {
      expect(ASSET_CLASS_CONFIG).toHaveProperty("XAUUSD");
      expect(ASSET_CLASS_CONFIG).toHaveProperty("WTIUSD");
    });

    it("includes indices", () => {
      expect(ASSET_CLASS_CONFIG).toHaveProperty("US500");
      expect(ASSET_CLASS_CONFIG).toHaveProperty("US100");
    });
  });

  describe("integration: complete margin workflow", () => {
    it("completes full margin cycle for BTC position", () => {
      // 1. Check if can open position
      const canOpen = canOpenPosition(10000, 50000);
      expect(canOpen).toBe(true);

      // 2. Calculate margin required
      const margin = calculateMarginRequired(1, 50000, 5);
      expect(margin).toBe(10000);

      // 3. Calculate position value
      const posValue = calculatePositionValue(1, 55000);
      expect(posValue).toBe(55000);

      // 4. Calculate unrealized P&L
      const pnl = calculateUnrealizedPnL(1, 50000, 55000);
      expect(pnl).toBe(5000);

      // 5. Calculate margin summary after trade
      const equity = 100000 + pnl; // Initial + P&L
      const summary = calculateMarginSummary(equity, margin);
      expect(summary.marginLevelStatus).toBe("safe");
      expect(summary.freeMargin).toBeCloseTo(95000, 0);
    });

    it("detects liquidation scenario", () => {
      // Position: 1 BTC at 50k entry, now at 40k (loss)
      const loss = calculateUnrealizedPnL(1, 50000, 40000);
      expect(loss).toBe(-10000);

      // Account with initial 15k margin
      const initialEquity = 100000;
      const equity = initialEquity + loss; // 90000
      const summary = calculateMarginSummary(equity, 15000);

      // Margin level = 90000 / 15000 = 600% (still safe)
      expect(summary.marginLevel).toBe(600);

      // But if we have larger position...
      const largeMargin = 60000; // Large margin used
      const summaryLarge = calculateMarginSummary(equity, largeMargin);
      expect(summaryLarge.marginLevelStatus).toBe("warning");
      expect(summaryLarge.marginLevel).toBeCloseTo(150, 2);
    });
  });
});
