import * as React from 'react';

export type Position = {
  id: string;
  symbol: string;
  quantity: number;
  entry_price: number;
  current_price: number;
  side: 'long' | 'short';
  opened_at: Date;
  leverage: number;
  margin_used: number;
  risk_reward_ratio?: number;
  stop_loss?: number;
  take_profit?: number;
};

export type PositionMetricsData = {
  totalPositions: number;
  openPositions: number;
  totalMarginUsed: number;
  availableMargin: number;
  marginLevel: number;
  totalUnrealizedPnL: number;
  averageLeverage: number;
};

export function calculateUnrealizedPnL(args: Pick<Position, 'side' | 'quantity' | 'entry_price' | 'current_price'>): number;
export function calculatePnLPercentage(args: Pick<Position, 'entry_price' | 'current_price' | 'leverage'>): number;
export function getPositionColor(args: Pick<Position, 'side' | 'entry_price' | 'current_price'>): string;

export const PositionCard: React.FC<{ position: Position; onClose?: (id: string) => void; onModify?: (id: string) => void; isUpdating?: boolean; isLocked?: boolean }>;
export const PositionMetrics: React.FC<{ metrics: PositionMetricsData }>;
export const PositionsGrid: React.FC<{ positions: Position[]; isLoading?: boolean; error?: Error; onClose?: (id: string) => void; onModify?: (id: string) => void; onRefresh?: () => void; allowMassClose?: boolean }>;
