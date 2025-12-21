/**
 * Hook: usePortfolioMetrics
 *
 * Real-time portfolio performance metrics and P&L tracking
 * Calculates win rate, profit factor, drawdown, ROI, and other portfolio statistics
 *
 * This hook provides comprehensive portfolio analytics with real-time updates
 * through Supabase Realtime subscriptions. It automatically subscribes to
 * profile and position changes to keep metrics current.
 *
 * @returns {UsePortfolioMetricsReturn} Object containing:
 *   - portfolioMetrics: PortfolioMetrics | null - Core performance metrics including win rate, profit factor, ROI
 *   - drawdownAnalysis: DrawdownAnalysis | null - Maximum drawdown, recovery time, and drawdown statistics
 *   - assetClassMetrics: AssetClassMetrics - Performance breakdown by asset class (forex, crypto, stocks, indices)
 *   - equityHistory: number[] - Array of equity values over time for charting
 *   - loading: boolean - Loading state during initial data fetch
 *   - error: string | null - Error message if data fetching fails
 *   - refetch: () => Promise<void> - Function to manually refresh all metrics
 *
 * @example
 * ```tsx
 * const {
 *   portfolioMetrics,
 *   drawdownAnalysis,
 *   assetClassMetrics,
 *   equityHistory,
 *   loading,
 *   error,
 *   refetch
 * } = usePortfolioMetrics();
 *
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage message={error} />;
 *
 * return (
 *   <div>
 *     <h3>Win Rate: {portfolioMetrics?.winRate}%</h3>
 *     <h3>Profit Factor: {portfolioMetrics?.profitFactor}</h3>
 *     <h3>Max Drawdown: {drawdownAnalysis?.maxDrawdown}%</h3>
 *     <EquityChart data={equityHistory} />
 *   </div>
 * );
 * ```
 *
 * @sideEffects
 * - Automatically subscribes to Supabase Realtime channels for 'profiles' and 'positions' tables
 * - Subscriptions are automatically cleaned up when component unmounts or user changes
 * - Real-time updates trigger automatic metric recalculation
 *
 * @see UsePortfolioMetricsReturn - Type definition for return object
 * @see PortfolioMetrics - Core metrics interface
 * @see DrawdownAnalysis - Drawdown analysis interface
 * @see AssetClassMetrics - Asset class breakdown interface
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import {
  analyzeDrawdown,
  AssetClassMetrics,
  breakdownByAssetClass,
  calculatePortfolioMetrics,
  DrawdownAnalysis,
  PortfolioMetrics,
} from '@/lib/risk/portfolioMetrics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';
type Position = Database['public']['Tables']['positions']['Row'];

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
  const [portfolioMetrics, setPortfolioMetrics] =
    useState<PortfolioMetrics | null>(null);
  const [drawdownAnalysis, setDrawdownAnalysis] =
    useState<DrawdownAnalysis | null>(null);
  const [assetClassMetrics, setAssetClassMetrics] = useState<AssetClassMetrics>(
    {}
  );
  const [equityHistory, setEquityHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for subscription channels to prevent re-subscription issues
  const profileChannelRef = useRef<
    import('@supabase/supabase-js').RealtimeChannel | null
  >(null);
  const positionsChannelRef = useRef<
    import('@supabase/supabase-js').RealtimeChannel | null
  >(null);

  const fetchPortfolioMetrics = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('balance, equity')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch open positions
      const { data: positionsData, error: positionsError } = await supabase
        .from('positions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'open');

      if (positionsError) throw positionsError;

      // Fetch closed trades for statistics
      const { data: closedPositions, error: closedError } = await supabase
        .from('positions')
        .select('realized_pnl')
        .eq('user_id', user.id)
        .eq('status', 'closed')
        .order('closed_at', { ascending: false })
        .limit(100);

      if (closedError) throw closedError;

      // Fetch portfolio history for drawdown calculation (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: portfolioHistory, error: historyError } = await supabase
        .from('daily_pnl_tracking')
        .select('realized_pnl, trading_date')
        .eq('user_id', user.id)
        .gte('trading_date', thirtyDaysAgo.toISOString())
        .order('trading_date', { ascending: true });

      if (historyError) throw historyError;

      // Build equity history (using realized_pnl as proxy since equity column doesn't exist in daily_pnl_tracking)
      const history: number[] = [];
      if (portfolioHistory && Array.isArray(portfolioHistory)) {
        portfolioHistory.forEach((h: unknown) => {
          const historyObj = h as Record<string, unknown>;
          if (historyObj && typeof historyObj.realized_pnl === 'number') {
            history.push(historyObj.realized_pnl);
          }
        });
      }
      if (history.length > 0) {
        setEquityHistory(history);
      }

      // Build trade statistics from closed positions
      const trades = (closedPositions || []).map((p: unknown) => {
        const posObj = p as Record<string, unknown>;
        return {
          pnl:
            typeof posObj.realized_pnl === 'number' ? posObj.realized_pnl : 0,
          isProfit:
            (typeof posObj.realized_pnl === 'number'
              ? posObj.realized_pnl
              : 0) > 0,
        };
      });

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
      const totalPortfolioValue =
        positionValues.reduce(
          (sum, p) => sum + (p.quantity || 0) * (p.current_price || 0),
          0
        ) + profileData.equity;

      // Map symbols to asset classes (basic classification)
      const symbolToAssetClass: Record<string, string> = {};
      const assetSpecs = await supabase
        .from('asset_specs')
        .select('symbol, asset_class')
        .in('symbol', positionValues.map((p) => p.symbol).filter(Boolean));

      if (assetSpecs.data) {
        assetSpecs.data.forEach((spec: unknown) => {
          const specObj = spec as Record<string, unknown>;
          symbolToAssetClass[specObj.symbol as string] =
            (specObj.asset_class as string) || 'Other';
        });
      }

      const assetMetrics = breakdownByAssetClass(
        positionValues.map((p) => ({
          symbol: p.symbol || '',
          assetClass: symbolToAssetClass[p.symbol] || 'Other',
          quantity: p.quantity || 0,
          currentPrice: p.current_price || 0,
          unrealizedPnL: p.unrealized_pnl || 0,
        })),
        totalPortfolioValue
      );
      setAssetClassMetrics(assetMetrics);

      setError(null);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to fetch portfolio metrics';
      setError(message);
      console.error('Portfolio metrics error:', message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    fetchPortfolioMetrics();

    if (!user) {
      // Reset refs when user is not present
      if (profileChannelRef.current) {
        profileChannelRef.current.unsubscribe();
        profileChannelRef.current = null;
      }
      if (positionsChannelRef.current) {
        positionsChannelRef.current.unsubscribe();
        positionsChannelRef.current = null;
      }
      return;
    }

    // Subscribe to profile changes
    profileChannelRef.current = supabase
      .channel(`portfolio-profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        () => {
          fetchPortfolioMetrics();
        }
      )
      .subscribe();

    // Subscribe to position changes
    positionsChannelRef.current = supabase
      .channel(`portfolio-positions-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'positions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchPortfolioMetrics();
        }
      )
      .subscribe();

    return () => {
      // Cleanup subscriptions using refs
      if (profileChannelRef.current) {
        profileChannelRef.current.unsubscribe();
        profileChannelRef.current = null;
      }
      if (positionsChannelRef.current) {
        positionsChannelRef.current.unsubscribe();
        positionsChannelRef.current = null;
      }
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
 *
 * Specialized hook for detailed drawdown analysis with real-time updates
 *
 * This hook provides comprehensive drawdown analysis including maximum drawdown,
 * recovery time, and drawdown frequency. It automatically subscribes to profile
 * changes to keep the analysis current and recalculates when equity data changes.
 *
 * @returns {Object} Object containing:
 *   - drawdownData: DrawdownAnalysis | null - Detailed drawdown metrics including:
 *     - maxDrawdown: number - Maximum drawdown percentage
 *     - maxDrawdownAmount: number - Maximum drawdown in monetary terms
 *     - recoveryTime: number - Time to recover from maximum drawdown (days)
 *     - currentDrawdown: number - Current drawdown percentage
 *     - drawdownFrequency: number - Number of drawdown events
 *     - averageDrawdown: number - Average drawdown percentage
 *   - loading: boolean - Loading state during initial data fetch
 *
 * @example
 * ```tsx
 * const { drawdownData, loading } = useDrawdownAnalysis();
 *
 * if (loading) return <LoadingSpinner />;
 *
 * return (
 *   <div>
 *     <h3>Max Drawdown: {drawdownData?.maxDrawdown}%</h3>
 *     <h3>Recovery Time: {drawdownData?.recoveryTime} days</h3>
 *     <h3>Current Drawdown: {drawdownData?.currentDrawdown}%</h3>
 *   </div>
 * );
 * ```
 *
 * @sideEffects
 * - Automatically subscribes to Supabase Realtime channel for 'profiles' table
 * - Subscription is automatically cleaned up when component unmounts or user changes
 * - Real-time updates trigger automatic drawdown recalculation
 *
 * @see DrawdownAnalysis - Type definition for drawdown analysis
 * @see analyzeDrawdown - Core drawdown calculation function
 */
export const useDrawdownAnalysis = () => {
  const { user } = useAuth();
  const [drawdownData, setDrawdownData] = useState<DrawdownAnalysis | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Ref for subscription channel to prevent re-subscription issues
  const drawdownSubscriptionRef = useRef<
    import('@supabase/supabase-js').RealtimeChannel | null
  >(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchDrawdownData = async () => {
      try {
        // Fetch profile and history data
        const { data: profile } = await supabase
          .from('profiles')
          .select('equity')
          .eq('id', user.id)
          .single();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: history } = await supabase
          .from('daily_pnl_tracking')
          .select('equity, date as recorded_at')
          .eq('user_id', user.id)
          .gte('date', thirtyDaysAgo.toISOString())
          .order('date', { ascending: true });

        const equityValues = (history || []).map((h: unknown) => {
          const hObj = h as Record<string, unknown>;
          return 'equity' in hObj ? Number(hObj.equity) || 0 : 0;
        });
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

    drawdownSubscriptionRef.current = supabase
      .channel(`drawdown-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        fetchDrawdownData
      )
      .subscribe();

    return () => {
      if (drawdownSubscriptionRef.current) {
        drawdownSubscriptionRef.current.unsubscribe();
        drawdownSubscriptionRef.current = null;
      }
    };
  }, [user]);

  return { drawdownData, loading };
};
