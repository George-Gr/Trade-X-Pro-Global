import React from 'react';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { usePortfolioData } from '@/hooks/usePortfolioData';

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
      <Card className="p-4 bg-card">
        <p className="text-sm text-muted-foreground">No positions</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card">
      <h3 className="font-semibold mb-2">Asset Allocation</h3>
      <div className="aspect-[16/9] w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie dataKey="value" data={data} innerRadius={40} outerRadius={80} paddingAngle={2}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default AssetAllocation;
