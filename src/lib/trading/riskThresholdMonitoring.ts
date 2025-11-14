/**
 * Risk Threshold Monitoring Engine
 * 
 * Monitors portfolio-level risk metrics and triggers alerts when thresholds are exceeded:
 * - Daily P&L loss limits
 * - Drawdown thresholds (max loss from peak)
 * - Concentration risk (max position size per asset class)
 * - Correlation-based portfolio risk
 * - Value-at-Risk (VaR) calculations
 * 
 * 20+ functions for comprehensive portfolio risk monitoring
 */

/**
 * Risk Status Enumeration
 */
export enum RiskStatus {
  SAFE = 'safe',           // All metrics within safe bounds
  WARNING = 'warning',     // One or more metrics approaching threshold
  CRITICAL = 'critical',  // One or more metrics exceeded threshold
  MONITOR = 'monitor'     // Requires active monitoring
}

/**
 * Risk Threshold Configuration
 */
export enum RiskThresholdType {
  DAILY_LOSS_LIMIT = 'daily_loss_limit',
  DRAWDOWN_LIMIT = 'drawdown_limit',
  CONCENTRATION_LIMIT = 'concentration_limit',
  CORRELATION_LIMIT = 'correlation_limit',
  VAR_LIMIT = 'var_limit'
}

/**
 * Core Risk Metric Interfaces
 */
export interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  entry_price: number;
  current_price: number;
  unrealized_pnl: number;
  margin_used: number;
  created_at: string;
  updated_at: string;
}

export interface RiskMetrics {
  totalEquity: number;
  totalMarginUsed: number;
  totalMarginRequired: number;
  freeMargin: number;
  marginLevel: number;
  dailyPnL: number;
  dailyLossLimit: number;
  drawdownCurrent: number;
  drawdownLimit: number;
  maxDrawdownToday: number;
  concentrationByAsset: Record<string, number>;
  concentrationLimit: number;
  openPositionCount: number;
  totalExposure: number;
  correlationRisk: number;
  varEstimate: number;
  riskStatus: RiskStatus;
  lastUpdated: string;
}

export interface PortfolioRiskSummary {
  metrics: RiskMetrics;
  violatedThresholds: string[];
  recommendations: string[];
  risklevel: RiskStatus;
}

export interface RiskThreshold {
  type: RiskThresholdType;
  value: number;
  alertLevel: RiskStatus; // WARNING or CRITICAL
  enabled: boolean;
}

export interface RiskAlert {
  id: string;
  userId: string;
  type: RiskThresholdType;
  currentValue: number;
  threshold: number;
  exceedancePercentage: number;
  status: RiskStatus;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

/**
 * Default Risk Thresholds
 * Conservative defaults suitable for retail traders
 */
export const DEFAULT_RISK_THRESHOLDS: Record<RiskThresholdType, RiskThreshold> = {
  [RiskThresholdType.DAILY_LOSS_LIMIT]: {
    type: RiskThresholdType.DAILY_LOSS_LIMIT,
    value: 1000, // $1000 daily loss limit
    alertLevel: RiskStatus.CRITICAL,
    enabled: true
  },
  [RiskThresholdType.DRAWDOWN_LIMIT]: {
    type: RiskThresholdType.DRAWDOWN_LIMIT,
    value: 0.10, // 10% max drawdown from peak
    alertLevel: RiskStatus.CRITICAL,
    enabled: true
  },
  [RiskThresholdType.CONCENTRATION_LIMIT]: {
    type: RiskThresholdType.CONCENTRATION_LIMIT,
    value: 0.25, // Max 25% of portfolio in single asset class
    alertLevel: RiskStatus.WARNING,
    enabled: true
  },
  [RiskThresholdType.CORRELATION_LIMIT]: {
    type: RiskThresholdType.CORRELATION_LIMIT,
    value: 0.85, // Portfolio correlation > 0.85 = high risk
    alertLevel: RiskStatus.WARNING,
    enabled: true
  },
  [RiskThresholdType.VAR_LIMIT]: {
    type: RiskThresholdType.VAR_LIMIT,
    value: 0.05, // 5% Value-at-Risk (95% confidence)
    alertLevel: RiskStatus.WARNING,
    enabled: true
  }
};

/**
 * Calculate total portfolio exposure across all open positions
 * @param positions - Array of open positions
 * @returns Total notional exposure in account currency
 */
export function calculateTotalExposure(positions: Position[]): number {
  if (!positions || positions.length === 0) {
    return 0;
  }
  
  return positions.reduce((sum, pos) => {
    const notionalValue = Math.abs(pos.quantity * pos.current_price);
    return sum + notionalValue;
  }, 0);
}

/**
 * Calculate concentration risk by asset class
 * @param positions - Array of open positions
 * @returns Record of asset class → concentration percentage
 */
export function calculateConcentration(
  positions: Position[]
): Record<string, number> {
  if (!positions || positions.length === 0) {
    return {};
  }

  const totalExposure = calculateTotalExposure(positions);
  if (totalExposure === 0) {
    return {};
  }

  const concentration: Record<string, number> = {};

  positions.forEach(pos => {
    const notionalValue = Math.abs(pos.quantity * pos.current_price);
    const assetClass = extractAssetClass(pos.symbol);
    
    if (!concentration[assetClass]) {
      concentration[assetClass] = 0;
    }
    
    concentration[assetClass] += notionalValue / totalExposure;
  });

  return concentration;
}

/**
 * Check if concentration limit exceeded
 * @param concentration - Concentration by asset class
 * @param limit - Concentration limit (e.g., 0.25 = 25%)
 * @returns true if any asset class exceeds limit
 */
export function isConcentrationExceeded(
  concentration: Record<string, number>,
  limit: number = DEFAULT_RISK_THRESHOLDS[RiskThresholdType.CONCENTRATION_LIMIT].value
): boolean {
  return Object.values(concentration).some(c => c > limit);
}

/**
 * Calculate drawdown from peak equity
 * @param currentEquity - Current account equity
 * @param peakEquity - Highest equity reached
 * @returns Drawdown percentage (0-1)
 */
export function calculateDrawdown(
  currentEquity: number,
  peakEquity: number
): number {
  if (peakEquity <= 0) {
    return 0;
  }
  
  const drawdown = (peakEquity - currentEquity) / peakEquity;
  return Math.max(0, drawdown);
}

/**
 * Check if drawdown limit exceeded
 * @param drawdown - Current drawdown percentage
 * @param limit - Drawdown limit (e.g., 0.10 = 10%)
 * @returns true if drawdown exceeds limit
 */
export function isDrawdownExceeded(
  drawdown: number,
  limit: number = DEFAULT_RISK_THRESHOLDS[RiskThresholdType.DRAWDOWN_LIMIT].value
): boolean {
  return drawdown > limit;
}

/**
 * Check if daily loss limit exceeded
 * @param dailyPnL - Current day's P&L
 * @param limit - Daily loss limit (negative value, e.g., -1000)
 * @returns true if daily loss exceeds limit
 */
export function isDailyLossLimitExceeded(
  dailyPnL: number,
  limit: number = DEFAULT_RISK_THRESHOLDS[RiskThresholdType.DAILY_LOSS_LIMIT].value
): boolean {
  const dailyLossLimit = -Math.abs(limit); // Ensure it's negative
  return dailyPnL < dailyLossLimit;
}

/**
 * Estimate portfolio correlation (simplified)
 * Uses position size weighting and direction alignment
 * @param positions - Array of open positions
 * @returns Correlation coefficient (0-1)
 */
export function estimatePortfolioCorrelation(positions: Position[]): number {
  if (!positions || positions.length < 2) {
    return 0;
  }

  let sameSideCount = 0;
  let totalPairs = 0;

  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      totalPairs++;
      if (positions[i].side === positions[j].side) {
        sameSideCount++;
      }
    }
  }

  if (totalPairs === 0) {
    return 0;
  }

  // Simplified: correlation based on directional alignment
  const correlation = sameSideCount / totalPairs;
  return Math.min(correlation, 1.0);
}

/**
 * Check if portfolio correlation risk is high
 * @param correlation - Correlation coefficient
 * @param limit - Correlation limit (e.g., 0.85)
 * @returns true if correlation exceeds limit
 */
export function isCorrelationRiskHigh(
  correlation: number,
  limit: number = DEFAULT_RISK_THRESHOLDS[RiskThresholdType.CORRELATION_LIMIT].value
): boolean {
  return correlation > limit;
}

/**
 * Estimate Value-at-Risk (VaR) using simplified method
 * VaR = total exposure × volatility × Z-score (95% confidence)
 * @param totalExposure - Total portfolio notional value
 * @param volatility - Portfolio volatility (0-1, default 0.15 = 15%)
 * @param confidenceLevel - Confidence level for VaR (default 0.95)
 * @returns VaR as percentage of equity
 */
export function estimateVaR(
  totalExposure: number,
  currentEquity: number,
  volatility: number = 0.15,
  confidenceLevel: number = 0.95
): number {
  if (currentEquity <= 0) {
    return 0;
  }

  // Z-score for 95% confidence: 1.645
  const zScore = confidenceLevel === 0.95 ? 1.645 : confidenceLevel === 0.99 ? 2.326 : 1.645;
  
  const varDollar = totalExposure * volatility * zScore;
  const varPercentage = varDollar / currentEquity;

  return Math.min(varPercentage, 1.0); // Cap at 100%
}

/**
 * Check if VaR limit exceeded
 * @param varEstimate - Estimated VaR (0-1)
 * @param limit - VaR limit (e.g., 0.05 = 5%)
 * @returns true if VaR exceeds limit
 */
export function isVaRLimitExceeded(
  varEstimate: number,
  limit: number = DEFAULT_RISK_THRESHOLDS[RiskThresholdType.VAR_LIMIT].value
): boolean {
  return varEstimate > limit;
}

/**
 * Classify overall risk status based on violated thresholds
 * @param violations - Array of violated threshold types
 * @returns Risk status
 */
export function classifyRiskStatus(violations: RiskThresholdType[]): RiskStatus {
  if (violations.length === 0) {
    return RiskStatus.SAFE;
  }

  // Check if any critical violations
  const hasCommon = (types: RiskThresholdType[]) =>
    violations.some(v => types.includes(v));

  if (hasCommon([
    RiskThresholdType.DAILY_LOSS_LIMIT,
    RiskThresholdType.DRAWDOWN_LIMIT
  ])) {
    return RiskStatus.CRITICAL;
  }

  if (violations.includes(RiskThresholdType.CONCENTRATION_LIMIT)) {
    return RiskStatus.WARNING;
  }

  return RiskStatus.MONITOR;
}

/**
 * Calculate comprehensive portfolio risk metrics
 * @param positions - Array of open positions
 * @param equity - Current account equity
 * @param peakEquity - Peak equity reached
 * @param dailyPnL - Current day's P&L
 * @param marginUsed - Total margin in use
 * @returns Complete risk metrics object
 */
export function calculatePortfolioRiskMetrics(
  positions: Position[],
  equity: number,
  peakEquity: number,
  dailyPnL: number,
  marginUsed: number
): RiskMetrics {
  const totalExposure = calculateTotalExposure(positions);
  const concentration = calculateConcentration(positions);
  const drawdown = calculateDrawdown(equity, peakEquity);
  const correlation = estimatePortfolioCorrelation(positions);
  const varEstimate = estimateVaR(totalExposure, equity);

  // Determine violations
  const violations: RiskThresholdType[] = [];

  if (isDailyLossLimitExceeded(dailyPnL)) {
    violations.push(RiskThresholdType.DAILY_LOSS_LIMIT);
  }

  if (isDrawdownExceeded(drawdown)) {
    violations.push(RiskThresholdType.DRAWDOWN_LIMIT);
  }

  if (isConcentrationExceeded(concentration)) {
    violations.push(RiskThresholdType.CONCENTRATION_LIMIT);
  }

  if (isCorrelationRiskHigh(correlation)) {
    violations.push(RiskThresholdType.CORRELATION_LIMIT);
  }

  if (isVaRLimitExceeded(varEstimate)) {
    violations.push(RiskThresholdType.VAR_LIMIT);
  }

  const riskStatus = classifyRiskStatus(violations);

  return {
    totalEquity: equity,
    totalMarginUsed: marginUsed,
    totalMarginRequired: marginUsed, // Simplified
    freeMargin: Math.max(0, equity - marginUsed),
    marginLevel: marginUsed > 0 ? (equity / marginUsed) * 100 : 0,
    dailyPnL,
    dailyLossLimit: -DEFAULT_RISK_THRESHOLDS[RiskThresholdType.DAILY_LOSS_LIMIT].value,
    drawdownCurrent: drawdown,
    drawdownLimit: DEFAULT_RISK_THRESHOLDS[RiskThresholdType.DRAWDOWN_LIMIT].value,
    maxDrawdownToday: drawdown, // Simplified
    concentrationByAsset: concentration,
    concentrationLimit: DEFAULT_RISK_THRESHOLDS[RiskThresholdType.CONCENTRATION_LIMIT].value,
    openPositionCount: positions.length,
    totalExposure,
    correlationRisk: correlation,
    varEstimate,
    riskStatus,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Generate portfolio risk summary with recommendations
 * @param metrics - Risk metrics object
 * @returns Risk summary with actionable recommendations
 */
export function generateRiskSummary(metrics: RiskMetrics): PortfolioRiskSummary {
  const violations: string[] = [];
  const recommendations: string[] = [];

  if (metrics.dailyPnL < metrics.dailyLossLimit) {
    violations.push('Daily loss limit exceeded');
    recommendations.push('Consider closing losing positions or pausing new trades');
  }

  if (metrics.drawdownCurrent > metrics.drawdownLimit) {
    violations.push('Maximum drawdown limit exceeded');
    recommendations.push('Review position sizing and stop-loss levels');
  }

  const maxConcentration = Math.max(...Object.values(metrics.concentrationByAsset), 0);
  if (maxConcentration > metrics.concentrationLimit) {
    violations.push('Concentration limit exceeded in one or more assets');
    recommendations.push('Reduce position size in concentrated assets');
  }

  if (metrics.correlationRisk > 0.85) {
    violations.push('High portfolio correlation detected');
    recommendations.push('Diversify positions across uncorrelated assets');
  }

  if (metrics.varEstimate > 0.05) {
    violations.push('Value-at-Risk limit exceeded');
    recommendations.push('Reduce leverage or portfolio size');
  }

  if (metrics.marginLevel < 150) {
    recommendations.push('Margin level approaching warning threshold');
  }

  return {
    metrics,
    violatedThresholds: violations,
    recommendations,
    risklevel: metrics.riskStatus
  };
}

/**
 * Extract asset class from symbol
 * @param symbol - Trading symbol (e.g., 'EURUSD', 'AAPL', 'BTCUSD')
 * @returns Asset class type
 */
function extractAssetClass(symbol: string): string {
  if (!symbol) {
    return 'unknown';
  }

  const upperSymbol = symbol.toUpperCase();

  // Forex majors
  if (['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD'].includes(upperSymbol)) {
    return 'forex_major';
  }

  // Crypto
  if (['BTCUSD', 'ETHUSD', 'LTCUSD', 'XRPUSD'].includes(upperSymbol)) {
    return 'crypto';
  }

  // Indices
  if (['US500', 'US100', 'UK100', 'GER40', 'JPN225'].includes(upperSymbol)) {
    return 'index';
  }

  // Commodities
  if (['XAUUSD', 'WTIUSD', 'BRENTUSD', 'NATGAS'].includes(upperSymbol)) {
    return 'commodity';
  }

  // Default to stock
  return 'stock';
}

/**
 * Create risk alert for violated threshold
 * @param userId - User ID
 * @param type - Threshold type
 * @param currentValue - Current metric value
 * @param threshold - Threshold value
 * @returns Risk alert object
 */
export function createRiskAlert(
  userId: string,
  type: RiskThresholdType,
  currentValue: number,
  threshold: number
): RiskAlert {
  const exceedancePercentage = Math.abs(
    ((currentValue - threshold) / threshold) * 100
  );

  return {
    id: `alert-${Date.now()}`,
    userId,
    type,
    currentValue,
    threshold,
    exceedancePercentage,
    status: exceedancePercentage > 10 ? RiskStatus.CRITICAL : RiskStatus.WARNING,
    createdAt: new Date().toISOString()
  };
}

/**
 * Format risk status for display
 * @param status - Risk status enum
 * @returns Formatted string
 */
export function formatRiskStatus(status: RiskStatus): string {
  const labels: Record<RiskStatus, string> = {
    [RiskStatus.SAFE]: 'Safe',
    [RiskStatus.WARNING]: 'Warning',
    [RiskStatus.CRITICAL]: 'Critical',
    [RiskStatus.MONITOR]: 'Monitor'
  };
  return labels[status] || 'Unknown';
}

/**
 * Get risk status color for UI display
 * @param status - Risk status enum
 * @returns Hex color code
 */
export function getRiskStatusColor(status: RiskStatus): string {
  const colors: Record<RiskStatus, string> = {
    [RiskStatus.SAFE]: '#10b981',      // Green
    [RiskStatus.WARNING]: '#f59e0b',   // Amber
    [RiskStatus.CRITICAL]: '#ef4444',  // Red
    [RiskStatus.MONITOR]: '#3b82f6'    // Blue
  };
  return colors[status] || '#6b7280';
}
