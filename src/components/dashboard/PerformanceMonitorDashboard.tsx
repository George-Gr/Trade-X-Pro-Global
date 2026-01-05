import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getBundleAnalysis, type BundleSize } from '@/lib/bundleAnalysis';
import {
  PerformanceAlert,
  TimeSeriesPoint,
  performanceMonitoring,
} from '@/lib/performance/performanceMonitoring';
import {
  getMetricStatus,
  getResourceStatus,
} from '@/lib/performance/performanceUtils';
import { getWebSocketManager } from '@/lib/websocketManager';
import React, { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BundleBar,
  MetricCard,
  ResourceMetricCard,
} from './PerformanceMonitorComponents';

// Type definitions for WebSocket status
interface WebSocketStatus {
  totalConnections: number;
  totalSubscriptions: number;
  connections: Array<{
    id: string;
    state:
      | 'disconnected'
      | 'connecting'
      | 'connected'
      | 'reconnecting'
      | 'error';
    subscriptionCount: number;
    tables: string[];
    retryCount: number;
  }>;
}

// Type definition for performance memory
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

/**
 * Enhanced Performance Monitoring Dashboard
 *
 * Features:
 * - Real-time metric visualization using Recharts
 * - WebSocket connection status and latency tracking
 * - Memory usage monitoring
 * - Bundle size budget visualization
 * - Performance alerts and regression tracking
 */
export const PerformanceMonitorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<Record<string, TimeSeriesPoint[]>>({});
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [wsStatus, setWsStatus] = useState<WebSocketStatus | null>(null);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [bundleData, setBundleData] = useState<BundleSize[] | null>(null);
  const [isUsingRealData, setIsUsingRealData] = useState(false);

  // Refresh data periodically
  useEffect(() => {
    const updateData = () => {
      const report = performanceMonitoring.getPerformanceReport();
      setMetrics(report.timeSeries);
      setAlerts(report.alerts);
      setWsStatus(getWebSocketManager().getStatus());

      // Memory usage (if available)
      if ((performance as unknown as { memory?: PerformanceMemory }).memory) {
        setMemoryUsage(
          (performance as unknown as { memory: PerformanceMemory }).memory
            .usedJSHeapSize /
            1024 /
            1024
        );
      }
    };

    const loadBundleData = async () => {
      try {
        const analysisData = await getBundleAnalysis();
        setBundleData(analysisData.bundles);
        setIsUsingRealData(analysisData.isRealData);
      } catch (error) {
        import('@/lib/logger')
          .then(({ logger }) => {
            logger.warn('Failed to load bundle data', {
              component: 'PerformanceMonitorDashboard',
              action: 'load_bundle_data',
              metadata: { error },
            });
          })
          .catch((importError) => {
            console.error('Failed to import logger:', importError);
          });
      }
    };

    updateData(); // Initial load
    loadBundleData(); // Load bundle data
    const interval = setInterval(updateData, 2000); // Update every 2s for smooth charts

    return () => clearInterval(interval);
  }, []);

  const getLatestValue = (metric: string): number => {
    const series = metrics[metric];
    if (!series || series.length === 0) return 0;
    const lastPoint = series[series.length - 1];
    return lastPoint?.value ?? 0;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Performance Monitor
        </h1>
        <div className="flex gap-2">
          <Badge
            variant={
              (wsStatus?.totalConnections ?? 0) > 0 ? 'default' : 'destructive'
            }
          >
            WS: {wsStatus?.totalConnections || 0} Conn
          </Badge>
          <Badge variant="outline">Memory: {memoryUsage.toFixed(1)} MB</Badge>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="network">Network & WS</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="LCP"
              value={`${getLatestValue('LCP').toFixed(0)}ms`}
              status={getMetricStatus('LCP', getLatestValue('LCP'))}
              trend={metrics['LCP']}
            />
            <MetricCard
              title="INP"
              value={`${getLatestValue('FID').toFixed(0)}ms`}
              status={getMetricStatus('FID', getLatestValue('FID'))}
              trend={metrics['FID']}
            />
            <MetricCard
              title="CLS"
              value={getLatestValue('CLS').toFixed(3)}
              status={getMetricStatus('CLS', getLatestValue('CLS'))}
              trend={metrics['CLS']}
            />
            <MetricCard
              title="TTFB"
              value={`${getLatestValue('TTFB').toFixed(0)}ms`}
              status={getMetricStatus('TTFB', getLatestValue('TTFB'))}
              trend={metrics['TTFB']}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-75">
                  <div className="space-y-2">
                    {alerts.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No alerts detected
                      </p>
                    ) : (
                      alerts
                        .slice()
                        .reverse()
                        .map((alert, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-lg border ${
                              alert.type === 'critical'
                                ? 'bg-red-500/10 border-red-500/50'
                                : 'bg-yellow-500/10 border-yellow-500/50'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-medium">
                                {alert.metric}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(alert.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm mt-1">{alert.message}</p>
                          </div>
                        ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>
                  Bundle Analysis
                  {!isUsingRealData && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Baseline Data
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {isUsingRealData
                    ? 'Real-time bundle sizes from build artifacts'
                    : 'Baseline/target values shown when build data unavailable'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bundleData && bundleData.length > 0 ? (
                    bundleData.map((bundle) => (
                      <BundleBar
                        key={bundle.name}
                        name={bundle.name}
                        size={bundle.size}
                        limit={bundle.limit}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading bundle analysis...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals Trends</CardTitle>
            </CardHeader>
            <CardContent className="h-100">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics['LCP']?.slice(-50) || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatTime}
                    stroke="#888888"
                    fontSize={12}
                  />
                  <YAxis stroke="#888888" fontSize={12} />
                  <Tooltip
                    labelFormatter={formatTime}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                    }}
                  />
                  <ReferenceLine
                    y={2500}
                    label="LCP Warning"
                    stroke="orange"
                    strokeDasharray="3 3"
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    name="LCP (ms)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WebSocket & Network Performance</CardTitle>
            </CardHeader>
            <CardContent className="h-100">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={metrics['WebSocketConnectionTime']?.slice(-50) || []}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatTime}
                    stroke="#888888"
                    fontSize={12}
                  />
                  <YAxis stroke="#888888" fontSize={12} />
                  <Tooltip
                    labelFormatter={formatTime}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#82ca9d"
                    name="WS Latency (ms)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ResourceMetricCard
              title="Memory Usage"
              value={`${memoryUsage.toFixed(1)} MB`}
              status={getResourceStatus('memory', memoryUsage)}
              icon="💾"
              description="JavaScript Heap Size"
            />
            <ResourceMetricCard
              title="Active Connections"
              value={wsStatus?.totalConnections?.toString() || '0'}
              status={getResourceStatus(
                'connections',
                wsStatus?.totalConnections || 0
              )}
              icon="🔗"
              description="WebSocket Connections"
            />
            <ResourceMetricCard
              title="Total Subscriptions"
              value={wsStatus?.totalSubscriptions?.toString() || '0'}
              status={getResourceStatus(
                'subscriptions',
                wsStatus?.totalSubscriptions || 0
              )}
              icon="📡"
              description="Database Subscriptions"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resource Usage Trends</CardTitle>
            </CardHeader>
            <CardContent className="h-100">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics['MemoryUsage']?.slice(-50) || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatTime}
                    stroke="#888888"
                    fontSize={12}
                  />
                  <YAxis stroke="#888888" fontSize={12} />
                  <Tooltip
                    labelFormatter={formatTime}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#f97316"
                    name="Memory (MB)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Connection Details</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-60">
                  <div className="space-y-3">
                    {wsStatus?.connections?.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No active connections
                      </p>
                    ) : (
                      wsStatus?.connections?.map((conn) => (
                        <div
                          key={conn.id}
                          className="p-3 rounded-lg border bg-card"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-sm">
                              {conn.id.slice(0, 8)}...
                            </span>
                            <Badge
                              variant={
                                conn.state === 'connected'
                                  ? 'default'
                                  : conn.state === 'error'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className="text-xs"
                            >
                              {conn.state}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div>Subscriptions: {conn.subscriptionCount}</div>
                            <div>Retries: {conn.retryCount}</div>
                          </div>
                          {conn.tables.length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs text-muted-foreground mb-1">
                                Tables:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {conn.tables.slice(0, 3).map((table) => (
                                  <Badge
                                    key={table}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {table}
                                  </Badge>
                                ))}
                                {conn.tables.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{conn.tables.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Alerts</span>
                    <Badge
                      variant={alerts.length > 0 ? 'destructive' : 'default'}
                    >
                      {alerts.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bundle Analysis</span>
                    <Badge variant={!isUsingRealData ? 'outline' : 'default'}>
                      {isUsingRealData ? 'Live Data' : 'Baseline'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Update Frequency</span>
                    <span className="text-xs text-muted-foreground">2s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Data Points</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.max(
                        metrics['LCP']?.length || 0,
                        metrics['FID']?.length || 0,
                        metrics['CLS']?.length || 0
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Type definitions for components
interface MetricCardProps {
  title: string;
  value: string;
  status: 'good' | 'warning' | 'critical';
  trend?: TimeSeriesPoint[] | undefined;
}

interface BundleBarProps {
  name: string;
  size: number;
  limit: number;
}

interface ResourceMetricCardProps {
  title: string;
  value: string;
  status: 'good' | 'warning' | 'critical';
  icon: string;
  description: string;
}

export default PerformanceMonitorDashboard;
