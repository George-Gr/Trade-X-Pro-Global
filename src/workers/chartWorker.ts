/**
 * Chart Calculation Web Worker
 * Handles heavy computations off the main thread for better performance
 */

interface ChartCalculationRequest {
  id: string;
  type:
    | 'calculateTrend'
    | 'normalizeData'
    | 'generateSparkline'
    | 'optimizeData';
  data: Record<string, unknown>;
}

interface ChartCalculationResponse {
  id: string;
  success: boolean;
  result?: Record<string, unknown> | Record<string, unknown>[];
  error?: string;
}

// Chart calculation functions that can run in worker
const calculateTrend = (
  values: number[]
): { changePercentage: number; direction: string; color: string } => {
  if (!values || values.length < 2) {
    return {
      changePercentage: 0,
      direction: 'neutral',
      color: 'hsl(var(--foreground-tertiary))',
    };
  }

  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const change = ((lastValue - firstValue) / Math.abs(firstValue)) * 100;

  let direction = 'neutral';
  let color = 'hsl(var(--foreground-tertiary))';

  if (change > 0.1) {
    direction = 'up';
    color = 'hsl(var(--buy))'; // Green
  } else if (change < -0.1) {
    direction = 'down';
    color = 'hsl(var(--destructive))'; // Red
  }

  return { changePercentage: change, direction, color };
};

const normalizeData = (data: { value: number }[]): { value: number }[] => {
  if (!data || data.length === 0) return [];

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  if (range === 0) {
    return data.map((d) => ({ ...d, value: 50 }));
  }

  return data.map((d) => ({
    ...d,
    value: ((d.value - min) / range) * 100,
  }));
};

const generateSparkline = (
  values: number[],
  labels?: string[]
): Array<{ date: string; value: number; label?: string }> => {
  return values.map((value, index) => ({
    date:
      labels?.[index] ||
      new Date(
        Date.now() - (values.length - 1 - index) * 24 * 60 * 60 * 1000
      ).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }),
    value,
    label: labels?.[index],
  }));
};

const optimizeLargeDataset = (
  data: unknown | unknown[],
  maxPoints: number = 1000
): unknown[] => {
  const arr = Array.isArray(data) ? data : [];
  if (arr.length <= maxPoints) return arr;

  const step = Math.ceil(arr.length / maxPoints);
  const optimized = [];

  for (let i = 0; i < arr.length; i += step) {
    optimized.push(arr[i]);
  }

  return optimized;
};

const performCalculation = (
  request: ChartCalculationRequest
): ChartCalculationResponse => {
  try {
    let result: Record<string, unknown> | Record<string, unknown>[] | unknown[];

    switch (request.type) {
      case 'calculateTrend':
        result = calculateTrend((request.data.values as number[]) || []);
        break;
      case 'normalizeData':
        result = normalizeData(
          (request.data.data as Array<{ value: number }>) || []
        );
        break;
      case 'generateSparkline':
        result = generateSparkline(
          (request.data.values as number[]) || [],
          request.data.labels as string[] | undefined
        );
        break;
      case 'optimizeData':
        result = optimizeLargeDataset(
          request.data.data,
          (request.data.maxPoints as number) || 1000
        );
        break;
      default:
        throw new Error(`Unknown calculation type: ${request.type}`);
    }

    return {
      id: request.id,
      success: true,
      result: result as Record<string, unknown> | Record<string, unknown>[],
    };
  } catch (error) {
    return {
      id: request.id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Handle messages from main thread
self.onmessage = function (e: MessageEvent<ChartCalculationRequest>) {
  const response = performCalculation(e.data);
  self.postMessage(response);
};

// Export for TypeScript
export {};
