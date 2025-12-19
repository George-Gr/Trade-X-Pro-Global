/**
 * Order Matching & Execution Engine
 *
 * This module implements order matching logic for different order types:
 * - Market orders: immediate execution at market price + slippage
 * - Limit orders: queued until price reaches target
 * - Stop orders: triggered on price movement, then market execution
 * - Stop-Limit orders: triggered on price, then limit execution
 * - Trailing Stop: adjusts stop dynamically based on price movement
 *
 * References:
 * - /project_resources_docs/TradePro v10 — Complete Production-Ready Development Plan.md
 * - IMPLEMENTATION_TASKS_DETAILED.md TASK 1.1.4
 */

import { z } from 'zod';

/**
 * Order types supported by the platform
 */
export enum OrderType {
  Market = 'market',
  Limit = 'limit',
  Stop = 'stop',
  StopLimit = 'stop_limit',
}

/**
 * Order execution sides
 */
export enum OrderSide {
  Buy = 'buy',
  Sell = 'sell',
}

/**
 * Order execution status
 */
export enum OrderStatus {
  Pending = 'pending',
  Filled = 'filled',
  Partial = 'partial',
  Cancelled = 'cancelled',
  Rejected = 'rejected',
}

/**
 * Position status
 */
export enum PositionStatus {
  Open = 'open',
  Closed = 'closed',
}

/**
 * Order input validation schema
 */
export const OrderInputSchema = z.object({
  symbol: z.string().min(1),
  order_type: z.enum(['market', 'limit', 'stop', 'stop_limit']),
  side: z.enum(['buy', 'sell']),
  quantity: z.number().positive(),
  price: z.number().positive().optional(), // For limit orders
  stop_price: z.number().positive().optional(), // For stop/stop-limit orders
  take_profit: z.number().positive().optional(),
  stop_loss: z.number().positive().optional(),
});

export type OrderInput = z.infer<typeof OrderInputSchema>;

/**
 * Market execution details
 */
export interface ExecutionDetails {
  orderId: string;
  executionPrice: number;
  executedQuantity: number;
  executionTime: Date;
  slippage: number;
  commission: number;
  status: OrderStatus;
}

/**
 * Order matching result
 */
export interface MatchingResult {
  matched: boolean;
  executionPrice?: number;
  executedQuantity?: number;
  reason?: string;
  shouldTrigger?: boolean;
}

/**
 * Order condition checker
 */
export interface OrderCondition {
  priceLevel: number;
  orderType: OrderType;
  side: OrderSide;
  quantity: number;
  limitPrice?: number;
}

/**
 * Market data snapshot
 */
export interface MarketSnapshot {
  symbol: string;
  currentPrice: number;
  bid: number;
  ask: number;
  volatility: number;
  liquidity: 'very_high' | 'high' | 'medium' | 'low';
  timestamp: Date;
}

/**
 * Check if a market order should execute (always yes for market orders)
 *
 * @param condition - Order condition
 * @returns Matching result
 */
export function checkMarketOrderMatch(
  condition: OrderCondition
): MatchingResult {
  if (condition.orderType !== OrderType.Market) {
    return { matched: false, reason: 'Not a market order' };
  }

  return {
    matched: true,
    executionPrice: undefined, // Will be determined by slippage
    executedQuantity: condition.quantity,
  };
}

/**
 * Check if a limit order should execute
 *
 * Buy limit: execute if price <= limit
 * Sell limit: execute if price >= limit
 *
 * @param condition - Order condition with limitPrice
 * @param market - Current market data
 * @returns Matching result
 */
export function checkLimitOrderMatch(
  condition: OrderCondition,
  market: MarketSnapshot
): MatchingResult {
  if (!condition.limitPrice) {
    return { matched: false, reason: 'Limit price not specified' };
  }

  const shouldExecute =
    condition.side === OrderSide.Buy
      ? market.currentPrice <= condition.limitPrice // Buy limit executes below limit
      : market.currentPrice >= condition.limitPrice; // Sell limit executes above limit

  if (!shouldExecute) {
    return {
      matched: false,
      reason: `Price ${market.currentPrice} does not meet limit ${condition.limitPrice}`,
    };
  }

  return {
    matched: true,
    executionPrice: condition.limitPrice,
    executedQuantity: condition.quantity,
  };
}

/**
 * Check if a stop order should trigger
 *
 * Buy stop: trigger if price >= stop level
 * Sell stop: trigger if price <= stop level
 *
 * @param condition - Order condition with stop_price
 * @param market - Current market data
 * @param previousPrice - Previous market price
 * @returns Matching result
 */
export function checkStopOrderTrigger(
  condition: OrderCondition,
  market: MarketSnapshot,
  previousPrice: number
): MatchingResult {
  if (!condition.priceLevel) {
    return { matched: false, reason: 'Stop price not specified' };
  }

  // Check if price has touched stop level
  const currentPriceTouched =
    condition.side === OrderSide.Buy
      ? market.currentPrice >= condition.priceLevel
      : market.currentPrice <= condition.priceLevel;

  // Prevent duplicate triggers from oscillation
  const previousPriceTouched =
    condition.side === OrderSide.Buy
      ? previousPrice >= condition.priceLevel
      : previousPrice <= condition.priceLevel;

  const shouldTrigger = currentPriceTouched && !previousPriceTouched;

  if (!shouldTrigger) {
    return { matched: false, reason: 'Stop level not touched' };
  }

  return {
    matched: true,
    shouldTrigger: true,
    reason: 'Stop order triggered',
  };
}

/**
 * Check if a stop-limit order should execute
 *
 * 1. First check if stop is triggered
 * 2. Then check if limit condition is met
 *
 * @param condition - Order condition with both stop and limit prices
 * @param market - Current market data
 * @param previousPrice - Previous market price
 * @returns Matching result
 */
export function checkStopLimitOrderMatch(
  condition: OrderCondition,
  market: MarketSnapshot,
  previousPrice: number
): MatchingResult {
  if (!condition.priceLevel || !condition.limitPrice) {
    return { matched: false, reason: 'Stop or limit price not specified' };
  }

  // First: check if stop is triggered
  const stopTriggerResult = checkStopOrderTrigger(
    condition,
    market,
    previousPrice
  );
  if (!stopTriggerResult.shouldTrigger) {
    return { matched: false, reason: 'Stop level not triggered' };
  }

  // Second: check if limit condition is met
  const limitCheckResult: OrderCondition = {
    ...condition,
    orderType: OrderType.Limit,
  };

  return checkLimitOrderMatch(limitCheckResult, market);
}

/**
 * Check if a trailing stop order should trigger
 *
 * Trailing stop moves with price:
 * - For buy orders: trigger if price drops below (highest_price - trail_amount)
 * - For sell orders: trigger if price rises above (lowest_price + trail_amount)
 *
 * @param condition - Order condition with trailingAmount
 * @param market - Current market data
 * @param highestPrice - Highest price since order creation (for buy)
 * @param lowestPrice - Lowest price since order creation (for sell)
 * @param previousPrice - Previous market price
 * @returns Matching result
 */
export function checkTrailingStopOrderTrigger(
  condition: OrderCondition & { trailingAmount: number },
  market: MarketSnapshot,
  highestPrice: number,
  lowestPrice: number,
  previousPrice: number
): MatchingResult {
  if (!condition.trailingAmount) {
    return { matched: false, reason: 'Trailing amount not specified' };
  }

  const shouldTrigger =
    condition.side === OrderSide.Buy
      ? market.currentPrice <= highestPrice - condition.trailingAmount &&
        previousPrice > highestPrice - condition.trailingAmount
      : market.currentPrice >= lowestPrice + condition.trailingAmount &&
        previousPrice < lowestPrice + condition.trailingAmount;

  if (!shouldTrigger) {
    return { matched: false, reason: 'Price has not triggered trailing stop' };
  }

  return {
    matched: true,
    shouldTrigger: true,
    reason: 'Trailing stop triggered',
  };
}

/**
 * Calculate execution price with slippage
 *
 * @param marketPrice - Current market price
 * @param side - Order side (buy/sell)
 * @param slippageAmount - Slippage in price units
 * @returns Execution price after slippage
 */
export function calculateExecutionPrice(
  marketPrice: number,
  side: OrderSide,
  slippageAmount: number
): number {
  if (side === OrderSide.Buy) {
    return marketPrice + slippageAmount; // Buy slips up
  } else {
    return marketPrice - slippageAmount; // Sell slips down
  }
}

/**
 * Determine if order conditions are met for execution
 *
 * @param orderCondition - Order to check
 * @param market - Current market snapshot
 * @param previousPrice - Previous market price
 * @returns Whether order should execute
 */
export function shouldOrderExecute(
  orderCondition: OrderCondition,
  market: MarketSnapshot,
  previousPrice: number = market.currentPrice
): MatchingResult {
  switch (orderCondition.orderType) {
    case OrderType.Market:
      return checkMarketOrderMatch(orderCondition);

    case OrderType.Limit:
      return checkLimitOrderMatch(orderCondition, market);

    case OrderType.Stop:
      return checkStopOrderTrigger(orderCondition, market, previousPrice);

    case OrderType.StopLimit:
      return checkStopLimitOrderMatch(orderCondition, market, previousPrice);

    default:
      return { matched: false, reason: 'Unknown order type' };
  }
}

/**
 * Execute order and update account state
 *
 * Note: This is a calculation-only function. The actual database
 * updates should happen via stored procedures for atomicity.
 *
 * @param executionPrice - Price at which order executed
 * @param quantity - Quantity executed
 * @param side - Order side
 * @param commission - Commission to deduct
 * @param currentBalance - Current account balance
 * @returns Updated balance after execution
 */
export function calculatePostExecutionBalance(
  executionPrice: number,
  quantity: number,
  side: OrderSide,
  commission: number,
  currentBalance: number
): number {
  const orderCost = executionPrice * quantity;
  const totalCost = orderCost + commission;

  if (side === OrderSide.Buy) {
    return currentBalance - totalCost;
  } else {
    // For sell, we add to balance, subtract commission
    return currentBalance + orderCost - commission;
  }
}

/**
 * Calculate margin required for position
 *
 * @param quantity - Position quantity
 * @param entryPrice - Entry price
 * @param leverage - Leverage multiplier
 * @returns Margin required
 */
export function calculateMarginRequired(
  quantity: number,
  entryPrice: number,
  leverage: number
): number {
  const positionValue = quantity * entryPrice;
  return positionValue / leverage;
}

/**
 * Calculate unrealized P&L for a position
 *
 * @param quantity - Position quantity
 * @param entryPrice - Entry price
 * @param currentPrice - Current market price
 * @param side - Position side (buy/sell)
 * @returns Unrealized P&L in account currency
 */
export function calculateUnrealizedPnL(
  quantity: number,
  entryPrice: number,
  currentPrice: number,
  side: OrderSide
): number {
  const priceDifference = currentPrice - entryPrice;

  if (side === OrderSide.Buy) {
    return quantity * priceDifference;
  } else {
    return quantity * -priceDifference;
  }
}

/**
 * Validate order execution pre-conditions
 *
 * @param balance - Current account balance
 * @param marginRequired - Margin needed for position
 * @param freeMargin - Free margin available
 * @returns Validation result
 */
export function validateExecutionPreConditions(
  balance: number,
  marginRequired: number,
  freeMargin: number
): { valid: boolean; reason?: string } {
  if (balance <= 0) {
    return { valid: false, reason: 'Insufficient balance' };
  }

  if (marginRequired > freeMargin) {
    return { valid: false, reason: 'Insufficient margin' };
  }

  return { valid: true };
}

/**
 * Custom error for order matching
 */
export class OrderMatchingError extends Error {
  constructor(
    public status: number,
    public details: string,
    message?: string
  ) {
    super(message || details);
    this.name = 'OrderMatchingError';
  }
}
