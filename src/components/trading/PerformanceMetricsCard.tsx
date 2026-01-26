import { Card } from '@/components/ui/card';

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

interface PerformanceMetricsCardProps {
  performanceMetrics: PerformanceMetrics;
}

export const PerformanceMetricsCard = ({ performanceMetrics }: PerformanceMetricsCardProps) => {
  return (
    <Card className="p-4 bg-card">
      <h3 className="font-semibold mb-4">Advanced Performance</h3>
      <div className="space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Win Rate</span>
          <span className="font-semibold">
            {performanceMetrics.totalTrades > 0
              ? `${performanceMetrics.winRate}/${performanceMetrics.totalTrades}`
              : '-'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Avg Return</span>
          <span
            className={`font-semibold ${
              performanceMetrics.avgReturn >= 0
                ? 'text-profit'
                : 'text-loss'
            }`}
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
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Volatility</span>
          <span className="font-semibold font-mono">
            {performanceMetrics.volatility.toFixed(2)}%
          </span>
        </div>
        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Best Trade</span>
            <span className={cn('font-semibold', performanceMetrics.bestTrade >= 0 ? 'text-profit' : 'text-loss')}>
              {performanceMetrics.bestTrade >= 0 ? '+' : ''}{performanceMetrics.bestTrade.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Worst Trade</span>
            <span className={cn('font-semibold', performanceMetrics.worstTrade >= 0 ? 'text-profit' : 'text-loss')}>
              {performanceMetrics.worstTrade >= 0 ? '+' : ''}{performanceMetrics.worstTrade.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Max Drawdown</span>
            <span className="text-loss font-semibold">
              -{performanceMetrics.maxDrawdown.toFixed(2)}%
            </span>
          </div>        </div>
      </div>
    </Card>
  );
};