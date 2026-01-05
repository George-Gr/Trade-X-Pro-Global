/**
 * Utility functions for performance monitoring components
 * Separated from components to avoid React fast refresh conflicts
 */

// Performance metric thresholds
const LCP_WARNING_THRESHOLD = 2500;
const LCP_CRITICAL_THRESHOLD = 4000;
const FID_WARNING_THRESHOLD = 100;
const FID_CRITICAL_THRESHOLD = 300;
const CLS_WARNING_THRESHOLD = 0.1;
const CLS_CRITICAL_THRESHOLD = 0.25;
const TTFB_WARNING_THRESHOLD = 600;
const TTFB_CRITICAL_THRESHOLD = 1200;

// Resource status thresholds
const MEMORY_WARNING_THRESHOLD = 100;
const MEMORY_CRITICAL_THRESHOLD = 200;
const CONNECTIONS_WARNING_THRESHOLD = 5;
const CONNECTIONS_CRITICAL_THRESHOLD = 10;
const SUBSCRIPTIONS_WARNING_THRESHOLD = 50;
const SUBSCRIPTIONS_CRITICAL_THRESHOLD = 100;

/**
 * Determines the status of a resource based on predefined thresholds.
 * @param {string} resource - The resource type ('memory', 'connections', 'subscriptions')
 * @param {number} value - The current value of the resource
 * @returns {'good' | 'warning' | 'critical'} The status of the resource
 */
export const getResourceStatus = (
  resource: string,
  value: number
): 'good' | 'warning' | 'critical' => {
  switch (resource) {
    case 'memory':
      // Warning at 100MB, Critical at 200MB
      return value > MEMORY_CRITICAL_THRESHOLD
        ? 'critical'
        : value > MEMORY_WARNING_THRESHOLD
        ? 'warning'
        : 'good';
    case 'connections':
      // Warning at 5 connections, Critical at 10
      return value > CONNECTIONS_CRITICAL_THRESHOLD
        ? 'critical'
        : value > CONNECTIONS_WARNING_THRESHOLD
        ? 'warning'
        : 'good';
    case 'subscriptions':
      // Warning at 50 subscriptions, Critical at 100
      return value > SUBSCRIPTIONS_CRITICAL_THRESHOLD
        ? 'critical'
        : value > SUBSCRIPTIONS_WARNING_THRESHOLD
        ? 'warning'
        : 'good';
    default:
      return 'good';
  }
};

/**
 * Determines the status of a performance metric based on predefined thresholds.
 * @param {PerformanceMetric} metric - The performance metric name (LCP, FID, CLS)
 * @param {number} value - The metric value
 * @returns {'good' | 'warning' | 'critical'} The status of the metric
 */
export const getMetricStatus = (
  metric: 'LCP' | 'FID' | 'CLS' | 'TTFB',
  value: number
): 'good' | 'warning' | 'critical' => {
  // Simplified logic, should use PerformanceMonitoring budgets
  switch (metric) {
    case 'LCP':
      return value > LCP_CRITICAL_THRESHOLD
        ? 'critical'
        : value > LCP_WARNING_THRESHOLD
        ? 'warning'
        : 'good';
    case 'FID':
      return value > FID_CRITICAL_THRESHOLD
        ? 'critical'
        : value > FID_WARNING_THRESHOLD
        ? 'warning'
        : 'good';
    case 'CLS':
      return value > CLS_CRITICAL_THRESHOLD
        ? 'critical'
        : value > CLS_WARNING_THRESHOLD
        ? 'warning'
        : 'good';
    case 'TTFB':
      return value > TTFB_CRITICAL_THRESHOLD
        ? 'critical'
        : value > TTFB_WARNING_THRESHOLD
        ? 'warning'
        : 'good';
    default:
      throw new Error(`Unknown performance metric: ${metric}`);
  }
};
