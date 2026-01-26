import { Card } from '@/components/ui/card';
import React from 'react';

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

interface PnLBreakdownCardProps {
  metrics: PortfolioMetrics;
}

/**
 * PnLBreakdownCard component displays a breakdown of profit and loss metrics for the portfolio.
 * @param props - The props object.
 * @param props.metrics - PortfolioMetrics object containing various P&L and margin data.
 */
export const PnLBreakdownCard: React.FC<PnLBreakdownCardProps> = ({ metrics }) => {
  return (
    <Card className="p-4 bg-card">
      <h3 className="font-semibold mb-4">P&L Breakdown</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Unrealized P&L
          </span>
          <span
            className={`font-semibold ${
              metrics.unrealizedPnL >= 0 ? 'text-profit' : 'text-loss'
            }`}
          >
            {metrics.unrealizedPnL >= 0 ? '+' : ''}$
            {metrics.unrealizedPnL.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Realized P&L
          </span>
          <span
            className={`font-semibold ${
              metrics.realizedPnL >= 0 ? 'text-profit' : 'text-loss'
            }`}
          >
            {metrics.realizedPnL >= 0 ? '+' : ''}$
            {metrics.realizedPnL.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="border-t border-border pt-4 flex items-center justify-between">
          <span className="text-sm font-semibold">Total P&L</span>
          <span
            className={`font-bold text-lg ${
              metrics.totalPnL >= 0 ? 'text-profit' : 'text-loss'
            }`}
          >
            {metrics.totalPnL >= 0 ? '+' : ''}$
            {metrics.totalPnL.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>
    </Card>
  );
};