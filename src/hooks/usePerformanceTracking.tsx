import { useEffect } from 'react';
import { performanceMonitoring } from '../lib/performance/performanceMonitoring';

/**
 * Hook that tracks component mount and unmount performance events.
 * Records performance marks for lifecycle analysis and monitoring.
 * @param {string} componentName - The component identifier used in performance marks (e.g., 'TradingForm')
 * @returns {void}
 * @example
 * usePerformanceTracking('TradingForm');
 */
export function usePerformanceTracking(componentName: string) {
  useEffect(() => {
    // Track component mount
    performanceMonitoring.markUserAction(`component-mount-${componentName}`);

    return () => {
      // Track component unmount
      performanceMonitoring.markUserAction(
        `component-unmount-${componentName}`
      );
    };
  }, [componentName]);
}
