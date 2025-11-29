/**
 * Mobile-Optimized Vertical Chart Component
 * Designed specifically for mobile devices with vertical layout optimization
 */

import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useChartWorker } from '@/hooks/useChartWorker';
import { useSwipe } from '@/hooks/useSwipe';
import { cn } from '@/lib/utils';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';

interface MobileChartProps {
  data: any[];
  type?: 'line' | 'bar' | 'area' | 'candlestick';
  title?: string;
  description?: string;
  height?: number;
  className?: string;
  showVolume?: boolean;
  timeRange?: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
  symbol?: string;
  onTimeRangeChange?: (range: string) => void;
  loading?: boolean;
}

interface ChartDataPoint {
  time: string | number;
  value: number;
  volume?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

export const MobileOptimizedChart: React.FC<MobileChartProps> = ({
  data,
  type = 'line',
  title,
  description,
  height = 300,
  className,
  showVolume = false,
  timeRange = '1D',
  symbol,
  onTimeRangeChange,
  loading = false
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedPoint, setSelectedPoint] = useState<ChartDataPoint | null>(null);
  
  const { calculateTrend, normalizeData } = useChartWorker();

  // Format time for mobile display
  const formatTimeForMobile = useCallback((time: string | number, timeRange: string) => {
    const date = new Date(time);
    
    switch (timeRange) {
      case '1D':
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });
      case '1W':
      case '1M':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }, []);

  // Process data for mobile display
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // For mobile, limit data points to improve performance
    const maxDataPoints = isZoomed ? data.length : Math.min(data.length, 50);
    const step = Math.ceil(data.length / maxDataPoints);
    
    return data.filter((_, index) => index % step === 0).map((point, index) => ({
      ...point,
      time: formatTimeForMobile(point.time, timeRange),
      index
    }));
  }, [data, isZoomed, timeRange, formatTimeForMobile]);

  // Calculate mobile-specific metrics
  const chartMetrics = useMemo(() => {
    if (!processedData || processedData.length === 0) return null;
    
    const values = processedData.map(d => d.value || d.close);
    const volumes = showVolume ? processedData.map(d => d.volume || 0) : [];
    
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      current: values[values.length - 1],
      change: values.length > 1 ? values[values.length - 1] - values[0] : 0,
      changePercent: values.length > 1 ? ((values[values.length - 1] - values[0]) / values[0]) * 100 : 0,
      averageVolume: volumes.length > 0 ? volumes.reduce((a, b) => a + b, 0) / volumes.length : 0,
      trend: calculateTrend(values)
    };
  }, [processedData, showVolume, calculateTrend]);

  // Handle swipe gestures for chart navigation
  const handleSwipeLeft = useCallback(() => {
    if (onTimeRangeChange) {
      const ranges = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];
      const currentIndex = ranges.indexOf(timeRange);
      if (currentIndex < ranges.length - 1) {
        onTimeRangeChange(ranges[currentIndex + 1]);
      }
    }
  }, [timeRange, onTimeRangeChange]);

  const handleSwipeRight = useCallback(() => {
    if (onTimeRangeChange) {
      const ranges = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];
      const currentIndex = ranges.indexOf(timeRange);
      if (currentIndex > 0) {
        onTimeRangeChange(ranges[currentIndex - 1]);
      }
    }
  }, [timeRange, onTimeRangeChange]);

  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 50,
    preventDefault: true
  });

  // Handle touch interactions
  const handleTouchPoint = useCallback((point: any) => {
    if (point && point.activePayload) {
      const dataPoint = point.activePayload[0]?.payload;
      setSelectedPoint(dataPoint);
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  }, []);

  // Format time for mobile display
  const formatTimeForMobile = useCallback((time: string | number, range: string): string => {
    const date = new Date(time);
    
    switch (range) {
      case '1D':
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      case '1W':
      case '1M':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '3M':
      case '1Y':
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      default:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }, []);

  // Chart configuration for mobile
  const chartConfig = useMemo(() => ({
    margin: {
      top: 5,
      right: 10,
      left: 30,
      bottom: 25
    },
    height: height,
    width: '100%'
  }), [height]);

  const yAxisConfig = useMemo(() => ({
    width: 50,
    tick: {
      fontSize: 10,
      dx: -5
    },
    tickFormatter: (value: number) => {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toFixed(2);
    }
  }), []);

  const xAxisConfig = useMemo(() => ({
    tick: {
      fontSize: 10,
      dy: 5
    },
    tickCount: Math.min(8, processedData.length),
    interval: 'preserveStartEnd'
  }), [processedData.length]);

  // Render different chart types
  const renderChart = () => {
    if (loading || !processedData || processedData.length === 0) {
      return (
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      );
    }

    const commonProps = {
      data: processedData,
      margin: chartConfig.margin,
      onClick: handleTouchPoint
    };

    switch (type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis {...xAxisConfig} dataKey="time" />
            <YAxis {...yAxisConfig} />
            <Tooltip content={<MobileChartTooltip />} />
            <Bar 
              dataKey="value" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
              minPointSize={2}
            />
          </BarChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis {...xAxisConfig} dataKey="time" interval={0} />
            <YAxis {...yAxisConfig} />
            <Tooltip content={<MobileChartTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        );
      
      case 'candlestick':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis {...xAxisConfig} dataKey="time" />
            <YAxis {...yAxisConfig} />
            <Tooltip content={<MobileCandlestickTooltip />} />
            {/* Render candlestick bars - simplified version */}
            {processedData.map((point, index) => (
              <g key={index}>
                {/* Wick */}
                <line
                  x1={index * (100 / processedData.length)}
                  y1={point.low}
                  x2={index * (100 / processedData.length)}
                  y2={point.high}
                  stroke={point.close >= point.open ? '#10b981' : '#ef4444'}
                  strokeWidth={1}
                />
                {/* Body */}
                <rect
                  x={index * (100 / processedData.length) - 2}
                  y={Math.min(point.open, point.close)}
                  width={4}
                  height={Math.abs(point.close - point.open)}
                  fill={point.close >= point.open ? '#10b981' : '#ef4444'}
                  opacity={0.8}
                />
              </g>
            ))}
          </BarChart>
        );

      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis {...xAxisConfig} dataKey="time" interval={0} />
            <YAxis {...yAxisConfig} />
            <Tooltip content={<MobileChartTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 2, strokeWidth: 1 }}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
          </LineChart>
        );
    }
  };

  return (
    <div 
      ref={chartRef}
      className={cn(
        "mobile-chart-container",
        "bg-background rounded-lg border border-border",
        "shadow-sm",
        className
      )}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border-b border-border gap-2">
        <div className="flex flex-col">
          {title && (
            <h3 className="text-sm font-semibold text-foreground">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        
        {/* Time Range Selector - Mobile Optimized */}
        <div className="flex gap-1 flex-wrap">
          {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const).map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange?.(range)}
              className={cn(
                "px-2 py-1 rounded text-xs font-medium",
                "min-w-[44px] min-h-[32px] flex items-center justify-center",
                "transition-colors",
                timeRange === range
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Metrics */}
      {chartMetrics && (
        <div className="grid grid-cols-2 gap-2 p-3 border-b border-border">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Current</div>
            <div className="font-mono text-sm font-semibold">{chartMetrics.current?.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">24h Change</div>
            <div className={cn(
              "font-mono text-sm font-semibold",
              chartMetrics.change >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {chartMetrics.change >= 0 ? '+' : ''}{chartMetrics.change?.toFixed(2)}
              ({chartMetrics.changePercent >= 0 ? '+' : ''}{chartMetrics.changePercent?.toFixed(2)}%)
            </div>
          </div>
        </div>
      )}

      {/* Chart Container */}
      <div className="p-2">
        <ResponsiveContainer {...chartConfig}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Selected Point Details */}
      {selectedPoint && (
        <div className="p-3 border-t border-border bg-muted/30">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Time:</span>
              <span className="ml-1 font-mono">{formatTimeForMobile(selectedPoint.time, timeRange)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Value:</span>
              <span className="ml-1 font-mono">{selectedPoint.value?.toFixed(2)}</span>
            </div>
            {selectedPoint.volume && (
              <>
                <div>
                  <span className="text-muted-foreground">Volume:</span>
                  <span className="ml-1 font-mono">{selectedPoint.volume.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Mobile-specific tooltip components
const MobileChartTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload) return null;

  const data = payload[0]?.payload;
  
  return (
    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
      <p className="text-xs text-muted-foreground font-mono">{label}</p>
      <p className="text-sm font-semibold font-mono">{data?.value?.toFixed(2)}</p>
      {data?.volume && (
        <p className="text-xs text-muted-foreground">Volume: {data.volume.toLocaleString()}</p>
      )}
    </div>
  );
};

const MobileCandlestickTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload) return null;

  const data = payload[0]?.payload;
  
  return (
    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
      <p className="text-xs text-muted-foreground font-mono">{label}</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <span>Open:</span>
        <span className="font-mono">{data?.open?.toFixed(2)}</span>
        <span>High:</span>
        <span className="font-mono">{data?.high?.toFixed(2)}</span>
        <span>Low:</span>
        <span className="font-mono">{data?.low?.toFixed(2)}</span>
        <span>Close:</span>
        <span className="font-mono">{data?.close?.toFixed(2)}</span>
      </div>
    </div>
  );
};