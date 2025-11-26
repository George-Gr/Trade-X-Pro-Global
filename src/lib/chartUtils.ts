/**
 * Chart utilities for dashboard data visualization
 * Provides chart data processing, formatting, and utility functions
 */

import { useMemo } from 'react';

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  color?: string;
}

export interface SparklineData {
  data: ChartDataPoint[];
  changePercentage: number;
  changeDirection: 'up' | 'down' | 'neutral';
  color: string;
}

export interface BarChartData {
  labels: string[];
  values: number[];
  colors?: string[];
}

/**
 * Formats a number with appropriate suffixes and decimal places
 */
export const formatNumber = (num: number, decimals = 2): string => {
  if (Math.abs(num) >= 1000000) {
    return (num / 1000000).toFixed(decimals) + 'M';
  }
  if (Math.abs(num) >= 1000) {
    return (num / 1000).toFixed(decimals) + 'K';
  }
  return num.toFixed(decimals);
};

/**
 * Formats currency values with $ symbol and appropriate formatting
 */
export const formatCurrency = (amount: number, showSign = false): string => {
  const absoluteAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : showSign && amount > 0 ? '+' : '';
  
  if (absoluteAmount >= 1000000) {
    return `${sign}$${(absoluteAmount / 1000000).toFixed(2)}M`;
  }
  if (absoluteAmount >= 1000) {
    return `${sign}$${(absoluteAmount / 1000).toFixed(1)}K`;
  }
  return `${sign}$${absoluteAmount.toFixed(2)}`;
};

/**
 * Formats percentage values with % symbol
 */
export const formatPercentage = (percentage: number, showSign = false): string => {
  const sign = percentage < 0 ? '' : showSign && percentage > 0 ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
};

/**
 * Calculates percentage change between two values
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
};

/**
 * Determines trend direction based on percentage change
 */
export const getTrendDirection = (percentage: number): 'up' | 'down' | 'neutral' => {
  if (percentage > 0.1) return 'up';
  if (percentage < -0.1) return 'down';
  return 'neutral';
};

/**
 * Gets color for trend direction
 */
export const getTrendColor = (direction: 'up' | 'down' | 'neutral'): string => {
  switch (direction) {
    case 'up': return '#10B981'; // Green
    case 'down': return '#EF4444'; // Red
    case 'neutral': return '#6B7280'; // Gray
    default: return '#6B7280';
  }
};

/**
 * Generates sparkline data from an array of numbers
 */
export const generateSparklineData = (
  values: number[],
  labels?: string[],
  dateFormat = 'MM/DD'
): SparklineData => {
  if (!values || values.length === 0) {
    return {
      data: [],
      changePercentage: 0,
      changeDirection: 'neutral',
      color: '#6B7280'
    };
  }

  const data: ChartDataPoint[] = values.map((value, index) => ({
    date: labels?.[index] || new Date(Date.now() - (values.length - 1 - index) * 24 * 60 * 60 * 1000)
      .toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }),
    value,
    label: labels?.[index]
  }));

  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const changePercentage = calculatePercentageChange(lastValue, firstValue);
  const changeDirection = getTrendDirection(changePercentage);
  const color = getTrendColor(changeDirection);

  return {
    data,
    changePercentage,
    changeDirection,
    color
  };
};

/**
 * Normalizes data for chart visualization (0-100 scale)
 */
export const normalizeChartData = (data: ChartDataPoint[]): ChartDataPoint[] => {
  if (!data || data.length === 0) return [];

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  if (range === 0) {
    return data.map(d => ({ ...d, value: 50 })); // All values are the same
  }

  return data.map(d => ({
    ...d,
    value: ((d.value - min) / range) * 100
  }));
};

/**
 * Generates time-based labels for chart data
 */
export const generateTimeLabels = (
  count: number,
  interval: 'hour' | 'day' | 'week' | 'month' = 'day'
): string[] => {
  const labels: string[] = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now);
    
    switch (interval) {
      case 'hour':
        date.setHours(date.getHours() - i);
        labels.push(date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        break;
      case 'day':
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        break;
      case 'week':
        date.setDate(date.getDate() - (i * 7));
        labels.push(`Week ${date.getMonth() + 1}-${date.getDate()}`);
        break;
      case 'month':
        date.setMonth(date.getMonth() - i);
        labels.push(date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }));
        break;
    }
  }

  return labels;
};

/**
 * Creates chart configuration for Recharts components
 */
export const createChartConfig = (data: ChartDataPoint[]) => {
  return {
    margin: { top: 5, right: 0, left: 0, bottom: 5 },
    className: 'chart-container'
  };
};

/**
 * Validates chart data for display
 */
export const validateChartData = (data: ChartDataPoint[]): boolean => {
  return data && 
         Array.isArray(data) && 
         data.length > 0 && 
         data.every(d => typeof d.value === 'number' && isFinite(d.value));
};

/**
 * Generates mock chart data for development/testing
 */
export const generateMockChartData = (
  count: number,
  baseValue: number,
  volatility: number = 0.1,
  trend: number = 0
): number[] => {
  const data: number[] = [];
  let currentValue = baseValue;

  for (let i = 0; i < count; i++) {
    // Add random volatility
    const randomChange = (Math.random() - 0.5) * volatility * baseValue;
    // Add trend
    const trendChange = trend * i;
    currentValue += randomChange + trendChange;
    
    data.push(Math.max(0, currentValue)); // Ensure non-negative values
  }

  return data;
};

/**
 * Hook for processing chart data with memoization
 */
export const useChartData = (
  rawData: number[],
  options: {
    labels?: string[];
    baseValue?: number;
    format?: 'currency' | 'percentage' | 'number';
  } = {}
) => {
  const {
    labels,
    baseValue = 0,
    format = 'number'
  } = options;

  return useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return {
        sparklineData: generateSparklineData([]),
        formattedValue: format === 'currency' ? '$0.00' : format === 'percentage' ? '0.00%' : '0.00',
        changePercentage: 0,
        changeDirection: 'neutral' as const,
        color: '#6B7280'
      };
    }

    const sparklineData = generateSparklineData(rawData, labels);
    
    let formattedValue: string;
    const currentValue = rawData[rawData.length - 1];
    
    switch (format) {
      case 'currency':
        formattedValue = formatCurrency(currentValue);
        break;
      case 'percentage':
        formattedValue = formatPercentage(currentValue);
        break;
      default:
        formattedValue = formatNumber(currentValue);
    }

    return {
      sparklineData,
      formattedValue,
      changePercentage: sparklineData.changePercentage,
      changeDirection: sparklineData.changeDirection,
      color: sparklineData.color
    };
  }, [rawData, labels, baseValue, format]);
};

/**
 * Utility for creating accessible chart descriptions
 */
export const createChartDescription = (
  title: string,
  data: ChartDataPoint[],
  changePercentage?: number
): string => {
  if (!data || data.length === 0) {
    return `${title}: No data available`;
  }

  const currentValue = data[data.length - 1]?.value || 0;
  const description = `${title}: Current value is ${currentValue}`;
  
  if (changePercentage !== undefined) {
    const direction = changePercentage > 0 ? 'increased' : changePercentage < 0 ? 'decreased' : 'remained stable';
    return `${description}, which has ${direction} by ${Math.abs(changePercentage).toFixed(2)}%`;
  }

  return description;
};

/**
 * Chart color palette for consistent theming
 */
export const chartColors = {
  primary: '#3B82F6',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  neutral: '#6B7280',
  background: '#F3F4F6',
  text: '#1F2937'
};

/**
 * Animation duration constants for chart transitions
 */
export const chartAnimations = {
  slow: 1500,
  medium: 1000,
  fast: 500,
  instant: 0
};