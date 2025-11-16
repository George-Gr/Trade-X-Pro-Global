/**
 * Position Calculation Utilities
 * 
 * Utility functions for position metrics and calculations.
 * Separated from component to avoid React Fast Refresh issues.
 */

import type { Position } from '@/types/position';

export function calculateUnrealizedPnL({ side, quantity, entry_price, current_price }: Pick<Position, 'side' | 'quantity' | 'entry_price' | 'current_price'>): number {
  if (side === 'long') {
    return +(quantity * (current_price - entry_price)).toFixed(2);
  } else {
    return +(quantity * (entry_price - current_price)).toFixed(2);
  }
}

export function calculatePnLPercentage({ entry_price, current_price, leverage }: Pick<Position, 'entry_price' | 'current_price' | 'leverage'>): number {
  return +(((current_price - entry_price) / entry_price) * 100 * leverage).toFixed(2);
}

export function getPositionColor({ side, entry_price, current_price }: Pick<Position, 'side' | 'entry_price' | 'current_price'>): string {
  const pnl = side === 'long' ? current_price - entry_price : entry_price - current_price;
  if (pnl > 0) return 'green';
  if (pnl < 0) return 'red';
  return 'gray';
}
