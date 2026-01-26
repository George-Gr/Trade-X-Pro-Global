import { Card } from '@/components/ui/card';
import { BarChart3, Target, Activity } from 'lucide-react';

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

interface TimePnLTrackingProps {
  performanceMetrics: PerformanceMetrics;
}

export const TimePnLTracking = ({ performanceMetrics }: TimePnLTrackingProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4 bg-card">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-4 w-4 text-blue-500" />
          <h3 className="font-semibold">Weekly P&L</h3>
        </div>
        <p className="text-2xl font-bold font-mono text-muted-foreground">
          N/A
        </p>
        <p className="text-xs text-muted-foreground">Coming soon</p>
      </Card>

      <Card className="p-4 bg-card">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4 text-green-500" />
          <h3 className="font-semibold">Monthly P&L</h3>
        </div>
        <p className="text-2xl font-bold font-mono text-muted-foreground">
          N/A
        </p>
        <p className="text-xs text-muted-foreground">Coming soon</p>
      </Card>

      <Card className="p-4 bg-card">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-4 w-4 text-purple-500" />
          <h3 className="font-semibold">Risk Metrics</h3>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Volatility: {Number.isFinite(performanceMetrics.volatility) ? performanceMetrics.volatility.toFixed(2) : "-"}%
          </p>
          <p className="text-sm text-muted-foreground">
            Max Drawdown: {Number.isFinite(performanceMetrics.maxDrawdown) ? performanceMetrics.maxDrawdown.toFixed(2) : "-"}%
          </p>
        </div>
      </Card>
    </div>
  );
};