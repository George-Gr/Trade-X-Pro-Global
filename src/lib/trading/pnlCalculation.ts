/**
 * P&L Calculation Engine
 * Comprehensive profit/loss calculations for all position types (long/short)
 * across asset classes with real-time price updates and precise decimal handling.
 *
 * All calculations use 4 decimal precision to match trading system accuracy.
 */

import { z } from 'zod';

// ============================================================================
// TYPE DEFINITIONS & SCHEMAS
// ============================================================================

/**
 * Result of a single P&L calculation
 */
export interface PnLResult {
  pnl: number;
  pnlPercentage: number;
  isProfit: boolean;
  isBreakeven: boolean;
}

/**
 * Comprehensive P&L details for a single position
 */
export interface PositionPnLDetails {
  positionId: string;
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercentage: number;
  positionValue: number;
  marginRequired: number;
  marginLevel: number;
  liquidationPrice?: number | null;
  roi: number;
  status: 'profit' | 'loss' | 'breakeven';
}

/**
 * Portfolio-level P&L aggregation
 */
export interface PortfolioPnLSummary {
  totalUnrealizedPnL: number;
  totalRealizedPnL: number;
  grossPnL: number;
  netPnL: number;
  pnlPercentage: number;
  roi: number;
  positionCount: number;
  profitablePositions: number;
  losingPositions: number;
  breakevenPositions: number;
  winRate: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
}

/**
 * Daily P&L breakdown by date
 */
export interface DailyPnLBreakdown {
  date: Date;
  dailyPnL: number;
  tradesCount: number;
  winCount: number;
  lossCount: number;
  winRate: number;
  largestWin: number;
  largestLoss: number;
}

/**
 * P&L grouped by asset class
 */
export interface PnLByAssetClass {
  [assetClass: string]: {
    unrealizedPnL: number;
    realizedPnL: number;
    grossPnL: number;
    positionCount: number;
    pnlPercentage: number;
  };
}

/**
 * Running P&L over a time period
 */
export interface RunningPnLMetrics {
  startDate: Date;
  endDate: Date;
  totalTrades: number;
  totalPnL: number;
  dailyMetrics: DailyPnLBreakdown[];
  cumulativePnL: number[];
  maxDrawdown: number;
  averageTradePnL: number;
}

/**
 * Win/Loss statistics
 */
export interface WinLossStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  profitFactor: number;
}

/**
 * Position data for P&L calculation
 */
export interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  marginRequired?: number;
  assetClass?: string;
}

/**
 * Order fill data
 */
export interface OrderFill {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  executionPrice: number;
  commission?: number;
  slippage?: number;
  timestamp: Date;
  positionId?: string;
}

// ============================================================================
// CORE P&L CALCULATIONS
// ============================================================================

/**
 * Calculate unrealized P&L for a position
 * Unrealized P&L = (Current Price - Entry Price) × Quantity (long)
 * Unrealized P&L = (Entry Price - Current Price) × Quantity (short)
 *
 * @param entry - Entry price of the position
 * @param current - Current market price
 * @param qty - Position quantity
 * @param side - Position side ('long' or 'short')
 * @returns PnLResult with P&L and percentage
 */
export function calculateUnrealizedPnL(
  entry: number,
  current: number,
  qty: number,
  side: 'long' | 'short'
): PnLResult {
  if (qty === 0) {
    return {
      pnl: 0,
      pnlPercentage: 0,
      isProfit: false,
      isBreakeven: true,
    };
  }

  let pnl: number;

  if (side === 'long') {
    // Long: profit when price goes up
    pnl = (current - entry) * qty;
  } else {
    // Short: profit when price goes down
    pnl = (entry - current) * qty;
  }

  // Round to 4 decimal places
  pnl = Math.round(pnl * 10000) / 10000;

  // Calculate percentage
  const baseCost = Math.abs(entry * qty);
  const pnlPercentage =
    baseCost > 0
      ? Math.round((pnl / baseCost) * 100 * 10000) / 10000
      : 0;

  return {
    pnl,
    pnlPercentage,
    isProfit: pnl > 0,
    isBreakeven: pnl === 0,
  };
}

/**
 * Calculate realized P&L for a closed position
 * Realized P&L = (Exit Price - Entry Price) × Quantity (long)
 * Realized P&L = (Entry Price - Exit Price) × Quantity (short)
 *
 * @param entry - Entry price
 * @param exit - Exit price
 * @param qty - Position quantity
 * @param side - Position side ('long' or 'short')
 * @returns PnLResult with realized P&L and percentage
 */
export function calculateRealizedPnL(
  entry: number,
  exit: number,
  qty: number,
  side: 'long' | 'short'
): PnLResult {
  if (qty === 0) {
    return {
      pnl: 0,
      pnlPercentage: 0,
      isProfit: false,
      isBreakeven: true,
    };
  }

  let pnl: number;

  if (side === 'long') {
    // Long: profit when exit > entry
    pnl = (exit - entry) * qty;
  } else {
    // Short: profit when entry > exit
    pnl = (entry - exit) * qty;
  }

  // Round to 4 decimal places
  pnl = Math.round(pnl * 10000) / 10000;

  // Calculate percentage
  const baseCost = Math.abs(entry * qty);
  const pnlPercentage =
    baseCost > 0
      ? Math.round((pnl / baseCost) * 100 * 10000) / 10000
      : 0;

  return {
    pnl,
    pnlPercentage,
    isProfit: pnl > 0,
    isBreakeven: pnl === 0,
  };
}

/**
 * Calculate P&L percentage
 * PL% = (UPL / (Entry Price × Quantity)) × 100
 *
 * @param pnl - Absolute P&L amount
 * @param baseCost - Base cost (entry price × quantity)
 * @returns Percentage value, rounded to 4 decimals
 */
export function calculatePnLPercentage(
  pnl: number,
  baseCost: number
): number {
  if (baseCost === 0) return 0;
  const percentage = (pnl / Math.abs(baseCost)) * 100;
  return Math.round(percentage * 10000) / 10000;
}

/**
 * Calculate Return on Investment (ROI)
 * ROI = (Net P&L / Initial Margin Required) × 100%
 *
 * @param netPnL - Net profit/loss after commissions and slippage
 * @param initialMargin - Margin required to open the position
 * @returns ROI percentage, rounded to 4 decimals
 */
export function calculateROI(
  netPnL: number,
  initialMargin: number
): number {
  if (initialMargin === 0) return 0;
  const roi = (netPnL / initialMargin) * 100;
  return Math.round(roi * 10000) / 10000;
}

// ============================================================================
// POSITION-LEVEL CALCULATIONS
// ============================================================================

/**
 * Calculate comprehensive P&L details for a single position
 *
 * @param position - Position data
 * @param currentPrice - Current market price
 * @param commission - Optional commission paid
 * @param slippage - Optional slippage loss
 * @param marginRequired - Optional margin required
 * @returns Detailed P&L breakdown for the position
 */
export function calculatePositionPnL(
  position: Position,
  currentPrice: number,
  commission: number = 0,
  slippage: number = 0,
  marginRequired: number = 0
): PositionPnLDetails {
  const unrealizedResult = calculateUnrealizedPnL(
    position.entryPrice,
    currentPrice,
    position.quantity,
    position.side as 'long' | 'short'
  );

  // Calculate net P&L after costs
  const netPnL = unrealizedResult.pnl - commission - slippage;
  const roi =
    marginRequired > 0 ? calculateROI(netPnL, marginRequired) : 0;

  // Position value (current price × quantity)
  const positionValue = currentPrice * position.quantity;

  // Simple liquidation price estimation (would use margin calculations in production)
  // LP = Entry Price ± (Entry Price × Leverage × (1 - Maintenance Margin Ratio))
  // For now, using a simple calculation
  const liquidationPrice =
    position.side === 'long'
      ? position.entryPrice * 0.5 // Simplified: 50% drop
      : position.entryPrice * 1.5; // Simplified: 50% rise

  return {
    positionId: position.id,
    symbol: position.symbol,
    side: position.side as 'long' | 'short',
    quantity: position.quantity,
    entryPrice: position.entryPrice,
    currentPrice,
    unrealizedPnL: unrealizedResult.pnl,
    unrealizedPnLPercentage: unrealizedResult.pnlPercentage,
    positionValue: Math.round(positionValue * 10000) / 10000,
    marginRequired,
    marginLevel: marginRequired > 0 ? position.quantity * currentPrice / marginRequired : 0,
    liquidationPrice: Math.round(liquidationPrice * 10000) / 10000,
    roi,
    status: unrealizedResult.isProfit ? 'profit' : unrealizedResult.isBreakeven ? 'breakeven' : 'loss',
  };
}

// ============================================================================
// AGGREGATION FUNCTIONS
// ============================================================================

/**
 * Calculate portfolio-level P&L summary
 * Aggregates P&L from all positions and closed trades
 *
 * @param positions - Array of open positions
 * @param prices - Map of symbol to current price
 * @param closedTrades - Optional array of closed trades
 * @returns Portfolio P&L summary
 */
export function calculatePortfolioPnL(
  positions: Position[],
  prices: Map<string, number>,
  closedTrades: OrderFill[] = []
): PortfolioPnLSummary {
  let totalUnrealizedPnL = 0;
  let profitableCount = 0;
  let losingCount = 0;
  let breakevenCount = 0;
  const realizedPnLs: number[] = [];

  // Calculate unrealized P&L from open positions
  for (const position of positions) {
    const currentPrice = prices.get(position.symbol) || position.currentPrice;
    const result = calculateUnrealizedPnL(
      position.entryPrice,
      currentPrice,
      position.quantity,
      position.side as 'long' | 'short'
    );

    totalUnrealizedPnL += result.pnl;

    if (result.isProfit) profitableCount++;
    else if (result.isBreakeven) breakevenCount++;
    else losingCount++;
  }

  // Calculate realized P&L from closed trades
  let totalRealizedPnL = 0;
  for (const trade of closedTrades) {
    // Group fills by position to calculate realized P&L
    // Simplified: assume buy then sell
    if (trade.side === 'sell') {
      totalRealizedPnL += trade.executionPrice * trade.quantity;
    } else {
      totalRealizedPnL -= trade.executionPrice * trade.quantity;
    }
    realizedPnLs.push(totalRealizedPnL);
  }

  const grossPnL = totalUnrealizedPnL + totalRealizedPnL;
  const netPnL = grossPnL; // Simplified, would subtract total commissions

  // Calculate win statistics
  const profitingPnLs = realizedPnLs.filter((p) => p > 0);
  const losingPnLs = realizedPnLs.filter((p) => p < 0);
  const profitFactor =
    losingPnLs.length > 0 && losingPnLs.some((p) => p !== 0)
      ? profitingPnLs.reduce((a, b) => a + b, 0) /
        Math.abs(losingPnLs.reduce((a, b) => a + b, 0))
      : 0;

  const largestWin = Math.max(...profitingPnLs, 0);
  const largestLoss = Math.min(...losingPnLs, 0);

  return {
    totalUnrealizedPnL: Math.round(totalUnrealizedPnL * 10000) / 10000,
    totalRealizedPnL: Math.round(totalRealizedPnL * 10000) / 10000,
    grossPnL: Math.round(grossPnL * 10000) / 10000,
    netPnL: Math.round(netPnL * 10000) / 10000,
    pnlPercentage:
      positions.length > 0
        ? Math.round(
            (netPnL /
              positions.reduce((sum, p) => sum + p.entryPrice * p.quantity, 0)) *
              100 *
              10000
          ) / 10000
        : 0,
    roi: 0, // Would calculate based on margin
    positionCount: positions.length,
    profitablePositions: profitableCount,
    losingPositions: losingCount,
    breakevenPositions: breakevenCount,
    winRate:
      positions.length > 0
        ? Math.round(
            (profitableCount / positions.length) * 100 * 10000
          ) / 10000
        : 0,
    profitFactor: Math.round(profitFactor * 10000) / 10000,
    largestWin: Math.round(largestWin * 10000) / 10000,
    largestLoss: Math.round(largestLoss * 10000) / 10000,
  };
}

/**
 * Calculate daily P&L breakdown
 * Aggregates P&L by trading date
 *
 * @param fills - Array of order fills
 * @returns Daily P&L metrics
 */
export function calculateDailyPnL(fills: OrderFill[]): DailyPnLBreakdown[] {
  const dailyMap = new Map<string, OrderFill[]>();

  // Group fills by date
  for (const fill of fills) {
    const dateKey = fill.timestamp.toISOString().split('T')[0];
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, []);
    }
    dailyMap.get(dateKey)!.push(fill);
  }

  const dailyMetrics: DailyPnLBreakdown[] = [];

  for (const [dateKey, dayFills] of dailyMap.entries()) {
    let dailyPnL = 0;
    let winCount = 0;
    let lossCount = 0;
    const dayPnLs: number[] = [];

    // Calculate P&L for each trade
    for (let i = 0; i < dayFills.length - 1; i++) {
      const buy = dayFills[i];
      const sell = dayFills[i + 1];

      if (buy.side === 'buy' && sell.side === 'sell') {
        const tradePnL =
          sell.quantity * sell.executionPrice -
          buy.quantity * buy.executionPrice -
          (buy.commission || 0) -
          (sell.commission || 0);

        dailyPnL += tradePnL;
        dayPnLs.push(tradePnL);

        if (tradePnL > 0) winCount++;
        else if (tradePnL < 0) lossCount++;
      }
    }

    dailyMetrics.push({
      date: new Date(dateKey),
      dailyPnL: Math.round(dailyPnL * 10000) / 10000,
      tradesCount: dayFills.length,
      winCount,
      lossCount,
      winRate:
        dayFills.length > 0
          ? Math.round((winCount / dayFills.length) * 100 * 10000) / 10000
          : 0,
      largestWin: Math.max(...dayPnLs, 0),
      largestLoss: Math.min(...dayPnLs, 0),
    });
  }

  return dailyMetrics.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Calculate P&L aggregated by asset class
 *
 * @param positions - Array of positions
 * @param prices - Map of symbol to current price
 * @returns P&L by asset class
 */
export function calculatePnLByAssetClass(
  positions: Position[],
  prices: Map<string, number>
): PnLByAssetClass {
  const result: PnLByAssetClass = {};

  for (const position of positions) {
    const assetClass = position.assetClass || 'Unknown';
    const currentPrice = prices.get(position.symbol) || position.currentPrice;

    const unrealizedResult = calculateUnrealizedPnL(
      position.entryPrice,
      currentPrice,
      position.quantity,
      position.side as 'long' | 'short'
    );

    if (!result[assetClass]) {
      result[assetClass] = {
        unrealizedPnL: 0,
        realizedPnL: 0,
        grossPnL: 0,
        positionCount: 0,
        pnlPercentage: 0,
      };
    }

    result[assetClass].unrealizedPnL += unrealizedResult.pnl;
    result[assetClass].grossPnL += unrealizedResult.pnl;
    result[assetClass].positionCount += 1;
    result[assetClass].pnlPercentage = calculatePnLPercentage(
      result[assetClass].grossPnL,
      position.entryPrice * position.quantity
    );
  }

  // Round all values to 4 decimals
  for (const assetClass of Object.keys(result)) {
    result[assetClass].unrealizedPnL =
      Math.round(result[assetClass].unrealizedPnL * 10000) / 10000;
    result[assetClass].realizedPnL =
      Math.round(result[assetClass].realizedPnL * 10000) / 10000;
    result[assetClass].grossPnL =
      Math.round(result[assetClass].grossPnL * 10000) / 10000;
    result[assetClass].pnlPercentage =
      Math.round(result[assetClass].pnlPercentage * 10000) / 10000;
  }

  return result;
}

/**
 * Calculate running P&L over a time period
 *
 * @param fills - Array of order fills
 * @param start - Start date
 * @param end - End date
 * @returns Running P&L metrics
 */
export function calculateRunningPnL(
  fills: OrderFill[],
  start: Date,
  end: Date
): RunningPnLMetrics {
  const filteredFills = fills.filter(
    (f) => f.timestamp >= start && f.timestamp <= end
  );

  const dailyMetrics = calculateDailyPnL(filteredFills);
  const cumulativePnL: number[] = [];
  let cumulative = 0;

  for (const daily of dailyMetrics) {
    cumulative += daily.dailyPnL;
    cumulativePnL.push(Math.round(cumulative * 10000) / 10000);
  }

  // Calculate max drawdown
  let maxDrawdown = 0;
  let peak = 0;
  for (const pnl of cumulativePnL) {
    if (pnl > peak) peak = pnl;
    const drawdown = peak - pnl;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  const totalPnL = cumulativePnL[cumulativePnL.length - 1] || 0;
  const avgTrade =
    filteredFills.length > 0 ? totalPnL / (filteredFills.length / 2) : 0;

  return {
    startDate: start,
    endDate: end,
    totalTrades: filteredFills.length,
    totalPnL: Math.round(totalPnL * 10000) / 10000,
    dailyMetrics,
    cumulativePnL,
    maxDrawdown: Math.round(maxDrawdown * 10000) / 10000,
    averageTradePnL: Math.round(avgTrade * 10000) / 10000,
  };
}

// ============================================================================
// WIN/LOSS STATISTICS
// ============================================================================

/**
 * Calculate win/loss statistics from closed trades
 *
 * @param fills - Array of order fills
 * @returns Win/loss statistics
 */
export function getWinLossStats(fills: OrderFill[]): WinLossStats {
  const trades: number[] = [];
  let totalPnL = 0;
  let winCount = 0;
  let lossCount = 0;
  let breakevenCount = 0;

  // Pair up buy and sell orders
  for (let i = 0; i < fills.length - 1; i++) {
    const buy = fills[i];
    const sell = fills[i + 1];

    if (buy.side === 'buy' && sell.side === 'sell') {
      const tradePnL =
        sell.quantity * sell.executionPrice -
        buy.quantity * buy.executionPrice -
        (buy.commission || 0) -
        (sell.commission || 0);

      trades.push(tradePnL);
      totalPnL += tradePnL;

      if (tradePnL > 0) winCount++;
      else if (tradePnL < 0) lossCount++;
      else breakevenCount++;
    }
  }

  const winningTrades = trades.filter((t) => t > 0);
  const losingTrades = trades.filter((t) => t < 0);

  const avgWin = winningTrades.length > 0
    ? winningTrades.reduce((a, b) => a + b, 0) / winningTrades.length
    : 0;

  const avgLoss = losingTrades.length > 0
    ? losingTrades.reduce((a, b) => a + b, 0) / losingTrades.length
    : 0;

  const profitFactor =
    Math.abs(avgLoss) > 0
      ? winningTrades.reduce((a, b) => a + b, 0) /
        Math.abs(losingTrades.reduce((a, b) => a + b, 0))
      : 0;

  return {
    totalTrades: trades.length,
    winningTrades: winCount,
    losingTrades: lossCount,
    breakevenTrades: breakevenCount,
    winRate:
      trades.length > 0
        ? Math.round((winCount / trades.length) * 100 * 10000) / 10000
        : 0,
    averageWin: Math.round(avgWin * 10000) / 10000,
    averageLoss: Math.round(avgLoss * 10000) / 10000,
    largestWin: Math.max(...winningTrades, 0),
    largestLoss: Math.min(...losingTrades, 0),
    profitFactor: Math.round(profitFactor * 10000) / 10000,
  };
}

// ============================================================================
// FORMATTING & UTILITY FUNCTIONS
// ============================================================================

/**
 * Format P&L value as string with currency
 *
 * @param pnl - P&L value
 * @param currency - Optional currency code (default: USD)
 * @returns Formatted P&L string
 */
export function formatPnL(pnl: number, currency: string = 'USD'): string {
  const sign = pnl > 0 ? '+' : pnl < 0 ? '-' : '';
  const currencySymbol = currency === 'USD' ? '$' : currency;
  return `${sign}${currencySymbol}${Math.abs(pnl).toFixed(2)}`;
}

/**
 * Get P&L trend status
 *
 * @param pnl - P&L value
 * @returns Trend status: 'profit', 'loss', or 'breakeven'
 */
export function getPnLTrend(pnl: number): 'profit' | 'loss' | 'breakeven' {
  if (pnl > 0) return 'profit';
  if (pnl < 0) return 'loss';
  return 'breakeven';
}

/**
 * Get P&L icon/indicator
 *
 * @param pnl - P&L value
 * @returns Icon: '+' for profit, '-' for loss, '=' for breakeven
 */
export function getPnLIcon(pnl: number): '+' | '-' | '=' {
  if (pnl > 0) return '+';
  if (pnl < 0) return '-';
  return '=';
}
