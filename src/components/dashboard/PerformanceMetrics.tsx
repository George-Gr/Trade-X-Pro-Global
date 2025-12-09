import React from 'react';
import { Card } from '@/components/ui/card';
import { usePortfolioData } from '@/hooks/usePortfolioData';

export const PerformanceMetrics: React.FC = () => {
  const { positions, profile } = usePortfolioData();

  const totalTrades = positions.length;
  const profitable = positions.filter(p => {
    if (p.unrealized_pnl == null) return false;
    return p.unrealized_pnl > 0;
  }).length;

  const winRate = totalTrades > 0 ? (profitable / totalTrades) * 100 : 0;

  const totalReturn = (() => {
    const equity = (profile?.balance ?? 0) + positions.reduce((s, p) => s + (p.unrealized_pnl || 0), 0);
    const initial = profile?.balance ?? 0; // approximation
    return initial > 0 ? ((equity - initial) / initial) * 100 : 0;
  })();

  return (
    <Card elevation="1" variant="primary" className="p-4 bg-card">
      <h3 className="font-semibold mb-4">Performance Metrics</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Total Trades</p>
          <p className="font-semibold">{totalTrades}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Win Rate</p>
          <p className="font-semibold">{winRate.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-muted-foreground">Total Return</p>
          <p className={`font-semibold ${totalReturn >= 0 ? 'text-profit' : 'text-loss'}`}>{totalReturn.toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-muted-foreground">Sharpe</p>
          <p className="font-semibold">—</p>
        </div>
      </div>
    </Card>
  );
};

export default PerformanceMetrics;
