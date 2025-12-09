/**
 * Hook: useProfitLossData
 *
 * Fetches and monitors profit/loss data for dashboard visualization
 * Provides real-time P&L updates and historical data for charts
 */

import * as React from "react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "./useAuth";
import type { Position, Order, Fill } from "@/integrations/supabase/types/tables";
import type { RealtimeChannel } from "@supabase/supabase-js";

const getSupabaseClient = async () => {
  const { supabase } = await import("@/lib/supabaseBrowserClient");
  return supabase;
};

interface DailyPnLData {
  date: string;
  realizedPnL: number;
  unrealizedPnL: number;
  totalPnL: number;
  equity: number;
}

interface ProfitLossMetrics {
  currentEquity: number;
  totalRealizedPnL: number;
  totalUnrealizedPnL: number;
  totalPnL: number;
  dailyChange: number;
  weeklyChange: number;
  monthlyChange: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  maxDrawdown: number;
  maxProfit: number;
}

interface UseProfitLossDataReturn {
  metrics: ProfitLossMetrics | null;
  dailyData: DailyPnLData[];
  chartData: number[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useProfitLossData = (timeRange: '7d' | '30d' | '90d' = '7d') => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<ProfitLossMetrics | null>(null);
  const [dailyData, setDailyData] = useState<DailyPnLData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate the number of days based on time range
  const daysCount = useMemo(() => {
    switch (timeRange) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 7;
    }
  }, [timeRange]);

  // calculateDailyPnLData is already defined above; duplicate removed to avoid redeclaration.

  // Calculate profit/loss metrics
  const calculateProfitLossMetrics = useCallback((
    profile: unknown,
    positions: Position[],
    fills: unknown[],
    dailyData: DailyPnLData[]
  ): ProfitLossMetrics => {
    // Current equity
    const profileObj = profile as Record<string, unknown>;
    const currentEquity = typeof profileObj.equity === 'number' ? profileObj.equity : 50000;

    // Total realized P&L
    const totalRealizedPnL = (fills.reduce((sum: number, fill) => {
      const fillObj = fill as Record<string, unknown>;
      const pnl = typeof fillObj.pnl === 'number' ? fillObj.pnl : 0;
      return sum + pnl;
    }, 0) as number);

    // Total unrealized P&L
    const totalUnrealizedPnL = positions.reduce((sum: number, pos) => sum + (pos.unrealized_pnl || 0), 0);

    // Total P&L
    const totalPnL = totalRealizedPnL + totalUnrealizedPnL;

    // Calculate changes
    const initialEquity = 50000;
    const dailyChange = dailyData.length > 0 ? 
      dailyData[dailyData.length - 1].totalPnL - (dailyData.length > 1 ? dailyData[dailyData.length - 2].totalPnL : 0) : 0;
    
    const weeklyChange = daysCount >= 7 ? 
      dailyData[dailyData.length - 1].totalPnL - (dailyData[Math.max(0, dailyData.length - 7)].totalPnL || 0) : 0;
    
    const monthlyChange = daysCount >= 30 ? 
      dailyData[dailyData.length - 1].totalPnL - (dailyData[Math.max(0, dailyData.length - 30)].totalPnL || 0) : 0;

    // Win rate calculation
    const profitableDays = dailyData.filter(d => d.totalPnL > 0).length;
    const winRate = dailyData.length > 0 ? (profitableDays / dailyData.length) * 100 : 0;

    // Average win/loss
    const winningDays = dailyData.filter(d => d.totalPnL > 0);
    const losingDays = dailyData.filter(d => d.totalPnL < 0);
    
    const averageWin = winningDays.length > 0 ? 
      winningDays.reduce((sum, d) => sum + d.totalPnL, 0) / winningDays.length : 0;
    
    const averageLoss = losingDays.length > 0 ? 
      losingDays.reduce((sum, d) => sum + d.totalPnL, 0) / losingDays.length : 0;

    // Max drawdown and max profit
    const maxDrawdown = Math.min(...dailyData.map(d => d.totalPnL));
    const maxProfit = Math.max(...dailyData.map(d => d.totalPnL));

    return {
      currentEquity,
      totalRealizedPnL,
      totalUnrealizedPnL,
      totalPnL,
      dailyChange,
      weeklyChange,
      monthlyChange,
      winRate,
      averageWin,
      averageLoss,
      maxDrawdown,
      maxProfit
    };
  }, [daysCount]);

  // Calculate daily P&L data
  const calculateDailyPnLData = useCallback((
    startDate: Date,
    daysCount: number,
    fills: unknown[],
    positions: Position[]
  ): DailyPnLData[] => {
    const dailyData: DailyPnLData[] = [];
    
    for (let i = 0; i < daysCount; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      // Calculate realized P&L for this day
      const dailyFills = fills.filter(f => {
        const fillObj = f as Record<string, unknown>;
        const executedAt = fillObj.executed_at;
        return typeof executedAt === 'string' && executedAt.split('T')[0] === dateStr;
      });
      
      const realizedPnL = (dailyFills.reduce((sum: number, fill) => {
        // Calculate P&L for this fill
        const fillObj = fill as Record<string, unknown>;
        const pnl = typeof fillObj.pnl === 'number' ? fillObj.pnl : 0;
        return sum + pnl;
      }, 0) as number);

      // Calculate unrealized P&L (from open positions)
      const unrealizedPnLValue = positions.reduce((sum: number, pos) => {
        const currentPnL = pos.unrealized_pnl || 0;
        return sum + currentPnL;
      }, 0);

      // Estimate equity for this day (simplified calculation)
      const baseEquity = 50000; // Starting balance
      const equity = baseEquity + realizedPnL + unrealizedPnLValue;

      dailyData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        realizedPnL,
        unrealizedPnL: unrealizedPnLValue,
        totalPnL: realizedPnL + unrealizedPnLValue,
        equity
      });
    }

    return dailyData;
  }, []);

  // Fetch profit/loss data
  const fetchProfitLossData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const supabase = await getSupabaseClient();

      // Fetch current profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("balance, equity, margin_used")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      
      // Validate profile data
      if (!profileData) {
        throw new Error("Profile data not found for user");
      }

      // Fetch open positions for unrealized P&L
      const { data: positionsData, error: positionsError } = await supabase
        .from("positions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "open");

      if (positionsError) throw positionsError;

      // Fetch closed positions and fills for realized P&L
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysCount);

      const { data: fillsData, error: fillsError } = await supabase
        .from("fills" as const)
        .select("*")
        .eq("user_id", user.id)
        .gte("executed_at", startDate.toISOString())
        .order("executed_at", { ascending: true });
        
      if (fillsError) throw fillsError;

      // Calculate daily P&L data
      const calculatedDailyData = calculateDailyPnLData(startDate, daysCount, fillsData || [], positionsData?.map(p => ({
        ...p,
        opened_at: (p.opened_at ?? new Date().toISOString()) as string,
        closed_at: (p.closed_at ?? undefined) as string | undefined,
        current_price: p.current_price ?? 0,
        realized_pnl: p.realized_pnl ?? 0,
        unrealized_pnl: p.unrealized_pnl ?? 0,
        status: (p.status ?? 'open') as 'open' | 'closed',
      })) || []);
      setDailyData(calculatedDailyData);

      // Calculate chart data (equity values)
      const chartData = calculatedDailyData.map(d => d.equity);
      
      // Calculate profit/loss metrics
      const calculatedMetrics = calculateProfitLossMetrics(
        profileData,
        positionsData?.map(p => ({
          ...p,
          opened_at: (p.opened_at ?? new Date().toISOString()) as string,
          closed_at: (p.closed_at ?? undefined) as string | undefined,
          current_price: p.current_price ?? 0,
          realized_pnl: p.realized_pnl ?? 0,
          unrealized_pnl: p.unrealized_pnl ?? 0,
          status: (p.status ?? 'open') as 'open' | 'closed',
        })) || [],
        fillsData || [],
        calculatedDailyData
      );
      
      setMetrics(calculatedMetrics);

    } catch (err) {
      let message = "Failed to fetch profit/loss data";
      const detailedError = err;
      
      if (err && typeof err === 'object' && 'message' in err) {
        message = err.message as string;
      } else if (typeof err === 'string') {
        message = err;
      }
      
      setError(message);
      console.error("Profit/loss data error:", {
        message,
        error: detailedError,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });
      
      // Set default empty data on error
      setDailyData([]);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [user, daysCount, calculateDailyPnLData, calculateProfitLossMetrics]);

  // Set up real-time subscriptions
  useEffect(() => {
    let isMounted = true;
    let profileChannel: RealtimeChannel | null = null;
    let positionsChannel: RealtimeChannel | null = null;
    let fillsChannel: RealtimeChannel | null = null;

    const setup = async () => {
      if (!user) return;
      await fetchProfitLossData();

      try {
        const supabase = await getSupabaseClient();
        if (!isMounted) return;

        // Subscribe to profile changes
        profileChannel = supabase
          .channel(`pnl-profile-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "profiles",
              filter: `id=eq.${user.id}`,
            },
            () => {
              fetchProfitLossData();
            }
          )
          .subscribe();

        // Subscribe to position changes
        positionsChannel = supabase
          .channel(`pnl-positions-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "positions",
              filter: `user_id=eq.${user.id}`,
            },
            () => {
              fetchProfitLossData();
            }
          )
          .subscribe();

        // Subscribe to fill changes
        fillsChannel = supabase
          .channel(`pnl-fills-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "fills",
              filter: `user_id=eq.${user.id}`,
            },
            () => {
              fetchProfitLossData();
            }
          )
          .subscribe();
      } catch (error) {
        console.error("Failed to set up profit/loss subscriptions", error);
      }
    };

    setup();

    return () => {
      isMounted = false;
      profileChannel?.unsubscribe();
      positionsChannel?.unsubscribe();
      fillsChannel?.unsubscribe();
    };
  }, [user, fetchProfitLossData, timeRange]);

  // Chart data for visualization
  const chartData = useMemo(() => {
    return dailyData.map(d => d.equity);
  }, [dailyData]);

  return {
    metrics,
    dailyData,
    chartData,
    loading,
    error,
    refetch: fetchProfitLossData,
  };
};