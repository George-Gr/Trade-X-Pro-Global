/**
 * CSP Monitoring Dashboard
 *
 * This component provides a real-time dashboard for monitoring Content Security Policy violations,
 * attack patterns, and security metrics. It integrates with the CSP violation monitor to provide
 * actionable insights for security teams.
 */

import { AttackPatternsCard } from '@/components/csp/AttackPatternsCard';
import { RecentViolationsCard } from '@/components/csp/RecentViolationsCard';
import { SeverityBreakdownCard } from '@/components/csp/SeverityBreakdownCard';
import {
  calculateRiskLevel,
  getRiskColor,
  getRiskIcon,
} from '@/components/csp/cspUtils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CSPViolationReport,
  cspMonitoringUtils,
} from '@/lib/cspViolationMonitor';
import { logger } from '@/lib/logger';
import {
  Activity,
  AlertTriangle,
  RefreshCw,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

interface CSPDashboardProps {
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

export const CSPMonitoringDashboard: React.FC<CSPDashboardProps> = ({
  autoRefresh = true,
  refreshInterval = 60000, // 1 minute
}) => {
  const [report, setReport] = useState<CSPViolationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(24); // hours

  // Fetch violation data
  const fetchViolationData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get report from monitoring utils
      const stats = cspMonitoringUtils.getStats(timeRange);
      setReport(stats);
    } catch (err) {
      logger.error('Failed to fetch CSP violation data', err, {
        component: 'CSPMonitoringDashboard',
      });
      setError('Failed to fetch violation data');
      // Error is displayed to user via error state
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Auto-refresh effect
  useEffect(() => {
    fetchViolationData();

    if (autoRefresh) {
      const interval = setInterval(fetchViolationData, refreshInterval);
      return () => clearInterval(interval);
    }
    return;
  }, [fetchViolationData, autoRefresh, refreshInterval]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!report) return null;

    const { summary, patterns } = report;

    return {
      totalViolations: summary.total,
      criticalViolations: summary.bySeverity.critical || 0,
      highViolations: summary.bySeverity.high || 0,
      mediumViolations: summary.bySeverity.medium || 0,
      lowViolations: summary.bySeverity.low || 0,
      uniqueSources: summary.uniqueSources,
      attackPatterns: patterns.attackPatterns.length,
      riskLevel: calculateRiskLevel(summary),
    };
  }, [report]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading CSP monitoring data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!metrics || !report) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>
          No CSP violations detected in the selected time range.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span>CSP Security Monitoring</span>
          </h1>
          <Badge
            variant="outline"
            className={`flex items-center space-x-1 ${getRiskColor(
              metrics.riskLevel
            )}`}
          >
            {getRiskIcon(metrics.riskLevel)}
            <span>Risk Level: {metrics.riskLevel.toUpperCase()}</span>
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>Last 1 hour</option>
            <option value={6}>Last 6 hours</option>
            <option value={24}>Last 24 hours</option>
            <option value={168}>Last 7 days</option>
            <option value={720}>Last 30 days</option>
          </select>
          <button
            onClick={fetchViolationData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Violations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Violations
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalViolations}</div>
            <p className="text-xs text-muted-foreground">
              CSP violations detected
            </p>
          </CardContent>
        </Card>

        {/* Critical Violations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              Critical Violations
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics.criticalViolations}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        {/* Unique Sources */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unique Sources
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uniqueSources}</div>
            <p className="text-xs text-muted-foreground">
              Different IP addresses
            </p>
          </CardContent>
        </Card>

        {/* Attack Patterns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Attack Patterns
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.attackPatterns}</div>
            <p className="text-xs text-muted-foreground">
              Detected attack types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SeverityBreakdownCard metrics={metrics} />
        <AttackPatternsCard attackPatterns={report.patterns.attackPatterns} />
      </div>

      {/* Violation Details */}
      <RecentViolationsCard violations={report.violations} />
    </div>
  );
};

export default CSPMonitoringDashboard;
