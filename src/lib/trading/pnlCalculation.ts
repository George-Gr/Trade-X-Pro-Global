/**
 * P&L Calculation Utilities
 * Provides profit/loss calculations for positions
 */

export interface PnLResult {
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  realizedPnL: number;
  totalPnL: number;
  isProfit: boolean;
}

/**
 * Interface for position data required for P&L calculations.
 * Contains the essential fields needed to compute profit and loss.
 */
export interface PositionForPnL {
  side: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  realizedPnL?: number;
}

export interface PositionPnLDetails {
  positionId: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  unrealizedPnLPercentage: number; // Alias for backward compatibility
  realizedPnL: number;
  totalPnL: number;
  isProfit: boolean;
}

/**
 * Interface for a complete position record.
 * Extends PositionForPnL with additional identifying fields.
 */
export interface Position extends PositionForPnL {
  id: string;
  symbol: string;
}

/**
 * Summary of portfolio P&L metrics across all positions.
 * Provides aggregated profit/loss statistics and position counts.
 */
export interface PortfolioPnLSummary {
  /** Total unrealized P&L across all positions (can be negative) */
  totalUnrealizedPnL: number;
  /** Total realized P&L across all positions (can be negative) */
  totalRealizedPnL: number;
  /** Combined total P&L (unrealized + realized, can be negative) */
  totalPnL: number;
  /** Total number of positions (non-negative integer) */
  totalPositions: number;
  /** Number of positions with positive P&L (non-negative integer) */
  profitablePositions: number;
  /** Number of positions with negative P&L (non-negative integer) */
  losingPositions: number;
  /** Win rate as percentage (0-100, calculated as profitablePositions/totalPositions * 100) */
  winRate: number;
}

/**
 * Calculate unrealized P&L for a position
 */
export function calculateUnrealizedPnL(
  side: 'buy' | 'sell',
  quantity: number,
  entryPrice: number,
  currentPrice: number
): number {
  const priceDiff = currentPrice - entryPrice;
  
  if (side === 'buy') {
    return priceDiff * quantity;
  } else {
    return -priceDiff * quantity;
  }
}

/**
 * Calculate P&L percentage
 */
export function calculatePnLPercent(
  entryPrice: number,
  currentPrice: number,
  side: 'buy' | 'sell'
): number {
  if (entryPrice === 0) return 0;
  
  const priceDiff = currentPrice - entryPrice;
  const percentChange = (priceDiff / entryPrice) * 100;
  
  return side === 'buy' ? percentChange : -percentChange;
}

/**
 * Alias for calculatePnLPercent for backward compatibility
 */
export const calculatePnLPercentage = calculatePnLPercent;

/**
 * Calculate ROI (Return on Investment)
 */
export function calculateROI(pnl: number, investment: number): number {
  if (investment === 0) return 0;
  return (pnl / investment) * 100;
}

/**
 * Calculate complete P&L for a position
 */
export function calculatePositionPnL(position: PositionForPnL): PnLResult {
  const unrealizedPnL = calculateUnrealizedPnL(
    position.side,
    position.quantity,
    position.entryPrice,
    position.currentPrice
  );
  
  const unrealizedPnLPercent = calculatePnLPercent(
    position.entryPrice,
    position.currentPrice,
    position.side
  );
  
  const realizedPnL = position.realizedPnL ?? 0;
  const totalPnL = unrealizedPnL + realizedPnL;
  
  return {
    unrealizedPnL,
    unrealizedPnLPercent,
    realizedPnL,
    totalPnL,
    isProfit: totalPnL >= 0,
  };
}

/**
 * Format P&L for display
 */
export function formatPnL(
  value: number,
  options?: { currency?: string; decimals?: number }
): string {
  const { decimals = 2 } = options ?? {};
  const formatted = Math.abs(value).toFixed(decimals);
  const sign = value >= 0 ? '+' : '-';
  
  return `${sign}$${formatted}`;
}

/**
 * Get P&L color class
 */
export function getPnLColorClass(value: number): string {
  if (value > 0) return 'text-green-500';
  if (value < 0) return 'text-red-500';
  return 'text-muted-foreground';
}

export default {
  calculateUnrealizedPnL,
  calculatePnLPercent,
  calculatePositionPnL,
  formatPnL,
  getPnLColorClass,
};
