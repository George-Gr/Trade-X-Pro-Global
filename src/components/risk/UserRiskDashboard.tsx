/**
 * User Risk Dashboard Component
 *
 * Comprehensive risk monitoring dashboard for traders
 * Displays real-time metrics, charts, and risk analysis
 *
 * Composed of extracted sub-components:
 * - RiskMetricsPanel: Key metrics in 4-column grid
 * - RiskAlertsPanel: Risk level alert and trade statistics
 * - RiskChartsPanel: Tabbed visualization charts
 */

import { useState, useMemo, useCallback } from "react";
import { useRiskMetrics } from "@/hooks/useRiskMetrics";
import { usePortfolioMetrics } from "@/hooks/usePortfolioMetrics";
import { usePositionAnalysis } from "@/hooks/usePositionAnalysis";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { RiskMetricsPanel } from "@/components/risk/RiskMetricsPanel";
import { RiskAlertsPanel } from "@/components/risk/RiskAlertsPanel";
import { RiskChartsPanel } from "@/components/risk/RiskChartsPanel";
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
        <div className="flex gap-4">
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

      {/* Risk Metrics Panel */}
      <RiskMetricsPanel
        riskMetrics={riskMetrics}
        portfolioMetrics={portfolioMetrics}
      />

      {/* Risk Alerts and Trade Stats */}
      <RiskAlertsPanel
        riskLevel={riskMetrics?.riskLevel || 'safe'}
        riskMetrics={riskMetrics}
        portfolioMetrics={portfolioMetrics}
        drawdownAnalysis={drawdownAnalysis}
        portfolioRiskAssessment={portfolioRiskAssessment}
      />

{/* Charts and Analysis */}
      <RiskChartsPanel
        equityHistory={equityHistory}
        assetClassMetrics={assetClassMetrics}
        portfolioMetrics={portfolioMetrics}
        stressTests={{
          ...stressTests,
          scenarios: stressTests.scenarios.map(s => ({
            ...s,
            priceMovement: String(s.priceMovement)
          }))
        }}
        diversification={diversification}
        concentration={concentration}
        riskMetrics={riskMetrics}
      />
    </div>
  );
};

export default UserRiskDashboard;
