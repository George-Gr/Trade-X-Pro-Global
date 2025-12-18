// Extended database types for TradePro

export type AssetClass =
  | "forex"
  | "stock"
  | "commodity"
  | "crypto"
  | "index"
  | "etf"
  | "bond";

export interface AssetSpec {
  symbol: string;
  asset_class: AssetClass;
  min_quantity: number;
  max_quantity: number;
  leverage: number;
  pip_size: number;
  base_commission: number;
  commission_type: "per_lot" | "percentage";
  is_tradable: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  country?: string;
  balance: number;
  equity: number;
  margin_used: number;
  free_margin?: number;
  margin_level?: number;
  kyc_status: "pending" | "approved" | "rejected" | "resubmitted";
  account_status: "active" | "suspended" | "closed";
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  symbol: string;
  order_type: "market" | "limit" | "stop" | "stop_limit";
  side: "buy" | "sell";
  quantity: number;
  price?: number;
  stop_loss?: number;
  take_profit?: number;
  fill_price?: number;
  status: "pending" | "filled" | "partial" | "cancelled" | "rejected";
  commission: number;
  idempotency_key: string;
  created_at: string;
  filled_at?: string;
}

export interface Position {
  id: string;
  user_id: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  entry_price: number;
  current_price?: number;
  unrealized_pnl: number;
  realized_pnl: number;
  margin_used: number;
  status: "open" | "closed";
  opened_at: string;
  closed_at?: string;
}

export interface Fill {
  id: string;
  order_id: string;
  user_id: string;
  symbol: string;
  quantity: number;
  price: number;
  commission: number;
  executed_at: string;
}

export interface PositionLot {
  id: string;
  position_id: string;
  order_id: string;
  fill_id: string;
  user_id: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  remaining_quantity: number;
  entry_price: number;
  commission: number;
  created_at: string;
}

export interface LedgerEntry {
  id: string;
  user_id: string;
  transaction_type:
    | "deposit"
    | "withdrawal"
    | "commission"
    | "profit"
    | "loss"
    | "swap"
    | "adjustment"
    | "realized_pnl";
  amount: number;
  balance_before: number;
  balance_after: number;
  description?: string;
  reference_id?: string;
  created_at: string;
}

export interface KYCDocument {
  id: string;
  user_id: string;
  document_type: string;
  file_path: string;
  status: "pending" | "approved" | "rejected" | "resubmitted";
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}
