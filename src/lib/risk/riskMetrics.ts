/**
 * Risk Metrics Calculation Engine
 * Real-time risk metrics including margin levels, capital at risk, and risk classification
 *
 * Provides calculations for:
 * - Margin monitoring (current level, free margin, used margin)
 * - Risk thresholds and classifications
 * - Capital at risk calculations
 * - Liquidation risk assessment
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface RiskMetrics {
  currentMarginLevel: number;
  freeMargin: number;
  usedMargin: number;
  marginCallThreshold: number;
  liquidationThreshold: number;
  riskLevel: 'safe' | 'warning' | 'critical' | 'liquidation';
  capitalAtRisk: number;
  capitalAtRiskPercentage: number;
  timeUntilLiquidation?: number; // in milliseconds
}

export interface RiskLevelDetails {
  level: 'safe' | 'warning' | 'critical' | 'liquidation';
  description: string;
  color: string;
  backgroundColor: string;
  warningMessage?: string;
  recommendedAction?: string;
}

export interface PortfolioRiskAssessment {
  overallRiskLevel: 'safe' | 'warning' | 'critical' | 'liquidation';
  marginHealth: number; // 0-100
  leverageRatio: number;
  concentrationRisk: number; // 0-100
  recommendedActions: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const RISK_THRESHOLDS = {
  MARGIN_CALL_LEVEL: 100, // 100% - margin level at which call is triggered
  LIQUIDATION_LEVEL: 50, // 50% - margin level at which liquidation occurs
  WARNING_LEVEL: 150, // 150% - warning threshold
  CRITICAL_LEVEL: 100, // 100% - critical threshold
  SAFE_LEVEL: 200, // 200% - safe threshold
} as const;

export const RISK_LEVEL_CONFIG = {
  safe: {
    level: 'safe' as const,
    description: 'Your account is in good standing with healthy margin levels',
    color: 'text-status-safe',
    backgroundColor: 'bg-status-safe',
    warningMessage: undefined,
    recommendedAction: 'Continue monitoring your positions',
  },
  warning: {
    level: 'warning' as const,
    description: 'Your margin level is elevated. Monitor your positions closely.',
    color: 'text-status-warning',
    backgroundColor: 'bg-status-warning',
    warningMessage: 'Margin call risk detected',
    recommendedAction: 'Consider closing some positions or depositing funds',
  },
  critical: {
    level: 'critical' as const,
    description: 'Your account is at critical risk. Your account is in close-only mode.',
    color: 'text-status-critical',
    backgroundColor: 'bg-status-critical',
    warningMessage: 'Critical margin level - only close positions allowed',
    recommendedAction: 'Immediately close positions or deposit significant funds',
  },
  liquidation: {
    level: 'liquidation' as const,
    description: 'Your account will be liquidated immediately.',
    color: 'text-red-600',
    backgroundColor: 'bg-red-50',
    warningMessage: 'LIQUIDATION IN PROGRESS',
    recommendedAction: 'Contact support immediately',
  },
} as const;

// ============================================================================
// MARGIN CALCULATIONS
// ============================================================================

/**
 * Calculate current margin level as a percentage
 * Margin Level (%) = (Equity / Margin Used) × 100
 *
 * @param equity - Account equity
 * @param marginUsed - Total margin used by open positions
 * @returns Margin level as percentage
 */
export function calculateMarginLevel(equity: number, marginUsed: number): number {
  if (marginUsed === 0) {
    return 10000; // No positions, infinite margin level
  }

  const marginLevel = (equity / marginUsed) * 100;
  return Math.round(marginLevel * 100) / 100; // Round to 2 decimals
}

/**
 * Calculate free margin available for new positions
 * Free Margin = Equity - Margin Used
 *
 * @param equity - Account equity
 * @param marginUsed - Total margin used by open positions
 * @returns Free margin available
 */
export function calculateFreeMargin(equity: number, marginUsed: number): number {
  const freeMargin = equity - marginUsed;
  return Math.max(0, Math.round(freeMargin * 100) / 100);
}

/**
 * Calculate used margin percentage relative to equity
 * Used Margin % = (Margin Used / Equity) × 100
 *
 * @param marginUsed - Total margin used by open positions
 * @param equity - Account equity
 * @returns Margin usage as percentage
 */
export function calculateMarginUsagePercentage(marginUsed: number, equity: number): number {
  if (equity === 0) return 100;

  const usage = (marginUsed / equity) * 100;
  return Math.round(Math.min(usage, 100) * 100) / 100;
}

// ============================================================================
// RISK LEVEL CLASSIFICATION
// ============================================================================

/**
 * Classify account risk level based on margin level
 *
 * - SAFE: Margin ≥ 200%
 * - WARNING: 100% ≤ Margin < 200%
 * - CRITICAL: 50% ≤ Margin < 100%
 * - LIQUIDATION: Margin < 50%
 *
 * @param marginLevel - Current margin level as percentage
 * @returns Risk level classification
 */
export function classifyRiskLevel(
  marginLevel: number
): 'safe' | 'warning' | 'critical' | 'liquidation' {
  if (marginLevel >= RISK_THRESHOLDS.SAFE_LEVEL) {
    return 'safe';
  } else if (marginLevel >= RISK_THRESHOLDS.WARNING_LEVEL) {
    return 'warning';
  } else if (marginLevel >= RISK_THRESHOLDS.LIQUIDATION_LEVEL) {
    return 'critical';
  } else {
    return 'liquidation';
  }
}

/**
 * Get detailed risk level information
 *
 * @param riskLevel - Risk level classification
 * @returns Detailed risk level information with colors and recommendations
 */
export function getRiskLevelDetails(
  riskLevel: 'safe' | 'warning' | 'critical' | 'liquidation'
): RiskLevelDetails {
  return RISK_LEVEL_CONFIG[riskLevel];
}

// ============================================================================
// CAPITAL AT RISK CALCULATIONS
// ============================================================================

/**
 * Calculate total capital at risk from all open positions
 * Capital at Risk = Sum of all position values (margin × leverage)
 *
 * @param positions - Array of open positions with values
 * @returns Total capital at risk
 */
export function calculateCapitalAtRisk(
  positions: Array<{ positionValue: number; marginRequired: number }>
): number {
  if (!positions || positions.length === 0) {
    return 0;
  }

  const totalCapitalAtRisk = positions.reduce((sum, position) => {
    return sum + (position.positionValue || 0);
  }, 0);

  return Math.round(totalCapitalAtRisk * 100) / 100;
}

/**
 * Calculate capital at risk as percentage of account equity
 *
 * @param capitalAtRisk - Total capital at risk
 * @param equity - Account equity
 * @returns Capital at risk percentage
 */
export function calculateCapitalAtRiskPercentage(
  capitalAtRisk: number,
  equity: number
): number {
  if (equity === 0) return 0;

  const percentage = (capitalAtRisk / equity) * 100;
  return Math.round(percentage * 100) / 100;
}

/**
 * Calculate worst-case scenario loss (if all positions move to liquidation)
 *
 * @param marginUsed - Total margin used
 * @param equity - Account equity
 * @returns Worst-case loss amount
 */
export function calculateWorstCaseLoss(marginUsed: number, equity: number): number {
  const worstCaseLoss = equity - marginUsed * 0.5; // Assuming 50% loss on liquidation
  return Math.round(Math.max(worstCaseLoss, 0) * 100) / 100;
}

// ============================================================================
// LIQUIDATION RISK
// ============================================================================

/**
 * Calculate liquidation price for a position
 * For long positions: liquidation occurs at 50% of entry price (2x leverage)
 * For short positions: liquidation occurs at 150% of entry price (2x leverage)
 *
 * @param entryPrice - Entry price of the position
 * @param side - Position side (long or short)
 * @param leverageRatio - Leverage ratio (default 2x)
 * @returns Liquidation price
 */
export function calculateLiquidationPrice(
  entryPrice: number,
  side: 'long' | 'short',
  leverageRatio: number = 2
): number {
  if (side === 'long') {
    return entryPrice / leverageRatio;
  } else {
    return entryPrice * leverageRatio;
  }
}

/**
 * Calculate price movement to liquidation
 *
 * @param currentPrice - Current market price
 * @param liquidationPrice - Liquidation price
 * @param side - Position side
 * @returns Percentage movement until liquidation
 */
export function calculateMovementToLiquidation(
  currentPrice: number,
  liquidationPrice: number,
  side: 'long' | 'short'
): number {
  if (currentPrice === 0) return 0;

  if (side === 'long') {
    const movement = ((currentPrice - liquidationPrice) / currentPrice) * 100;
    return Math.round(movement * 100) / 100;
  } else {
    const movement = ((liquidationPrice - currentPrice) / currentPrice) * 100;
    return Math.round(movement * 100) / 100;
  }
}

// ============================================================================
// COMPREHENSIVE RISK ASSESSMENT
// ============================================================================

/**
 * Calculate comprehensive risk metrics for the account
 *
 * @param equity - Account equity
 * @param marginUsed - Total margin used
 * @param positions - Array of open positions
 * @returns Complete risk metrics
 */
export function calculateRiskMetrics(
  equity: number,
  marginUsed: number,
  positions: Array<{ positionValue: number; marginRequired: number }> = []
): RiskMetrics {
  const marginLevel = calculateMarginLevel(equity, marginUsed);
  const riskLevel = classifyRiskLevel(marginLevel);
  const capitalAtRisk = calculateCapitalAtRisk(positions);
  const capitalAtRiskPercentage = calculateCapitalAtRiskPercentage(capitalAtRisk, equity);

  return {
    currentMarginLevel: marginLevel,
    freeMargin: calculateFreeMargin(equity, marginUsed),
    usedMargin: marginUsed,
    marginCallThreshold: RISK_THRESHOLDS.MARGIN_CALL_LEVEL,
    liquidationThreshold: RISK_THRESHOLDS.LIQUIDATION_LEVEL,
    riskLevel,
    capitalAtRisk,
    capitalAtRiskPercentage,
  };
}

/**
 * Assess overall portfolio risk
 *
 * @param riskMetrics - Risk metrics object
 * @param positions - Array of open positions
 * @param concentration - Position concentration ratio (0-100)
 * @returns Portfolio risk assessment with recommendations
 */
export function assessPortfolioRisk(
  riskMetrics: RiskMetrics,
  positions: Array<{ symbol: string; quantity: number; positionValue: number }> = [],
  concentration: number = 0
): PortfolioRiskAssessment {
  const marginHealth = Math.min(
    100,
    Math.round((riskMetrics.currentMarginLevel / 300) * 100)
  );

  const leverageRatio = riskMetrics.usedMargin > 0
    ? Math.round((riskMetrics.capitalAtRisk / riskMetrics.usedMargin) * 100) / 100
    : 0;

  const recommendedActions: string[] = [];

  if (riskMetrics.riskLevel === 'critical' || riskMetrics.riskLevel === 'liquidation') {
    recommendedActions.push('Close positions immediately to avoid liquidation');
    if (riskMetrics.freeMargin > 0) {
      recommendedActions.push('Deposit additional funds to increase margin level');
    }
  } else if (riskMetrics.riskLevel === 'warning') {
    recommendedActions.push('Monitor margin level closely');
    recommendedActions.push('Consider closing smaller positions');
  }

  if (concentration > 50) {
    recommendedActions.push('Reduce position concentration for diversification');
  }

  if (riskMetrics.capitalAtRiskPercentage > 80) {
    recommendedActions.push('Reduce overall capital at risk');
  }

  return {
    overallRiskLevel: riskMetrics.riskLevel,
    marginHealth,
    leverageRatio,
    concentrationRisk: concentration,
    recommendedActions,
  };
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Check if account is in close-only mode
 * Close-only mode is enabled when margin level is below critical threshold
 *
 * @param marginLevel - Current margin level
 * @returns True if close-only mode should be enabled
 */
export function isCloseOnlyMode(marginLevel: number): boolean {
  return marginLevel < RISK_THRESHOLDS.CRITICAL_LEVEL;
}

/**
 * Check if account is in liquidation risk
 *
 * @param marginLevel - Current margin level
 * @returns True if liquidation is imminent
 */
export function isLiquidationRisk(marginLevel: number): boolean {
  return marginLevel < RISK_THRESHOLDS.LIQUIDATION_LEVEL;
}

/**
 * Format margin level for display
 *
 * @param marginLevel - Margin level percentage
 * @returns Formatted string with % symbol
 */
export function formatMarginLevel(marginLevel: number): string {
  if (marginLevel >= 10000) {
    return '∞%'; // Infinite margin level
  }
  return `${marginLevel.toFixed(2)}%`;
}

/**
 * Format currency for display
 *
 * @param amount - Currency amount
 * @param currency - Currency code (default USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return `$${amount.toFixed(2)}`;
}
