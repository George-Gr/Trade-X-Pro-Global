import React, { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import type { PieProps, TooltipProps, CellProps, ResponsiveContainerProps } from 'recharts';

// Dynamic import wrapper for recharts components with proper type assertions
const DynamicPieChart = React.lazy(() => import('recharts').then(m => ({
  default: m.PieChart as React.ComponentType<ResponsiveContainerProps>,
})));

const DynamicPie = React.lazy(() => import('recharts').then(m => ({
  default: m.Pie as React.ComponentType<PieProps>,
})));

const DynamicCell = React.lazy(() => import('recharts').then(m => ({
  default: m.Cell as React.ComponentType<CellProps>,
})));

const DynamicTooltip = React.lazy(() => import('recharts').then(m => ({
  default: m.Tooltip as React.ComponentType<TooltipProps<number, string>>,
})));

const DynamicResponsiveContainer = React.lazy(() => import('recharts').then(m => ({
  default: m.ResponsiveContainer as React.ComponentType<ResponsiveContainerProps>,
})));

const COLORS = ['#4ade80', '#f97316', '#60a5fa', '#f87171', '#c084fc', '#94a3b8'];

// Loading component for charts
const ChartLoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-muted rounded-full h-48 w-48 mx-auto"></div>
  </div>
);

export const AssetAllocation: React.FC<{ onSelect?: (symbol: string) => void }> = ({ onSelect }) => {
  const { positions } = usePortfolioData();

  const groups = positions.reduce<Record<string, number>>((acc, pos) => {
    const cls = (pos.asset_class || 'OTHER').toUpperCase();
    const notional = Math.abs((pos.current_price || 0) * pos.quantity * 100000);
    acc[cls] = (acc[cls] || 0) + notional;
    return acc;
  }, {});

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
          <DynamicResponsiveContainer width="100%" height="100%">
            <DynamicPieChart>
              <React.Fragment>
                <DynamicPie dataKey="value" data={data} innerRadius={40} outerRadius={80} paddingAngle={2}>
                  {data.map((entry, index) => (
                    <DynamicCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </DynamicPie>
                <DynamicTooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']} />
              </React.Fragment>
            </DynamicPieChart>
          </DynamicResponsiveContainer>
        </Suspense>
      </div>
    </Card>
  );
};

export default AssetAllocation;
