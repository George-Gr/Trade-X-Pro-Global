import { Card } from '@/components/ui/card';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import type { FC } from 'react';
import React, { Suspense } from 'react';

// Dynamic import wrapper for recharts components
const DynamicPieChart = React.lazy(() =>
  import('recharts').then((m) => ({
    default: m.PieChart as React.ComponentType<
      React.ComponentProps<typeof m.PieChart>
    >,
  }))
);

const DynamicPie = React.lazy(() =>
  import('recharts').then((m) => ({
    default: m.Pie as React.ComponentType<React.ComponentProps<typeof m.Pie>>,
  }))
);

const DynamicCell = React.lazy(() =>
  import('recharts').then((m) => ({
    default: m.Cell as React.ComponentType<React.ComponentProps<typeof m.Cell>>,
  }))
);

const DynamicTooltip = React.lazy(() =>
  import('recharts').then((m) => ({
    default: m.Tooltip as React.ComponentType<
      React.ComponentProps<typeof m.Tooltip>
    >,
  }))
);

const DynamicResponsiveContainer = React.lazy(() =>
  import('recharts').then((m) => ({
    default: m.ResponsiveContainer as React.ComponentType<
      React.ComponentProps<typeof m.ResponsiveContainer>
    >,
  }))
);

const COLORS = [
  '#4ade80',
  '#f97316',
  '#60a5fa',
  '#f87171',
  '#c084fc',
  '#94a3b8',
];

// Loading component for charts
const ChartLoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-muted rounded-full h-48 w-48 mx-auto"></div>
  </div>
);

const DEFAULT_ASSET_CLASS = 'OTHER';

export const AssetAllocation: FC = () => {
  const { positions } = usePortfolioData();

  const groups = positions.reduce<Record<string, number>>(
    (acc: Record<string, number>, pos: (typeof positions)[0]) => {
      const cls = (pos.asset_class || DEFAULT_ASSET_CLASS).toUpperCase();
      const notional = Math.abs(
        (pos.current_price || 0) * pos.quantity * 100000
      );
      acc[cls] = (acc[cls] || 0) + notional;
      return acc;
    },
    {}
  );

  const data = Object.entries(groups).map(([name, value]) => ({ name, value }));

  if (data.length === 0) {
    return (
      <Card elevation="1" variant="primary" className="p-4 bg-card">
        <p className="text-sm text-muted-foreground">No positions</p>
      </Card>
    );
  }

  return (
    <Card elevation="1" variant="primary" className="p-4 bg-card">
      <h3 className="font-semibold mb-2">Asset Allocation</h3>
      <div className="aspect-video w-full">
        <Suspense fallback={<ChartLoadingSkeleton />}>
          <DynamicResponsiveContainer>
            <DynamicPieChart>
              <DynamicPie
                dataKey="value"
                data={data}
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
              >
                {data.map((_, index) => (
                  <DynamicCell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </DynamicPie>
              <DynamicTooltip
                formatter={(value: unknown) => {
                  if (value === undefined || value === null) return '';
                  if (Array.isArray(value)) return value.join(', ');
                  return typeof value === 'number'
                    ? `${value.toLocaleString()}`
                    : String(value);
                }}
              />
            </DynamicPieChart>
          </DynamicResponsiveContainer>
        </Suspense>
      </div>
    </Card>
  );
};

export default AssetAllocation;
