/**
 * User Risk Dashboard Component
 *
 * Comprehensive risk monitoring dashboard for traders
 * Displays real-time metrics, charts, and risk analysis
 */

import { useState, useMemo, useCallback } from "react";
import { useRiskMetrics } from "@/hooks/useRiskMetrics";
import { usePortfolioMetrics } from "@/hooks/usePortfolioMetrics";
import { usePositionAnalysis } from "@/hooks/usePositionAnalysis";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "recharts";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Target,
  AlertCircle,
  Download,
  RefreshCw,
} from "lucide-react";
import { getRiskLevelDetails, formatMarginLevel, formatCurrency } from "@/lib/risk/riskMetrics";
import { getRiskLevelColors } from "@/lib/utils";
import {
  exportRiskDashboardToCSV,
  exportRiskDashboardToPDF,
  generateRiskDashboardHTMLReport,
  openRiskDashboardReport,
} from "@/lib/risk/exportUtils";

interface RiskDashboardProps {
  onExport?: (format: 'csv' | 'pdf') => void;
}

export const UserRiskDashboard = ({ onExport }: RiskDashboardProps) => {
  const { riskMetrics, portfolioRiskAssessment, loading: riskLoading, refetch: refetchRisk } =
    useRiskMetrics();
  const { portfolioMetrics, drawdownAnalysis, assetClassMetrics, equityHistory, loading: metricsLoading } =
    usePortfolioMetrics();
  const { concentration, stressTests, diversification, loading: analysisLoading, refetch: refetchAnalysis } =
    usePositionAnalysis();
  const { toast } = useToast();

  const [selectedTab, setSelectedTab] = useState("overview");

  const loading = riskLoading || metricsLoading || analysisLoading;

  // Export handlers
  const handleExportCSV = useCallback(() => {
    try {
      exportRiskDashboardToCSV(
        riskMetrics,
        portfolioMetrics,
        drawdownAnalysis,
        assetClassMetrics,
        concentration,
        stressTests,
        `risk-dashboard-${new Date().toISOString().split('T')[0]}.csv`
      );
      toast({
        title: "Export Successful",
        description: "Risk dashboard data exported to CSV",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export to CSV",
        variant: "destructive",
      });
    }
  }, [riskMetrics, portfolioMetrics, drawdownAnalysis, assetClassMetrics, concentration, stressTests, toast]);

  const handleExportPDF = useCallback(() => {
    try {
      const html = generateRiskDashboardHTMLReport(
        riskMetrics,
        portfolioMetrics,
        drawdownAnalysis,
        assetClassMetrics,
        concentration,
        stressTests
      );
      openRiskDashboardReport(html);
      toast({
        title: "Report Generated",
        description: "Risk dashboard report opened in new window",
      });
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: "Failed to generate report",
        variant: "destructive",
      });
    }
  }, [riskMetrics, portfolioMetrics, drawdownAnalysis, assetClassMetrics, concentration, stressTests, toast]);

  // Prepare chart data
  const equityChartData = useMemo(() => {
    return (equityHistory || []).map((equity, index) => ({
      date: `Day ${index + 1}`,
      equity: Math.round(equity * 100) / 100,
    }));
  }, [equityHistory]);

  const stressTestChartData = useMemo(() => {
    return (stressTests?.scenarios || []).map(scenario => ({
      movement: scenario.priceMovement,
      loss: Math.round(scenario.estimatedLoss * 100) / 100,
      marginLevel: scenario.marginLevel,
    }));
  }, [stressTests]);

  const assetClassChartData = useMemo(() => {
    const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
    return Object.entries(assetClassMetrics).map(([assetClass, metrics], index) => ({
      name: assetClass,
      value: metrics.percentageOfPortfolio,
      color: COLORS[index % COLORS.length],
    }));
  }, [assetClassMetrics]);

  const riskLevelDetails = riskMetrics
    ? getRiskLevelDetails(riskMetrics.riskLevel)
    : null;

  const handleRefresh = () => {
    refetchRisk();
    refetchAnalysis();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Risk Dashboard</h1>
          <p className="text-muted-foreground">Real-time risk monitoring and analysis</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
          >
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
          >
            <Download className="h-4 w-4 mr-2" />
            Report
          </Button>
        </div>
      </div>

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
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
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
              <p className="text-sm mt-1">{riskLevelDetails.recommendedAction}</p>
            </CardContent>
          )}
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Margin Level */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margin Level</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {riskMetrics ? formatMarginLevel(riskMetrics.currentMarginLevel) : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Call: {riskMetrics?.marginCallThreshold}% | Liquidation: {riskMetrics?.liquidationThreshold}%
            </p>
            {riskMetrics && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${
                    riskMetrics.currentMarginLevel >= 200
                      ? 'bg-green-600'
                      : riskMetrics.currentMarginLevel >= 100
                      ? 'bg-yellow-600'
                      : 'bg-red-600'
                  }`}
                  style={{
                    width: `${Math.min((riskMetrics.currentMarginLevel / 300) * 100, 100)}%`,
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Equity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equity</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(portfolioMetrics?.currentEquity || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Capital: {formatCurrency(portfolioMetrics?.totalCapital || 0)}
            </p>
          </CardContent>
        </Card>

        {/* Total P&L */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {(portfolioMetrics?.totalPnL || 0) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                (portfolioMetrics?.totalPnL || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(portfolioMetrics?.totalPnL || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ROI: {portfolioMetrics?.roi.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        {/* Capital at Risk */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capital at Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(riskMetrics?.capitalAtRisk || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {riskMetrics?.capitalAtRiskPercentage.toFixed(2)}% of Equity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trade Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{portfolioMetrics?.winRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              {portfolioMetrics?.profitableTrades || 0} wins / {portfolioMetrics?.totalTrades || 0} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{portfolioMetrics?.profitFactor.toFixed(2)}</div>
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

      {/* Tabs for detailed analysis */}
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
                    <span className="font-medium">{formatCurrency(riskMetrics?.freeMargin || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Used Margin</span>
                    <span className="font-medium">{formatCurrency(riskMetrics?.usedMargin || 0)}</span>
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

          {/* Recommendations */}
          {portfolioRiskAssessment?.recommendedActions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recommended Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {portfolioRiskAssessment.recommendedActions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
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
                    <p className="text-sm text-muted-foreground mt-1">
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
                        style={{ width: `${diversification.diversificationScore}%` }}
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
                      <span className="font-medium">{diversification.largestPosition.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Top 3 Positions</span>
                      <span className="font-medium">{diversification.topThreePositions.toFixed(2)}%</span>
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
                  <div className="space-y-3">
                    {concentration.topPositions.map(pos => (
                      <div key={pos.symbol} className="space-y-1">
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
                            style={{ width: `${Math.min(pos.percentageOfPortfolio, 100)}%` }}
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
    </div>
  );
};

export default UserRiskDashboard;
