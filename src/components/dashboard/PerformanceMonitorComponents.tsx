import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, Line, LineChart } from 'recharts';
import { TimeSeriesPoint } from '@/lib/performance/performanceMonitoring';

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

// Helper Components
export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  status,
  trend,
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

export const BundleBar: React.FC<BundleBarProps> = ({ name, size, limit }) => {
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

export const ResourceMetricCard: React.FC<ResourceMetricCardProps> = ({
  title,
  value,
  status,
  icon,
  description,
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="flex items-center space-x-2">
        <span className="text-lg">{icon}</span>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </div>
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
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

// Helper functions
export const getResourceStatus = (
  resource: string,
  value: number
): 'good' | 'warning' | 'critical' => {
  switch (resource) {
    case 'memory':
      // Warning at 100MB, Critical at 200MB
      return value > 200 ? 'critical' : value > 100 ? 'warning' : 'good';
    case 'connections':
      // Warning at 5 connections, Critical at 10
      return value > 10 ? 'critical' : value > 5 ? 'warning' : 'good';
    case 'subscriptions':
      // Warning at 50 subscriptions, Critical at 100
      return value > 100 ? 'critical' : value > 50 ? 'warning' : 'good';
    default:
      return 'good';
  }
};

export const getMetricStatus = (
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