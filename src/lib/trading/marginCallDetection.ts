/**
 * Margin Call Detection Utilities
 * Provides margin call detection and warning logic
 */

export enum MarginCallSeverity {
  WARNING = 'warning',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency',
}

export enum MarginCallStatus {
  PENDING = 'pending',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  LIQUIDATED = 'liquidated',
}

export interface MarginCallLevel {
  level: 'safe' | 'warning' | 'margin_call' | 'stop_out';
  threshold: number;
  message: string;
  action: string;
}

export const MARGIN_LEVELS: Record<string, MarginCallLevel> = {
  safe: {
    level: 'safe',
    threshold: 100,
    message: 'Account is in good standing',
    action: 'Continue trading normally',
  },
  warning: {
    level: 'warning',
    threshold: 80,
    message: 'Margin level approaching critical',
    action: 'Consider reducing positions or adding funds',
  },
  margin_call: {
    level: 'margin_call',
    threshold: 50,
    message: 'Margin call - positions at risk',
    action: 'Close losing positions or deposit funds immediately',
  },
  stop_out: {
    level: 'stop_out',
    threshold: 20,
    message: 'Stop out imminent',
    action: 'Positions will be liquidated automatically',
  },
};

export interface MarginCallEvent {
  id: string;
  userId: string;
  marginLevel: number;
  accountEquity: number;
  marginUsed: number;
  triggeredAt: Date;
  status: MarginCallStatus;
  severity: MarginCallSeverity;
}

/**
 * Detect margin call level based on margin percentage
 */
export function detectMarginCallLevel(marginLevel: number): MarginCallLevel {
  if (marginLevel >= MARGIN_LEVELS.safe.threshold) {
    return MARGIN_LEVELS.safe;
  }
  if (marginLevel >= MARGIN_LEVELS.warning.threshold) {
    return MARGIN_LEVELS.warning;
  }
  if (marginLevel >= MARGIN_LEVELS.margin_call.threshold) {
    return MARGIN_LEVELS.margin_call;
  }
  return MARGIN_LEVELS.stop_out;
}

/**
 * Check if margin call should be triggered
 */
export function shouldTriggerMarginCall(marginLevel: number): boolean {
  return marginLevel < MARGIN_LEVELS.margin_call.threshold;
}

/**
 * Check if stop out should be triggered
 */
export function shouldTriggerStopOut(marginLevel: number): boolean {
  return marginLevel < MARGIN_LEVELS.stop_out.threshold;
}

/**
 * Calculate time until forced liquidation (estimate)
 */
export function estimateTimeToLiquidation(
  currentMarginLevel: number,
  marginDeclineRate: number
): number | null {
  if (currentMarginLevel >= MARGIN_LEVELS.margin_call.threshold) {
    return null;
  }
  
  if (marginDeclineRate <= 0) {
    return null;
  }
  
  const marginToLose = currentMarginLevel - MARGIN_LEVELS.stop_out.threshold;
  const hoursUntilLiquidation = marginToLose / marginDeclineRate;
  
  return Math.max(0, hoursUntilLiquidation * 60);
}

/**
 * Get severity level for margin call
 */
export function getMarginCallSeverity(marginLevel: number): MarginCallSeverity {
  if (marginLevel < MARGIN_LEVELS.stop_out.threshold) {
    return MarginCallSeverity.EMERGENCY;
  }
  if (marginLevel < MARGIN_LEVELS.margin_call.threshold) {
    return MarginCallSeverity.CRITICAL;
  }
  return MarginCallSeverity.WARNING;
}

export default {
  MarginCallSeverity,
  MarginCallStatus,
  MARGIN_LEVELS,
  detectMarginCallLevel,
  shouldTriggerMarginCall,
  shouldTriggerStopOut,
  estimateTimeToLiquidation,
  getMarginCallSeverity,
};
