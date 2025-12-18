import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { formatTooltipValue } from '@/lib/chartUtils';
import { ZoomIn, ZoomOut } from 'lucide-react';
import React, { Suspense, useMemo, useState } from 'react';

// Dynamic import wrapper for recharts components
const DynamicLineChart = React.lazy(() =>
  import('recharts').then((m) => ({
    default: m.LineChart,
  }))
);

const DynamicLine = React.lazy(() =>
  import('recharts').then((m) => ({
    default: m.Line,
  }))
);

const DynamicXAxis = React.lazy(() =>
  import('recharts').then((m) => ({
    default: m.XAxis,
  }))
);

const DynamicYAxis = React.lazy(() =>
  import('recharts').then((m) => ({
    default: m.YAxis,
  }))
);

const DynamicTooltip = React.lazy(() =>
  import('recharts').then((m) => ({
    default: m.Tooltip,
  }))
);

const DynamicResponsiveContainer = React.lazy(() =>
  import('recharts').then((m) => ({
    default: m.ResponsiveContainer,
  }))
);

const DynamicCartesianGrid = React.lazy(() =>
  import('recharts').then((m) => ({
    default: m.CartesianGrid,
  }))
);

const DynamicReferenceLine = React.lazy(() =>
  import('recharts').then((m) => ({
    default: m.ReferenceLine,
  }))
);

// Loading component for charts
const ChartLoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-muted rounded-lg h-64 w-full"></div>
  </div>
);

type Timeframe = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';

interface DataPoint {
  date: string;
  equity: number;
  pnl: number;
}

const TIMEFRAME_CONFIG: Record<Timeframe, { days: number; interval: string }> =
  {
    '1D': { days: 1, interval: 'hourly' },
    '1W': { days: 7, interval: 'daily' },
    '1M': { days: 30, interval: 'daily' },
    '3M': { days: 90, interval: 'weekly' },
    '6M': { days: 180, interval: 'weekly' },
    '1Y': { days: 365, interval: 'monthly' },
  };

export const EquityChart: React.FC = () => {
  const { profile, positions } = usePortfolioData();
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);

  // Memoized chart data
  const data = useMemo(() => {
    const base = profile?.balance ?? 0;
    const config = TIMEFRAME_CONFIG[timeframe];
    let points = config.days;

    // Adjust points based on interval
    if (config.interval === 'hourly') points = 24;
    else if (config.interval === 'weekly') points = Math.ceil(config.days / 7);
    else if (config.interval === 'monthly')
      points = Math.ceil(config.days / 30);

    const dataPoints: DataPoint[] = Array.from({ length: points }).map(
      (_, i) => {
        const date = new Date();
        const daysBack = points - 1 - i;

        if (config.interval === 'hourly') {
          date.setHours(date.getHours() - daysBack);
        } else if (config.interval === 'weekly') {
          date.setDate(date.getDate() - daysBack * 7);
        } else if (config.interval === 'monthly') {
          date.setMonth(date.getMonth() - daysBack);
        } else {
          date.setDate(date.getDate() - daysBack);
        }

        const equityFluctuation = (positions || []).reduce(
          (sum: number, pos: any) => {
            const volatility =
              ((pos.current_price || 0) - (pos.entry_price || 0)) *
              pos.quantity *
              100000;
            return sum + volatility * Math.sin(i / Math.max(points / 5, 1));
          },
          0
        );

        const equity = Math.max(0, base + equityFluctuation);
        const pnl = equity - base;

        return {
          date:
            config.interval === 'hourly'
              ? date.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : date.toISOString().slice(0, 10),
          equity,
          pnl,
        };
      }
    );

    return dataPoints;
  }, [profile, positions, timeframe]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (data.length === 0)
      return { minEquity: 0, maxEquity: 0, totalPnL: 0, avgEquity: 0 };

    const equities = data.map((d) => d.equity);
    const minEquity = Math.min(...equities);
    const maxEquity = Math.max(...equities);
    const totalPnL = data[data.length - 1]?.pnl ?? 0;
    const avgEquity = equities.reduce((a, b) => a + b, 0) / equities.length;

    return { minEquity, maxEquity, totalPnL, avgEquity };
  }, [data]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 1));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanX(0);
  };

  // Calculate visible data range based on zoom
  const visibleDataStart = Math.max(0, Math.floor((panX * data.length) / 100));
  const visibleDataLength = Math.max(5, Math.floor(data.length / zoomLevel));
  const visibleData = data.slice(
    visibleDataStart,
    Math.min(visibleDataStart + visibleDataLength, data.length)
  );

  return (
    <Card elevation="1" variant="primary" className="p-4 bg-card">
      <div className="space-y-4">
        {/* Header with controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="font-semibold">Equity Curve</h3>
          <div className="flex flex-wrap gap-4">
            {(Object.keys(TIMEFRAME_CONFIG) as Timeframe[]).map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setTimeframe(tf);
                  handleResetZoom();
                }}
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="aspect-video w-full">
          <Suspense fallback={<ChartLoadingSkeleton />}>
            <DynamicResponsiveContainer>
              <DynamicLineChart
                data={visibleData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <DynamicCartesianGrid strokeDasharray="3 3" />
                <DynamicXAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <DynamicYAxis
                  tick={{ fontSize: 12 }}
                  label={{
                    value: 'Equity ($)',
                    angle: -90,
                    position: 'insideLeft',
                  }}
                />
                <DynamicTooltip
                  formatter={formatTooltipValue as (value: unknown) => string}
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                  }}
                />

                <DynamicReferenceLine
                  y={stats.avgEquity}
                  stroke="#94a3b8"
                  strokeDasharray="5 5"
                  label={{
                    value: 'Avg',
                    position: 'right',
                    fill: '#94a3b8',
                    fontSize: 12,
                  }}
                />
                <DynamicLine
                  type="monotone"
                  dataKey="equity"
                  stroke="#4ade80"
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </DynamicLineChart>
            </DynamicResponsiveContainer>
          </Suspense>
        </div>

        {/* Statistics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-secondary/50 rounded">
            <p className="text-muted-foreground">Min Equity</p>
            <p className="font-semibold">
              $
              {stats.minEquity.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="p-4 bg-secondary/50 rounded">
            <p className="text-muted-foreground">Max Equity</p>
            <p className="font-semibold">
              $
              {stats.maxEquity.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="p-4 bg-secondary/50 rounded">
            <p className="text-muted-foreground">Avg Equity</p>
            <p className="font-semibold">
              $
              {stats.avgEquity.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div
            className={`p-4 bg-secondary/50 rounded ${
              stats.totalPnL >= 0 ? 'text-profit' : 'text-loss'
            }`}
          >
            <p className="text-muted-foreground">Total P&L</p>
            <p className="font-semibold">
              $
              {stats.totalPnL.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${Math.min((zoomLevel - 1) * 50, 100)}%` }}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          {zoomLevel > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetZoom}
              className="text-xs"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Pan slider */}
        {zoomLevel > 1 && (
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">Pan:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={panX}
              onChange={(e) => setPanX(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-secondary rounded-full cursor-pointer"
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default EquityChart;
