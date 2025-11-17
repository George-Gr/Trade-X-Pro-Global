/**
 * Portfolio Metrics Calculation Engine
 * Comprehensive portfolio performance and risk metrics
 *
 * Provides calculations for:
 * - Profit/loss metrics (realized, unrealized, net)
 * - Win rate and profit factor
 * - Drawdown analysis
 * - Return on investment (ROI)
 * - Asset class breakdown
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PortfolioMetrics {
  totalCapital: number;
  currentEquity: number;
  totalRealizedPnL: number;
  totalUnrealizedPnL: number;
  totalPnL: number;
  totalPnLPercentage: number;
  roi: number;
  profitableTrades: number;
  losingTrades: number;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
  averageWin: number;
  averageLoss: number;
  expectancy: number;
  drawdown: number;
  maxDrawdown: number;
  recoveryFactor: number;
}

export interface DrawdownAnalysis {
  currentDrawdown: number;
  maxDrawdown: number;
  drawdownPercentage: number;
  maxDrawdownPercentage: number;
  recoveryTime?: number; // in days
  peakEquity: number;
  troughEquity: number;
  isRecovering: boolean;
}

export interface AssetClassMetrics {
  [assetClass: string]: {
    positions: number;
    totalValue: number;
    unrealizedPnL: number;
    percentageOfPortfolio: number;
    pnlPercentage: number;
  };
}

export interface TradeStatistics {
  totalTrades: number;
  profitableTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  totalProfit: number;
  totalLoss: number;
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  riskRewardRatio: number;
}

export interface PerformanceTrend {
  date: string;
  equity: number;
  dailyPnL: number;
  cumulativePnL: number;
  drawdown: number;
}

// ============================================================================
// PROFIT/LOSS CALCULATIONS
// ============================================================================

/**
 * Calculate total profit and loss
 *
 * @param realizedPnL - Realized profit/loss from closed positions
 * @param unrealizedPnL - Unrealized profit/loss from open positions
 * @returns Total P&L
 */
export function calculateTotalPnL(realizedPnL: number, unrealizedPnL: number): number {
  const total = realizedPnL + unrealizedPnL;
  return Math.round(total * 100) / 100;
}

/**
 * Calculate P&L percentage
 *
 * @param pnl - Total P&L amount
 * @param initialCapital - Initial capital
 * @returns P&L as percentage
 */
export function calculatePnLPercentage(pnl: number, initialCapital: number): number {
  if (initialCapital === 0) return 0;
  return Math.round((pnl / initialCapital) * 100 * 100) / 100;
}

/**
 * Calculate return on investment (ROI)
 *
 * @param pnl - Profit/loss amount
 * @param capitalInvested - Capital invested
 * @returns ROI as percentage
 */
export function calculateROI(pnl: number, capitalInvested: number): number {
  if (capitalInvested === 0) return 0;
  return Math.round((pnl / capitalInvested) * 100 * 100) / 100;
}

// ============================================================================
// TRADE STATISTICS
// ============================================================================

/**
 * Calculate win rate from trades
 *
 * @param profitableTrades - Number of profitable trades
 * @param totalTrades - Total number of trades
 * @returns Win rate as percentage (0-100)
 */
export function calculateWinRate(profitableTrades: number, totalTrades: number): number {
  if (totalTrades === 0) return 0;
  return Math.round((profitableTrades / totalTrades) * 100 * 100) / 100;
}

/**
 * Calculate profit factor
 * Profit Factor = Gross Profit / Gross Loss
 *
 * @param totalProfit - Sum of all profitable trades
 * @param totalLoss - Sum of all losses (absolute value)
 * @returns Profit factor (typically > 1.5 is good)
 */
export function calculateProfitFactor(totalProfit: number, totalLoss: number): number {
  if (totalLoss === 0) {
    return totalProfit > 0 ? 999.99 : 0; // Max out at 999.99 if no losses
  }
  const factor = totalProfit / Math.abs(totalLoss);
  return Math.round(factor * 100) / 100;
}

/**
 * Calculate average win
 *
 * @param totalProfit - Sum of all profits
 * @param profitableTrades - Number of profitable trades
 * @returns Average win amount
 */
export function calculateAverageWin(totalProfit: number, profitableTrades: number): number {
  if (profitableTrades === 0) return 0;
  return Math.round((totalProfit / profitableTrades) * 100) / 100;
}

/**
 * Calculate average loss
 *
 * @param totalLoss - Sum of all losses (absolute value)
 * @param losingTrades - Number of losing trades
 * @returns Average loss amount
 */
export function calculateAverageLoss(totalLoss: number, losingTrades: number): number {
  if (losingTrades === 0) return 0;
  return Math.round((totalLoss / losingTrades) * 100) / 100;
}

/**
 * Calculate risk-reward ratio
 *
 * @param averageWin - Average winning trade
 * @param averageLoss - Average losing trade
 * @returns Risk-reward ratio
 */
export function calculateRiskRewardRatio(averageWin: number, averageLoss: number): number {
  if (averageLoss === 0) return 0;
  const ratio = Math.abs(averageWin / averageLoss);
  return Math.round(ratio * 100) / 100;
}

/**
 * Calculate expectancy (expected value per trade)
 *
 * @param winRate - Win rate percentage (0-100)
 * @param averageWin - Average winning trade
 * @param averageLoss - Average losing trade
 * @returns Expected value per trade
 */
export function calculateExpectancy(
  winRate: number,
  averageWin: number,
  averageLoss: number
): number {
  const winProbability = winRate / 100;
  const lossProbability = 1 - winProbability;
  const expectancy = winProbability * averageWin - lossProbability * Math.abs(averageLoss);
  return Math.round(expectancy * 100) / 100;
}

// ============================================================================
// DRAWDOWN ANALYSIS
// ============================================================================

/**
 * Calculate drawdown from peak
 *
 * @param currentEquity - Current account equity
 * @param peakEquity - Highest equity reached
 * @returns Drawdown amount
 */
export function calculateDrawdown(currentEquity: number, peakEquity: number): number {
  if (peakEquity === 0) return 0;
  const drawdown = peakEquity - currentEquity;
  return Math.round(Math.max(drawdown, 0) * 100) / 100;
}

/**
 * Calculate drawdown percentage
 *
 * @param currentEquity - Current account equity
 * @param peakEquity - Highest equity reached
 * @returns Drawdown as percentage
 */
export function calculateDrawdownPercentage(currentEquity: number, peakEquity: number): number {
  if (peakEquity === 0) return 0;
  const drawdownPercentage = ((peakEquity - currentEquity) / peakEquity) * 100;
  return Math.round(Math.max(drawdownPercentage, 0) * 100) / 100;
}

/**
 * Calculate max drawdown from performance history
 *
 * @param equityHistory - Array of equity values over time
 * @returns Maximum drawdown and related metrics
 */
export function calculateMaxDrawdown(equityHistory: number[]): {
  maxDrawdown: number;
  maxDrawdownPercentage: number;
  peakEquity: number;
  troughEquity: number;
} {
  if (equityHistory.length === 0) {
    return { maxDrawdown: 0, maxDrawdownPercentage: 0, peakEquity: 0, troughEquity: 0 };
  }

  let peak = equityHistory[0];
  let maxDrawdown = 0;
  let peakEquity = equityHistory[0];
  let troughEquity = equityHistory[0];

  for (const equity of equityHistory) {
    if (equity > peak) {
      peak = equity;
      peakEquity = equity;
    }

    const drawdown = peak - equity;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
      troughEquity = equity;
    }
  }

  const maxDrawdownPercentage = peakEquity > 0
    ? (maxDrawdown / peakEquity) * 100
    : 0;

  return {
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    maxDrawdownPercentage: Math.round(maxDrawdownPercentage * 100) / 100,
    peakEquity,
    troughEquity,
  };
}

/**
 * Calculate recovery factor
 * Recovery Factor = Net Profit / Max Drawdown
 *
 * @param netProfit - Total net profit
 * @param maxDrawdown - Maximum drawdown
 * @returns Recovery factor
 */
export function calculateRecoveryFactor(netProfit: number, maxDrawdown: number): number {
  if (maxDrawdown === 0) {
    return netProfit > 0 ? 999.99 : 0;
  }
  const factor = Math.abs(netProfit) / maxDrawdown;
  return Math.round(factor * 100) / 100;
}

/**
 * Analyze drawdown details
 *
 * @param currentEquity - Current equity
 * @param peakEquity - Peak equity
 * @param maxDrawdown - Maximum drawdown amount
 * @param equityHistory - History of equity values
 * @returns Drawdown analysis
 */
export function analyzeDrawdown(
  currentEquity: number,
  peakEquity: number,
  maxDrawdown: number,
  equityHistory: number[] = []
): DrawdownAnalysis {
  const currentDrawdown = calculateDrawdown(currentEquity, peakEquity);
  const currentDrawdownPercentage = calculateDrawdownPercentage(currentEquity, peakEquity);
  const maxDrawdownPercentage = calculateDrawdownPercentage(peakEquity - maxDrawdown, peakEquity);

  return {
    currentDrawdown: Math.round(currentDrawdown * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    drawdownPercentage: Math.round(currentDrawdownPercentage * 100) / 100,
    maxDrawdownPercentage: Math.round(maxDrawdownPercentage * 100) / 100,
    peakEquity,
    troughEquity: peakEquity - maxDrawdown,
    isRecovering: currentEquity > (peakEquity - maxDrawdown),
  };
}

// ============================================================================
// ASSET CLASS ANALYSIS
// ============================================================================

/**
 * Breakdown portfolio by asset class
 *
 * @param positions - Array of positions with asset classes
 * @param totalPortfolioValue - Total portfolio value
 * @returns Metrics by asset class
 */
export function breakdownByAssetClass(
  positions: Array<{
    symbol: string;
    assetClass?: string;
    quantity: number;
    currentPrice: number;
    unrealizedPnL: number;
  }>,
  totalPortfolioValue: number
): AssetClassMetrics {
  const breakdown: AssetClassMetrics = {};

  for (const position of positions) {
    const assetClass = position.assetClass || 'Other';
    const positionValue = position.quantity * position.currentPrice;

    if (!breakdown[assetClass]) {
      breakdown[assetClass] = {
        positions: 0,
        totalValue: 0,
        unrealizedPnL: 0,
        percentageOfPortfolio: 0,
        pnlPercentage: 0,
      };
    }

    breakdown[assetClass].positions += 1;
    breakdown[assetClass].totalValue += positionValue;
    breakdown[assetClass].unrealizedPnL += position.unrealizedPnL;
  }

  // Calculate percentages
  for (const assetClass in breakdown) {
    const data = breakdown[assetClass];
    data.percentageOfPortfolio = totalPortfolioValue > 0
      ? Math.round((data.totalValue / totalPortfolioValue) * 100 * 100) / 100
      : 0;
    data.pnlPercentage = data.totalValue > 0
      ? Math.round((data.unrealizedPnL / data.totalValue) * 100 * 100) / 100
      : 0;
  }

  return breakdown;
}

// ============================================================================
// COMPREHENSIVE PORTFOLIO METRICS
// ============================================================================

/**
 * Calculate comprehensive portfolio metrics
 *
 * @param equity - Current account equity
 * @param initialCapital - Initial capital invested
 * @param realizedPnL - Realized profit/loss
 * @param unrealizedPnL - Unrealized profit/loss
 * @param trades - Array of closed trades with P&L
 * @param equityHistory - History of equity values
 * @returns Complete portfolio metrics
 */
export function calculatePortfolioMetrics(
  equity: number,
  initialCapital: number,
  realizedPnL: number,
  unrealizedPnL: number,
  trades: Array<{ pnl: number; isProfit: boolean }> = [],
  equityHistory: number[] = []
): PortfolioMetrics {
  const totalPnL = calculateTotalPnL(realizedPnL, unrealizedPnL);
  const totalPnLPercentage = calculatePnLPercentage(totalPnL, initialCapital);
  const roi = calculateROI(totalPnL, initialCapital);

  // Calculate trade statistics
  const profitableTrades = trades.filter(t => t.isProfit).length;
  const losingTrades = trades.filter(t => !t.isProfit && t.pnl !== 0).length;
  const totalTrades = trades.length;
  const winRate = calculateWinRate(profitableTrades, totalTrades);

  const totalProfit = trades
    .filter(t => t.isProfit)
    .reduce((sum, t) => sum + Math.abs(t.pnl), 0);
  const totalLoss = trades
    .filter(t => !t.isProfit)
    .reduce((sum, t) => sum + Math.abs(t.pnl), 0);
  const profitFactor = calculateProfitFactor(totalProfit, totalLoss);

  const averageWin = calculateAverageWin(totalProfit, profitableTrades);
  const averageLoss = calculateAverageLoss(totalLoss, losingTrades);
  const expectancy = calculateExpectancy(winRate, averageWin, averageLoss);

  const largestWin = trades
    .filter(t => t.isProfit)
    .reduce((max, t) => Math.max(max, t.pnl), 0);
  const largestLoss = trades
    .filter(t => !t.isProfit)
    .reduce((min, t) => Math.min(min, t.pnl), 0);

  const maxDrawdownData = calculateMaxDrawdown(equityHistory);
  const recoveryFactor = calculateRecoveryFactor(totalPnL, maxDrawdownData.maxDrawdown);

  const currentDrawdown = calculateDrawdown(equity, maxDrawdownData.peakEquity);

  return {
    totalCapital: initialCapital,
    currentEquity: equity,
    totalRealizedPnL: Math.round(realizedPnL * 100) / 100,
    totalUnrealizedPnL: Math.round(unrealizedPnL * 100) / 100,
    totalPnL: Math.round(totalPnL * 100) / 100,
    totalPnLPercentage,
    roi,
    profitableTrades,
    losingTrades,
    totalTrades,
    winRate,
    profitFactor,
    largestWin: Math.round(largestWin * 100) / 100,
    largestLoss: Math.round(largestLoss * 100) / 100,
    averageWin,
    averageLoss,
    expectancy,
    drawdown: currentDrawdown,
    maxDrawdown: maxDrawdownData.maxDrawdown,
    recoveryFactor,
  };
}

/**
 * Format trade statistics for display
 *
 * @param stats - Trade statistics
 * @returns Formatted statistics object
 */
export function formatTradeStatistics(stats: Partial<PortfolioMetrics>) {
  return {
    totalTrades: stats.totalTrades || 0,
    profitableTrades: stats.profitableTrades || 0,
    losingTrades: stats.losingTrades || 0,
    winRate: `${(stats.winRate || 0).toFixed(2)}%`,
    profitFactor: (stats.profitFactor || 0).toFixed(2),
    largestWin: `$${(stats.largestWin || 0).toFixed(2)}`,
    largestLoss: `$${(stats.largestLoss || 0).toFixed(2)}`,
    averageWin: `$${(stats.averageWin || 0).toFixed(2)}`,
    averageLoss: `$${(stats.averageLoss || 0).toFixed(2)}`,
    roi: `${(stats.roi || 0).toFixed(2)}%`,
  };
}
