import { useCallback, useEffect } from 'react';
import { trackCustomMetric } from '../../hooks/useWebVitalsEnhanced';
import { logger } from '../logger';

export interface PerformanceBaseline {
  timestamp: Date;
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay (now INP)
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  fcp: number; // First Contentful Paint
  ttit: number; // Time to Interactive
  tbt: number; // Total Blocking Time
  bundleSize: number;
  cacheHitRate: number;
  resourceLoadTimes: Record<string, number>;
}

export interface PerformanceAlert {
  type: 'warning' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: Date;
  url?: string;
  userAgent?: string;
}

export interface PerformanceBudget {
  metric: string;
  warning: number;
  critical: number;
  unit: 'ms' | 'bytes' | 'percent';
  enabled: boolean;
}

/**
 * Represents a single time-series data point for performance metrics
 * Used for tracking metric values over time in performance monitoring
 *
 * @export
 * @interface TimeSeriesPoint
 */
export interface TimeSeriesPoint {
  /** Timestamp in milliseconds since epoch when the metric was recorded */
  timestamp: number;
  /** Numeric value of the performance metric at the given timestamp */
  value: number;
}

export class PerformanceMonitoring {
  private static instance: PerformanceMonitoring;
  private baselines: PerformanceBaseline[] = [];
  private alerts: PerformanceAlert[] = [];
  private budgets: PerformanceBudget[] = [];
  private timeSeriesData: Map<string, TimeSeriesPoint[]> = new Map();
  private monitoringEnabled = true;
  private sampleRate = 0.1; // 10% of users

  static getInstance(): PerformanceMonitoring {
    if (!PerformanceMonitoring.instance) {
      PerformanceMonitoring.instance = new PerformanceMonitoring();
    }
    return PerformanceMonitoring.instance;
  }

  private constructor() {
    this.setupDefaultBudgets();
    this.initializeMonitoring();
  }

  private setupDefaultBudgets() {
    this.budgets = [
      {
        metric: 'LCP',
        warning: 2500,
        critical: 4000,
        unit: 'ms',
        enabled: true,
      },
      {
        metric: 'FID',
        warning: 100,
        critical: 300,
        unit: 'ms',
        enabled: true,
      },
      {
        metric: 'CLS',
        warning: 0.1,
        critical: 0.25,
        unit: 'percent',
        enabled: true,
      },
      {
        metric: 'TTFB',
        warning: 600,
        critical: 1200,
        unit: 'ms',
        enabled: true,
      },
      {
        metric: 'FCP',
        warning: 1800,
        critical: 3000,
        unit: 'ms',
        enabled: true,
      },
      {
        metric: 'BundleSize',
        warning: 500000, // 500KB
        critical: 1000000, // 1MB
        unit: 'bytes',
        enabled: true,
      },
    ];
  }

  private initializeMonitoring() {
    if (!this.monitoringEnabled) return;

    // Only monitor a sample of users to avoid performance impact
    if (Math.random() > this.sampleRate) return;

    this.setupCoreWebVitalsMonitoring();
    this.setupResourceMonitoring();
    this.setupBundleSizeMonitoring();
    this.setupNetworkConditionMonitoring();
    this.setupUserTiming();
  }

  private setupCoreWebVitalsMonitoring() {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry;
        if (lastEntry) {
          this.recordMetric('LCP', lastEntry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // FID (now INP)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const eventEntry = entry as PerformanceEventTiming;
          this.recordMetric(
            'FID',
            eventEntry.processingStart - eventEntry.startTime
          );
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // CLS
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        (entries as unknown as LayoutShift[]).forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric('CLS', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // TTFB
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const navEntry = entry as PerformanceNavigationTiming;
          if (navEntry.entryType === 'navigation') {
            this.recordMetric('TTFB', navEntry.responseStart);
            this.recordMetric('FCP', navEntry.loadEventEnd);
          }
        });
      });
      navObserver.observe({ entryTypes: ['navigation'] });
    }
  }

  private setupResourceMonitoring() {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.analyzeResource(entry as PerformanceResourceTiming);
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
    }
  }

  private setupBundleSizeMonitoring() {
    // Monitor bundle size by observing script tags
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach((script) => {
      const src = script.getAttribute('src');
      if (src && (src.includes('.js') || src.includes('.chunk'))) {
        // Estimate bundle size based on resource timing
        this.estimateBundleSize(src);
      }
    });
  }

  private setupNetworkConditionMonitoring() {
    if ('connection' in navigator) {
      const connection = (
        navigator as unknown as {
          connection?: {
            effectiveType: string;
            downlink: number;
            addEventListener: (event: string, callback: () => void) => void;
          };
        }
      ).connection;
      if (connection) {
        const networkTypeValue = this.mapNetworkTypeToNumber(
          connection.effectiveType
        );
        this.recordMetric('NetworkType', networkTypeValue);
        this.recordMetric('Downlink', connection.downlink);

        // Listen for network changes
        connection.addEventListener('change', () => {
          const newNetworkTypeValue = this.mapNetworkTypeToNumber(
            connection.effectiveType
          );
          this.recordMetric('NetworkTypeChanged', newNetworkTypeValue);
        });
      }
    }
  }

  private mapNetworkTypeToNumber(effectiveType: string): number {
    const typeMap: Record<string, number> = {
      'slow-2g': 1,
      '2g': 2,
      '3g': 3,
      '4g': 4,
    };
    return typeMap[effectiveType] || 0;
  }

  private setupUserTiming() {
    // Custom performance marks
    window.addEventListener('load', () => {
      // Mark when React app is ready
      performance.mark('react-ready');

      // Mark when main content is visible
      const mainContent = document.querySelector('main');
      if (mainContent) {
        const observer = new IntersectionObserver((entries) => {
          if (entries[0]?.isIntersecting) {
            performance.mark('main-content-visible');
            observer.disconnect();
          }
        });
        observer.observe(mainContent);
      }
    });
  }

  private analyzeResource(entry: PerformanceResourceTiming) {
    const resourceType = this.getResourceType(entry.name);
    const loadTime = entry.responseEnd - entry.startTime;

    // Record resource load time
    this.recordResourceLoadTime(resourceType, loadTime);

    // Check for slow resources
    const slowThreshold = this.getSlowResourceThreshold(resourceType);
    if (loadTime > slowThreshold) {
      this.createAlert(
        'warning',
        'ResourceLoadTime',
        loadTime,
        slowThreshold,
        `Slow ${resourceType} resource: ${entry.name}`
      );
    }

    // Track cache hit rate
    if (entry.transferSize === 0 && entry.decodedBodySize > 0) {
      this.recordCacheHit();
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.webp'))
      return 'image';
    if (url.includes('.woff') || url.includes('.ttf')) return 'font';
    if (url.includes('chunk')) return 'chunk';
    return 'other';
  }

  private getSlowResourceThreshold(type: string): number {
    const thresholds: Record<string, number> = {
      script: 500,
      stylesheet: 300,
      image: 1000,
      font: 200,
      chunk: 800,
      other: 1000,
    };
    return thresholds[type] || 1000;
  }

  private estimateBundleSize(url: string) {
    // Use resource timing API to get actual size
    const entries = performance.getEntriesByName(url);
    if (entries.length > 0) {
      const entry = entries[0] as PerformanceResourceTiming;
      this.recordMetric(
        'BundleSize',
        entry.transferSize || entry.decodedBodySize
      );
    }
  }

  private recordMetric(metric: string, value: number) {
    // Check against performance budgets
    this.checkBudget(metric, value);

    // Record baseline
    this.recordBaseline(metric, value);

    // Track custom metric
    trackCustomMetric(metric.toLowerCase(), value, 'Performance');

    // Store time-series data
    this.recordTimeSeriesData(metric, value);

    // Check for regression
    this.detectRegression(metric, value);
  }

  private recordTimeSeriesData(metric: string, value: number) {
    if (!this.timeSeriesData.has(metric)) {
      this.timeSeriesData.set(metric, []);
    }
    const series = this.timeSeriesData.get(metric)!;
    series.push({ timestamp: Date.now(), value });

    // Keep last 100 data points
    if (series.length > 100) {
      series.shift();
    }
  }

  private detectRegression(metric: string, currentValue: number) {
    const series = this.timeSeriesData.get(metric);
    if (!series || series.length < 10) return;

    // Calculate moving average of last 10 points excluding current
    const recentValues = series.slice(-11, -1).map((p) => p.value);
    const avg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
    const stdDev = Math.sqrt(
      recentValues.map((x) => Math.pow(x - avg, 2)).reduce((a, b) => a + b, 0) /
        recentValues.length
    );

    // Constants to prevent false positives and division by zero
    const MIN_ABSOLUTE_INCREASE = 10; // Minimum absolute increase to consider as regression
    const MIN_RELATIVE_STD_FACTOR = 0.1; // 10% of average for stdDev adjustment
    const MIN_PERCENT_INCREASE = 0.2; // 20% minimum relative increase
    const EPSILON = 0.001; // Small epsilon for zero comparisons

    // Guard 1: Handle case when avg is 0
    if (avg === 0) {
      if (currentValue > MIN_ABSOLUTE_INCREASE) {
        this.createAlert(
          'warning',
          metric,
          currentValue,
          MIN_ABSOLUTE_INCREASE,
          `Performance Regression: ${metric} increased by ${currentValue.toFixed(
            1
          )} (from zero baseline)`
        );
      }
      return;
    }

    // Guard 2: Prevent stdDev == 0 false positives by adjusting with relative factor
    const adjustedStdDev = Math.max(
      stdDev,
      avg * MIN_RELATIVE_STD_FACTOR,
      EPSILON
    );
    const threshold = avg + 2 * adjustedStdDev;

    // Guard 3: Require both relative threshold and adjusted stdDev-based threshold
    const percentIncrease = (currentValue - avg) / avg;
    const hasRelativeIncrease = percentIncrease >= MIN_PERCENT_INCREASE;
    const hasAbsoluteIncrease = currentValue > threshold;

    if (hasRelativeIncrease && hasAbsoluteIncrease) {
      // Compute percent increase safely (only when avg > 0)
      const safePercentIncrease =
        ((currentValue - avg) / Math.max(avg, EPSILON)) * 100;

      this.createAlert(
        'warning',
        metric,
        currentValue,
        threshold,
        `Performance Regression: ${metric} increased by ${safePercentIncrease.toFixed(
          1
        )}% (from ${avg.toFixed(1)} to ${currentValue.toFixed(1)})`
      );
    }
  }

  public getTimeSeriesData(metric: string): TimeSeriesPoint[] {
    return this.timeSeriesData.get(metric) || [];
  }

  private recordResourceLoadTime(type: string, time: number) {
    const metricName = `${type}LoadTime`;
    this.recordMetric(metricName, time);
  }

  private checkBudget(metric: string, value: number) {
    const budget = this.budgets.find((b) => b.metric === metric && b.enabled);
    if (!budget) return;

    let alertType: 'warning' | 'critical' | null = null;

    if (budget.unit === 'ms' || budget.unit === 'bytes') {
      if (value > budget.critical) {
        alertType = 'critical';
      } else if (value > budget.warning) {
        alertType = 'warning';
      }
    } else if (budget.unit === 'percent') {
      if (value > budget.critical) {
        alertType = 'critical';
      } else if (value > budget.warning) {
        alertType = 'warning';
      }
    }

    if (alertType) {
      this.createAlert(
        alertType,
        metric,
        value,
        budget.warning,
        `${metric} ${alertType}: ${value.toFixed(2)}${budget.unit} (budget: ${
          budget.warning
        }${budget.unit})`
      );
    }
  }

  private createAlert(
    type: 'warning' | 'critical',
    metric: string,
    value: number,
    threshold: number,
    message: string
  ) {
    // Dedup alerts - check if we had similar alert in last 10 seconds
    const existingAlert = this.alerts.find(
      (a) =>
        a.metric === metric &&
        a.type === type &&
        new Date().getTime() - a.timestamp.getTime() < 10000
    );

    if (existingAlert) return;

    const alert: PerformanceAlert = {
      type,
      metric,
      value,
      threshold,
      message,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Send alert to monitoring service
    this.sendAlert(alert);

    // Log alerts using structured logging with safe fallback
    try {
      if (type === 'critical') {
        logger.error('Performance Alert', undefined, {
          component: 'PerformanceMonitoring',
          action: 'performance_alert_critical',
          metadata: {
            alertType: type,
            metric: alert.metric,
            value: alert.value,
            threshold: alert.threshold,
            message: alert.message,
            timestamp: alert.timestamp,
            url: alert.url,
            userAgent: alert.userAgent,
            performanceImpact: 'critical',
          },
        });
      } else {
        logger.warn('Performance Warning', {
          component: 'PerformanceMonitoring',
          action: 'performance_alert_warning',
          metadata: {
            alertType: type,
            metric: alert.metric,
            value: alert.value,
            threshold: alert.threshold,
            message: alert.message,
            timestamp: alert.timestamp,
            url: alert.url,
            userAgent: alert.userAgent,
            performanceImpact: 'warning',
          },
        });
      }
    } catch (error) {
      // Safe fallback to console if logger is not initialized
      if (type === 'critical') {
        console.error('Performance Alert:', alert, error);
      } else {
        console.warn('Performance Warning:', alert, error);
      }
    }
  }

  private sendAlert(alert: PerformanceAlert) {
    // In a real implementation, send to monitoring service
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
      ).gtag?.('event', 'performance_alert', {
        event_category: 'Performance',
        event_label: alert.metric,
        custom_parameter_1: alert.type,
        custom_parameter_2: alert.message,
        value: Math.round(alert.value),
      });
    }
  }

  private recordBaseline(metric: string, value: number) {
    if (this.baselines.length === 0) {
      this.baselines.push({
        timestamp: new Date(),
        lcp: metric === 'LCP' ? value : 0,
        fid: metric === 'FID' ? value : 0,
        cls: metric === 'CLS' ? value : 0,
        ttfb: metric === 'TTFB' ? value : 0,
        fcp: metric === 'FCP' ? value : 0,
        ttit: 0,
        tbt: 0,
        bundleSize: metric === 'BundleSize' ? value : 0,
        cacheHitRate: 0,
        resourceLoadTimes: {},
      });
    } else {
      const lastBaseline = this.baselines[this.baselines.length - 1];
      (lastBaseline as unknown as Record<string, number>)[
        metric.toLowerCase()
      ] = value;
    }
  }

  private recordCacheHit() {
    // Track cache hit rate
    const lastBaseline = this.baselines[this.baselines.length - 1];
    if (lastBaseline) {
      // Calculate cache hit rate over recent requests
      const recentRequests = performance.getEntriesByType('resource');
      const cacheHits = recentRequests.filter(
        (entry: PerformanceResourceTiming) =>
          entry.transferSize === 0 && entry.decodedBodySize > 0
      ).length;

      lastBaseline.cacheHitRate =
        recentRequests.length > 0
          ? (cacheHits / recentRequests.length) * 100
          : 0;
    }
  }

  // Public methods for external use
  public recordCustomTiming(name: string, startTime: number, duration: number) {
    performance.mark(name);
    performance.measure(name, { start: startTime, duration });

    this.recordMetric(name, duration);
  }

  public markUserAction(actionName: string) {
    performance.mark(`user-action-${actionName}`);
    this.recordMetric(`UserAction_${actionName}`, performance.now());
  }

  public measureUserFlow(flowName: string, startMark: string, endMark: string) {
    try {
      performance.measure(flowName, startMark, endMark);
      const measure = performance.getEntriesByName(flowName, 'measure')[0];
      if (measure) {
        this.recordMetric(`Flow_${flowName}`, measure.duration);
      }
    } catch (error) {
      console.warn('Failed to measure user flow:', error);
    }
  }

  public getPerformanceReport(): {
    baseline: PerformanceBaseline | null;
    alerts: PerformanceAlert[];
    budgets: PerformanceBudget[];
    recommendations: string[];
    timeSeries: Record<string, TimeSeriesPoint[]>;
  } {
    const currentBaseline = this.baselines[this.baselines.length - 1] || null;
    const recommendations = this.generateRecommendations();
    const timeSeriesObj: Record<string, TimeSeriesPoint[]> = {};

    this.timeSeriesData.forEach((points, metric) => {
      timeSeriesObj[metric] = points;
    });

    return {
      baseline: currentBaseline,
      alerts: [...this.alerts],
      budgets: [...this.budgets],
      recommendations,
      timeSeries: timeSeriesObj,
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const currentBaseline = this.baselines[this.baselines.length - 1];

    if (!currentBaseline) return recommendations;

    // Check each metric and provide recommendations
    if (currentBaseline.lcp > 2500) {
      recommendations.push(
        'Optimize Largest Contentful Paint by preloading critical resources and optimizing images'
      );
    }

    if (currentBaseline.fid > 100) {
      recommendations.push(
        'Reduce First Input Delay by minimizing main thread work and code splitting'
      );
    }

    if (currentBaseline.cls > 0.1) {
      recommendations.push(
        'Improve Cumulative Layout Shift by setting explicit dimensions for images and ads'
      );
    }

    if (currentBaseline.bundleSize > 500000) {
      recommendations.push(
        'Reduce bundle size through code splitting, tree shaking, and dynamic imports'
      );
    }

    if (currentBaseline.cacheHitRate < 80) {
      recommendations.push(
        'Improve cache hit rate by implementing proper cache headers and service workers'
      );
    }

    return recommendations;
  }

  public updateBudget(metric: string, warning: number, critical: number) {
    const budget = this.budgets.find((b) => b.metric === metric);
    if (budget) {
      budget.warning = warning;
      budget.critical = critical;
    }
  }

  public enableMonitoring() {
    this.monitoringEnabled = true;
  }

  public disableMonitoring() {
    this.monitoringEnabled = false;
  }
}

// Singleton instance
export const performanceMonitoring = PerformanceMonitoring.getInstance();

// Utility functions

/**
 * Wraps a function with performance tracking to measure execution time.
 * Records timing metrics via performanceMonitoring.recordCustomTiming.
 *
 * @template T - The function type being wrapped
 * @param fn - The function to wrap with performance tracking
 * @param name - The name to identify this timing measurement
 * @returns The wrapped function with the same type as the input function
 */
export function withPerformanceTracking<
  T extends (...args: unknown[]) => unknown
>(fn: T, name: string): T {
  return ((...args: unknown[]) => {
    const start = performance.now();
    const result = fn(...args);

    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start;
        performanceMonitoring.recordCustomTiming(name, start, duration);
      });
    } else {
      const duration = performance.now() - start;
      performanceMonitoring.recordCustomTiming(name, start, duration);
      return result;
    }
  }) as T;
}

// React hook for performance monitoring

/**
 * React hook for tracking component performance metrics.
 * Records mount/unmount events and provides render tracking.
 *
 * @param componentName - The name to identify this component in performance metrics
 * @returns Object with trackRender function for manual render tracking
 */
export function usePerformanceMonitoring(componentName: string) {
  useEffect(() => {
    performanceMonitoring.markUserAction(`component-mount-${componentName}`);

    return () => {
      performanceMonitoring.markUserAction(
        `component-unmount-${componentName}`
      );
    };
  }, [componentName]);

  const trackRender = useCallback(() => {
    performanceMonitoring.markUserAction(`component-render-${componentName}`);
  }, [componentName]);

  return { trackRender };
}
