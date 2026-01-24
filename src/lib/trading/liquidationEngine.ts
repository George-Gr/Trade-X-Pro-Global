/**
 * Client-side Liquidation Engine
 * Provides types and utilities for liquidation display and monitoring
 */

export enum LiquidationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PARTIAL = 'partial',
  CANCELLED = 'cancelled',
}

export enum LiquidationReason {
  MARGIN_CALL_TIMEOUT = 'margin_call_timeout',
  CRITICAL_THRESHOLD = 'critical_threshold',
  MANUAL_FORCED = 'manual_forced',
  RISK_LIMIT_BREACH = 'risk_limit_breach',
}

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
  totalRealizedPnL: number;
  totalSlippageApplied: number;
}

export interface LiquidationExecutionResult {
  success: boolean;
  eventId: string;
  positionsClosed: number;
  positionsFailed: number;
  totalLossRealized: number;
  totalSlippageApplied: number;
  finalMarginLevel: number;
  finalEquity: number;
  executionTimeMs: number;
  closedPositions: Array<{
    positionId: string;
    symbol: string;
    quantity: number;
    closePrice: number;
    realizedPnL: number;
    slippage: number;
  }>;
  failedPositions: Array<{
    positionId: string;
    error: string;
  }>;
  message: string;
}

/**
 * Check if liquidation is needed based on margin level
 */
export function isLiquidationNeeded(marginLevel: number): boolean {
  return marginLevel < 50;
}

/**
 * Calculate priority score for position liquidation
 */
export function calculateLiquidationPriority(
  unrealizedLoss: number,
  positionSize: number
): number {
  return unrealizedLoss * positionSize;
}

/**
 * Format liquidation reason for display
 */
export function formatLiquidationReason(reason: LiquidationReason): string {
  const labels: Record<LiquidationReason, string> = {
    [LiquidationReason.MARGIN_CALL_TIMEOUT]: 'Margin Call Timeout (30+ min)',
    [LiquidationReason.CRITICAL_THRESHOLD]: 'Critical Margin Threshold (<30%)',
    [LiquidationReason.MANUAL_FORCED]: 'Manual Liquidation (Admin)',
    [LiquidationReason.RISK_LIMIT_BREACH]: 'Risk Limit Breach',
  };

  return labels[reason] || 'Unknown Reason';
}

/**
 * Format liquidation status for display
 */
export function formatLiquidationStatus(status: LiquidationStatus): {
  label: string;
  color: string;
  bgColor: string;
} {
  const styles: Record<LiquidationStatus, { label: string; color: string; bgColor: string }> = {
    [LiquidationStatus.PENDING]: {
      label: 'Pending',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    [LiquidationStatus.IN_PROGRESS]: {
      label: 'In Progress',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    [LiquidationStatus.COMPLETED]: {
      label: 'Completed',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    [LiquidationStatus.FAILED]: {
      label: 'Failed',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    [LiquidationStatus.PARTIAL]: {
      label: 'Partial',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    [LiquidationStatus.CANCELLED]: {
      label: 'Cancelled',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
  };

  return styles[status] || styles[LiquidationStatus.PENDING];
}

export default {
  LiquidationStatus,
  LiquidationReason,
  isLiquidationNeeded,
  calculateLiquidationPriority,
  formatLiquidationReason,
  formatLiquidationStatus,
};
