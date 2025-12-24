import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PerformanceAlert,
  TimeSeriesPoint,
  performanceMonitoring,
} from '@/lib/performance/performanceMonitoring';
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

    updateData(); // Initial load
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
              trend={metrics['LCP'] || undefined}
            />
            <MetricCard
              title="INP"
              value={`${getLatestValue('FID').toFixed(0)}ms`}
              status={getMetricStatus('FID', getLatestValue('FID'))}
              trend={metrics['FID'] || undefined}
            />
            <MetricCard
              title="CLS"
              value={getLatestValue('CLS').toFixed(3)}
              status={getMetricStatus('CLS', getLatestValue('CLS'))}
              trend={metrics['CLS'] || undefined}
            />
            <MetricCard
              title="TTFB"
              value={`${getLatestValue('TTFB').toFixed(0)}ms`}
              status={getMetricStatus('TTFB', getLatestValue('TTFB'))}
              trend={metrics['TTFB'] || undefined}
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
                <CardTitle>Bundle Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <BundleBar name="React Core" size={145} limit={150} />
                  <BundleBar name="Charts" size={480} limit={500} />
                  <BundleBar name="TanStack Query" size={85} limit={100} />
                  <BundleBar name="UI Libs" size={180} limit={200} />
                  <BundleBar name="Main Entry" size={250} limit={300} />
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
      </Tabs>
    </div>
  );
};

// Helper Components
const MetricCard = ({
  title,
  value,
  status,
  trend,
}: {
  title: string;
  value: string;
  status: 'good' | 'warning' | 'critical';
  trend?: TimeSeriesPoint[] | undefined;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div
        className={`h-2 w-2 rounded-full ${
          status === 'good'
            ? 'bg-green-500'
            : status === 'warning'
            ? 'bg-yellow-500'
            : 'bg-red-500'
        }`}
      />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <div className="h-10 mt-2">
        {trend && trend.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend.slice(-20)}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={
                  status === 'good'
                    ? '#22c55e'
                    : status === 'warning'
                    ? '#eab308'
                    : '#ef4444'
                }
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </CardContent>
  </Card>
);

const BundleBar = ({
  name,
  size,
  limit,
}: {
  name: string;
  size: number;
  limit: number;
}) => {
  const percentage = Math.min((size / limit) * 100, 100);
  const isOver = size > limit;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{name}</span>
        <span
          className={
            isOver ? 'text-red-500 font-medium' : 'text-muted-foreground'
          }
        >
          {size}KB / {limit}KB
        </span>
      </div>
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            isOver
              ? 'bg-red-500'
              : percentage > 80
              ? 'bg-yellow-500'
              : 'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const getMetricStatus = (
  metric: string,
  value: number
): 'good' | 'warning' | 'critical' => {
  // Simplified logic, should use PerformanceMonitoring budgets
  if (metric === 'LCP')
    return value > 4000 ? 'critical' : value > 2500 ? 'warning' : 'good';
  if (metric === 'FID')
    return value > 300 ? 'critical' : value > 100 ? 'warning' : 'good';
  if (metric === 'CLS')
    return value > 0.25 ? 'critical' : value > 0.1 ? 'warning' : 'good';
  return 'good';
};

export default PerformanceMonitorDashboard;
