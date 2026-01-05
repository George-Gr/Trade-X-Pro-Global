import { useEffect } from 'react';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

export interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id?: string;
}

// Type definition for gtag function
interface GtagFunction {
  (event: string, action: string, data: unknown): void;
}

// Helper function to safely send data to gtag
function sendToGtag(action: string, data: unknown): void {
  if (
    typeof window !== 'undefined' &&
    (window as unknown as { gtag?: GtagFunction }).gtag
  ) {
    (window as unknown as { gtag?: GtagFunction }).gtag?.(
      'event',
      action,
      data
    );
  }
}

export interface TradingPerformanceMetric {
  chartLoadTime: number;
  orderExecutionTime: number;
  priceUpdateLatency: number;
  realTimeDataDelay: number;
  portfolioCalculationTime: number;
}

export function useWebVitalsEnhanced() {
  useEffect(() => {
    // Core Web Vitals monitoring
    onCLS((metric: WebVitalMetric) => {
      import('@/lib/logger').then(({ logger }) => {
        logger.recordMetric('CLS', metric.value, 'custom', {
          rating: metric.rating,
          id: metric.id,
        });
      });
      sendToGtag('web_vital', {
        event_category: 'Performance',
        event_label: 'CLS',
        value: Math.round(metric.value * 1000),
        custom_parameter_1: metric.rating,
      });
    });

    onINP((metric: WebVitalMetric) => {
      import('@/lib/logger').then(({ logger }) => {
        logger.recordMetric('INP', metric.value, 'millisecond', {
          rating: metric.rating,
          id: metric.id,
        });
      });
      sendToGtag('web_vital', {
        event_category: 'Performance',
        event_label: 'INP',
        value: Math.round(metric.value),
        custom_parameter_1: metric.rating,
      });
    });

    onFCP((metric: WebVitalMetric) => {
      import('@/lib/logger').then(({ logger }) => {
        logger.recordMetric('FCP', metric.value, 'millisecond', {
          rating: metric.rating,
          id: metric.id,
        });
      });
      sendToGtag('web_vital', {
        event_category: 'Performance',
        event_label: 'FCP',
        value: Math.round(metric.value),
        custom_parameter_1: metric.rating,
      });
    });

    onLCP((metric: WebVitalMetric) => {
      import('@/lib/logger').then(({ logger }) => {
        logger.recordMetric('LCP', metric.value, 'millisecond', {
          rating: metric.rating,
          id: metric.id,
        });
      });
      sendToGtag('web_vital', {
        event_category: 'Performance',
        event_label: 'LCP',
        value: Math.round(metric.value),
        custom_parameter_1: metric.rating,
      });
    });

    onTTFB((metric: WebVitalMetric) => {
      import('@/lib/logger').then(({ logger }) => {
        logger.recordMetric('TTFB', metric.value, 'millisecond', {
          rating: metric.rating,
          id: metric.id,
        });
      });
      sendToGtag('web_vital', {
        event_category: 'Performance',
        event_label: 'TTFB',
        value: Math.round(metric.value),
        custom_parameter_1: metric.rating,
      });
    });

    // Trading-specific performance monitoring
    const tradingMetrics: TradingPerformanceMetric = {
      chartLoadTime: 0,
      orderExecutionTime: 0,
      priceUpdateLatency: 0,
      realTimeDataDelay: 0,
      portfolioCalculationTime: 0,
    };

    // Monitor chart loading performance
    const chartLoadObserver = new PerformanceObserver(
      (list: PerformanceObserverEntryList) => {
        const entries = Array.from(list.getEntries());
        entries.forEach((entry: PerformanceEntry) => {
          if (
            entry.name.includes('chart') ||
            entry.name.includes('tradingview')
          ) {
            tradingMetrics.chartLoadTime = entry.duration;
            import('@/lib/logger').then(({ logger }) => {
              logger.recordMetric(
                'chart_load_time',
                entry.duration,
                'millisecond',
                {
                  entryName: entry.name,
                }
              );
            });
          }
        });
      }
    );
    chartLoadObserver.observe({ entryTypes: ['measure', 'navigation'] });

    // Monitor order execution performance
    const orderExecutionObserver = new PerformanceObserver(
      (list: PerformanceObserverEntryList) => {
        const entries = Array.from(list.getEntries());
        entries.forEach((entry: PerformanceEntry) => {
          if (entry.name.includes('order') || entry.name.includes('execute')) {
            tradingMetrics.orderExecutionTime = entry.duration;
            import('@/lib/logger').then(({ logger }) => {
              logger.recordMetric(
                'order_execution_time',
                entry.duration,
                'millisecond',
                {
                  entryName: entry.name,
                }
              );
            });
          }
        });
      }
    );
    orderExecutionObserver.observe({ entryTypes: ['measure'] });

    return () => {
      chartLoadObserver.disconnect();
      orderExecutionObserver.disconnect();
    };
  }, []);
}

export function trackCustomMetric(
  name: string,
  value: number,
  category: string = 'Custom'
) {
  if (
    typeof window !== 'undefined' &&
    (
      window as unknown as {
        gtag?: (event: string, action: string, data: unknown) => void;
      }
    ).gtag
  ) {
    (
      window as unknown as {
        gtag?: (event: string, action: string, data: unknown) => void;
      }
    ).gtag?.('event', 'custom_metric', {
      event_category: category,
      event_label: name,
      value: Math.round(value),
    });
  }
}

export function getPerformanceRating(
  value: number,
  thresholds: { good: number; poor: number }
): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}
