/**
 * Risk Charts Panel Component
 *
 * Displays four tabs with visualizations:
 * - Overview: Margin details, trade stats, recommendations
 * - Charts: Equity curve, portfolio allocation
 * - Stress Test: Bar chart of stress test scenarios
 * - Diversification: Diversification score, stats, and top positions
 */

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/risk/riskMetrics';

interface RiskChartsPanelProps {
  equityHistory: number[] | null;
  assetClassMetrics: Record<
    string,
    {
      percentageOfPortfolio: number;
    }
  >;
  stressTests: {
    scenarios: Array<{
      priceMovement: string;
      estimatedLoss: number;
      marginLevel: number;
    }>;
    maxPossibleLoss: number;
    survivalRate: number;
  } | null;
  diversification: {
    diversificationScore: number;
    isWellDiversified: boolean;
    numberOfSymbols: number;
    numberOfAssetClasses: number;
    largestPosition: number;
    topThreePositions: number;
  } | null;
  concentration: {
    totalPositions: number;
    topPositions: Array<{
      symbol: string;
      risk: string;
      percentageOfPortfolio: number;
    }>;
  } | null;
  riskMetrics: {
    freeMargin: number;
    usedMargin: number;
    capitalAtRisk: number;
  } | null;
  portfolioMetrics: {
    largestWin: number;
    largestLoss: number;
    expectancy: number;
  } | null;
}

export const RiskChartsPanel: React.FC<RiskChartsPanelProps> = ({
  equityHistory,
  assetClassMetrics,
  stressTests,
  diversification,
  concentration,
  riskMetrics,
  portfolioMetrics,
}) => {
  const [selectedTab, setSelectedTab] = useState('overview');

  // Prepare chart data
  const equityChartData = useMemo(() => {
    return (equityHistory || []).map((equity, index) => ({
      date: `Day ${index + 1}`,
      equity: Math.round(equity * 100) / 100,
    }));
  }, [equityHistory]);

  const stressTestChartData = useMemo(() => {
    return (stressTests?.scenarios || []).map((scenario) => ({
      movement: scenario.priceMovement,
      loss: Math.round(scenario.estimatedLoss * 100) / 100,
      marginLevel: scenario.marginLevel,
    }));
  }, [stressTests]);

  const assetClassChartData = useMemo(() => {
    const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    return Object.entries(assetClassMetrics).map(([assetClass, metrics], index) => ({
      name: assetClass,
      value: metrics.percentageOfPortfolio,
      color: COLORS[index % COLORS.length],
    }));
  }, [assetClassMetrics]);

  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="charts">Charts</TabsTrigger>
        <TabsTrigger value="stress">Stress Test</TabsTrigger>
        <TabsTrigger value="diversification">Diversification</TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Margin Details */}
          <Card>
            <CardHeader>
              <CardTitle>Margin Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Free Margin</span>
                  <span className="font-medium">
                    {formatCurrency(riskMetrics?.freeMargin || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Used Margin</span>
                  <span className="font-medium">
                    {formatCurrency(riskMetrics?.usedMargin || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Trade Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Largest Win</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(portfolioMetrics?.largestWin || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Largest Loss</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(portfolioMetrics?.largestLoss || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Expectancy</span>
                <span className="font-medium">
                  {formatCurrency(portfolioMetrics?.expectancy || 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Charts Tab */}
      <TabsContent value="charts" className="space-y-4">
        {equityChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Equity Curve (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={equityChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="equity"
                    stroke="#3b82f6"
                    name="Equity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {assetClassChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={assetClassChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {assetClassChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Stress Test Tab */}
      <TabsContent value="stress">
        {stressTestChartData.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Stress Test Results</CardTitle>
              <CardDescription>
                Estimated losses under different market conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stressTestChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="movement" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="loss" fill="#ef4444" name="Est. Loss" />
                </BarChart>
              </ResponsiveContainer>
              {stressTests && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    Worst Case: {formatCurrency(stressTests.maxPossibleLoss)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Survival Rate: {stressTests.survivalRate.toFixed(2)}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">No positions to stress test</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Diversification Tab */}
      <TabsContent value="diversification">
        <div className="grid gap-4 md:grid-cols-2">
          {diversification && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Diversification Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-600">
                    {diversification.diversificationScore}%
                  </div>
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-blue-600"
                      style={{
                        width: `${diversification.diversificationScore}%`,
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {diversification.isWellDiversified
                      ? 'Portfolio is well diversified'
                      : 'Consider diversifying further'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Diversification Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Positions</span>
                    <span className="font-medium">{diversification.numberOfSymbols}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Asset Classes</span>
                    <span className="font-medium">{diversification.numberOfAssetClasses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Largest Position</span>
                    <span className="font-medium">
                      {diversification.largestPosition.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Top 3 Positions</span>
                    <span className="font-medium">
                      {diversification.topThreePositions.toFixed(2)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {concentration && concentration.totalPositions > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Positions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {concentration.topPositions.map((pos) => (
                    <div key={pos.symbol} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{pos.symbol}</span>
                        <Badge variant="outline">{pos.risk}</Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            pos.risk === 'critical'
                              ? 'bg-red-600'
                              : pos.risk === 'high'
                              ? 'bg-orange-600'
                              : pos.risk === 'medium'
                              ? 'bg-yellow-600'
                              : 'bg-green-600'
                          }`}
                          style={{
                            width: `${Math.min(pos.percentageOfPortfolio, 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {pos.percentageOfPortfolio.toFixed(2)}% of portfolio
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default RiskChartsPanel;
