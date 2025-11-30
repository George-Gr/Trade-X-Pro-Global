import React, { useMemo, Suspense } from 'react';
import { Card } from '@/components/ui/card';

// Dynamic import wrapper for recharts components
const DynamicBarChart = React.lazy(() => import('recharts').then(m => ({
  default: m.BarChart as React.ComponentType<React.ComponentProps<typeof m.BarChart>>,
})));

const DynamicBar = React.lazy(() => import('recharts').then(m => ({
  default: m.Bar as React.ComponentType<React.ComponentProps<typeof m.Bar>>,
})));

const DynamicXAxis = React.lazy(() => import('recharts').then(m => ({
  default: m.XAxis as React.ComponentType<React.ComponentProps<typeof m.XAxis>>,
})));

const DynamicYAxis = React.lazy(() => import('recharts').then(m => ({
  default: m.YAxis as React.ComponentType<React.ComponentProps<typeof m.YAxis>>,
})));

const DynamicTooltip = React.lazy(() => import('recharts').then(m => ({
  default: m.Tooltip as React.ComponentType<React.ComponentProps<typeof m.Tooltip>>,
})));

const DynamicResponsiveContainer = React.lazy(() => import('recharts').then(m => ({
  default: m.ResponsiveContainer as React.ComponentType<React.ComponentProps<typeof m.ResponsiveContainer>>,
})));

const DynamicCartesianGrid = React.lazy(() => import('recharts').then(m => ({
  default: m.CartesianGrid as React.ComponentType<React.ComponentProps<typeof m.CartesianGrid>>,
})));

const DynamicCell = React.lazy(() => import('recharts').then(m => ({
  default: m.Cell as React.ComponentType<React.ComponentProps<typeof m.Cell>>,
})));

// Loading component for charts
const ChartLoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-muted rounded-lg h-48 w-full"></div>
  </div>
);

interface DailyPnL {
  date: string;
  pnl: number;
  isProfit: boolean;
}

export const RecentPnLChart: React.FC = () => {
  const data = useMemo((): DailyPnL[] => {
    // Generate synthetic last 30 days of P&L data
    const days = 30;
    return Array.from({ length: days }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));

      // Simulate daily P&L with some volatility
      const basePnL = (Math.random() - 0.4) * 500;
      const trend = (i / days) * 200; // Slight upward trend
      const pnl = basePnL + trend;

      return {
        date: date.toISOString().slice(5, 10), // MM-DD format
        pnl: Math.round(pnl),
        isProfit: pnl >= 0,
      };
    });
  }, []);

  const stats = useMemo(() => {
    const totalPnL = data.reduce((sum, d) => sum + d.pnl, 0);
    const profitDays = data.filter((d) => d.isProfit).length;
    const maxProfit = Math.max(...data.map((d) => d.pnl), 0);
    const maxLoss = Math.min(...data.map((d) => d.pnl), 0);

    return {
      totalPnL,
      profitDays,
      lossDays: data.length - profitDays,
      winRate: (profitDays / data.length) * 100,
      maxProfit,
      maxLoss,
    };
  }, [data]);

  return (
    <Card elevation="1" variant="primary" className="p-4 bg-card">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Daily P&L (Last 30 Days)</h3>
          <div className="text-xs text-muted-foreground">
            {stats.profitDays} win, {stats.lossDays} loss
          </div>
        </div>

        {/* Chart */}
        <div className="aspect-video w-full">
          <Suspense fallback={<ChartLoadingSkeleton />}>
            <DynamicResponsiveContainer>
              <DynamicBarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <DynamicCartesianGrid strokeDasharray="3 3" vertical={false} />
                <DynamicXAxis dataKey="date" tick={{ fontSize: 11 }} />
                <DynamicYAxis tick={{ fontSize: 11 }} />
                <DynamicTooltip
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
                />
                <DynamicBar dataKey="pnl" isAnimationActive={false}>
                  {data.map((entry, index) => (
                    <DynamicCell key={`cell-${index}`} fill={entry.isProfit ? '#4ade80' : '#f87171'} />
                  ))}
                </DynamicBar>
              </DynamicBarChart>
            </DynamicResponsiveContainer>
          </Suspense>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-secondary/50 rounded">
            <p className="text-muted-foreground">Total P&L</p>
            <p className={`font-semibold ${stats.totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
              ${stats.totalPnL.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-secondary/50 rounded">
            <p className="text-muted-foreground">Win Rate</p>
            <p className="font-semibold">{stats.winRate.toFixed(1)}%</p>
          </div>
          <div className="p-4 bg-secondary/50 rounded">
            <p className="text-muted-foreground">Max Profit</p>
            <p className="font-semibold text-profit">${stats.maxProfit.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-secondary/50 rounded">
            <p className="text-muted-foreground">Profit Days</p>
            <p className="font-semibold">{stats.profitDays}</p>
          </div>
          <div className="p-4 bg-secondary/50 rounded">
            <p className="text-muted-foreground">Loss Days</p>
            <p className="font-semibold">{stats.lossDays}</p>
          </div>
          <div className="p-4 bg-secondary/50 rounded">
            <p className="text-muted-foreground">Max Loss</p>
            <p className="font-semibold text-loss">${stats.maxLoss.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RecentPnLChart;
