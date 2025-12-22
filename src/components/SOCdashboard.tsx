/**
 * Security Operations Center (SOC) Dashboard
 *
 * This component provides a unified dashboard for monitoring all security systems,
 * including CSP violations, authentication events, and security incidents.
 * It serves as the central hub for security operations and incident response.
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { logger } from '@/lib/logger';
import { SecurityIncident } from '@/lib/securityAlertSystem';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  Database,
  Eye,
  Globe,
  LineChart,
  RefreshCw,
  Shield,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

interface SOCDashboardProps {
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

interface SecurityMetrics {
  totalIncidents: number;
  criticalIncidents: number;
  activeIncidents: number;
  resolvedIncidents: number;
  cspViolations: number;
  authEvents: number;
  blockedIPs: number;
  riskScore: number;
  systemStatus: 'secure' | 'warning' | 'critical';
}

export const SOCDashboard: React.FC<SOCDashboardProps> = ({
  autoRefresh = true,
  refreshInterval = 60000, // 1 minute
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(24); // hours
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  // Generate stable mock values once
  const [mockMetrics] = useState(() => ({
    cspViolations: Math.floor(Math.random() * 50),
    authEvents: Math.floor(Math.random() * 1000),
    blockedIPs: Math.floor(Math.random() * 10),
    riskScore: Math.floor(Math.random() * 100),
  }));

  // Generate stable mock previous values for trend calculations
  const [mockPreviousMetrics] = useState(() => ({
    authEvents: Math.floor(Math.random() * 1000),
    blockedIPs: Math.floor(Math.random() * 10),
  }));

  // Mock security data for demonstration
  const mockIncidents: SecurityIncident[] = useMemo(
    () => [
      {
        id: 'INC-001',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        type: 'MULTIPLE_FAILED_LOGINS',
        severity: 'high',
        title: 'Multiple Failed Login Attempts Detected',
        description:
          'User attempted 5 failed logins from different IP addresses',
        affectedUsers: ['user_123'],
        sourceIPs: ['192.168.1.100', '192.168.1.101'],
        metadata: { failedAttempts: 5, timeWindow: '10 minutes' },
        status: 'investigating',
      },
      {
        id: 'INC-002',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        type: 'XSS_ATTACK',
        severity: 'critical',
        title: 'XSS Attack Detected',
        description: 'Multiple XSS attempts blocked from malicious IP',
        affectedUsers: [],
        sourceIPs: ['203.0.113.1'],
        metadata: { violations: 8, blockedUri: 'javascript:alert("xss")' },
        status: 'mitigated',
      },
      {
        id: 'INC-003',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        type: 'GEOLOCATION_ANOMALY',
        severity: 'medium',
        title: 'Geographic Anomaly Detected',
        description: 'User logged in from unusual location',
        affectedUsers: ['user_456'],
        sourceIPs: ['10.0.0.1'],
        metadata: { previousLocation: 'New York', currentLocation: 'London' },
        status: 'resolved',
      },
      {
        id: 'INC-004',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        type: 'SUSPICIOUS_ACTIVITY',
        severity: 'medium',
        title: 'Suspicious Activity Detected',
        description: 'Unusual trading pattern detected',
        affectedUsers: ['user_789'],
        sourceIPs: ['192.168.1.200'],
        metadata: { pattern: 'rapid_trading', volume: 1000000 },
        status: 'investigating',
      },
    ],
    []
  );

  // Filter incidents based on time range and severity
  const filteredIncidents = useMemo(() => {
    const cutoffTime = Date.now() - timeRange * 60 * 60 * 1000;

    return mockIncidents.filter((incident) => {
      const incidentTime = new Date(incident.timestamp).getTime();
      const timeFilter = incidentTime > cutoffTime;
      const severityFilter =
        selectedSeverity === 'all' || incident.severity === selectedSeverity;

      return timeFilter && severityFilter;
    });
  }, [mockIncidents, timeRange, selectedSeverity]);

  // Calculate security metrics
  const securityMetrics = useMemo((): SecurityMetrics => {
    const totalIncidents = filteredIncidents.length;
    const criticalIncidents = filteredIncidents.filter(
      (i) => i.severity === 'critical'
    ).length;
    const activeIncidents = filteredIncidents.filter(
      (i) => i.status === 'detected' || i.status === 'investigating'
    ).length;
    const resolvedIncidents = filteredIncidents.filter(
      (i) => i.status === 'resolved' || i.status === 'mitigated'
    ).length;

    const { cspViolations, authEvents, blockedIPs, riskScore } = mockMetrics;

    const systemStatus =
      criticalIncidents > 0
        ? 'critical'
        : activeIncidents > 5
        ? 'warning'
        : 'secure';

    return {
      totalIncidents,
      criticalIncidents,
      activeIncidents,
      resolvedIncidents,
      cspViolations,
      authEvents,
      blockedIPs,
      riskScore,
      systemStatus,
    };
  }, [filteredIncidents, mockMetrics]);

  /**
   * Calculate trend percentage with proper formatting and fallback handling
   */
  const calculateTrend = (current: number, previous: number): string => {
    if (previous === 0 || previous === null || previous === undefined) {
      return '—';
    }

    const change = ((current - previous) / previous) * 100;

    if (isNaN(change) || !isFinite(change)) {
      return '—';
    }

    const sign = change >= 0 ? '+' : '';
    const formattedChange = Math.abs(change).toFixed(1);

    return `${sign}${formattedChange}% from last hour`;
  };

  // Fetch security data
  const fetchSecurityData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Trigger re-computation of filtered incidents and security metrics
      // The actual computation happens in the useMemo hooks that depend on timeRange
      // This function serves as the entry point for data fetching and error handling

      // In a real implementation, this would fetch data from APIs:
      // const response = await fetch(`/api/security-data?timeRange=${timeRange}`);
      // const data = await response.json();
      // setSecurityMetrics(data.metrics);
      // setFilteredIncidents(data.incidents);

      // For now, we rely on the useMemo hooks that compute data based on timeRange
      // The computation is triggered by the dependency on timeRange in the useMemo hooks
    } catch (err) {
      setError('Failed to fetch security data');
      logger.error('SOC dashboard error', err, {
        component: 'SOCDashboard',
        action: 'fetchSecurityData',
        metadata: { timeRange },
      });
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Auto-refresh effect
  useEffect(() => {
    fetchSecurityData();

    if (autoRefresh) {
      const interval = setInterval(fetchSecurityData, refreshInterval);
      return () => clearInterval(interval);
    }

    return undefined;
  }, [fetchSecurityData, autoRefresh, refreshInterval]);

  // Get system status color
  const getSystemStatusColor = (status: string): string => {
    switch (status) {
      case 'critical':
        return 'text-red-600';
      case 'warning':
        return 'text-orange-600';
      case 'secure':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get system status icon
  const getSystemStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5" />;
      case 'warning':
        return <Eye className="h-5 w-5" />;
      case 'secure':
        return <Shield className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  // Get incident status color
  const getIncidentStatusColor = (status: string): string => {
    switch (status) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading security operations center...</span>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <Shield className="h-10 w-10 text-blue-600" />
            <span>Security Operations Center</span>
          </h1>
          <Badge
            variant="outline"
            className={`flex items-center space-x-1 ${getSystemStatusColor(
              securityMetrics.systemStatus
            )}`}
          >
            {getSystemStatusIcon(securityMetrics.systemStatus)}
            <span>
              System Status: {securityMetrics.systemStatus.toUpperCase()}
            </span>
          </Badge>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Zap className="h-4 w-4 text-yellow-600" />
            <span>Risk Score: {securityMetrics.riskScore}/100</span>
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
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={fetchSecurityData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Security Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Incidents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Incidents
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityMetrics.totalIncidents}
            </div>
            <p className="text-xs text-muted-foreground">
              Security incidents detected
            </p>
          </CardContent>
        </Card>

        {/* Critical Incidents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              Critical Incidents
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {securityMetrics.criticalIncidents}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        {/* Active Incidents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Incidents
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityMetrics.activeIncidents}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently being investigated
            </p>
          </CardContent>
        </Card>

        {/* CSP Violations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              CSP Violations
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityMetrics.cspViolations}
            </div>
            <p className="text-xs text-muted-foreground">
              Content security policy violations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Authentication Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Auth Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {securityMetrics.authEvents}
            </div>
            <p className="text-sm text-muted-foreground">
              Authentication events processed
            </p>
            <div className="mt-2 flex items-center space-x-2 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span>
                {calculateTrend(
                  securityMetrics.authEvents,
                  mockPreviousMetrics.authEvents
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Blocked IPs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Blocked IPs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {securityMetrics.blockedIPs}
            </div>
            <p className="text-sm text-muted-foreground">
              Malicious IPs blocked
            </p>
            <div className="mt-2 flex items-center space-x-2 text-xs text-red-600">
              <TrendingDown className="h-3 w-3" />
              <span>
                {calculateTrend(
                  securityMetrics.blockedIPs,
                  mockPreviousMetrics.blockedIPs
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Resolution Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Resolution Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {securityMetrics.totalIncidents > 0
                ? Math.round(
                    (securityMetrics.resolvedIncidents /
                      securityMetrics.totalIncidents) *
                      100
                  )
                : 0}
              %
            </div>
            <p className="text-sm text-muted-foreground">Incidents resolved</p>
            <div className="mt-2 flex items-center space-x-2 text-xs text-blue-600">
              <TrendingUp className="h-3 w-3" />
              <span>
                {(() => {
                  const currentRate =
                    securityMetrics.totalIncidents > 0
                      ? (securityMetrics.resolvedIncidents /
                          securityMetrics.totalIncidents) *
                        100
                      : 0;

                  // Mock previous resolution rate calculation
                  const mockPreviousTotal = Math.max(
                    1,
                    Math.floor(securityMetrics.totalIncidents * 0.8)
                  );
                  const mockPreviousResolved = Math.floor(
                    securityMetrics.resolvedIncidents * 0.9
                  );
                  const previousRate =
                    mockPreviousTotal > 0
                      ? (mockPreviousResolved / mockPreviousTotal) * 100
                      : 0;

                  return calculateTrend(currentRate, previousRate);
                })()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incident Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LineChart className="h-5 w-5" />
            <span>Security Incidents Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredIncidents.length > 0 ? (
            <div className="space-y-3">
              {filteredIncidents.map((incident, index) => (
                <div
                  key={`${incident.id}-${index}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant={
                          incident.severity === 'critical'
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        {incident.type.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant="outline">
                        {incident.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary">{incident.status}</Badge>
                      <span className="text-sm font-medium text-gray-600">
                        ID: {incident.id}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 mt-2">
                      {incident.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {incident.description}
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>
                        Affected:{' '}
                        {incident.affectedUsers.length > 0
                          ? incident.affectedUsers.join(', ')
                          : 'None'}
                      </span>
                      <span>Source IPs: {incident.sourceIPs.join(', ')}</span>
                      <span>
                        {new Date(incident.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {incident.metadata && (
                      <div className="text-xs text-gray-500 mt-2">
                        Details: {JSON.stringify(incident.metadata)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${getIncidentStatusColor(
                        incident.severity
                      )}`}
                    ></div>
                    {incident.status === 'mitigated' && (
                      <Badge variant="outline" className="text-xs">
                        Mitigated
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p>No security incidents detected in the selected time range</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Security Status Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {securityMetrics.criticalIncidents}
              </div>
              <div className="text-sm text-gray-600">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {securityMetrics.activeIncidents}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {securityMetrics.resolvedIncidents}
              </div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {securityMetrics.riskScore}
              </div>
              <div className="text-sm text-gray-600">Risk Score</div>
            </div>
          </div>

          {/* Risk Level Indicator */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Risk Level</span>
              <span className="text-sm text-gray-500">
                {securityMetrics.systemStatus.toUpperCase()}
              </span>
            </div>
            <Progress
              value={securityMetrics.riskScore}
              className={
                securityMetrics.systemStatus === 'critical'
                  ? 'bg-red-200'
                  : securityMetrics.systemStatus === 'warning'
                  ? 'bg-orange-200'
                  : 'bg-green-200'
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SOCDashboard;
