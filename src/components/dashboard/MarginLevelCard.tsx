import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Placeholder } from "@/components/ui/Placeholder";
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
  formatPercentage, 
  chartColors,
  chartAnimations
} from '@/lib/chartUtils';
import { cn } from "@/lib/utils";

interface MarginLevelCardProps {
  loading?: boolean;
  marginLevel?: number; // percent 0-100
  trend?: number[]; // margin history data
}

interface ChartDataPoint {
  date: string;
  value: number;
}

export const MarginLevelCard: React.FC<MarginLevelCardProps> = ({ loading = false, marginLevel = 72, trend = [] }) => {
  // Generate chart data for visualization
  const chartData = React.useMemo(() => {
    if (trend && trend.length > 0) {
      return trend.map((value, index) => ({
        date: new Date(Date.now() - (trend.length - 1 - index) * 24 * 60 * 60 * 1000)
          .toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value
      }));
    }
    
    // Generate mock data if none provided
    const mockData = generateMockChartData(7, marginLevel, 0.1, 0.01);
    return mockData.map((value, index) => ({
      date: new Date(Date.now() - (7 - 1 - index) * 24 * 60 * 60 * 1000)
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.max(0, Math.min(100, value)) // Ensure 0-100 range
    }));
  }, [trend, marginLevel]);

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
      format: 'percentage'
    }
  );

  // Determine trend icon and styling
  const getTrendIcon = () => {
    switch (changeDirection) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-warning-contrast" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-success-contrast" />;
      default:
        return <Minus className="h-4 w-4 text-secondary-contrast" />;
    }
  };

  const getChangeClassName = () => {
    switch (changeDirection) {
      case 'up':
        return 'text-warning-contrast font-medium';
      case 'down':
        return 'text-success-contrast font-medium';
      default:
        return 'text-secondary-contrast font-medium';
    }
  };

  // If there's no data, show a placeholder explaining what will appear
  if (loading) {
    return (
      <Card elevation="1" className="min-h-[200px] p-6">
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
            <Skeleton variant="card" className="h-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trend || trend.length === 0) {
    return (
      <Card elevation="1" className="min-h-[200px] p-6">
        <CardHeader>
          <CardTitle className="typography-h4 text-primary-contrast">Margin Level</CardTitle>
          <CardDescription className="text-secondary-contrast">Shows your current margin usage and trend over time.</CardDescription>
        </CardHeader>
        <CardContent>
          <Placeholder
            title="Margin Level"
            description="When positions are open, this card will show your margin usage, a trend chart and actionable guidance."
          />
        </CardContent>
      </Card>
    );
  }

  // Normal populated state with enhanced chart
  return (
    <Card elevation="1" className="min-h-[200px] p-6">
      <CardHeader>
        <CardTitle className="typography-h4 text-primary-contrast">Margin Level</CardTitle>
        <CardDescription className="text-secondary-contrast">Current margin usage and recent trend</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Value and Change */}
        <div className="flex items-baseline justify-between">
          <div className="space-y-1">
            <div className="text-2xl font-bold typography-body text-primary-contrast tracking-tight tabular-nums">
              {marginLevel}%
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className={getChangeClassName()}>
                {changeDirection !== 'neutral' && (
                  <>
                    {changeDirection === 'up' ? '+' : ''}
                    {Math.abs(changePercentage).toFixed(1)}%
                  </>
                )}
                {changeDirection === 'neutral' && '0.0%'}
              </span>
              <span className="text-xs text-secondary-contrast">vs period start</span>
            </div>
          </div>
          
          {/* Risk Level Indicator */}
          <div className="text-xs">
            {marginLevel > 80 ? (
              <span className="px-2 py-1 bg-danger-contrast/10 text-danger-contrast rounded-full">
                High Risk
              </span>
            ) : marginLevel > 60 ? (
              <span className="px-2 py-1 bg-warning-contrast/10 text-warning-contrast rounded-full">
                Medium Risk
              </span>
            ) : (
              <span className="px-2 py-1 bg-success-contrast/10 text-success-contrast rounded-full">
                Low Risk
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-secondary-contrast">
            <span>0% Used</span>
            <span>{Math.max(0, Math.min(100, marginLevel))}% Used</span>
            <span>100% Used</span>
          </div>
          <Progress 
            value={Math.max(0, Math.min(100, marginLevel))} 
            className="h-2"
          />
        </div>

        {/* Enhanced Chart */}
        <div className="h-24">
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
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: 'hsl(var(--secondary-contrast))' }}
                axisLine={false}
                tickLine={false}
                width={30}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  borderRadius: '0.5rem'
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Margin Level']}
                labelStyle={{ color: 'hsl(var(--primary-contrast))' }}
                cursor={{ stroke: color, strokeWidth: 2 }}
              />
              {/* Risk level reference lines */}
              <ReferenceLine 
                y={80} 
                stroke={chartColors.danger} 
                strokeDasharray="5 5" 
                strokeWidth={1}
                label={{ value: 'High Risk', fontSize: 9, position: 'insideTopRight' }}
              />
              <ReferenceLine 
                y={60} 
                stroke={chartColors.warning} 
                strokeDasharray="5 5" 
                strokeWidth={1}
                label={{ value: 'Medium Risk', fontSize: 9, position: 'insideTopRight' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{
                  fill: 'hsl(var(--card))',
                  stroke: color,
                  strokeWidth: 2,
                  r: 3
                }}
                activeDot={{
                  r: 5,
                  stroke: color,
                  strokeWidth: 2,
                  fill: 'hsl(var(--card))'
                }}
                isAnimationActive={true}
                animationDuration={chartAnimations.fast}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Margin Summary */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="text-center">
            <div className="text-tertiary-contrast">Current</div>
            <div className="font-medium text-primary-contrast">{marginLevel}%</div>
          </div>
          <div className="text-center">
            <div className="text-tertiary-contrast">Avg Level</div>
            <div className="font-medium text-primary-contrast">
              {(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length).toFixed(1)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarginLevelCard;
