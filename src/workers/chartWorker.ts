/**
 * Chart Calculation Web Worker
 * Handles heavy computations off the main thread for better performance
 */

interface ChartCalculationRequest {
  id: string;
  type: 'calculateTrend' | 'normalizeData' | 'generateSparkline' | 'optimizeData';
  data: any;
}

interface ChartCalculationResponse {
  id: string;
  success: boolean;
  result?: any;
  error?: string;
}

// Chart calculation functions that can run in worker
const calculateTrend = (values: number[]): { changePercentage: number; direction: string; color: string } => {
  if (!values || values.length < 2) {
    return { changePercentage: 0, direction: 'neutral', color: '#6B7280' };
  }

  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const change = ((lastValue - firstValue) / Math.abs(firstValue)) * 100;

  let direction = 'neutral';
  let color = '#6B7280';

  if (change > 0.1) {
    direction = 'up';
    color = '#10B981'; // Green
  } else if (change < -0.1) {
    direction = 'down';
    color = '#EF4444'; // Red
  }

  return { changePercentage: change, direction, color };
};

const normalizeData = (data: { value: number }[]): { value: number }[] => {
  if (!data || data.length === 0) return [];

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  if (range === 0) {
    return data.map(d => ({ ...d, value: 50 }));
  }

  return data.map(d => ({
    ...d,
    value: ((d.value - min) / range) * 100
  }));
};

const generateSparkline = (values: number[], labels?: string[]): any[] => {
  return values.map((value, index) => ({
    date: labels?.[index] || new Date(Date.now() - (values.length - 1 - index) * 24 * 60 * 60 * 1000)
      .toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }),
    value,
    label: labels?.[index]
  }));
};

const optimizeLargeDataset = (data: any[], maxPoints: number = 1000): any[] => {
  if (data.length <= maxPoints) return data;

  const step = Math.ceil(data.length / maxPoints);
  const optimized = [];

  for (let i = 0; i < data.length; i += step) {
    optimized.push(data[i]);
  }

  return optimized;
};

const performCalculation = (request: ChartCalculationRequest): ChartCalculationResponse => {
  try {
    let result: any;

    switch (request.type) {
      case 'calculateTrend':
        result = calculateTrend(request.data.values);
        break;
      case 'normalizeData':
        result = normalizeData(request.data.data);
        break;
      case 'generateSparkline':
        result = generateSparkline(request.data.values, request.data.labels);
        break;
      case 'optimizeData':
        result = optimizeLargeDataset(request.data.data, request.data.maxPoints || 1000);
        break;
      default:
        throw new Error(`Unknown calculation type: ${request.type}`);
    }

    return {
      id: request.id,
      success: true,
      result
    };
  } catch (error) {
    return {
      id: request.id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Handle messages from main thread
self.onmessage = function(e: MessageEvent<ChartCalculationRequest>) {
  const response = performCalculation(e.data);
  self.postMessage(response);
};

// Export for TypeScript
export {};