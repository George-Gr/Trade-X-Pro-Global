import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { 
  useChartData, 
  generateMockChartData, 
  formatCurrency, 
  chartColors,
  chartAnimations
} from '@/lib/chartUtils';
import { cn } from '@/lib/utils';

interface ProfitLossCardProps {
  loading?: boolean;
  currentValue?: number;
  profitLossData?: number[];
  timeRange?: '7d' | '30d' | '90d' | '1y';
  className?: string;
}

interface ChartDataPoint {
  date: string;
  value: number;
}

const ProfitLossCard: React.FC<ProfitLossCardProps> = ({
  loading = false,
  currentValue = 0,
  profitLossData = [],
  timeRange = '7d',
  className
}) => {
  // Generate mock data if none provided (for development)
  const chartData = React.useMemo(() => {
    if (profitLossData && profitLossData.length > 0) {
      return profitLossData.map((value, index) => ({
        date: new Date(Date.now() - (profitLossData.length - 1 - index) * 24 * 60 * 60 * 1000)
          .toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value
      }));
    }
    
    // Generate mock data based on time range
    const dataPoints = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const baseValue = currentValue || 0;
    const mockData = generateMockChartData(dataPoints, baseValue, 0.05, currentValue > 0 ? 0.001 : -0.001);
    
    return mockData.map((value, index) => ({
      date: new Date(Date.now() - (dataPoints - 1 - index) * 24 * 60 * 60 * 1000)
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value
    }));
  }, [profitLossData, timeRange, currentValue]);

  // Use chart utilities for processing
  const { 
    sparklineData, 
    formattedValue, 
    changePercentage, 
    changeDirection, 
    color 
  } = useChartData(
    chartData.map(d => d.value),
    { 
      labels: chartData.map(d => d.date),
      format: 'currency'
    }
  );

  // Determine trend icon and styling
  const getTrendIcon = () => {
    switch (changeDirection) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-success-contrast" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-danger-contrast" />;
      default:
        return <Minus className="h-4 w-4 text-secondary-contrast" />;
    }
  };

  const getChangeClassName = () => {
    switch (changeDirection) {
      case 'up':
        return 'text-success-contrast font-medium';
      case 'down':
        return 'text-danger-contrast font-medium';
      default:
        return 'text-secondary-contrast font-medium';
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card elevation="1" className={cn("min-h-[200px] p-6", className)}>
        <CardHeader className="space-y-2">
          <Skeleton variant="heading" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-2">
            <Skeleton variant="heading" className="w-1/3" />
            <Skeleton variant="text" className="w-1/4" />
          </div>
          <div className="space-y-2">
            <Skeleton variant="card" className="h-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation="1" className={cn("min-h-[200px] p-6", className)}>
      <CardHeader className="space-y-2">
        <CardTitle className="typography-h4 text-primary-contrast">Profit/Loss</CardTitle>
        <CardDescription className="text-secondary-contrast">
          Performance over the last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : timeRange === '90d' ? '90 days' : '1 year'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Value and Change */}
        <div className="flex items-baseline justify-between">
          <div className="space-y-1">
            <div className="text-2xl font-bold typography-body text-primary-contrast tracking-tight">
              {formattedValue}
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className={getChangeClassName()}>
                {changeDirection !== 'neutral' && (
                  <>
                    {changeDirection === 'up' ? '+' : ''}
                    {Math.abs(changePercentage).toFixed(2)}%
                  </>
                )}
                {changeDirection === 'neutral' && '0.00%'}
              </span>
              <span className="text-xs text-secondary-contrast">since period start</span>
            </div>
          </div>
          
          {/* Time Range Indicator */}
          <div className="text-xs text-tertiary-contrast bg-secondary/50 px-2 py-1 rounded">
            {timeRange === '7d' ? '7D' : timeRange === '30d' ? '30D' : timeRange === '90d' ? '90D' : '1Y'}
          </div>
        </div>

        {/* Chart */}
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                horizontal={true} 
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis 
                dataKey="date"
                tick={{ fontSize: 10, fill: 'hsl(var(--secondary-contrast))' }}
                axisLine={false}
                tickLine={false}
                dy={5}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'hsl(var(--secondary-contrast))' }}
                axisLine={false}
                tickLine={false}
                width={40}
                tickFormatter={(value) => formatCurrency(value, false).replace('$', '')}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  borderRadius: '0.5rem'
                }}
                formatter={(value: number) => [formatCurrency(value), 'Value']}
                labelStyle={{ color: 'hsl(var(--primary-contrast))' }}
                cursor={{ stroke: color, strokeWidth: 2 }}
              />
              <ReferenceLine 
                y={0} 
                stroke={chartColors.neutral} 
                strokeDasharray="2 2" 
                strokeWidth={1}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 4,
                  stroke: color,
                  strokeWidth: 2,
                  fill: 'hsl(var(--card))'
                }}
                isAnimationActive={true}
                animationDuration={chartAnimations.fast}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Summary */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="text-center">
              <div className="text-tertiary-contrast">Period Start</div>
              <div className="font-medium text-primary-contrast">
                {formatCurrency(chartData[0].value)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-tertiary-contrast">Period End</div>
              <div className="font-medium text-primary-contrast">
                {formatCurrency(chartData[chartData.length - 1].value)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-tertiary-contrast">Net Change</div>
              <div className={getChangeClassName()}>
                {formatCurrency(chartData[chartData.length - 1].value - chartData[0].value, true)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfitLossCard;