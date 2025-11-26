import React, { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { usePortfolioData } from '@/hooks/usePortfolioData';

// Dynamic import wrapper for recharts components
const DynamicPieChart = React.lazy(() => import('recharts').then(m => ({
  default: m.PieChart,
})));

const DynamicPie = React.lazy(() => import('recharts').then(m => ({
  default: m.Pie,
})));

const DynamicCell = React.lazy(() => import('recharts').then(m => ({
  default: m.Cell,
})));

const DynamicTooltip = React.lazy(() => import('recharts').then(m => ({
  default: m.Tooltip,
})));

const DynamicResponsiveContainer = React.lazy(() => import('recharts').then(m => ({
  default: m.ResponsiveContainer,
})));

const COLORS = ['#4ade80', '#f97316', '#60a5fa', '#f87171', '#c084fc', '#94a3b8'];

// Loading component for charts
const ChartLoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-muted rounded-full h-48 w-48 mx-auto"></div>
  </div>
);

const COLORS = ['#4ade80', '#f97316', '#60a5fa', '#f87171', '#c084fc', '#94a3b8'];

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
      <div className="aspect-[16/9] w-full">
        <Suspense fallback={<ChartLoadingSkeleton />}>
          <DynamicResponsiveContainer>
            <DynamicPieChart>
              <DynamicPie dataKey="value" data={data} innerRadius={40} outerRadius={80} paddingAngle={2}>
                {data.map((entry, index) => (
                  <DynamicCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </DynamicPie>
              <DynamicTooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            </DynamicPieChart>
          </DynamicResponsiveContainer>
        </Suspense>
      </div>
    </Card>
  );
};

export default AssetAllocation;
