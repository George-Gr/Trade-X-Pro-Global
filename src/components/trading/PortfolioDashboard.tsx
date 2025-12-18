import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, PieChart } from "lucide-react";
import { usePortfolioData } from "@/hooks/usePortfolioData";

interface PortfolioDashboardProps {
  userId?: string;
}

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
}

/**
 * PortfolioDashboard Component
 *
 * Displays comprehensive portfolio overview with:
 * - Key metrics (equity, margin, P&L)
 * - Asset allocation (pie chart data)
 * - Performance metrics (ROI, Sharpe ratio)
 * - Holdings table with real-time updates
 * - Equity curve visualization data
 */
export const PortfolioDashboard = ({ userId }: PortfolioDashboardProps) => {
  const { profile, positions, loading, error } = usePortfolioData();

  // Calculate comprehensive portfolio metrics
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
      };
    }

    const balance = profile.balance || 0;
    const usedMargin = profile.margin_used || 0;
    const availableMargin = balance - usedMargin;

    // Calculate unrealized P&L from positions
    const unrealizedPnL = (positions || []).reduce((sum, pos) => {
      const currentPrice = pos.current_price ?? 0;
      const entryPrice = pos.entry_price ?? 0;
      const posValue = currentPrice * pos.quantity * 100000;
      const entryValue = entryPrice * pos.quantity * 100000;
      const pnl =
        pos.side === "buy" ? posValue - entryValue : entryValue - posValue;
      return sum + pnl;
    }, 0);

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
    const marginLevel = usedMargin > 0 ? (usedMargin / balance) * 100 : 0;

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
    };
  }, [profile, positions]);

  // Calculate asset allocation (by position value)
  const assetAllocation = useMemo(() => {
    if (!positions || positions.length === 0) return [];

    const totalValue = positions.reduce((sum, pos) => {
      const currentPrice = pos.current_price ?? 0;
      const value = Math.abs(currentPrice * pos.quantity * 100000);
      return sum + value;
    }, 0);

    return positions
      .map((pos) => {
        const currentPrice = pos.current_price ?? 0;
        const value = Math.abs(currentPrice * pos.quantity * 100000);
        return {
          symbol: pos.symbol,
          value,
          percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
          side: pos.side,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [positions]);

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    const returns = (positions || []).map((pos) => {
      const pnl =
        pos.side === "buy"
          ? (pos.current_price - pos.entry_price) / pos.entry_price
          : (pos.entry_price - pos.current_price) / pos.entry_price;
      return pnl;
    });

    const avgReturn =
      returns.length > 0
        ? returns.reduce((a, b) => a + b, 0) / returns.length
        : 0;

    // Simple Sharpe ratio approximation
    const variance =
      returns.length > 0
        ? returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) /
          returns.length
        : 0;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;

    return {
      winRate: returns.filter((r) => r > 0).length,
      totalTrades: returns.length,
      avgReturn: avgReturn * 100,
      sharpeRatio,
      bestTrade: returns.length > 0 ? Math.max(...returns) * 100 : 0,
      worstTrade: returns.length > 0 ? Math.min(...returns) * 100 : 0,
    };
  }, [positions]);

  if (error) {
    return (
      <Card className="p-4 border-destructive/20 bg-destructive/5">
        <p className="text-destructive">
          Error loading portfolio data: {error}
        </p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6 bg-card">
        <div className="text-center text-muted-foreground">
          Loading portfolio...
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Equity */}
        <Card className="p-4 bg-card">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Equity</p>
            <p className="text-2xl font-bold font-mono">
              $
              {metrics.totalEquity.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {metrics.totalBalance > 0 && (
                <>
                  Balance: $
                  {metrics.totalBalance.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </>
              )}
            </p>
          </div>
        </Card>

        {/* Total P&L */}
        <Card className="p-4 bg-card">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total P&L</p>
            <div className="flex items-center gap-4">
              {metrics.totalPnL >= 0 ? (
                <TrendingUp className="h-4 w-4 text-profit" />
              ) : (
                <TrendingDown className="h-4 w-4 text-loss" />
              )}
              <p
                className={`text-2xl font-bold font-mono ${
                  metrics.totalPnL >= 0 ? "text-profit" : "text-loss"
                }`}
              >
                {metrics.totalPnL >= 0 ? "+" : ""}
                {metrics.totalPnL.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <p
              className={`text-xs font-semibold ${
                metrics.roi >= 0 ? "text-profit" : "text-loss"
              }`}
            >
              ROI: {metrics.roi.toFixed(2)}%
            </p>
          </div>
        </Card>

        {/* Margin Status */}
        <Card
          className={`p-4 ${metrics.marginLevel > 80 ? "border-yellow-500/30 bg-background/5" : "bg-card"}`}
        >
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Margin Level</p>
            <p className="text-2xl font-bold font-mono">
              {metrics.marginLevel.toFixed(1)}%
            </p>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-colors ${
                  metrics.marginLevel > 90
                    ? "bg-loss"
                    : metrics.marginLevel > 80
                      ? "bg-background"
                      : "bg-profit"
                }`}
                style={{ width: `${Math.min(metrics.marginLevel, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Used: $
              {metrics.totalUsedMargin.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </Card>

        {/* Available Margin */}
        <Card className="p-4 bg-card">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Available Margin</p>
            <p className="text-2xl font-bold font-mono">
              $
              {metrics.totalAvailableMargin.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {metrics.totalBalance > 0 &&
                (
                  (metrics.totalAvailableMargin / metrics.totalBalance) *
                  100
                ).toFixed(1) + "% available"}
            </p>
          </div>
        </Card>
      </div>

      {/* P&L Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Unrealized vs Realized */}
        <Card className="p-4 bg-card">
          <h3 className="font-semibold mb-4">P&L Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Unrealized P&L
              </span>
              <span
                className={`font-semibold ${metrics.unrealizedPnL >= 0 ? "text-profit" : "text-loss"}`}
              >
                {metrics.unrealizedPnL >= 0 ? "+" : ""}$
                {metrics.unrealizedPnL.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Realized P&L
              </span>
              <span
                className={`font-semibold ${metrics.realizedPnL >= 0 ? "text-profit" : "text-loss"}`}
              >
                {metrics.realizedPnL >= 0 ? "+" : ""}$
                {metrics.realizedPnL.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="border-t border-border pt-4 flex items-center justify-between">
              <span className="text-sm font-semibold">Total P&L</span>
              <span
                className={`font-bold text-lg ${metrics.totalPnL >= 0 ? "text-profit" : "text-loss"}`}
              >
                {metrics.totalPnL >= 0 ? "+" : ""}$
                {metrics.totalPnL.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-4 bg-card">
          <h3 className="font-semibold mb-4">Performance</h3>
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Win Rate</span>
              <span className="font-semibold">
                {performanceMetrics.totalTrades > 0
                  ? `${performanceMetrics.winRate}/${performanceMetrics.totalTrades}`
                  : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Avg Return</span>
              <span
                className={`font-semibold ${performanceMetrics.avgReturn >= 0 ? "text-profit" : "text-loss"}`}
              >
                {performanceMetrics.avgReturn.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sharpe Ratio</span>
              <span className="font-semibold font-mono">
                {performanceMetrics.sharpeRatio.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Best Trade</span>
                <span className="text-profit font-semibold">
                  +{performanceMetrics.bestTrade.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Worst Trade</span>
                <span className="text-loss font-semibold">
                  {performanceMetrics.worstTrade.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Holdings and Asset Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Holdings Table */}
        <div className="lg:col-span-2">
          <Card className="p-4 bg-card">
            <h3 className="font-semibold mb-4">Open Positions</h3>
            {positions && positions.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-4 text-muted-foreground font-medium">
                          Symbol
                        </th>
                        <th className="text-right py-4 text-muted-foreground font-medium">
                          Qty
                        </th>
                        <th className="text-right py-4 text-muted-foreground font-medium">
                          Entry
                        </th>
                        <th className="text-right py-4 text-muted-foreground font-medium">
                          Current
                        </th>
                        <th className="text-right py-4 text-muted-foreground font-medium">
                          P&L
                        </th>
                        <th className="text-right py-4 text-muted-foreground font-medium">
                          ROI%
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((pos) => {
                        const posValue =
                          (pos.current_price ?? 0) * pos.quantity * 100000;
                        const entryValue =
                          pos.entry_price * pos.quantity * 100000;
                        const pnl =
                          pos.side === "buy"
                            ? posValue - entryValue
                            : entryValue - posValue;
                        const roi =
                          entryValue > 0 ? (pnl / entryValue) * 100 : 0;

                        return (
                          <tr
                            key={pos.id}
                            className="border-b border-border/50 hover:bg-secondary/30"
                          >
                            <td className="py-4">
                              <span className="font-semibold">
                                {pos.symbol}
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">
                                ({pos.side})
                              </span>
                            </td>
                            <td className="text-right font-mono text-xs">
                              {pos.quantity}
                            </td>
                            <td className="text-right font-mono text-xs">
                              {pos.entry_price.toFixed(5)}
                            </td>
                            <td className="text-right font-mono text-xs">
                              {pos.current_price
                                ? pos.current_price.toFixed(5)
                                : "0.00000"}
                            </td>
                            <td
                              className={`text-right font-mono text-xs font-semibold ${pnl >= 0 ? "text-profit" : "text-loss"}`}
                            >
                              {pnl >= 0 ? "+" : ""}
                              {pnl.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td
                              className={`text-right font-mono text-xs font-semibold ${roi >= 0 ? "text-profit" : "text-loss"}`}
                            >
                              {roi >= 0 ? "+" : ""}
                              {roi.toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card Layout */}
                <div className="md:hidden space-y-3">
                  {positions.map((pos) => {
                    const posValue = pos.current_price * pos.quantity * 100000;
                    const entryValue = pos.entry_price * pos.quantity * 100000;
                    const pnl =
                      pos.side === "buy"
                        ? posValue - entryValue
                        : entryValue - posValue;
                    const roi = entryValue > 0 ? (pnl / entryValue) * 100 : 0;

                    return (
                      <div
                        key={pos.id}
                        className="border border-border rounded-lg p-3 space-y-2 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">
                            {pos.symbol}
                          </h4>
                          <span
                            className={`text-xs px-2 py-1 rounded ${pos.side === "buy" ? "bg-buy/20 text-buy" : "bg-sell/20 text-sell"}`}
                          >
                            {pos.side.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Qty:</span>
                            <p className="font-mono font-semibold">
                              {pos.quantity}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Entry:
                            </span>
                            <p className="font-mono font-semibold">
                              {pos.entry_price.toFixed(5)}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Current:
                            </span>
                            <p className="font-mono font-semibold">
                              {pos.current_price
                                ? pos.current_price.toFixed(5)
                                : "0.00000"}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">ROI:</span>
                            <p
                              className={`font-mono font-semibold ${roi >= 0 ? "text-profit" : "text-loss"}`}
                            >
                              {roi >= 0 ? "+" : ""}
                              {roi.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                        <div
                          className={`pt-2 border-t text-sm font-semibold ${pnl >= 0 ? "text-profit" : "text-loss"}`}
                        >
                          P&L: {pnl >= 0 ? "+" : ""}
                          {pnl.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No open positions
              </p>
            )}
          </Card>
        </div>

        {/* Asset Allocation Summary */}
        <Card className="p-4 bg-card">
          <div className="flex items-center gap-4 mb-4">
            <PieChart className="h-4 w-4" />
            <h3 className="font-semibold">Asset Allocation</h3>
          </div>
          {assetAllocation.length > 0 ? (
            <div className="space-y-4">
              {assetAllocation.map((asset) => (
                <div key={asset.symbol}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      {asset.symbol}
                    </span>
                    <span className="font-semibold">
                      {asset.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className={asset.side === "buy" ? "bg-profit" : "bg-loss"}
                      style={{ width: `${Math.min(asset.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm py-4">
              No positions
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PortfolioDashboard;
