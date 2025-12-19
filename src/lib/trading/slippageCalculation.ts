/**
 * Slippage Calculation Engine
 *
 * This module simulates realistic order slippage based on market conditions,
 * asset volatility, liquidity, and order size. Slippage represents the
 * difference between expected execution price and actual execution price.
 *
 * Key Formulas:
 * - Base Slippage = Spread (normal market)
 * - Volatility Multiplier = Current Volatility / Average Volatility
 * - Size Multiplier = (Order Size / Daily Volume) × Impact Factor
 * - Total Slippage = Base Slippage × Volatility Multiplier × Size Multiplier
 * - Execution Price = Market Price ± (Slippage × Price Step)
 *
 * References:
 * - /project_resources_docs/TradeX_Pro_Assets_Fees_Spreads.md
 * - IMPLEMENTATION_TASKS_DETAILED.md TASK 1.1.3
 */

import { z } from 'zod';

/**
 * Asset class slippage configuration
 * Defines base spreads and slippage ranges for different asset types
 */
export const ASSET_SLIPPAGE_CONFIG: Record<
  string,
  {
    baseSpread: number; // Default spread in pips/points/%)
    minSlippage: number; // Minimum slippage (pips/points/%)
    maxSlippage: number; // Maximum slippage (pips/points/%)
    volatilityMultiplier: number; // How much slippage increases with volatility (factor)
    priceStep: number; // Minimum price movement unit
    liquidity: 'very_high' | 'high' | 'medium' | 'low'; // Market liquidity
    afterHoursPenalty: number; // Extra slippage after hours (multiplier)
  }
> = {
  // Forex Majors (EUR/USD, USD/JPY, GBP/USD, USD/CHF)
  // Typically 0-0.6 pips, 3x wider in volatility
  EURUSD: {
    baseSpread: 0.2,
    minSlippage: 0,
    maxSlippage: 0.6,
    volatilityMultiplier: 3,
    priceStep: 0.0001,
    liquidity: 'very_high',
    afterHoursPenalty: 2,
  },
  USDJPY: {
    baseSpread: 0.2,
    minSlippage: 0,
    maxSlippage: 0.6,
    volatilityMultiplier: 3,
    priceStep: 0.001,
    liquidity: 'very_high',
    afterHoursPenalty: 2,
  },
  GBPUSD: {
    baseSpread: 0.3,
    minSlippage: 0,
    maxSlippage: 0.6,
    volatilityMultiplier: 3,
    priceStep: 0.0001,
    liquidity: 'very_high',
    afterHoursPenalty: 2,
  },
  USDCHF: {
    baseSpread: 0.2,
    minSlippage: 0,
    maxSlippage: 0.6,
    volatilityMultiplier: 3,
    priceStep: 0.0001,
    liquidity: 'very_high',
    afterHoursPenalty: 2,
  },

  // Forex Minors (less liquid, wider spreads)
  NZDCAD: {
    baseSpread: 1,
    minSlippage: 0.5,
    maxSlippage: 2,
    volatilityMultiplier: 2.5,
    priceStep: 0.0001,
    liquidity: 'high',
    afterHoursPenalty: 3,
  },
  AUDCAD: {
    baseSpread: 1,
    minSlippage: 0.5,
    maxSlippage: 2,
    volatilityMultiplier: 2.5,
    priceStep: 0.0001,
    liquidity: 'high',
    afterHoursPenalty: 3,
  },

  // Forex Exotics (high volatility, low liquidity)
  USDTRY: {
    baseSpread: 5,
    minSlippage: 2,
    maxSlippage: 15,
    volatilityMultiplier: 4,
    priceStep: 0.0001,
    liquidity: 'low',
    afterHoursPenalty: 5,
  },
  USDRUB: {
    baseSpread: 5,
    minSlippage: 2,
    maxSlippage: 15,
    volatilityMultiplier: 4,
    priceStep: 0.0001,
    liquidity: 'low',
    afterHoursPenalty: 5,
  },

  // Indices CFDs (0.5-2 points typically)
  US500: {
    baseSpread: 0.5,
    minSlippage: 0.5,
    maxSlippage: 2,
    volatilityMultiplier: 2,
    priceStep: 0.1,
    liquidity: 'very_high',
    afterHoursPenalty: 2,
  },
  US100: {
    baseSpread: 0.5,
    minSlippage: 0.5,
    maxSlippage: 2,
    volatilityMultiplier: 2,
    priceStep: 0.1,
    liquidity: 'very_high',
    afterHoursPenalty: 2,
  },
  UK100: {
    baseSpread: 1,
    minSlippage: 0.5,
    maxSlippage: 2,
    volatilityMultiplier: 2,
    priceStep: 0.1,
    liquidity: 'high',
    afterHoursPenalty: 2.5,
  },
  GER40: {
    baseSpread: 1,
    minSlippage: 0.5,
    maxSlippage: 2,
    volatilityMultiplier: 2,
    priceStep: 0.1,
    liquidity: 'high',
    afterHoursPenalty: 2.5,
  },

  // Commodities (0.1-0.5 points typically, 2-5x in geo events)
  XAUUSD: {
    baseSpread: 0.3,
    minSlippage: 0.1,
    maxSlippage: 1,
    volatilityMultiplier: 3,
    priceStep: 0.01,
    liquidity: 'very_high',
    afterHoursPenalty: 2,
  },
  XAGUSD: {
    baseSpread: 0.5,
    minSlippage: 0.2,
    maxSlippage: 1.5,
    volatilityMultiplier: 3,
    priceStep: 0.001,
    liquidity: 'high',
    afterHoursPenalty: 2.5,
  },
  WTIUSD: {
    baseSpread: 0.2,
    minSlippage: 0.1,
    maxSlippage: 0.8,
    volatilityMultiplier: 3,
    priceStep: 0.01,
    liquidity: 'very_high',
    afterHoursPenalty: 2,
  },
  BRENTUSD: {
    baseSpread: 0.2,
    minSlippage: 0.1,
    maxSlippage: 0.8,
    volatilityMultiplier: 3,
    priceStep: 0.01,
    liquidity: 'very_high',
    afterHoursPenalty: 2,
  },

  // Stocks ($0.03-$0.15 per share, 2x wider at earnings)
  AAPL: {
    baseSpread: 0.05,
    minSlippage: 0.03,
    maxSlippage: 0.15,
    volatilityMultiplier: 2,
    priceStep: 0.01,
    liquidity: 'very_high',
    afterHoursPenalty: 3,
  },
  TSLA: {
    baseSpread: 0.05,
    minSlippage: 0.03,
    maxSlippage: 0.2,
    volatilityMultiplier: 2.5,
    priceStep: 0.01,
    liquidity: 'very_high',
    afterHoursPenalty: 3,
  },
  MSFT: {
    baseSpread: 0.05,
    minSlippage: 0.03,
    maxSlippage: 0.15,
    volatilityMultiplier: 2,
    priceStep: 0.01,
    liquidity: 'very_high',
    afterHoursPenalty: 3,
  },
  GOOGL: {
    baseSpread: 0.05,
    minSlippage: 0.03,
    maxSlippage: 0.15,
    volatilityMultiplier: 2,
    priceStep: 0.01,
    liquidity: 'very_high',
    afterHoursPenalty: 3,
  },

  // Cryptocurrencies (20-50 pips, 2x in volatility spikes)
  BTCUSD: {
    baseSpread: 30,
    minSlippage: 20,
    maxSlippage: 50,
    volatilityMultiplier: 2.5,
    priceStep: 1,
    liquidity: 'very_high',
    afterHoursPenalty: 1.5, // 24/7, minimal time-based variance
  },
  ETHUSD: {
    baseSpread: 20,
    minSlippage: 15,
    maxSlippage: 40,
    volatilityMultiplier: 2.5,
    priceStep: 0.1,
    liquidity: 'very_high',
    afterHoursPenalty: 1.5,
  },
  XRPUSD: {
    baseSpread: 0.0005,
    minSlippage: 0.0003,
    maxSlippage: 0.001,
    volatilityMultiplier: 2,
    priceStep: 0.00001,
    liquidity: 'high',
    afterHoursPenalty: 1.3,
  },

  // ETFs (similar to stocks)
  SPY: {
    baseSpread: 0.05,
    minSlippage: 0.03,
    maxSlippage: 0.15,
    volatilityMultiplier: 2,
    priceStep: 0.01,
    liquidity: 'very_high',
    afterHoursPenalty: 3,
  },
  QQQ: {
    baseSpread: 0.05,
    minSlippage: 0.03,
    maxSlippage: 0.15,
    volatilityMultiplier: 2,
    priceStep: 0.01,
    liquidity: 'very_high',
    afterHoursPenalty: 3,
  },

  // Bonds (typically very tight spreads)
  US10Y: {
    baseSpread: 0.01,
    minSlippage: 0.005,
    maxSlippage: 0.05,
    volatilityMultiplier: 2,
    priceStep: 0.001,
    liquidity: 'very_high',
    afterHoursPenalty: 2,
  },
};

/**
 * Market conditions for slippage calculation
 */
export interface MarketConditions {
  currentVolatility: number; // Current IV (as percentage, e.g., 20 for 20%)
  averageVolatility: number; // 14-day average IV
  dailyVolume: number; // Typical daily trading volume
  isHighVolatility: boolean; // Geopolitical events, earnings, etc.
  isLowLiquidity: boolean; // Weekend, after-hours, etc.
  orderSizePercentage: number; // Order size as % of daily volume
  isAfterHours: boolean; // Outside normal trading hours
}

/**
 * Slippage result with details
 */
export interface SlippageResult {
  baseSlippage: number;
  volatilityMultiplier: number;
  sizeMultiplier: number;
  totalSlippage: number;
  executionPrice: number;
  slippageInPrice: number;
}

/**
 * Validation schema for slippage calculation
 */
export const SlippageCalculationSchema = z.object({
  symbol: z.string().min(1, 'Symbol required'),
  marketPrice: z.number().positive('Market price must be positive'),
  orderQuantity: z.number().positive('Order quantity must be positive'),
  side: z.enum(['buy', 'sell'], { message: 'Side must be buy or sell' }),
  conditions: z.object({
    currentVolatility: z
      .number()
      .nonnegative('Current volatility cannot be negative'),
    averageVolatility: z
      .number()
      .positive('Average volatility must be positive'),
    dailyVolume: z.number().positive('Daily volume must be positive'),
    isHighVolatility: z.boolean(),
    isLowLiquidity: z.boolean(),
    orderSizePercentage: z.number().nonnegative(),
    isAfterHours: z.boolean(),
  }),
  seed: z.string().optional(), // For deterministic randomness
});

export type SlippageCalculationInput = z.infer<
  typeof SlippageCalculationSchema
>;

/**
 * Custom error for slippage calculations
 */
export class SlippageCalculationError extends Error {
  constructor(
    public status: number,
    public details: string,
    message?: string
  ) {
    super(message || details);
    this.name = 'SlippageCalculationError';
  }
}

/**
 * Simple seeded random number generator for reproducible results
 * Uses a linear congruential generator (LCG) algorithm
 *
 * @param seed - Seed string (converted to number)
 * @returns Function that generates random number [0, 1)
 */
function createSeededRandom(seed?: string): () => number {
  let state = seed ? hashStringToNumber(seed) : Math.random() * 2147483647;

  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

/**
 * Convert string to number for seed purposes
 */
function hashStringToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) || 1; // Avoid zero seed
}

/**
 * Calculate volatility multiplier based on current vs average volatility
 *
 * Formula: Volatility Multiplier = (Current IV / Average IV) × Asset Multiplier
 *
 * @param currentVolatility - Current implied volatility (%)
 * @param averageVolatility - 14-day average volatility (%)
 * @param assetVolatilityMult - Asset-specific multiplier
 * @param isHighVolatility - Flag for geopolitical/event volatility
 * @returns Volatility multiplier (minimum 1x)
 *
 * @example
 * const mult = calculateVolatilityMultiplier(25, 20, 3, false);
 * // Current IV is higher than average, so multiplier > 1
 * // Result: (25 / 20) × 3 = 3.75
 */
export function calculateVolatilityMultiplier(
  currentVolatility: number,
  averageVolatility: number,
  assetVolatilityMult: number,
  isHighVolatility: boolean
): number {
  const ratio = currentVolatility / (averageVolatility || 1);
  let multiplier = ratio * assetVolatilityMult;

  // Apply additional multiplier for high volatility events
  if (isHighVolatility) {
    multiplier *= 1.5; // 50% additional slippage during events
  }

  return Math.max(1, multiplier); // Minimum 1x
}

/**
 * Calculate order size multiplier based on order size vs daily volume
 *
 * Formula: Size Multiplier = (Order Size % / Liquidity Base) ^ 2 (with diminishing returns)
 *
 * @param orderSizePercentage - Order size as % of daily volume (0-100)
 * @param liquidity - Market liquidity level
 * @param isLowLiquidity - Additional low liquidity flag
 * @returns Size multiplier (minimum 1x)
 *
 * @example
 * const mult = calculateSizeMultiplier(5, 'very_high', false);
 * // 5% of daily volume on high-liquidity asset
 * // Result: ~1.1x
 *
 * const mult2 = calculateSizeMultiplier(50, 'low', true);
 * // 50% of daily volume on low-liquidity asset during low liquidity
 * // Result: much higher multiplier
 */
export function calculateSizeMultiplier(
  orderSizePercentage: number,
  liquidity: 'very_high' | 'high' | 'medium' | 'low',
  isLowLiquidity: boolean
): number {
  // Cap order size percentage to 100 for calculation
  const cappedSize = Math.min(orderSizePercentage, 100);

  // Define liquidity bases (% of daily volume where multiplier becomes significant)
  const liquidityBases: Record<typeof liquidity, number> = {
    very_high: 10, // 10% of volume is threshold
    high: 5, // 5% threshold
    medium: 2, // 2% threshold
    low: 0.5, // 0.5% threshold
  };

  const base = liquidityBases[liquidity];
  const sizeRatio = Math.max(0.1, cappedSize / base); // Avoid division issues

  // Use power function for non-linear scaling
  let multiplier = Math.pow(sizeRatio, 1.5);

  // Apply low liquidity penalty
  if (isLowLiquidity) {
    multiplier *= 2;
  }

  return Math.max(1, multiplier);
}

/**
 * Calculate base slippage with random variation
 *
 * Base slippage varies within [minSlippage, maxSlippage] range
 * Random component allows for realistic variation
 *
 * @param config - Asset slippage configuration
 * @param random - Random function [0, 1)
 * @returns Base slippage in pips/points
 */
export function calculateBaseSlippage(
  config: (typeof ASSET_SLIPPAGE_CONFIG)[string],
  random: () => number
): number {
  const range = config.maxSlippage - config.minSlippage;
  const randomSlippage = config.minSlippage + random() * range;

  // Weight towards base spread (50% chance) or random within range
  if (random() < 0.5) {
    return config.baseSpread;
  }

  return randomSlippage;
}

/**
 * Calculate after-hours penalty
 *
 * @param config - Asset slippage configuration
 * @param isAfterHours - Whether outside normal trading hours
 * @returns After-hours multiplier
 */
export function calculateAfterHoursPenalty(
  config: (typeof ASSET_SLIPPAGE_CONFIG)[string],
  isAfterHours: boolean
): number {
  return isAfterHours ? config.afterHoursPenalty : 1;
}

/**
 * Complete slippage calculation
 *
 * Combines all factors: base spread, volatility, order size, after-hours
 *
 * @param input - Slippage calculation input
 * @returns SlippageResult with all details
 *
 * @example
 * const result = calculateSlippage({
 *   symbol: 'EURUSD',
 *   marketPrice: 1.0850,
 *   orderQuantity: 100000,
 *   side: 'buy',
 *   conditions: {
 *     currentVolatility: 15,
 *     averageVolatility: 12,
 *     dailyVolume: 10000000,
 *     isHighVolatility: false,
 *     isLowLiquidity: false,
 *     orderSizePercentage: 1,
 *     isAfterHours: false,
 *   },
 * });
 * // Returns slippage, execution price, and all intermediate values
 */
export function calculateSlippage(
  input: SlippageCalculationInput
): SlippageResult {
  // Validate input
  const validation = SlippageCalculationSchema.safeParse(input);
  if (!validation.success) {
    const details = validation.error.issues
      .map(
        (issue: { path: PropertyKey[]; message: string }) =>
          `${issue.path.join('.')}: ${issue.message}`
      )
      .join(', ');
    throw new SlippageCalculationError(400, 'Invalid slippage input', details);
  }

  const { symbol, marketPrice, orderQuantity, side, conditions, seed } =
    validation.data;

  // Get asset configuration
  const config = ASSET_SLIPPAGE_CONFIG[symbol];
  if (!config) {
    throw new SlippageCalculationError(
      400,
      `Asset ${symbol} not supported for slippage calculation`
    );
  }

  // Create deterministic random function
  const random = createSeededRandom(seed);

  // Calculate volatility multiplier
  const volatilityMultiplier = calculateVolatilityMultiplier(
    conditions.currentVolatility,
    conditions.averageVolatility,
    config.volatilityMultiplier,
    conditions.isHighVolatility
  );

  // Calculate size multiplier
  const sizeMultiplier = calculateSizeMultiplier(
    conditions.orderSizePercentage,
    config.liquidity,
    conditions.isLowLiquidity
  );

  // Calculate after-hours penalty
  const afterHoursPenalty = calculateAfterHoursPenalty(
    config,
    conditions.isAfterHours
  );

  // Calculate base slippage
  const baseSlippage = calculateBaseSlippage(config, random);

  // Calculate total slippage
  const totalSlippage =
    baseSlippage * volatilityMultiplier * sizeMultiplier * afterHoursPenalty;

  // Clamp total slippage to max
  const clampedSlippage = Math.min(totalSlippage, config.maxSlippage * 2); // Allow up to 2x max in extreme conditions

  // Calculate execution price
  const slippageInPrice = clampedSlippage * config.priceStep;
  const executionPrice =
    side === 'buy'
      ? marketPrice + slippageInPrice // Buy slips up
      : marketPrice - slippageInPrice; // Sell slips down

  return {
    baseSlippage,
    volatilityMultiplier,
    sizeMultiplier,
    totalSlippage: clampedSlippage,
    executionPrice: Math.round(executionPrice * 100000000) / 100000000, // Round to 8 decimals
    slippageInPrice: Math.round(slippageInPrice * 100000000) / 100000000,
  };
}

/**
 * Get slippage for asset with default market conditions
 * Convenience function for simple slippage lookups
 *
 * @param symbol - Asset symbol
 * @param marketPrice - Current market price
 * @param side - 'buy' or 'sell'
 * @param orderQuantity - Order size
 * @returns Execution price with slippage applied
 */
export function getExecutionPrice(
  symbol: string,
  marketPrice: number,
  side: 'buy' | 'sell',
  orderQuantity: number
): number {
  const result = calculateSlippage({
    symbol,
    marketPrice,
    orderQuantity,
    side,
    conditions: {
      currentVolatility: 15,
      averageVolatility: 15,
      dailyVolume: 1000000,
      isHighVolatility: false,
      isLowLiquidity: false,
      orderSizePercentage: 1,
      isAfterHours: false,
    },
  });

  return result.executionPrice;
}

/**
 * Get slippage configuration for an asset
 *
 * @param symbol - Asset symbol
 * @returns Asset slippage configuration or undefined
 */
export function getAssetSlippageConfig(
  symbol: string
): (typeof ASSET_SLIPPAGE_CONFIG)[string] | undefined {
  return ASSET_SLIPPAGE_CONFIG[symbol];
}

/**
 * List all supported assets for slippage calculation
 *
 * @returns Array of supported asset symbols
 */
export function getSupportedAssets(): string[] {
  return Object.keys(ASSET_SLIPPAGE_CONFIG);
}
