/**
 * Margin Calculation Engine
 *
 * This module provides comprehensive margin requirement calculations for all asset classes.
 * Margin is the collateral required to open or maintain a leveraged position.
 *
 * Key Formulas:
 * - Margin Required: M = (Position Size × Price) / Leverage
 * - Free Margin: FM = Equity - Margin Used
 * - Margin Level: ML = (Equity / Margin Used) × 100 %
 * - Liquidation Price: Triggered when ML falls below maintenance ratio
 *
 * References:
 * - /docs/TradeX_Pro_Margin_Liquidation_Formulas.md
 * - /project_resources_docs/TradeX_Pro_Assets_Fees_Spreads.md
 */

import { z } from "zod";

/**
 * Asset class definitions with leverage and maintenance margin ratios
 *
 * Maintenance Margin Ratio: Minimum margin % required to keep position open
 * - Higher for volatile assets (crypto, exotic forex)
 * - Lower for stable assets (indices, majors)
 */
export const ASSET_CLASS_CONFIG: Record<
  string,
  {
    leverage: number;
    maintenanceMarginRatio: number; // as percentage (e.g., 50 = 50%)
    minQuantity: number;
    maxQuantity: number;
  }
> = {
  // Forex Majors (EUR/USD, USD/JPY, GBP/USD, USD/CHF)
  EURUSD: {
    leverage: 500,
    maintenanceMarginRatio: 2,
    minQuantity: 0.01,
    maxQuantity: 1000,
  },
  USDJPY: {
    leverage: 500,
    maintenanceMarginRatio: 2,
    minQuantity: 0.01,
    maxQuantity: 1000,
  },
  GBPUSD: {
    leverage: 500,
    maintenanceMarginRatio: 2,
    minQuantity: 0.01,
    maxQuantity: 1000,
  },
  USDCHF: {
    leverage: 500,
    maintenanceMarginRatio: 2,
    minQuantity: 0.01,
    maxQuantity: 1000,
  },

  // Forex Minors (less liquid)
  NZDCAD: {
    leverage: 300,
    maintenanceMarginRatio: 5,
    minQuantity: 0.01,
    maxQuantity: 500,
  },
  AUDCAD: {
    leverage: 300,
    maintenanceMarginRatio: 5,
    minQuantity: 0.01,
    maxQuantity: 500,
  },

  // Forex Exotics (high volatility, high risk)
  USDTRY: {
    leverage: 100,
    maintenanceMarginRatio: 10,
    minQuantity: 0.01,
    maxQuantity: 100,
  },
  USDRUB: {
    leverage: 100,
    maintenanceMarginRatio: 10,
    minQuantity: 0.01,
    maxQuantity: 100,
  },

  // Indices CFDs (moderate leverage)
  US500: {
    leverage: 200,
    maintenanceMarginRatio: 5,
    minQuantity: 0.1,
    maxQuantity: 10000,
  },
  US100: {
    leverage: 200,
    maintenanceMarginRatio: 5,
    minQuantity: 0.1,
    maxQuantity: 10000,
  },
  UK100: {
    leverage: 200,
    maintenanceMarginRatio: 5,
    minQuantity: 0.1,
    maxQuantity: 10000,
  },
  GER40: {
    leverage: 200,
    maintenanceMarginRatio: 5,
    minQuantity: 0.1,
    maxQuantity: 10000,
  },

  // Commodities (variable leverage)
  XAUUSD: {
    leverage: 500,
    maintenanceMarginRatio: 5,
    minQuantity: 0.01,
    maxQuantity: 1000,
  }, // Gold
  XAGUSD: {
    leverage: 500,
    maintenanceMarginRatio: 5,
    minQuantity: 1,
    maxQuantity: 10000,
  }, // Silver
  WTIUSD: {
    leverage: 500,
    maintenanceMarginRatio: 5,
    minQuantity: 0.01,
    maxQuantity: 1000,
  }, // WTI Crude
  BRENTUSD: {
    leverage: 500,
    maintenanceMarginRatio: 5,
    minQuantity: 0.01,
    maxQuantity: 1000,
  }, // Brent

  // Stocks (low leverage, high maintenance requirement)
  AAPL: {
    leverage: 20,
    maintenanceMarginRatio: 25,
    minQuantity: 0.1,
    maxQuantity: 100000,
  },
  TSLA: {
    leverage: 20,
    maintenanceMarginRatio: 25,
    minQuantity: 0.1,
    maxQuantity: 100000,
  },
  MSFT: {
    leverage: 20,
    maintenanceMarginRatio: 25,
    minQuantity: 0.1,
    maxQuantity: 100000,
  },
  GOOGL: {
    leverage: 20,
    maintenanceMarginRatio: 25,
    minQuantity: 0.1,
    maxQuantity: 100000,
  },

  // Cryptocurrencies (highly volatile, moderate leverage)
  BTCUSD: {
    leverage: 5,
    maintenanceMarginRatio: 15,
    minQuantity: 0.001,
    maxQuantity: 100,
  },
  ETHUSD: {
    leverage: 5,
    maintenanceMarginRatio: 15,
    minQuantity: 0.01,
    maxQuantity: 1000,
  },
  XRPUSD: {
    leverage: 5,
    maintenanceMarginRatio: 15,
    minQuantity: 1,
    maxQuantity: 1000000,
  },

  // ETFs (similar to stocks)
  SPY: {
    leverage: 20,
    maintenanceMarginRatio: 25,
    minQuantity: 0.1,
    maxQuantity: 100000,
  },
  QQQ: {
    leverage: 20,
    maintenanceMarginRatio: 25,
    minQuantity: 0.1,
    maxQuantity: 100000,
  },

  // Bonds (low volatility, high leverage possible)
  US10Y: {
    leverage: 50,
    maintenanceMarginRatio: 3,
    minQuantity: 0.01,
    maxQuantity: 10000,
  },
};

/**
 * Validation schema for margin calculation inputs
 */
export const MarginCalculationSchema = z.object({
  positionSize: z.number().positive("Position size must be positive"),
  entryPrice: z.number().positive("Entry price must be positive"),
  leverage: z
    .number()
    .positive("Leverage must be positive")
    .max(500, "Leverage exceeds maximum"),
  currentPrice: z.number().positive("Current price must be positive"),
  accountEquity: z.number().nonnegative("Account equity cannot be negative"),
});

export type MarginCalculationInput = z.infer<typeof MarginCalculationSchema>;

/**
 * Validation error class for margin calculations
 */
export class MarginCalculationError extends Error {
  constructor(
    public status: number,
    public details: string,
    message?: string,
  ) {
    super(message || details);
    this.name = "MarginCalculationError";
  }
}

/**
 * Calculate margin required to open a position
 *
 * Formula: M = (Position Size × Entry Price) / Leverage
 *
 * @param positionSize - Number of units/contracts
 * @param entryPrice - Entry price per unit
 * @param leverage - Leverage multiplier (e.g., 100x)
 * @returns Margin required (4 decimal precision)
 *
 * @example
 * const margin = calculateMarginRequired(1, 50000, 5); // BTC at 50k with 5x leverage
 * // Result: 10000 (= 1 × 50000 / 5)
 */
export function calculateMarginRequired(
  positionSize: number,
  entryPrice: number,
  leverage: number,
): number {
  const margin = (positionSize * entryPrice) / leverage;
  return Math.round(margin * 10000) / 10000; // Round to 4 decimals
}

/**
 * Calculate free margin (available for new positions)
 *
 * Formula: FM = Total Equity - Total Margin Used
 *
 * @param totalEquity - Account equity (balance + unrealized P&L)
 * @param marginUsed - Total margin used across all open positions
 * @returns Free margin available (4 decimal precision)
 *
 * @example
 * const free = calculateFreeMargin(100000, 25000); // $100k equity, $25k margin used
 * // Result: 75000
 *
 * @throws {MarginCalculationError} if total equity < margin used
 */
export function calculateFreeMargin(
  totalEquity: number,
  marginUsed: number,
): number {
  if (marginUsed > totalEquity) {
    throw new MarginCalculationError(
      400,
      "Margin used exceeds total equity",
      "Account is in negative equity",
    );
  }
  const freeMargin = totalEquity - marginUsed;
  return Math.round(freeMargin * 10000) / 10000;
}

/**
 * Calculate margin level (percentage of margin utilization)
 *
 * Formula: ML = (Total Equity / Total Margin Used) × 100
 *
 * Interpretation:
 * - > 200%: Safe (comfortable margin cushion)
 * - 100–200%: Caution (margin warning zone)
 * - < 100%: Liquidation (positions will be closed)
 * - < 50%: Critical (immediate liquidation)
 *
 * @param totalEquity - Account equity
 * @param marginUsed - Total margin used
 * @returns Margin level as percentage (e.g., 150 = 150%)
 *
 * @throws {MarginCalculationError} if margin used is zero or negative
 */
export function calculateMarginLevel(
  totalEquity: number,
  marginUsed: number,
): number {
  if (marginUsed <= 0) {
    throw new MarginCalculationError(
      400,
      "Margin used must be positive to calculate margin level",
      "Invalid margin used value",
    );
  }
  const marginLevel = (totalEquity / marginUsed) * 100;
  return Math.round(marginLevel * 100) / 100; // Round to 2 decimals (percentage)
}

/**
 * Calculate position value (current market value)
 *
 * Formula: PV = Position Size × Current Price
 *
 * @param positionSize - Number of units
 * @param currentPrice - Current market price
 * @returns Position value (4 decimal precision)
 */
export function calculatePositionValue(
  positionSize: number,
  currentPrice: number,
): number {
  const value = positionSize * currentPrice;
  return Math.round(value * 10000) / 10000;
}

/**
 * Calculate unrealized P&L for an open position
 *
 * Formula:
 * - Buy position: P&L = (Current Price - Entry Price) × Position Size
 * - Sell position: P&L = (Entry Price - Current Price) × Position Size
 *
 * @param positionSize - Number of units (positive for buy, negative for sell)
 * @param entryPrice - Entry price
 * @param currentPrice - Current market price
 * @returns Unrealized P&L (4 decimal precision)
 */
export function calculateUnrealizedPnL(
  positionSize: number,
  entryPrice: number,
  currentPrice: number,
): number {
  const pnl = positionSize * (currentPrice - entryPrice);
  return Math.round(pnl * 10000) / 10000;
}

/**
 * Calculate liquidation price (price at which position is forcefully closed)
 *
 * For a long position:
 *   LP = Entry Price - (Entry Price × Leverage × (1 - Maintenance Margin Ratio))
 *
 * For a short position:
 *   LP = Entry Price + (Entry Price × Leverage × (1 - Maintenance Margin Ratio))
 *
 * @param entryPrice - Entry price
 * @param positionSize - Position size (sign indicates direction)
 * @param leverage - Leverage multiplier
 * @param maintenanceMarginRatio - Maintenance margin ratio as decimal (e.g., 0.05 for 5%)
 * @returns Liquidation price (4 decimal precision)
 */
export function calculateLiquidationPrice(
  entryPrice: number,
  positionSize: number,
  leverage: number,
  maintenanceMarginRatio: number,
): number {
  const isLong = positionSize > 0;
  const marginBuffer =
    entryPrice * leverage * (1 - maintenanceMarginRatio / 100);

  const liquidationPrice = isLong
    ? entryPrice - marginBuffer
    : entryPrice + marginBuffer;

  return Math.round(liquidationPrice * 10000) / 10000;
}

/**
 * Check if a new position fits within available margin
 *
 * @param newMarginRequired - Margin required for new position
 * @param freeMargin - Available free margin
 * @returns true if position fits, false otherwise
 */
export function canOpenPosition(
  newMarginRequired: number,
  freeMargin: number,
): boolean {
  return newMarginRequired <= freeMargin;
}

/**
 * Calculate max position size based on available equity and leverage
 *
 * Formula: Pmax = (Available Equity × Leverage) / Current Price
 *
 * @param availableEquity - Available equity (free margin)
 * @param leverage - Leverage multiplier
 * @param currentPrice - Current market price
 * @returns Maximum position size (4 decimal precision)
 *
 * @throws {MarginCalculationError} if parameters are invalid
 */
export function calculateMaxPositionSize(
  availableEquity: number,
  leverage: number,
  currentPrice: number,
): number {
  if (availableEquity < 0) {
    throw new MarginCalculationError(
      400,
      "Available equity cannot be negative",
      "Insufficient funds",
    );
  }
  if (currentPrice <= 0) {
    throw new MarginCalculationError(
      400,
      "Current price must be positive",
      "Invalid price",
    );
  }
  const maxSize = (availableEquity * leverage) / currentPrice;
  return Math.round(maxSize * 10000) / 10000;
}

/**
 * Comprehensive margin summary for an account state
 */
export interface MarginSummary {
  totalEquity: number;
  totalMarginUsed: number;
  freeMargin: number;
  marginLevel: number; // percentage
  marginLevelStatus: "safe" | "warning" | "critical" | "liquidation"; // based on margin level
  canOpenNewPosition: boolean;
}

/**
 * Calculate comprehensive margin summary for account
 *
 * @param totalEquity - Total account equity
 * @param totalMarginUsed - Total margin used across all positions
 * @returns Margin summary with all metrics
 */
export function calculateMarginSummary(
  totalEquity: number,
  totalMarginUsed: number,
): MarginSummary {
  // Handle case where margin exceeds equity (negative equity scenario)
  let freeMargin: number;
  let marginLevel: number;

  if (totalMarginUsed > totalEquity) {
    // In liquidation - negative equity
    freeMargin = totalEquity - totalMarginUsed; // Will be negative
    marginLevel =
      totalMarginUsed > 0 ? (totalEquity / totalMarginUsed) * 100 : 0;
  } else {
    freeMargin = calculateFreeMargin(totalEquity, totalMarginUsed);
    marginLevel =
      totalMarginUsed > 0
        ? calculateMarginLevel(totalEquity, totalMarginUsed)
        : 100000; // If no positions, margin level is very high
  }

  // Determine status based on margin level
  let marginLevelStatus: "safe" | "warning" | "critical" | "liquidation" =
    "safe";
  if (marginLevel < 50) {
    marginLevelStatus = "liquidation";
  } else if (marginLevel < 100) {
    marginLevelStatus = "critical";
  } else if (marginLevel < 200) {
    marginLevelStatus = "warning";
  }

  return {
    totalEquity,
    totalMarginUsed,
    freeMargin,
    marginLevel,
    marginLevelStatus,
    canOpenNewPosition: freeMargin > 0 && marginLevelStatus !== "liquidation",
  };
}

/**
 * Get asset-specific configuration (leverage, maintenance ratio, etc.)
 *
 * @param symbol - Trading symbol/asset code
 * @returns Asset configuration or default config if not found
 */
export function getAssetConfig(
  symbol: string,
): (typeof ASSET_CLASS_CONFIG)[keyof typeof ASSET_CLASS_CONFIG] {
  return (
    ASSET_CLASS_CONFIG[symbol] || {
      leverage: 10, // Safe default
      maintenanceMarginRatio: 10,
      minQuantity: 0.01,
      maxQuantity: 10000,
    }
  );
}
