import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseBrowserClient";
import { useAuth } from "./useAuth";

/**
 * Represents a closed trade with P&L information
 * @interface TradeHistoryItem
 */
export interface TradeHistoryItem {
  /** Unique position ID */
  id: string;
  /** Trading symbol (e.g., 'EURUSD') */
  symbol: string;
  /** Trade direction */
  side: "buy" | "sell";
  /** Position size in lots */
  quantity: number;
  /** Entry price when position was opened */
  entry_price: number;
  /** Exit price when position was closed */
  exit_price: number;
  /** Profit/loss realized from the trade */
  realized_pnl: number;
  /** Commission paid for the trade */
  commission: number;
  /** Timestamp when position was opened */
  opened_at: string;
  /** Timestamp when position was closed */
  closed_at: string;
  /** Margin used for the position */
  margin_used: number;
}

/**
 * Represents an account ledger entry
 * @interface LedgerEntry
 */
export interface LedgerEntry {
  /** Unique entry ID */
  id: string;
  /** Type of transaction (deposit, withdrawal, commission, profit, loss, etc.) */
  transaction_type: string;
  /** Transaction amount (positive or negative) */
  amount: number;
  /** Account balance before transaction */
  balance_before: number;
  /** Account balance after transaction */
  balance_after: number;
  /** Human-readable description */
  description: string;
  /** Transaction timestamp */
  created_at: string;
  /** Reference to related order/position (optional) */
  reference_id?: string;
}

/**
 * Represents an order in history
 * @interface OrderHistoryItem
 */
export interface OrderHistoryItem {
  /** Unique order ID */
  id: string;
  /** Trading symbol */
  symbol: string;
  /** Order type (market, limit, stop, stop_limit) */
  order_type: string;
  /** Order direction */
  side: "buy" | "sell";
  /** Order quantity in lots */
  quantity: number;
  /** Requested price (for limit/stop orders) */
  price?: number;
  /** Actual fill price */
  fill_price?: number;
  /** Current order status */
  status: string;
  /** Commission charged */
  commission: number;
  /** Order creation timestamp */
  created_at: string;
  /** Fill timestamp (if filled) */
  filled_at?: string;
}

/**
 * Aggregated trading statistics
 * @interface TradeStatistics
 */
export interface TradeStatistics {
  /** Total number of closed trades */
  totalTrades: number;
  /** Number of profitable trades */
  winningTrades: number;
  /** Number of losing trades */
  losingTrades: number;
  /** Win rate percentage (0-100) */
  winRate: number;
  /** Total P&L across all trades */
  totalPnL: number;
  /** Total commission paid */
  totalCommission: number;
  /** Average P&L per trade */
  averagePnL: number;
  /** Largest winning trade amount */
  largestWin: number;
  /** Largest losing trade amount (negative) */
  largestLoss: number;
  /** Total volume traded (in lots) */
  totalVolume: number;
}

/**
 * Hook for fetching and managing trading history data.
 *
 * @description
 * This hook provides comprehensive access to:
 * - Closed positions with P&L details
 * - Complete order history
 * - Account ledger entries
 * - Aggregated trading statistics
 *
 * Data is automatically refreshed via real-time subscriptions when
 * positions or orders are updated.
 *
 * @example
 * ```tsx
 * const {
 *   closedPositions,
 *   orders,
 *   ledger,
 *   statistics,
 *   loading,
 *   refresh
 * } = useTradingHistory();
 *
 * // Display win rate
 * if (statistics) {
 *   console.log(`Win rate: ${statistics.winRate.toFixed(1)}%`);
 *   console.log(`Total P&L: $${statistics.totalPnL.toFixed(2)}`);
 * }
 *
 * // Force refresh data
 * const handleRefresh = () => refresh();
 * ```
 *
 * @returns {Object} Hook return object
 * @returns {TradeHistoryItem[]} closedPositions - Array of closed trades
 * @returns {OrderHistoryItem[]} orders - Array of all orders
 * @returns {LedgerEntry[]} ledger - Array of ledger entries
 * @returns {TradeStatistics | null} statistics - Aggregated trading stats
 * @returns {boolean} loading - Whether data is being fetched
 * @returns {string | null} error - Error message if fetch failed
 * @returns {Function} refresh - Function to manually refresh data
 */
export const useTradingHistory = () => {
  const { user } = useAuth();
  const [closedPositions, setClosedPositions] = useState<TradeHistoryItem[]>(
    [],
  );
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [statistics, setStatistics] = useState<TradeStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all trading history data from the database
   */
  const fetchTradingHistory = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch closed positions
      const { data: positionsData, error: positionsError } = await supabase
        .from("positions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "closed")
        .order("closed_at", { ascending: false });

      if (positionsError) throw positionsError;

      // Fetch all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch ledger entries
      const { data: ledgerData, error: ledgerError } = await supabase
        .from("ledger")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ledgerError) throw ledgerError;

      // Process closed positions into trade history
      const trades: TradeHistoryItem[] = (positionsData || []).map((pos) => ({
        id: pos.id,
        symbol: pos.symbol,
        side: pos.side === "buy" || pos.side === "sell" ? pos.side : "buy",
        quantity: pos.quantity,
        entry_price: pos.entry_price,
        exit_price: (pos.current_price ?? pos.entry_price) as number,
        realized_pnl: pos.realized_pnl ?? 0,
        commission: 0,
        opened_at: pos.opened_at ?? new Date().toISOString(),
        closed_at: (pos.closed_at ??
          pos.opened_at ??
          new Date().toISOString()) as string,
        margin_used: pos.margin_used,
      }));

      // Calculate statistics
      const stats = calculateStatistics(trades);

      setClosedPositions(trades);
      const typedOrders = (ordersData || []).map((o) => ({
        ...o,
        price: o.fill_price ?? o.price,
        commission: o.commission ?? 0,
        side: o.side === "buy" || o.side === "sell" ? o.side : "buy",
      })) as OrderHistoryItem[];
      const typedLedger = (ledgerData || []).map((l) => ({
        ...l,
        description: l.description ?? "",
      })) as LedgerEntry[];
      setOrders(typedOrders);
      setLedger(typedLedger);
      setStatistics(stats);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch trading history",
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Calculate aggregated statistics from trade history
   * @param trades - Array of closed trades
   * @returns Calculated statistics object
   */
  const calculateStatistics = (trades: TradeHistoryItem[]): TradeStatistics => {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnL: 0,
        totalCommission: 0,
        averagePnL: 0,
        largestWin: 0,
        largestLoss: 0,
        totalVolume: 0,
      };
    }

    const winningTrades = trades.filter((t) => t.realized_pnl > 0).length;
    const losingTrades = trades.filter((t) => t.realized_pnl < 0).length;
    const totalPnL = trades.reduce((sum, t) => sum + t.realized_pnl, 0);
    const totalCommission = trades.reduce((sum, t) => sum + t.commission, 0);
    const totalVolume = trades.reduce((sum, t) => sum + t.quantity, 0);

    const pnlValues = trades.map((t) => t.realized_pnl);
    const largestWin = pnlValues.length > 0 ? Math.max(...pnlValues) : 0;
    const largestLoss = pnlValues.length > 0 ? Math.min(...pnlValues) : 0;

    return {
      totalTrades: trades.length,
      winningTrades,
      losingTrades,
      winRate: trades.length > 0 ? (winningTrades / trades.length) * 100 : 0,
      totalPnL,
      totalCommission,
      averagePnL: totalPnL / trades.length,
      largestWin,
      largestLoss,
      totalVolume,
    };
  };

  useEffect(() => {
    fetchTradingHistory();

    // Set up real-time subscriptions
    const positionsChannel = supabase
      .channel("closed-positions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "positions",
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchTradingHistory();
        },
      )
      .subscribe();

    const ordersChannel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchTradingHistory();
        },
      )
      .subscribe();

    return () => {
      positionsChannel.unsubscribe();
      ordersChannel.unsubscribe();
      supabase.removeChannel(positionsChannel);
      supabase.removeChannel(ordersChannel);
    };
  }, [user, fetchTradingHistory]);

  return {
    /** Array of closed positions with P&L details */
    closedPositions,
    /** Array of all orders (pending, filled, cancelled) */
    orders,
    /** Array of account ledger entries */
    ledger,
    /** Aggregated trading statistics (null while loading) */
    statistics,
    /** Whether data is currently being fetched */
    loading,
    /** Error message if fetch failed */
    error,
    /** Function to manually refresh all data */
    refresh: fetchTradingHistory,
  };
};
