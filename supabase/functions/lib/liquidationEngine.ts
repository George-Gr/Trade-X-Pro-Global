/**
 * Liquidation Execution Engine - Deno Edition
 *
 * Pure function implementations for Deno Edge Function runtime.
 * All types are exported from this module for use in Edge Functions.
 *
 * Implements forced position closure when margin level falls below critical thresholds.
 */

/**
 * Liquidation status enum
 */
export enum LiquidationStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  PARTIAL = "partial",
  CANCELLED = "cancelled",
}

/**
 * Liquidation reason enum
 */
export enum LiquidationReason {
  MARGIN_CALL_TIMEOUT = "margin_call_timeout",
  CRITICAL_THRESHOLD = "critical_threshold",
  MANUAL_FORCED = "manual_forced",
  RISK_LIMIT_BREACH = "risk_limit_breach",
}

/**
 * Position for liquidation
 */
export interface PositionForLiquidation {
  id: string;
  symbol: string;
  side: "buy" | "sell";
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
    closedPositions: unknown[];
    failedPositions: Array<{ positionId: string; error: string }>;
  };
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Determines if liquidation is needed
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
      message: "No margin used",
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
 */
export function calculateLiquidationPriority(
  unrealizedLoss: number,
  positionSize: number,
): number {
  return unrealizedLoss * positionSize;
}

/**
 * Selects positions to liquidate in priority order
 */
export function selectPositionsForLiquidation(
  positions: PositionForLiquidation[],
  marginToFree: number,
): PositionForLiquidation[] {
  if (positions.length === 0) {
    return [];
  }

  interface PositionWithPriority extends PositionForLiquidation {
    priority: number;
    loss: number;
  }

  const withPriority: PositionWithPriority[] = positions.map((pos) => ({
    ...pos,
    loss: Math.max(0, -pos.unrealizedPnL),
    priority: calculateLiquidationPriority(
      Math.max(0, -pos.unrealizedPnL),
      pos.notionalValue,
    ),
  }));

  withPriority.sort((a, b) => b.priority - a.priority);

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
 * Calculates slippage with 1.5x multiplier for liquidations
 */
export function calculateLiquidationSlippage(normalSlippage: number): number {
  return normalSlippage * 1.5;
}

/**
 * Calculates execution price for liquidation
 */
export function calculateLiquidationPrice(
  currentPrice: number,
  side: "buy" | "sell",
  slippage: number,
): number {
  const slippageAmount = currentPrice * (slippage / 100);

  if (side === "buy") {
    return currentPrice - slippageAmount;
  } else {
    return currentPrice + slippageAmount;
  }
}

/**
 * Calculates realized P&L for a closed position
 */
export function calculateRealizedPnL(
  side: "buy" | "sell",
  quantity: number,
  entryPrice: number,
  exitPrice: number,
): {
  amount: number;
  percentage: number;
} {
  const priceDiff = exitPrice - entryPrice;

  if (side === "buy") {
    const amount = priceDiff * quantity;
    const percentage = (priceDiff / entryPrice) * 100;
    return { amount, percentage };
  } else {
    const amount = -priceDiff * quantity;
    const percentage = (-priceDiff / entryPrice) * 100;
    return { amount, percentage };
  }
}

/**
 * Validates liquidation preconditions
 */
export function validateLiquidationPreConditions(
  marginLevel: number,
  positionCount: number,
  accountEquity: number,
): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (marginLevel >= 50) {
    issues.push(`Margin level ${marginLevel.toFixed(2)}% must be below 50%`);
  }

  if (accountEquity <= 0) {
    issues.push("Account equity must be positive");
  }

  if (positionCount === 0 && marginLevel < 50) {
    issues.push("No positions to liquidate");
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Checks liquidation safety
 */
export function checkLiquidationSafety(
  positions: PositionForLiquidation[],
  prices: Record<string, { bid: number; ask: number }>,
): {
  isSafe: boolean;
  issues: string[];
  marketImpactEstimate: number;
  positionsToClose: number;
} {
  const issues: string[] = [];
  let totalNotional = 0;
  let closablePositions = 0;

  for (const pos of positions) {
    if (prices[pos.symbol]) {
      closablePositions++;
      totalNotional += pos.notionalValue;
    } else {
      issues.push(`No market data for ${pos.symbol}`);
    }
  }

  const marketImpactEstimate = (totalNotional / 1000000) * 100; // Rough estimate

  return {
    isSafe: issues.length === 0,
    issues,
    marketImpactEstimate,
    positionsToClose: closablePositions,
  };
}

/**
 * Generates liquidation notification payload
 */
export function generateLiquidationNotification(
  event: LiquidationEvent,
  result: unknown,
): {
  type: string;
  priority: string;
  title: string;
  message: string;
  metadata: unknown;
} {
  const resultTyped = result as Record<string, unknown>;
  return {
    type: "LIQUIDATION",
    priority: "CRITICAL",
    title: (resultTyped.success as boolean)
      ? "Account Liquidated"
      : "Liquidation Failed",
    message: resultTyped.message as string,
    metadata: {
      liquidationEventId: event.id,
      positionsClosed: resultTyped.totalPositionsClosed,
      totalLoss: resultTyped.totalLossRealized,
      finalMarginLevel: resultTyped.finalMarginLevel,
      initialMarginLevel: event.initialMarginLevel,
      executionTimeMs: resultTyped.executionTimeMs,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      closedPositions: (resultTyped.closedPositions as any[]).map((p: any) => ({
        symbol: p.symbol,
        quantity: p.quantity,
        realizedPnL: p.realizedPnL,
      })),
    },
  };
}

/**
 * Calculates liquidation metrics
 */
export function calculateLiquidationMetrics(event: LiquidationEvent): {
  eventId: string;
  positionsLiquidated: number;
  totalLoss: number;
  averageLoss: number;
  worstLoss: number;
  bestLoss: number;
  totalSlippage: number;
  averageSlippage: number;
  marginRecovery: number;
  executionQuality: number;
} {
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

  // @ts-expect-error - Position type inference
  const losses = positions.map(
    (p: { realizedPnL?: number; pnlPercentage?: number }) =>
      p.realizedPnL || p.pnlPercentage || 0,
  );
  const totalLoss = losses.reduce((a, b) => a + b, 0);
  // @ts-expect-error - Position type inference
  const slippages = positions.map(
    (p: { slippage?: number }) => p.slippage || 0,
  );
  const totalSlippage = slippages.reduce((a, b) => a + b, 0);

  return {
    eventId: event.id,
    positionsLiquidated: positions.length,
    totalLoss,
    averageLoss: positions.length > 0 ? totalLoss / positions.length : 0,
    worstLoss: Math.min(...losses),
    bestLoss: Math.max(...losses),
    totalSlippage,
    averageSlippage:
      positions.length > 0 ? totalSlippage / positions.length : 0,
    marginRecovery: event.finalMarginLevel - event.initialMarginLevel,
    executionQuality: 100 - totalSlippage / positions.length, // Inverted quality metric
  };
}

/**
 * Formats liquidation reason for display
 */
export function formatLiquidationReason(reason: LiquidationReason): string {
  const labels: Record<LiquidationReason, string> = {
    [LiquidationReason.MARGIN_CALL_TIMEOUT]: "Margin Call Timeout (30+ min)",
    [LiquidationReason.CRITICAL_THRESHOLD]: "Critical Margin Threshold (<30%)",
    [LiquidationReason.MANUAL_FORCED]: "Manual Liquidation (Admin)",
    [LiquidationReason.RISK_LIMIT_BREACH]: "Risk Limit Breach",
  };

  return labels[reason] || "Unknown Reason";
}

/**
 * Formats liquidation status with styling
 */
export function formatLiquidationStatus(status: LiquidationStatus): {
  label: string;
  color: string;
  bgColor: string;
} {
  const styles: Record<
    LiquidationStatus,
    { label: string; color: string; bgColor: string }
  > = {
    [LiquidationStatus.PENDING]: {
      label: "Pending",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    [LiquidationStatus.IN_PROGRESS]: {
      label: "In Progress",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    [LiquidationStatus.COMPLETED]: {
      label: "Completed",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    [LiquidationStatus.FAILED]: {
      label: "Failed",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    [LiquidationStatus.PARTIAL]: {
      label: "Partial",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    [LiquidationStatus.CANCELLED]: {
      label: "Cancelled",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  };

  return styles[status] || styles[LiquidationStatus.PENDING];
}

/**
 * Estimates execution time based on position count
 */
export function estimateExecutionTime(positionCount: number): number {
  // 50ms per position + 500ms overhead
  return positionCount * 50 + 500;
}

/**
 * Validates liquidation event structure
 */
export function validateLiquidationEvent(event: {
  id: string;
  userId: string;
  initialMarginLevel: number;
  finalMarginLevel: number;
  status: LiquidationStatus;
  reason: LiquidationReason;
}): boolean {
  try {
    if (!event.id || typeof event.id !== "string") return false;
    if (!event.userId || typeof event.userId !== "string") return false;
    if (event.initialMarginLevel < 0) return false;
    if (event.finalMarginLevel < 0) return false;
    if (!Object.values(LiquidationStatus).includes(event.status)) return false;
    if (!Object.values(LiquidationReason).includes(event.reason)) return false;

    return true;
  } catch {
    return false;
  }
}
