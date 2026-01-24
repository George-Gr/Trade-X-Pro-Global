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
