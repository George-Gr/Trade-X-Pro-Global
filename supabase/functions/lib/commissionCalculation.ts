/**
 * Commission Calculation Engine
 * 
 * This module calculates per-order commissions based on asset class, order size,
 * and account tier. Commission structures vary significantly by asset type:
 * - Stocks/ETFs: Per-share commission ($0.01–$0.05)
 * - Forex/Indices/Commodities/Crypto: Spread-only (no commission)
 * - Bonds: Typically spread-only
 * 
 * References:
 * - /project_resources_docs/TradeX_Pro_Assets_Fees_Spreads.md
 * - IMPLEMENTATION_TASKS_DETAILED.md TASK 1.1.5
 */

// @ts-expect-error - Deno URL import in editor - resolved at deploy time
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

/**
 * Asset class types for commission calculation
 */
export enum AssetClass {
  Forex = 'forex',
  Stock = 'stock',
  Index = 'index',
  Commodity = 'commodity',
  Crypto = 'crypto',
  ETF = 'etf',
  Bond = 'bond',
}

/**
 * Account tier for potential tiered commissions
 */
export enum AccountTier {
  Standard = 'standard',
  Silver = 'silver',
  Gold = 'gold',
  Platinum = 'platinum',
}

/**
 * Commission configuration per asset class
 */
interface CommissionConfig {
  assetClass: AssetClass;
  hasCommission: boolean; // Whether this asset class charges commissions
  commissionType: 'per_share' | 'per_contract' | 'percentage' | 'fixed' | 'none';
  baseCommission: number; // Base commission amount
  minCommission?: number; // Minimum commission per order
  maxCommission?: number; // Maximum commission per order
  volumeDiscount?: Record<number, number>; // Volume thresholds for discounts
  tierMultipliers?: Record<AccountTier, number>; // Tier-based multipliers
}

/**
 * Commission configuration mapping
 */
export const COMMISSION_CONFIG: Record<AssetClass, CommissionConfig> = {
  [AssetClass.Forex]: {
    assetClass: AssetClass.Forex,
    hasCommission: false,
    commissionType: 'none',
    baseCommission: 0,
  },

  [AssetClass.Stock]: {
    assetClass: AssetClass.Stock,
    hasCommission: true,
    commissionType: 'per_share',
    baseCommission: 0.02, // $0.02 per share (average: $0.01-$0.05)
    minCommission: 1, // Minimum $1 per order
    maxCommission: 50, // Maximum $50 per order
    tierMultipliers: {
      [AccountTier.Standard]: 1.0,
      [AccountTier.Silver]: 0.9, // 10% discount
      [AccountTier.Gold]: 0.8, // 20% discount
      [AccountTier.Platinum]: 0.7, // 30% discount
    },
  },

  [AssetClass.ETF]: {
    assetClass: AssetClass.ETF,
    hasCommission: true,
    commissionType: 'per_share',
    baseCommission: 0.02, // Same as stocks
    minCommission: 1,
    maxCommission: 50,
    tierMultipliers: {
      [AccountTier.Standard]: 1.0,
      [AccountTier.Silver]: 0.9,
      [AccountTier.Gold]: 0.8,
      [AccountTier.Platinum]: 0.7,
    },
  },

  [AssetClass.Bond]: {
    assetClass: AssetClass.Bond,
    hasCommission: false,
    commissionType: 'none',
    baseCommission: 0,
  },

  [AssetClass.Index]: {
    assetClass: AssetClass.Index,
    hasCommission: false,
    commissionType: 'none',
    baseCommission: 0,
  },

  [AssetClass.Commodity]: {
    assetClass: AssetClass.Commodity,
    hasCommission: false,
    commissionType: 'none',
    baseCommission: 0,
  },

  [AssetClass.Crypto]: {
    assetClass: AssetClass.Crypto,
    hasCommission: false,
    commissionType: 'none',
    baseCommission: 0,
  },
};

/**
 * Commission calculation input
 */
export const CommissionCalculationSchema = z.object({
  symbol: z.string().min(1, 'Symbol required'),
  assetClass: z.nativeEnum(AssetClass),
  side: z.enum(['buy', 'sell']),
  quantity: z.number().positive('Quantity must be positive'),
  executionPrice: z.number().positive('Execution price must be positive'),
  accountTier: z.nativeEnum(AccountTier).default(AccountTier.Standard),
});

export type CommissionCalculationInput = z.infer<typeof CommissionCalculationSchema>;

/**
 * Commission calculation result
 */
export interface CommissionResult {
  symbol: string;
  assetClass: AssetClass;
  quantity: number;
  executionPrice: number;
  baseCommission: number;
  tierMultiplier: number;
  totalCommission: number;
  commissionType: string;
  notes?: string;
}

/**
 * Custom error for commission calculations
 */
export class CommissionCalculationError extends Error {
  constructor(
    public status: number,
    public details: string,
    message?: string
  ) {
    super(message || details);
    this.name = 'CommissionCalculationError';
  }
}

/**
 * Get commission configuration for an asset class
 * 
 * @param assetClass - Asset class
 * @returns Commission configuration
 */
export function getCommissionConfig(assetClass: AssetClass): CommissionConfig {
  const config = COMMISSION_CONFIG[assetClass];
  if (!config) {
    throw new CommissionCalculationError(
      400,
      `Unknown asset class: ${assetClass}`
    );
  }
  return config;
}

/**
 * Calculate base commission for an order
 * 
 * @param quantity - Order quantity
 * @param executionPrice - Execution price
 * @param config - Commission configuration
 * @returns Base commission amount
 */
export function calculateBaseCommission(
  quantity: number,
  executionPrice: number,
  config: CommissionConfig
): number {
  if (!config.hasCommission) {
    return 0;
  }

  let commission = 0;

  switch (config.commissionType) {
    case 'per_share':
      // For stocks/ETFs: commission per share
      commission = quantity * config.baseCommission;
      break;

    case 'per_contract':
      // For futures: commission per contract
      commission = quantity * config.baseCommission;
      break;

    case 'percentage':
      // For assets charged as percentage of order value
      commission = (quantity * executionPrice * config.baseCommission) / 100;
      break;

    case 'fixed':
      // Fixed commission per order
      commission = config.baseCommission;
      break;

    case 'none':
    default:
      commission = 0;
  }

  return commission;
}

/**
 * Apply tier-based multiplier to commission
 * 
 * @param baseCommission - Base commission amount
 * @param accountTier - User account tier
 * @param config - Commission configuration
 * @returns Tier multiplier
 */
export function getTierMultiplier(
  accountTier: AccountTier,
  config: CommissionConfig
): number {
  if (!config.tierMultipliers) {
    return 1.0;
  }

  return config.tierMultipliers[accountTier] || 1.0;
}

/**
 * Apply min/max commission bounds
 * 
 * @param commission - Calculated commission
 * @param config - Commission configuration
 * @returns Bounded commission
 */
export function applyCommissionBounds(
  commission: number,
  config: CommissionConfig
): number {
  if (config.minCommission && commission < config.minCommission) {
    commission = config.minCommission;
  }

  if (config.maxCommission && commission > config.maxCommission) {
    commission = config.maxCommission;
  }

  return commission;
}

/**
 * Calculate total order cost including commission
 * 
 * @param quantity - Order quantity
 * @param executionPrice - Execution price
 * @param commission - Commission amount
 * @param side - Order side (buy/sell)
 * @returns Total cost (for buy) or proceeds (for sell)
 */
export function calculateOrderCostWithCommission(
  quantity: number,
  executionPrice: number,
  commission: number,
  side: 'buy' | 'sell'
): number {
  const orderValue = quantity * executionPrice;

  if (side === 'buy') {
    return orderValue + commission;
  } else {
    return orderValue - commission;
  }
}

/**
 * Complete commission calculation
 * 
 * @param input - Commission calculation input
 * @returns Commission result
 * 
 * @example
 * const result = calculateCommission({
 *   symbol: 'AAPL',
 *   assetClass: AssetClass.Stock,
 *   side: 'buy',
 *   quantity: 100,
 *   executionPrice: 150.50,
 *   accountTier: AccountTier.Gold,
 * });
 * // Returns: { totalCommission: 2.40, ... }
 */
export function calculateCommission(input: CommissionCalculationInput): CommissionResult {
  // Validate input
  const validation = CommissionCalculationSchema.safeParse(input);
  if (!validation.success) {
    const details = validation.error.issues
      .map((i: z.ZodIssue) => `${i.path.join('.')}: ${i.message}`)
      .join(', ');
    throw new CommissionCalculationError(400, 'Invalid commission input', details);
  }

  const { symbol, assetClass, side, quantity, executionPrice, accountTier } = validation.data;

  // Get asset class configuration
  const config = getCommissionConfig(assetClass);

  // Calculate base commission
  const baseCommission = calculateBaseCommission(quantity, executionPrice, config);

  // Get tier multiplier
  const tierMultiplier = getTierMultiplier(accountTier, config);

  // Apply tier discount
  const discountedCommission = baseCommission * tierMultiplier;

  // Apply min/max bounds
  const totalCommission = applyCommissionBounds(discountedCommission, config);

  return {
    symbol,
    assetClass,
    quantity,
    executionPrice,
    baseCommission,
    tierMultiplier,
    totalCommission: Math.round(totalCommission * 100) / 100, // Round to 2 decimals
    commissionType: config.commissionType,
    notes:
      tierMultiplier < 1.0
        ? `${((1 - tierMultiplier) * 100).toFixed(0)}% tier discount applied`
        : undefined,
  };
}

/**
 * Calculate commission for multiple orders (batch)
 * 
 * @param orders - Array of commission calculation inputs
 * @returns Array of commission results
 */
export function calculateCommissionBatch(
  orders: CommissionCalculationInput[]
): CommissionResult[] {
  return orders.map((order) => calculateCommission(order));
}

/**
 * Calculate total commissions for a batch
 * 
 * @param orders - Array of commission calculation inputs
 * @returns Total commission across all orders
 */
export function calculateTotalCommission(orders: CommissionCalculationInput[]): number {
  return orders
    .map((order) => calculateCommission(order).totalCommission)
    .reduce((sum, commission) => sum + commission, 0);
}

/**
 * Get all supported assets for commission calculation
 * 
 * @returns Array of asset classes
 */
export function getSupportedAssetClasses(): AssetClass[] {
  return Object.values(AssetClass);
}

/**
 * Get available account tiers
 * 
 * @returns Array of account tiers
 */
export function getAvailableAccountTiers(): AccountTier[] {
  return Object.values(AccountTier);
}

/**
 * Format commission for display
 * 
 * @param commission - Commission amount
 * @param currency - Currency symbol (default: $)
 * @returns Formatted commission string
 */
export function formatCommission(commission: number, currency: string = '$'): string {
  return `${currency}${commission.toFixed(2)}`;
}
