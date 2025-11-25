/**
 * Hook: usePortfolioMetrics
 *
 * Real-time portfolio performance metrics and P&L tracking
 * Calculates win rate, profit factor, drawdown, ROI, and other portfolio statistics
 */

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import {
  calculatePortfolioMetrics,
  analyzeDrawdown,
  breakdownByAssetClass,
  PortfolioMetrics,
  DrawdownAnalysis,
  AssetClassMetrics,
} from "@/lib/risk/portfolioMetrics";
import type { Position } from "@/integrations/supabase/types/tables";

// Database interfaces
interface DatabasePortfolioHistory {
  equity: number;
  date: string;
  error?: boolean;
}

interface DatabaseClosedPosition {
  realized_pnl?: number;
}

interface UsePortfolioMetricsReturn {
  portfolioMetrics: PortfolioMetrics | null;
  drawdownAnalysis: DrawdownAnalysis | null;
  assetClassMetrics: AssetClassMetrics;
  equityHistory: number[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePortfolioMetrics = (): UsePortfolioMetricsReturn => {
  const { user } = useAuth();
  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics | null>(null);
  const [drawdownAnalysis, setDrawdownAnalysis] = useState<DrawdownAnalysis | null>(null);
  const [assetClassMetrics, setAssetClassMetrics] = useState<AssetClassMetrics>({});
  const [equityHistory, setEquityHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolioMetrics = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("balance, equity")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch open positions
      const { data: positionsData, error: positionsError } = await supabase
        .from("positions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "open");

      if (positionsError) throw positionsError;

      // Fetch closed trades for statistics
      const { data: closedPositions, error: closedError } = await supabase
        .from("positions")
        .select("realized_pnl")
        .eq("user_id", user.id)
        .eq("status", "closed")
        .order("closed_at", { ascending: false })
        .limit(100);

      if (closedError) throw closedError;

      // Fetch portfolio history for drawdown calculation (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: portfolioHistory, error: historyError } = await supabase
        .from("daily_pnl_tracking")
        .select("equity, date as recorded_at")
        .eq("user_id", user.id)
        .gte("date", thirtyDaysAgo.toISOString())
        .order("date", { ascending: true });

      if (historyError) throw historyError;

      // Build equity history
      const history = (portfolioHistory || [])
        .filter((h: DatabasePortfolioHistory) => h && typeof h.equity === 'number' && !h.error)
        .map((h: DatabasePortfolioHistory) => h.equity);
      if (history.length > 0) {
        setEquityHistory(history);
      }

      // Build trade statistics from closed positions
      const trades = (closedPositions || []).map((p: DatabaseClosedPosition) => ({
        pnl: p.realized_pnl || 0,
        isProfit: (p.realized_pnl || 0) > 0,
      }));

      // Calculate unrealized P&L from open positions
      const unrealizedPnL = (positionsData as Position[]).reduce(
        (sum, p) => sum + (p.unrealized_pnl || 0),
        0
      );

      // Calculate realized P&L from closed positions
      const realizedPnL = (closedPositions || []).reduce(
        (sum, p) => sum + (p.realized_pnl || 0),
        0
      );

      // Calculate metrics
      const metrics = calculatePortfolioMetrics(
        profileData.equity || 0,
        profileData.balance || 0,
        realizedPnL,
        unrealizedPnL,
        trades,
        history
      );

      setPortfolioMetrics(metrics);

      // Calculate drawdown analysis
      const peakEquity = Math.max(...history, profileData.equity || 0);
      const drawdown = analyzeDrawdown(
        profileData.equity || 0,
        peakEquity,
        metrics.maxDrawdown,
        history
      );
      setDrawdownAnalysis(drawdown);

      // Calculate asset class metrics (using symbol-based classification)
      const positionValues = positionsData as Position[];
      const totalPortfolioValue = positionValues.reduce(
        (sum, p) => sum + (p.quantity || 0) * (p.current_price || 0),
        0
      ) + profileData.equity;

      // Map symbols to asset classes (basic classification)
      const symbolToAssetClass: Record<string, string> = {};
      const assetSpecs = await supabase
        .from("asset_specs")
        .select("symbol, asset_class")
        .in("symbol", positionValues.map(p => p.symbol).filter(Boolean));

      if (assetSpecs.data) {
        assetSpecs.data.forEach(spec => {
          symbolToAssetClass[spec.symbol] = spec.asset_class || "Other";
        });
      }

      const assetMetrics = breakdownByAssetClass(
        positionValues.map(p => ({
          symbol: p.symbol || "",
          assetClass: symbolToAssetClass[p.symbol] || "Other",
          quantity: p.quantity || 0,
          currentPrice: p.current_price || 0,
          unrealizedPnL: p.unrealized_pnl || 0,
        })),
        totalPortfolioValue
      );
      setAssetClassMetrics(assetMetrics);

      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch portfolio metrics";
      setError(message);
      console.error("Portfolio metrics error:", message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    fetchPortfolioMetrics();

    if (!user) return;

    // Subscribe to profile changes
    const profileChannel = supabase
      .channel(`portfolio-profile-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        () => {
          fetchPortfolioMetrics();
        }
      )
      .subscribe();

    // Subscribe to position changes
    const positionsChannel = supabase
      .channel(`portfolio-positions-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "positions",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchPortfolioMetrics();
        }
      )
      .subscribe();

    return () => {
      profileChannel.unsubscribe();
      positionsChannel.unsubscribe();
    };
  }, [user, fetchPortfolioMetrics]);

  return {
    portfolioMetrics,
    drawdownAnalysis,
    assetClassMetrics,
    equityHistory,
    loading,
    error,
    refetch: fetchPortfolioMetrics,
  };
};

/**
 * Hook: useDrawdownAnalysis
 * Specialized hook for detailed drawdown analysis with real-time updates
 */
export const useDrawdownAnalysis = () => {
  const { user } = useAuth();
  const [drawdownData, setDrawdownData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchDrawdownData = async () => {
      try {
        // Fetch profile and history data
        const { data: profile } = await supabase
          .from("profiles")
          .select("equity")
          .eq("id", user.id)
          .single();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: history } = await supabase
          .from("daily_pnl_tracking")
          .select("equity, date as recorded_at")
          .eq("user_id", user.id)
          .gte("date", thirtyDaysAgo.toISOString())
          .order("date", { ascending: true });

        const equityValues = (history || []).map((h: any) => h.equity || 0);
        const peakEquity = Math.max(...equityValues, profile?.equity || 0);

        const analysis = analyzeDrawdown(
          profile?.equity || 0,
          peakEquity,
          peakEquity - Math.min(...equityValues, profile?.equity || 0),
          equityValues
        );

        setDrawdownData(analysis);
      } finally {
        setLoading(false);
      }
    };

    fetchDrawdownData();

    const subscription = supabase
      .channel(`drawdown-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        fetchDrawdownData
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return { drawdownData, loading };
};
