/**
 * Margin Level Monitoring Utilities
 * Provides real-time margin level calculations and alerts
 */

export enum MarginStatusLevel {
  SAFE = 'safe',
  WARNING = 'warning',
  CRITICAL = 'critical',
  LIQUIDATION = 'liquidation',
}

// Re-export as MarginStatus for backward compatibility
export const MarginStatus = MarginStatusLevel;

export interface MarginStatusInfo {
  marginLevel: number;
  marginLevelPercent: string;
  status: MarginStatusLevel;
  message: string;
  color: string;
}

export interface MarginThresholds {
  safe: number;
  warning: number;
  critical: number;
  liquidation: number;
}

export const DEFAULT_THRESHOLDS: MarginThresholds = {
  safe: 100,
  warning: 80,
  critical: 50,
  liquidation: 20,
};

/**
 * Calculate margin level percentage
 */
export function calculateMarginLevel(
  equity: number,
  marginUsed: number
): number {
  if (marginUsed <= 0) return Infinity;
  return (equity / marginUsed) * 100;
}

/**
 * Format margin level for display
 */
export function formatMarginLevel(marginLevel: number): string {
  if (marginLevel === Infinity) return '∞';
  if (marginLevel >= 1000) return '>1000%';
  return `${marginLevel.toFixed(2)}%`;
}

/**
 * Format margin status for display
 */
export function formatMarginStatus(status: MarginStatusLevel): {
  label: string;
  color: string;
  bgColor: string;
} {
  const styles: Record<MarginStatusLevel, { label: string; color: string; bgColor: string }> = {
    [MarginStatusLevel.SAFE]: {
      label: 'Safe',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    [MarginStatusLevel.WARNING]: {
      label: 'Warning',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    [MarginStatusLevel.CRITICAL]: {
      label: 'Critical',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    [MarginStatusLevel.LIQUIDATION]: {
      label: 'Liquidation',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  };

  return styles[status] || styles[MarginStatusLevel.SAFE];
}

/**
 * Get margin status based on level
 */
export function getMarginStatus(
  marginLevel: number,
  thresholds: MarginThresholds = DEFAULT_THRESHOLDS
): MarginStatusInfo {
  const marginLevelPercent = formatMarginLevel(marginLevel);

  if (marginLevel >= thresholds.safe) {
    return {
      marginLevel,
      marginLevelPercent,
      status: MarginStatusLevel.SAFE,
      message: 'Margin level is healthy',
      color: 'text-green-500',
    };
  }

  if (marginLevel >= thresholds.warning) {
    return {
      marginLevel,
      marginLevelPercent,
      status: MarginStatusLevel.WARNING,
      message: 'Margin level approaching critical',
      color: 'text-yellow-500',
    };
  }

  if (marginLevel >= thresholds.critical) {
    return {
      marginLevel,
      marginLevelPercent,
      status: MarginStatusLevel.CRITICAL,
      message: 'Margin call warning - reduce positions',
      color: 'text-orange-500',
    };
  }

  return {
    marginLevel,
    marginLevelPercent,
    status: MarginStatusLevel.LIQUIDATION,
    message: 'Liquidation imminent - close positions immediately',
    color: 'text-red-500',
  };
}

/**
 * Calculate free margin
 */
export function calculateFreeMargin(
  equity: number,
  marginUsed: number
): number {
  return Math.max(0, equity - marginUsed);
}

/**
 * Check if new position can be opened
 */
export function canOpenPosition(
  freeMargin: number,
  requiredMargin: number
): boolean {
  return freeMargin >= requiredMargin;
}

/**
 * Calculate margin required for position
 */
export function calculatePositionMargin(
  positionValue: number,
  leverage: number
): number {
  return positionValue / leverage;
}

export default {
  MarginStatus: MarginStatusLevel,
  MarginStatusLevel,
  calculateMarginLevel,
  formatMarginLevel,
  formatMarginStatus,
  getMarginStatus,
  calculateFreeMargin,
  canOpenPosition,
  calculatePositionMargin,
  DEFAULT_THRESHOLDS,
};
