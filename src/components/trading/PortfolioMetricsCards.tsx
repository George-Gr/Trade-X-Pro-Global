import { Card } from '@/components/ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';

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

interface PortfolioMetricsCardsProps {
  metrics: PortfolioMetrics;
}

export const PortfolioMetricsCards = ({ metrics }: PortfolioMetricsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                metrics.totalPnL >= 0 ? 'text-profit' : 'text-loss'
              }`}
            >
              {metrics.totalPnL >= 0 ? '+' : ''}
              {metrics.totalPnL.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <p
            className={`text-xs font-semibold ${
              metrics.roi >= 0 ? 'text-profit' : 'text-loss'
            }`}
          >
            ROI: {metrics.roi.toFixed(2)}%
          </p>
        </div>
      </Card>

      {/* Daily P&L */}
      <Card className="p-4 bg-card">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Daily P&L</p>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-blue-500/20 flex items-center justify-center">
              <div className="h-2 w-2 rounded bg-blue-500" />
            </div>
            <p className="text-xl font-bold font-mono text-muted-foreground">
              N/A
            </p>
          </div>
          <p className="text-xs text-muted-foreground">Coming soon</p>
        </div>
      </Card>

      {/* Margin Status */}
      <Card
        className={`p-4 ${
          metrics.marginLevel > 80
            ? 'border-yellow-500/30 bg-background/5'
            : 'bg-card'
        }`}
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
                  ? 'bg-loss'
                  : metrics.marginLevel > 80
                  ? 'bg-background'
                  : 'bg-profit'
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
              ).toFixed(1) + '% available'}
          </p>
        </div>
      </Card>
    </div>
  );
};