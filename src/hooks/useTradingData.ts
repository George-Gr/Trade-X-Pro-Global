/**
 * Hook: useTradingData
 *
 * CONSOLIDATED hook that combines:
 * - usePortfolioData
 * - usePortfolioMetrics
 * - useProfitLossData
 * - useRiskMetrics
 *
 * Single source of truth for trading data with unified subscriptions
 */

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Position as DBPosition } from '@/integrations/supabase/types/tables';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRealtimePositions } from './useRealtimePositions';
import { useRealtimeProfile } from './useRealtimeProfile';

// Types
interface ProfileData {
  balance: number;
  equity: number;
  margin_used: number;
  free_margin: number | null;
  margin_level: number | null;
}

interface PositionWithPnL extends Omit<DBPosition, 'closed_at'> {
  unrealized_pnl: number;
  closed_at: string | undefined;
  current_price: number;
  realized_pnl: number;
}

interface PnLMetrics {
  totalUnrealizedPnL: number;
  totalRealizedPnL: number;
  totalPnL: number;
  dailyChange: number;
  weeklyChange: number;
  monthlyChange: number;
  winRate: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
  profitablePositions: number;
  losingPositions: number;
}

interface RiskMetrics {
  marginLevel: number;
  marginUsedPercent: number;
  capitalAtRisk: number;
  isCloseOnly: boolean;
  isLiquidationRisk: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface PortfolioSummary {
  positionCount: number;
  totalExposure: number;
  avgEntryPrice: number;
  totalMarginUsed: number;
}

interface TradingDataReturn {
  // Core data
  profile: ProfileData | null;
  positions: PositionWithPnL[];

  // Computed metrics
  pnl: PnLMetrics;
  risk: RiskMetrics;
  portfolio: PortfolioSummary;

  // Computed values
  equity: number;
  freeMargin: number;
  marginLevel: number;

  // State
  loading: boolean;
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
  updatePositionPrices: (
    pricesMap: Map<string, { currentPrice: number }>
  ) => void;
}

// Thresholds
const MARGIN_CALL_THRESHOLD = 100;
const LIQUIDATION_THRESHOLD = 50;
const CONTRACT_SIZE = 100000;

export function useTradingData(): TradingDataReturn {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [positions, setPositions] = useState<PositionWithPnL[]>([]);
  const [closedTrades, setClosedTrades] = useState<
    { realized_pnl: number | null }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  // Fetch all trading data
  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Parallel fetch all data
      const [profileRes, positionsRes, closedRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('balance, equity, margin_used, free_margin, margin_level')
          .eq('id', user.id)
          .single(),
        supabase
          .from('positions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'open')
          .order('opened_at', { ascending: false }),
        supabase
          .from('positions')
          .select('realized_pnl')
          .eq('user_id', user.id)
          .eq('status', 'closed')
          .order('closed_at', { ascending: false })
          .limit(100),
      ]);

      if (!isMountedRef.current) return;

      if (profileRes.error) throw profileRes.error;
      if (positionsRes.error) throw positionsRes.error;

      setProfile(profileRes.data);
      setPositions(
        (positionsRes.data || []).map((pos) => ({
          ...pos,
          opened_at: pos.opened_at ?? new Date().toISOString(),
          closed_at: pos.closed_at ?? undefined,
          status: (pos.status ?? 'open') as 'open' | 'closed',
          current_price: pos.current_price ?? 0,
          realized_pnl: pos.realized_pnl ?? 0,
          unrealized_pnl: pos.unrealized_pnl ?? 0,
        }))
      );
      setClosedTrades(closedRes.data || []);
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [user]);

  // Set up subscriptions using dedicated hooks
  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    return () => {
      isMountedRef.current = false;
    };
  }, [user, fetchData]);

  // Set up real-time subscriptions using dedicated hooks
  useRealtimeProfile(user?.id, fetchData);
  useRealtimePositions(user?.id, fetchData);

  // Calculate unrealized PnL for a position
  const calculateUnrealizedPnL = useCallback(
    (position: PositionWithPnL, currentPrice: number): number => {
      const priceDiff =
        position.side === 'buy'
          ? currentPrice - position.entry_price
          : position.entry_price - currentPrice;
      return priceDiff * position.quantity * CONTRACT_SIZE;
    },
    []
  );

  // Update prices from price stream
  const updatePositionPrices = useCallback(
    (pricesMap: Map<string, { currentPrice: number }>) => {
      setPositions((prev) =>
        prev.map((pos) => {
          const priceData = pricesMap.get(pos.symbol);
          if (priceData) {
            const unrealized_pnl = calculateUnrealizedPnL(
              pos,
              priceData.currentPrice
            );
            return {
              ...pos,
              current_price: priceData.currentPrice,
              unrealized_pnl,
            };
          }
          return pos;
        })
      );
    },
    [calculateUnrealizedPnL]
  );

  // Computed: Total unrealized PnL
  const totalUnrealizedPnL = useMemo(
    () => positions.reduce((sum, pos) => sum + (pos.unrealized_pnl || 0), 0),
    [positions]
  );

  // Computed: Total realized PnL
  const totalRealizedPnL = useMemo(
    () => closedTrades.reduce((sum, t) => sum + (t.realized_pnl || 0), 0),
    [closedTrades]
  );

  // Computed: Equity
  const equity = useMemo(
    () => (profile?.balance || 0) + totalUnrealizedPnL,
    [profile?.balance, totalUnrealizedPnL]
  );

  // Computed: Free margin
  const freeMargin = useMemo(
    () => equity - (profile?.margin_used || 0),
    [equity, profile?.margin_used]
  );

  // Computed: Margin level
  const marginLevel = useMemo(
    () =>
      (profile?.margin_used || 0) === 0
        ? Infinity
        : (equity / (profile?.margin_used || 1)) * 100,
    [equity, profile?.margin_used]
  );

  // Computed: PnL metrics
  const pnl = useMemo((): PnLMetrics => {
    const profitable = positions.filter((p) => (p.unrealized_pnl || 0) > 0);
    const losing = positions.filter((p) => (p.unrealized_pnl || 0) < 0);

    const profitSum = profitable.reduce(
      (s, p) => s + (p.unrealized_pnl || 0),
      0
    );
    const lossSum = Math.abs(
      losing.reduce((s, p) => s + (p.unrealized_pnl || 0), 0)
    );

    return {
      totalUnrealizedPnL,
      totalRealizedPnL,
      totalPnL: totalUnrealizedPnL + totalRealizedPnL,
      dailyChange: 0, // Would need historical data
      weeklyChange: 0,
      monthlyChange: 0,
      winRate:
        closedTrades.length > 0
          ? (closedTrades.filter((t) => (t.realized_pnl || 0) > 0).length /
              closedTrades.length) *
            100
          : 0,
      profitFactor:
        lossSum > 0 ? profitSum / lossSum : profitSum > 0 ? Infinity : 0,
      largestWin: Math.max(0, ...positions.map((p) => p.unrealized_pnl || 0)),
      largestLoss: Math.min(0, ...positions.map((p) => p.unrealized_pnl || 0)),
      profitablePositions: profitable.length,
      losingPositions: losing.length,
    };
  }, [positions, closedTrades, totalUnrealizedPnL, totalRealizedPnL]);

  // Computed: Risk metrics
  const risk = useMemo((): RiskMetrics => {
    const ml = marginLevel === Infinity ? 9999 : marginLevel;
    const capitalAtRisk = positions.reduce(
      (s, p) => s + Math.abs(p.unrealized_pnl || 0),
      0
    );

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (ml < LIQUIDATION_THRESHOLD) riskLevel = 'critical';
    else if (ml < MARGIN_CALL_THRESHOLD) riskLevel = 'high';
    else if (ml < 150) riskLevel = 'medium';

    return {
      marginLevel: ml,
      marginUsedPercent:
        profile?.margin_used && equity > 0
          ? (profile.margin_used / equity) * 100
          : 0,
      capitalAtRisk,
      isCloseOnly: ml < MARGIN_CALL_THRESHOLD,
      isLiquidationRisk: ml < LIQUIDATION_THRESHOLD,
      riskLevel,
    };
  }, [marginLevel, positions, profile?.margin_used, equity]);

  // Computed: Portfolio summary
  const portfolio = useMemo(
    (): PortfolioSummary => ({
      positionCount: positions.length,
      totalExposure: positions.reduce(
        (s, p) => s + p.quantity * (p.current_price || 0) * CONTRACT_SIZE,
        0
      ),
      avgEntryPrice:
        positions.length > 0
          ? positions.reduce((s, p) => s + p.entry_price, 0) / positions.length
          : 0,
      totalMarginUsed: profile?.margin_used || 0,
    }),
    [positions, profile?.margin_used]
  );

  return {
    profile,
    positions,
    pnl,
    risk,
    portfolio,
    equity,
    freeMargin,
    marginLevel,
    loading,
    error,
    refresh: fetchData,
    updatePositionPrices,
  };
}

export default useTradingData;
