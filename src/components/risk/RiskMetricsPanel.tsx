/**
 * Risk Metrics Panel Component
 *
 * Displays key risk metrics in a 4-column grid:
 * - Margin Level with progress bar
 * - Total Equity
 * - Total P&L with trend indicator
 * - Capital at Risk
 */

import React from 'react';
import {
  Target,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMarginLevel, formatCurrency } from '@/lib/risk/riskMetrics';

interface RiskMetricsPanelProps {
  riskMetrics: {
    currentMarginLevel: number;
    marginCallThreshold: number;
    liquidationThreshold: number;
    freeMargin: number;
    usedMargin: number;
    capitalAtRisk: number;
    capitalAtRiskPercentage: number;
  } | null;
  portfolioMetrics: {
    currentEquity: number;
    totalCapital: number;
    totalPnL: number;
    roi: number;
  } | null;
}

export const RiskMetricsPanel: React.FC<RiskMetricsPanelProps> = ({
  riskMetrics,
  portfolioMetrics,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {/* Margin Level */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-2 pb-4">
          <CardTitle className="text-sm font-medium">Margin Level</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {riskMetrics ? formatMarginLevel(riskMetrics.currentMarginLevel) : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Call: {riskMetrics?.marginCallThreshold}% | Liquidation:{' '}
            {riskMetrics?.liquidationThreshold}%
          </p>
          {riskMetrics && (
            <div className="w-full bg-border rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full ${
                  riskMetrics.currentMarginLevel >= 200
                    ? 'bg-buy'
                    : riskMetrics.currentMarginLevel >= 100
                    ? 'bg-yellow-600'
                    : 'bg-sell'
                }`}
                style={{
                  width: `${Math.min(
                    (riskMetrics.currentMarginLevel / 300) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Equity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-2 pb-4">
          <CardTitle className="text-sm font-medium">Total Equity</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(portfolioMetrics?.currentEquity || 0)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Capital: {formatCurrency(portfolioMetrics?.totalCapital || 0)}
          </p>
        </CardContent>
      </Card>

      {/* Total P&L */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-2 pb-4">
          <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          {(portfolioMetrics?.totalPnL || 0) >= 0 ? (
            <TrendingUp className="h-4 w-4 text-buy" />
          ) : (
            <TrendingDown className="h-4 w-4 text-sell" />
          )}
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              (portfolioMetrics?.totalPnL || 0) >= 0
                ? 'text-buy'
                : 'text-sell'
            }`}
          >
            {formatCurrency(portfolioMetrics?.totalPnL || 0)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            ROI: {portfolioMetrics?.roi.toFixed(2)}%
          </p>
        </CardContent>
      </Card>

      {/* Capital at Risk */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-2 pb-4">
          <CardTitle className="text-sm font-medium">Capital at Risk</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(riskMetrics?.capitalAtRisk || 0)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {riskMetrics?.capitalAtRiskPercentage.toFixed(2)}% of Equity
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskMetricsPanel;
