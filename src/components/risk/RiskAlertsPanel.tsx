/**
 * Risk Alerts Panel Component
 *
 * Displays:
 * - Risk Level Alert (color-coded by level)
 * - Trade Statistics (Win Rate, Profit Factor, Max Drawdown)
 * - Recommended Actions
 */

import React from 'react';
import {
  AlertTriangle,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getRiskLevelDetails, formatCurrency } from '@/lib/risk/riskMetrics';

interface RiskAlertsProps {
  riskLevel: string;
  riskMetrics: {
    riskLevel: string;
  } | null;
  portfolioMetrics: {
    winRate: number;
    profitableTrades: number;
    totalTrades: number;
    profitFactor: number;
  } | null;
  drawdownAnalysis: {
    maxDrawdownPercentage: number;
    maxDrawdown: number;
  } | null;
  portfolioRiskAssessment: {
    recommendedActions?: string[];
  } | null;
}

export const RiskAlertsPanel: React.FC<RiskAlertsProps> = ({
  riskLevel,
  riskMetrics,
  portfolioMetrics,
  drawdownAnalysis,
  portfolioRiskAssessment,
}) => {
  const riskLevelDetails = riskMetrics
    ? getRiskLevelDetails(riskMetrics.riskLevel as 'safe' | 'warning' | 'critical' | 'liquidation')
    : null;

  return (
    <div className="space-y-4">
      {/* Risk Level Alert */}
      {riskLevelDetails && (
        <Card
          className={`border-2 ${
            riskMetrics?.riskLevel === 'liquidation'
              ? 'border-red-500 bg-red-50'
              : riskMetrics?.riskLevel === 'critical'
              ? 'border-orange-500 bg-orange-50'
              : riskMetrics?.riskLevel === 'warning'
              ? 'border-yellow-500 bg-yellow-50'
              : 'border-green-500 bg-green-50'
          }`}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {riskMetrics?.riskLevel === 'liquidation' && (
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                )}
                {riskMetrics?.riskLevel === 'critical' && (
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                )}
                {riskMetrics?.riskLevel === 'warning' && (
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                )}
                {riskMetrics?.riskLevel === 'safe' && (
                  <Activity className="h-6 w-6 text-green-600" />
                )}
                <CardTitle>{riskLevelDetails.description}</CardTitle>
              </div>
              <Badge
                variant={
                  riskMetrics?.riskLevel === 'liquidation'
                    ? 'destructive'
                    : riskMetrics?.riskLevel === 'critical'
                    ? 'outline'
                    : 'secondary'
                }
              >
                {riskMetrics?.riskLevel.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          {riskLevelDetails.warningMessage && (
            <CardContent>
              <p className="text-sm font-medium">{riskLevelDetails.warningMessage}</p>
              <p className="text-sm mt-2">{riskLevelDetails.recommendedAction}</p>
            </CardContent>
          )}
        </Card>
      )}

      {/* Trade Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {portfolioMetrics?.winRate.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {portfolioMetrics?.profitableTrades || 0} wins /{' '}
              {portfolioMetrics?.totalTrades || 0} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {portfolioMetrics?.profitFactor.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Goal: {'>'} 1.5 for profitability
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {drawdownAnalysis?.maxDrawdownPercentage.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {formatCurrency(drawdownAnalysis?.maxDrawdown || 0)} loss
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {portfolioRiskAssessment?.recommendedActions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {portfolioRiskAssessment.recommendedActions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-2.5 flex-shrink-0" />
                  <span className="text-sm">{action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RiskAlertsPanel;
