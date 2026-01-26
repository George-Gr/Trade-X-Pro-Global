import { useMemo } from 'react';

interface PortfolioMetrics {
  totalEquity: number;
  totalBalance: number;
  totalUsedMargin: number;
  totalAvailableMargin: number;
  marginLevel: number;
  unrealizedPnL: number;
  realizedPnL: number;
  totalPnL: number;
  roi: number;
  dailyPnL: number | null;
  weeklyPnL: number | null;
  monthlyPnL: number | null;
}

interface AssetAllocationItem {
  symbol: string;
  value: number;
  percentage: number;
  side: string;
  pnl: number;
  risk: number;
}

interface PerformanceMetrics {
  winRate: number;
  totalTrades: number;
  avgReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  bestTrade: number;
  worstTrade: number;
  volatility: number;
}

interface ProfileData {
  balance: number;
  equity: number;
  margin_used: number;
  free_margin: number | null;
  margin_level: number | null;
}

interface PositionWithPnL {
  id: string;
  symbol: string;
  side: string;
  current_price: number;
  entry_price: number;
  quantity: number;
  unrealized_pnl: number;
  closed_at: string | undefined;
  asset_class?: string;
  trailing_stop_enabled?: boolean;
  trailing_stop_distance?: number | null;
  trailing_stop_price?: number | null;
  highest_price?: number | null;
  lowest_price?: number | null;
  realized_pnl: number;
}

interface UsePortfolioCalculationsProps {
  profile: ProfileData | null;
  positions: PositionWithPnL[];
}

interface UsePortfolioCalculationsReturn {
  metrics: PortfolioMetrics;
  assetAllocation: AssetAllocationItem[];
  performanceMetrics: PerformanceMetrics;
}

/**
 * Calculates enhanced portfolio analytics from user profile and positions.
 * @param props - The hook props containing profile and positions data
 * @param props.profile - User profil/ data with balance and margin information
 * @param props.positions - Array of open positions with P&L data
/**
 * Calculates enhanced portfolio analytics from user profile and positions.
 * @param props - The hook props containing profile and positions data.
 * @param props.profile - User profile data with balance and margin information.
 * @param props.positions - Array of open positions with P&L data.
 * @returns Portfolio metrics, asset allocation, and performance metrics.
 */
export const usePortfolioCalculations = ({
  profile,
  positions,
}: UsePortfolioCalculationsProps): UsePortfolioCalculationsReturn => {  // Calculate enhanced portfolio metrics
  const metrics = useMemo((): PortfolioMetrics => {
    if (!profile) {
      return {
        totalEquity: 0,
        totalBalance: 0,
        totalUsedMargin: 0,
        totalAvailableMargin: 0,
        marginLevel: 0,
        unrealizedPnL: 0,
        realizedPnL: 0,
        totalPnL: 0,
        roi: 0,
        dailyPnL: null,
        weeklyPnL: null,
        monthlyPnL: null,
      };
    }

    const balance = profile.balance || 0;
    const usedMargin = profile.margin_used || 0;
    const availableMargin = balance - usedMargin;

    // Calculate unrealized P&L from positions
    const unrealizedPnL = (positions || []).reduce(
      (
        sum: number,
        pos: {
          current_price: number;
          entry_price: number;
          quantity: number;
          side: string;
        }
      ) => {
        const currentPrice = pos.current_price ?? 0;
        const entryPrice = pos.entry_price ?? 0;
        const quantity = pos.quantity ?? 0;

        // Guard against invalid values
        if (!entryPrice || !quantity || !isFinite(currentPrice)) {
          return sum; // Skip invalid positions
        }

        const posValue = currentPrice * quantity * 100000;
        const entryValue = entryPrice * quantity * 100000;
        const pnl =
          pos.side === 'buy' ? posValue - entryValue : entryValue - posValue;
        return sum + (isFinite(pnl) ? pnl : 0);
      },
      0
    );

    const realizedPnL =
      (
        profile as {
          realized_pnl?: number;
          realizedPnl?: number;
          realizedPnL?: number;
        } | null
      )?.realized_pnl ??
      (profile as { realizedPnl?: number })?.realizedPnl ??
      (profile as { realizedPnL?: number })?.realizedPnL ??
      0;

    const totalPnL = unrealizedPnL + realizedPnL;
    const totalEquity = balance + unrealizedPnL;

    // Calculate ROI
    const initialDeposit = balance - realizedPnL;
    const roi = initialDeposit > 0 ? (totalPnL / initialDeposit) * 100 : 0;

    // Calculate margin level percentage
    const marginLevel = usedMargin > 0 && balance > 0 ? (usedMargin / balance) * 100 : 0;
    // Historical P&L data not available - set to null
    const dailyPnL = null;
    const weeklyPnL = null;
    const monthlyPnL = null;

    return {
      totalEquity,
      totalBalance: balance,
      totalUsedMargin: usedMargin,
      totalAvailableMargin: availableMargin,
      marginLevel,
      unrealizedPnL,
      realizedPnL,
      totalPnL,
      roi,
      dailyPnL,
      weeklyPnL,
      monthlyPnL,
    };
  }, [profile, positions]);

  // Calculate enhanced asset allocation with risk metrics
  const assetAllocation = useMemo(() => {
    if (!positions || positions.length === 0) return [];

    const totalValue = positions.reduce(
      (sum: number, pos: { current_price: number; quantity: number }) => {
        const currentPrice = pos.current_price ?? 0;
        const value = Math.abs(currentPrice * pos.quantity * 100000);
        return sum + value;
      },
      0
    );

    return positions
      .map(
        (pos: {
          symbol: string;
          current_price: number;
          entry_price: number;
          quantity: number;
          side: string;
        }) => {
          const currentPrice = pos.current_price ?? 0;
          const entryPrice = pos.entry_price ?? 0;
          const quantity = pos.quantity ?? 0;
          const value = Math.abs(currentPrice * quantity * 100000);

          // Guard against division by zero when computing P&L ratio
          let pnl = 0;
          if (entryPrice && isFinite(currentPrice)) {
            pnl =
              pos.side === 'buy'
                ? (currentPrice - entryPrice) / entryPrice
                : (entryPrice - currentPrice) / entryPrice;
          }

          return {
            symbol: pos.symbol,
            value,
            percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
            side: pos.side,
            pnl: isFinite(pnl) ? pnl * 100 : 0,
            risk: isFinite(pnl) ? Math.abs(pnl) * value : 0, // Risk as potential loss
          };
        }
      )
      .sort((a: { value: number }, b: { value: number }) => b.value - a.value);
  }, [positions]);

  // Calculate advanced performance metrics
  const performanceMetrics = useMemo(() => {
    const returns = (positions || []).map(
      (pos: { side: string; current_price: number; entry_price: number }) => {
        const currentPrice = pos.current_price ?? 0;
        const entryPrice = pos.entry_price ?? 0;

        // Guard against invalid values
        if (!entryPrice || !isFinite(currentPrice)) return 0;

        const pnl =
          pos.side === 'buy'
            ? (currentPrice - entryPrice) / entryPrice
            : (entryPrice - currentPrice) / entryPrice;

        return isFinite(pnl) ? pnl : 0;
      }
    );
    const avgReturn =
      returns.length > 0
        ? returns.reduce((a: number, b: number) => a + b, 0) / returns.length
        : 0;

    // Enhanced Sharpe ratio calculation
    const variance =
      returns.length > 0
        ? returns.reduce(
            (sum: number, r: number) => sum + Math.pow(r - avgReturn, 2),
            0
          ) / returns.length
        : 0;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;

    // Calculate drawdown
    let peak = 0;
    let maxDrawdown = 0;
    let runningTotal = 0;

    returns.forEach((r: number) => {
      runningTotal += r;
      if (runningTotal > peak) peak = runningTotal;
      const drawdown = peak - runningTotal;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    const winningTrades = returns.filter((r: number) => r > 0).length;

    return {
      winRate: returns.length > 0 ? (winningTrades / returns.length) * 100 : 0,
      totalTrades: returns.length,
      avgReturn: avgReturn * 100,
      sharpeRatio,
      maxDrawdown: maxDrawdown * 100,
      bestTrade: returns.length > 0 ? Math.max(...returns) * 100 : 0,
      worstTrade: returns.length > 0 ? Math.min(...returns) * 100 : 0,
      volatility: stdDev * 100,
    };
  }, [positions]);

  return {
    metrics,
    assetAllocation,
    performanceMetrics,
  };
};