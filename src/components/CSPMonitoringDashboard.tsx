/**
 * CSP Monitoring Dashboard
 *
 * This component provides a real-time dashboard for monitoring Content Security Policy violations,
 * attack patterns, and security metrics. It integrates with the CSP violation monitor to provide
 * actionable insights for security teams.
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  CSPViolationReport,
  cspMonitoringUtils,
} from '@/lib/cspViolationMonitor';
import { logger } from '@/lib/logger';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  Eye,
  LineChart,
  PieChart,
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

interface ViolationSummary {
  total: number;
  bySeverity: {
    critical?: number;
    high?: number;
    medium?: number;
    low?: number;
  };
  uniqueSources: number;
}

// Helper functions

const calculateRiskLevel = (
  summary: ViolationSummary
): 'low' | 'medium' | 'high' | 'critical' => {
  const critical = summary.bySeverity.critical || 0;
  const high = summary.bySeverity.high || 0;
  const total = summary.total;

  if (critical > 0) return 'critical';
  if (high > 5 || total > 100) return 'high';
  if (high > 0 || total > 50) return 'medium';
  return 'low';
};

const getRiskColor = (
  level: 'low' | 'medium' | 'high' | 'critical'
): string => {
  switch (level) {
    case 'critical':
      return 'text-red-600';
    case 'high':
      return 'text-orange-600';
    case 'medium':
      return 'text-yellow-600';
    case 'low':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

const getRiskIcon = (level: 'low' | 'medium' | 'high' | 'critical') => {
  switch (level) {
    case 'critical':
      return <AlertTriangle className="h-5 w-5" />;
    case 'high':
      return <AlertTriangle className="h-5 w-5" />;
    case 'medium':
      return <Eye className="h-5 w-5" />;
    case 'low':
      return <Shield className="h-5 w-5" />;
    default:
      return <Shield className="h-5 w-5" />;
  }
};

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
        {/* Severity Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Violation Severity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                label: 'Critical',
                value: metrics.criticalViolations,
                color: 'bg-red-500',
              },
              {
                label: 'High',
                value: metrics.highViolations,
                color: 'bg-orange-500',
              },
              {
                label: 'Medium',
                value: metrics.mediumViolations,
                color: 'bg-yellow-500',
              },
              {
                label: 'Low',
                value: metrics.lowViolations,
                color: 'bg-green-500',
              },
            ].map((severity) => (
              <div key={severity.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{severity.label}</span>
                  <span className="font-medium">{severity.value}</span>
                </div>
                <Progress
                  value={
                    metrics.totalViolations > 0
                      ? (severity.value / metrics.totalViolations) * 100
                      : 0
                  }
                  className={severity.color}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Attack Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Attack Patterns</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.patterns.attackPatterns.length > 0 ? (
              <div className="space-y-2">
                {report.patterns.attackPatterns.map((pattern, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm">{pattern}</span>
                    <Badge variant="outline">Detected</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No attack patterns detected
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Violation Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LineChart className="h-5 w-5" />
            <span>Recent Violations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {report.violations.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {report.violations.slice(0, 20).map((violation) => (
                <div
                  key={violation.id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          violation.severity === 'critical'
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        {violation.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{violation.category}</Badge>
                      <span className="text-sm font-medium">
                        {violation.violatedDirective}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Blocked: {violation.blockedUri}
                    </div>
                    <div className="text-xs text-gray-500">
                      {violation.clientIP} •{' '}
                      {new Date(violation.timestamp).toLocaleString()}
                    </div>
                  </div>
                  {violation.scriptSample && (
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded max-w-xs">
                      {violation.scriptSample.substring(0, 100)}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p>No violations detected in the selected time range</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CSPMonitoringDashboard;
