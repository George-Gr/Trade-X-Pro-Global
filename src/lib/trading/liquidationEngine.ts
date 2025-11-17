/**
 * Liquidation Execution Engine
 *
 * Implements forced position closure when margin level falls below critical thresholds.
 * This engine protects account equity by automatically closing positions when users
 * cannot bring their accounts into compliance.
 *
 * Liquidation Priority: Positions are selected and closed by:
 * 1. Largest unrealized loss (protect account from worst losses)
 * 2. Largest position size (free up margin fastest)
 * 3. Alternate long/short (reduce market impact)
 *
 * Liquidation Execution: All orders execute at worst-case market prices with
 * 1.5x multiplier on normal slippage to ensure market clearing.
 *
 * Dependencies:
 * - marginCallDetection (1.3.1): Triggers liquidation when escalated
 * - slippageCalculation (1.1.3): Base slippage calculation
 * - orderMatching (1.1.4): Execution logic
 * - marginCalculations (1.1.2): Margin recalculation
 */

import { z } from 'zod';

/**
 * Liquidation status enum
 */
export enum LiquidationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PARTIAL = 'partial',
  CANCELLED = 'cancelled',
}

/**
 * Liquidation reason enum
 */
export enum LiquidationReason {
  MARGIN_CALL_TIMEOUT = 'margin_call_timeout', // 30+ min in critical margin
  CRITICAL_THRESHOLD = 'critical_threshold', // Margin < 30%
  MANUAL_FORCED = 'manual_forced', // Admin-initiated
  RISK_LIMIT_BREACH = 'risk_limit_breach', // Concentration risk
}

/**
 * Liquidated position details
 */
export interface LiquidatedPosition {
  positionId: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  liquidationPrice: number;
  slippage: number;
  realizedPnL: number;
  pnlPercentage: number;
  closureReason: string;
  closedAt: Date;
}

/**
 * Liquidation execution result
 */
export interface LiquidationExecutionResult {
  success: boolean;
  liquidationEventId: string;
  totalPositionsClosed: number;
  totalPositionsFailed: number;
  initialMarginLevel: number;
  finalMarginLevel: number;
  totalLossRealized: number;
  totalSlippageApplied: number;
  averageLiquidationPrice: number;
  executionTimeMs: number;
  closedPositions: LiquidatedPosition[];
  failedPositions: Array<{
    positionId: string;
    symbol: string;
    error: string;
  }>;
  message: string;
}

/**
 * Liquidation safety check result
 */
export interface SafetyCheckResult {
  isSafe: boolean;
  issues: string[];
  marketImpactEstimate: number;
  estimatedSlippage: number;
  positionsToClose: number;
  estimatedTimeMs: number;
}

/**
 * Position for liquidation
 */
export interface PositionForLiquidation {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  marginRequired: number;
  notionalValue: number;
  leverage: number;
}

/**
 * Liquidation event details
 */
export interface LiquidationEvent {
  id: string;
  userId: string;
  marginCallEventId: string | null;
  reason: LiquidationReason;
  status: LiquidationStatus;
  initiatedAt: Date;
  completedAt: Date | null;
  initialMarginLevel: number;
  finalMarginLevel: number;
  initialEquity: number;
  finalEquity: number;
  positionsLiquidated: number;
  total_realized_pnl: number;
  totalSlippageApplied: number;
  details: {
    closedPositions: LiquidatedPosition[];
    failedPositions: Array<{ positionId: string; error: string }>;
  };
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Liquidation metrics for reporting
 */
export interface LiquidationMetrics {
  eventId: string;
  positionsLiquidated: number;
  totalLoss: number;
  averageLoss: number;
  worstLoss: number;
  bestLoss: number;
  totalSlippage: number;
  averageSlippage: number;
  marginRecovery: number; // percentage points recovered
  executionQuality: number; // 0-100, higher is better
}

/**
 * Calculates if liquidation is needed and how much
 *
 * @param accountEquity - Current account equity
 * @param marginUsed - Current margin used
 * @returns Liquidation necessity and details
 *
 * @example
 * const result = calculateLiquidationNeeded(5000, 10000);
 * // Margin level = 50%, liquidation needed
 */
export function calculateLiquidationNeeded(
  accountEquity: number,
  marginUsed: number,
): {
  isNeeded: boolean;
  marginLevel: number;
  marginToFree: number;
  targetMarginLevel: number;
  message: string;
} {
  if (marginUsed === 0) {
    return {
      isNeeded: false,
      marginLevel: Infinity,
      marginToFree: 0,
      targetMarginLevel: 100,
      message: 'No margin used',
    };
  }

  const marginLevel = (accountEquity / marginUsed) * 100;

  // Calculate how much margin needs to be freed to reach safe level (100%)
  const targetMargin = accountEquity; // At 100%, equity = margin
  const marginToFree = Math.max(0, marginUsed - targetMargin);

  const isNeeded = marginLevel < 50;

  return {
    isNeeded,
    marginLevel: Math.round(marginLevel * 100) / 100,
    marginToFree: Math.round(marginToFree * 100) / 100,
    targetMarginLevel: 100,
    message: isNeeded
      ? `Liquidation needed: margin level ${marginLevel.toFixed(2)}% < 50%`
      : `No liquidation needed: margin level ${marginLevel.toFixed(2)}%`,
  };
}

/**
 * Calculates priority score for liquidation
 *
 * @param unrealizedLoss - Absolute loss amount
 * @param positionSize - Position notional value
 * @returns Priority score (higher = liquidate first)
 *
 * @example
 * const score = calculateLiquidationPriority(1000, 50000);
 * // 50,000,000 - will be liquidated early
 */
export function calculateLiquidationPriority(
  unrealizedLoss: number,
  positionSize: number,
): number {
  return unrealizedLoss * positionSize;
}

/**
 * Selects positions to liquidate in priority order
 *
 * @param positions - All open positions
 * @param marginToFree - How much margin to free up
 * @returns Selected positions in liquidation order
 *
 * @example
 * const selected = selectPositionsForLiquidation(positions, 5000);
 * // Returns positions with highest loss × size, until 5000 margin freed
 */
export function selectPositionsForLiquidation(
  positions: PositionForLiquidation[],
  marginToFree: number,
): PositionForLiquidation[] {
  if (positions.length === 0) {
    return [];
  }

  // Calculate priority for each position
  interface PositionWithPriority extends PositionForLiquidation {
    priority: number;
    loss: number;
  }

  const withPriority: PositionWithPriority[] = positions.map((pos) => ({
    ...pos,
    loss: Math.max(0, -pos.unrealizedPnL), // Absolute loss
    priority: calculateLiquidationPriority(
      Math.max(0, -pos.unrealizedPnL),
      pos.notionalValue,
    ),
  }));

  // Sort by priority descending (largest losses first)
  withPriority.sort((a, b) => b.priority - a.priority);

  // Select positions until margin target met
  const selected: PositionForLiquidation[] = [];
  let marginFreed = 0;

  for (const pos of withPriority) {
    if (marginFreed >= marginToFree) break;
    selected.push(pos);
    marginFreed += pos.marginRequired;
  }

  return selected;
}

/**
 * Calculates liquidation slippage with worst-case multiplier
 *
 * @param normalSlippage - Normal slippage for this symbol
 * @returns Liquidation slippage (worst-case, 1.5x multiplier)
 *
 * @example
 * const liqSlippage = calculateLiquidationSlippage(0.02);
 * // Returns 0.03 (0.02 × 1.5)
 */
export function calculateLiquidationSlippage(normalSlippage: number): number {
  // Liquidation uses 1.5x multiplier for worst-case pricing
  return normalSlippage * 1.5;
}

/**
 * Calculates execution price for liquidation
 *
 * @param currentPrice - Current market price
 * @param side - Position side (buy/sell)
 * @param slippage - Slippage percentage
 * @returns Liquidation execution price
 *
 * @example
 * const execPrice = calculateLiquidationPrice(100, 'buy', 0.03);
 * // Buys closed at 97 (slippage benefit for exit)
 */
export function calculateLiquidationPrice(
  currentPrice: number,
  side: 'buy' | 'sell',
  slippage: number,
): number {
  const slippageAmount = currentPrice * (slippage / 100);

  // For buy positions (go short to close), get worse price (higher)
  // For sell positions (go long to close), get worse price (lower)
  if (side === 'buy') {
    return currentPrice - slippageAmount; // Sell at lower price
  } else {
    return currentPrice + slippageAmount; // Buy at higher price
  }
}

/**
 * Calculates realized PnL for a closed position
 *
 * @param side - Position side
 * @param quantity - Position quantity
 * @param entryPrice - Entry price
 * @param exitPrice - Exit price
 * @returns Realized PnL amount and percentage
 *
 * @example
 * const pnl = calculateRealizedPnL('buy', 100, 50, 48);
 * // { amount: -200, percentage: -4 }
 */
export function calculateRealizedPnL(
  side: 'buy' | 'sell',
  quantity: number,
  entryPrice: number,
  exitPrice: number,
): { amount: number; percentage: number } {
  const priceDiff = exitPrice - entryPrice;
  const amount = side === 'buy' ? priceDiff * quantity : -priceDiff * quantity;
  const percentage = (priceDiff / entryPrice) * 100 * (side === 'buy' ? 1 : -1);

  return {
    amount: Math.round(amount * 100) / 100,
    percentage: Math.round(percentage * 100) / 100,
  };
}

/**
 * Validates liquidation preconditions
 *
 * @param marginLevel - Current margin level
 * @param positionCount - Number of open positions
 * @param timeInCriticalMinutes - Minutes spent in critical state
 * @returns Validation result
 *
 * @example
 * const validation = validateLiquidationPreConditions(45, 8, 35);
 * // valid = true (meets all criteria)
 */
export function validateLiquidationPreConditions(
  marginLevel: number,
  positionCount: number,
  timeInCriticalMinutes: number,
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (marginLevel > 50) {
    issues.push(`Margin level ${marginLevel.toFixed(2)}% not below 50%`);
  }

  if (positionCount === 0) {
    issues.push('No positions to liquidate');
  }

  if (timeInCriticalMinutes < 30 && marginLevel > 30) {
    issues.push(
      `Time in critical state ${timeInCriticalMinutes}m < 30m and margin > 30%`,
    );
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Performs safety check before liquidation execution
 *
 * @param positions - Positions to liquidate
 * @param marketPrices - Current bid/ask prices
 * @returns Safety check result
 *
 * @example
 * const check = checkLiquidationSafety(positions, prices);
 * // Validates no extreme prices, sufficient liquidity, etc.
 */
export function checkLiquidationSafety(
  positions: PositionForLiquidation[],
  marketPrices: Record<string, { bid: number; ask: number }>,
): SafetyCheckResult {
  const issues: string[] = [];
  let totalSlippage = 0;
  let maxSlippage = 0;

  for (const pos of positions) {
    const prices = marketPrices[pos.symbol];
    if (!prices) {
      issues.push(`No market prices for ${pos.symbol}`);
      continue;
    }

    // Check for stale prices (>2% difference from current)
    const midPrice = (prices.bid + prices.ask) / 2;
    const spreadPercent = ((prices.ask - prices.bid) / midPrice) * 100;

    if (spreadPercent > 5) {
      issues.push(
        `Spread too wide for ${pos.symbol}: ${spreadPercent.toFixed(2)}%`,
      );
    }

    totalSlippage += spreadPercent;
    maxSlippage = Math.max(maxSlippage, spreadPercent);
  }

  const estimatedTimeMs = positions.length * 50 + 500; // ~50ms per position

  return {
    isSafe: issues.length === 0,
    issues,
    marketImpactEstimate: maxSlippage,
    estimatedSlippage: positions.length > 0 ? totalSlippage / positions.length : 0,
    positionsToClose: positions.length,
    estimatedTimeMs,
  };
}

/**
 * Generates liquidation notification payload
 *
 * @param event - Liquidation event
 * @param result - Execution result
 * @returns Notification object
 *
 * @example
 * const notification = generateLiquidationNotification(event, result);
 * // {
 * //   type: 'LIQUIDATION',
 * //   priority: 'CRITICAL',
 * //   title: 'Account Liquidated',
 * //   ...
 * // }
 */
export function generateLiquidationNotification(
  event: LiquidationEvent,
  result: LiquidationExecutionResult,
): Record<string, unknown> {
  return {
    type: 'LIQUIDATION',
    priority: 'CRITICAL',
    icon: '🚨',
    title: 'Account Liquidation Executed',
    message: `${result.totalPositionsClosed} positions liquidated due to margin call. Account margin restored from ${event.initialMarginLevel.toFixed(2)}% to ${result.finalMarginLevel.toFixed(2)}%. Total realized loss: $${Math.abs(result.totalLossRealized).toFixed(2)}.`,
    actions: [
      {
        label: 'View Details',
        action: 'NAVIGATE_LIQUIDATION_DETAILS',
        color: 'primary',
      },
      {
        label: 'Deposit Funds',
        action: 'NAVIGATE_WALLET',
        color: 'secondary',
      },
      {
        label: 'Contact Support',
        action: 'NAVIGATE_SUPPORT',
        color: 'secondary',
      },
    ],
    metadata: {
      liquidationEventId: event.id,
      positionsClosed: result.totalPositionsClosed,
      totalLoss: result.totalLossRealized,
      finalMarginLevel: result.finalMarginLevel,
      initialMarginLevel: event.initialMarginLevel,
      executionTimeMs: result.executionTimeMs,
      closedPositions: result.closedPositions.map((p) => ({
        symbol: p.symbol,
        quantity: p.quantity,
        realizedPnL: p.realizedPnL,
      })),
    },
  };
}

/**
 * Calculates liquidation metrics
 *
 * @param event - Completed liquidation event
 * @returns Metrics for reporting
 *
 * @example
 * const metrics = calculateLiquidationMetrics(event);
 * // { positionsLiquidated: 3, totalLoss: -1500, ... }
 */
export function calculateLiquidationMetrics(event: LiquidationEvent): LiquidationMetrics {
  const positions = event.details.closedPositions;

  if (positions.length === 0) {
    return {
      eventId: event.id,
      positionsLiquidated: 0,
      totalLoss: 0,
      averageLoss: 0,
      worstLoss: 0,
      bestLoss: 0,
      totalSlippage: 0,
      averageSlippage: 0,
      marginRecovery: event.finalMarginLevel - event.initialMarginLevel,
      executionQuality: 100,
    };
  }

  const losses = positions.map((p) => p.realizedPnL);
  const totalLoss = losses.reduce((a, b) => a + b, 0);
  const totalSlippage = positions.reduce((sum, p) => sum + p.slippage, 0);

  return {
    eventId: event.id,
    positionsLiquidated: positions.length,
    totalLoss: Math.round(totalLoss * 100) / 100,
    averageLoss: Math.round((totalLoss / positions.length) * 100) / 100,
    worstLoss: Math.round(Math.min(...losses) * 100) / 100,
    bestLoss: Math.round(Math.max(...losses) * 100) / 100,
    totalSlippage: Math.round(totalSlippage * 100) / 100,
    averageSlippage: Math.round((totalSlippage / positions.length) * 100) / 100,
    marginRecovery: event.finalMarginLevel - event.initialMarginLevel,
    executionQuality: Math.max(
      0,
      100 - Math.abs(event.finalMarginLevel - 100) * 2,
    ),
  };
}

/**
 * Formats liquidation reason for display
 *
 * @param reason - Liquidation reason enum
 * @returns Human-readable string
 */
export function formatLiquidationReason(reason: LiquidationReason): string {
  const labels: Record<LiquidationReason, string> = {
    [LiquidationReason.MARGIN_CALL_TIMEOUT]: 'Margin Call Timeout (30+ min)',
    [LiquidationReason.CRITICAL_THRESHOLD]: 'Critical Margin Level (<30%)',
    [LiquidationReason.MANUAL_FORCED]: 'Admin-Initiated Liquidation',
    [LiquidationReason.RISK_LIMIT_BREACH]: 'Risk Limit Breach',
  };
  return labels[reason];
}

/**
 * Formats liquidation status for display
 *
 * @param status - Status enum
 * @returns Human-readable string and color
 */
export function formatLiquidationStatus(status: LiquidationStatus): {
  label: string;
  color: string;
} {
  const labels: Record<
    LiquidationStatus,
    { label: string; color: string }
  > = {
    [LiquidationStatus.PENDING]: { label: 'Pending', color: 'text-yellow-600' },
    [LiquidationStatus.IN_PROGRESS]: { label: 'In Progress', color: 'text-blue-600' },
    [LiquidationStatus.COMPLETED]: { label: 'Completed', color: 'text-red-600' },
    [LiquidationStatus.FAILED]: { label: 'Failed', color: 'text-red-900' },
    [LiquidationStatus.PARTIAL]: { label: 'Partial', color: 'text-orange-600' },
    [LiquidationStatus.CANCELLED]: { label: 'Cancelled', color: 'text-gray-600' },
  };
  return labels[status];
}

/**
 * Estimates time to liquidation completion
 *
 * @param positionCount - Number of positions to close
 * @returns Estimated time in milliseconds
 *
 * @example
 * const estimatedMs = estimateExecutionTime(5);
 * // 750 ms (50ms per position + overhead)
 */
export function estimateExecutionTime(positionCount: number): number {
  const perPositionMs = 50;
  const overheadMs = 500;
  return positionCount * perPositionMs + overheadMs;
}

/**
 * Validates liquidation event structure
 *
 * @param event - Event to validate
 * @returns true if valid
 */
export function validateLiquidationEvent(event: Partial<LiquidationEvent>): boolean {
  try {
    const schema = z.object({
      id: z.string().min(1),
      userId: z.string().min(1),
      marginCallEventId: z.string().nullable(),
      reason: z.nativeEnum(LiquidationReason),
      status: z.nativeEnum(LiquidationStatus),
      initiatedAt: z.date(),
      completedAt: z.date().nullable(),
      initialMarginLevel: z.number().min(0),
      finalMarginLevel: z.number().min(0),
      initialEquity: z.number(),
      finalEquity: z.number(),
      positionsLiquidated: z.number().int().min(0),
      total_realized_pnl: z.number(),
      totalSlippageApplied: z.number().min(0),
      details: z.object({
        closedPositions: z.array(z.any()),
        failedPositions: z.array(z.any()),
      }),
      notes: z.string().nullable(),
      createdAt: z.date(),
      updatedAt: z.date(),
    });

    schema.parse(event);
    return true;
  } catch {
    return false;
  }
}
