export type Position = {
  id: string;
  user_id?: string;
  symbol: string;
  side: "long" | "short";
  quantity: number;
  entry_price: number;
  current_price: number;
  unrealized_pnl?: number;
  margin_used: number;
  margin_level?: number;
  opened_at: Date;
  leverage: number;
  status?: "open" | "closing" | "closed";
  created_at?: string;
  updated_at?: string;
  // optional advanced fields
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
