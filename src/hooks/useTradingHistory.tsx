import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface TradeHistoryItem {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  entry_price: number;
  exit_price: number;
  realized_pnl: number;
  commission: number;
  opened_at: string;
  closed_at: string;
  margin_used: number;
}

export interface LedgerEntry {
  id: string;
  transaction_type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  created_at: string;
  reference_id?: string;
}

export interface OrderHistoryItem {
  id: string;
  symbol: string;
  order_type: string;
  side: "buy" | "sell";
  quantity: number;
  price?: number;
  fill_price?: number;
  status: string;
  commission: number;
  created_at: string;
  filled_at?: string;
}

export interface TradeStatistics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  totalCommission: number;
  averagePnL: number;
  largestWin: number;
  largestLoss: number;
  totalVolume: number;
}

export const useTradingHistory = () => {
  const { user } = useAuth();
  const [closedPositions, setClosedPositions] = useState<TradeHistoryItem[]>([]);
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [statistics, setStatistics] = useState<TradeStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        side: pos.side,
        quantity: pos.quantity,
        entry_price: pos.entry_price,
        exit_price: pos.current_price || pos.entry_price,
        realized_pnl: pos.realized_pnl || 0,
        commission: 0, // Will be calculated from orders if needed
        opened_at: pos.opened_at,
        closed_at: pos.closed_at || pos.opened_at,
        margin_used: pos.margin_used,
      }));

      // Calculate statistics
      const stats = calculateStatistics(trades);

      setClosedPositions(trades);
      setOrders(ordersData || []);
      setLedger(ledgerData || []);
      setStatistics(stats);
      setError(null);
    } catch (err) {
      console.error("Error fetching trading history:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch trading history");
    } finally {
      setLoading(false);
    }
  }, [user]);

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
        }
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(positionsChannel);
      supabase.removeChannel(ordersChannel);
    };
  }, [user, fetchTradingHistory]);

  return {
    closedPositions,
    orders,
    ledger,
    statistics,
    loading,
    error,
    refresh: fetchTradingHistory,
  };
};
