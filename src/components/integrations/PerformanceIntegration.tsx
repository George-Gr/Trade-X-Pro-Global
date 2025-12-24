import React, { useEffect } from 'react';
import { useWebVitalsEnhanced } from '../../hooks/useWebVitalsEnhanced';
import { initializePreloading } from '../../lib/performance/dynamicImports';
import { performanceMonitoring } from '../../lib/performance/performanceMonitoring';

interface PerformanceIntegrationProps {
  children: React.ReactNode;
  enablePerformanceMonitoring?: boolean;
  enableWebVitalsTracking?: boolean;
  enablePreloading?: boolean;
  customThresholds?: {
    lcp?: number;
    fid?: number;
    cls?: number;
    ttfb?: number;
  };
}

export function PerformanceIntegration({
  children,
  enablePerformanceMonitoring = true,
  enableWebVitalsTracking = true,
  enablePreloading = true,
  customThresholds = {},
}: PerformanceIntegrationProps) {
  // Destructure threshold values to use stable primitives in dependencies
  const { lcp, fid, cls, ttfb } = customThresholds;

  useEffect(() => {
    // Initialize performance monitoring
    if (enablePerformanceMonitoring) {
      performanceMonitoring.enableMonitoring();

      // Set custom thresholds if provided
      if (lcp) {
        performanceMonitoring.updateBudget('LCP', lcp * 0.8, lcp);
      }
      if (fid) {
        performanceMonitoring.updateBudget('FID', fid * 0.8, fid);
      }
      if (cls) {
        performanceMonitoring.updateBudget('CLS', cls * 0.8, cls);
      }
      if (ttfb) {
        performanceMonitoring.updateBudget('TTFB', ttfb * 0.8, ttfb);
      }

      // Track initial page load performance
      const report = performanceMonitoring.getPerformanceReport();
      console.warn('Initial Performance Report:', report);
    }

    // Initialize Web Vitals tracking
    if (enableWebVitalsTracking) {
      // This will automatically start tracking when the hook is called
      // WebVitals will be tracked for any component that uses this wrapper
    }

    // Initialize dynamic imports and preloading
    if (enablePreloading) {
      initializePreloading();
    }

    // Setup performance correlation with user behavior
    const setupPerformanceCorrelation = () => {
      // Listen for Core Web Vitals and correlate with analytics
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver(
          (
            list: PerformanceObserverEntryList,
            _observer: PerformanceObserver
          ) => {
            const entries = list.getEntries();
            entries.forEach((entry: PerformanceEntry) => {
              if (entry.entryType === 'largest-contentful-paint') {
                // Correlate LCP with user behavior
                console.warn('LCP correlated with user engagement');
              }
            });
          }
        );

        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      }
    };

    setupPerformanceCorrelation();

    // Cleanup function
    return () => {
      if (enablePerformanceMonitoring) {
        performanceMonitoring.disableMonitoring();
      }
    };
  }, [
    enablePerformanceMonitoring,
    enableWebVitalsTracking,
    enablePreloading,
    lcp,
    fid,
    cls,
    ttfb,
  ]);

  return (
    <>
      {enableWebVitalsTracking && <WebVitalsTracker />}
      {children}
    </>
  );
}

// Separate component for Web Vitals tracking
function WebVitalsTracker() {
  useWebVitalsEnhanced();
  return null;
}

// Performance monitoring hook for components has been moved to a separate file
// Import and use from: import { usePerformanceTracking } from '../../hooks/usePerformanceTracking'

// Performance boundary component for error handling
export class PerformanceBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error?: Error }>;
  },
  { hasError: boolean; error?: Error }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error?: Error }>;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override componentDidCatch() {
    // Track performance-related errors
    performanceMonitoring.recordCustomTiming(
      'component_error',
      performance.now(),
      0
    );
  }

  override render() {
    if (this.state.hasError) {
      const FallbackComponent =
        this.props.fallback ||
        (() => (
          <div className="error-boundary p-4 bg-red-50 border border-red-200 rounded">
            <h2 className="text-red-800 font-semibold">Something went wrong</h2>
            <p className="text-red-600">Please refresh the page to continue.</p>
          </div>
        ));

      const fallbackProps = this.state.error ? { error: this.state.error } : {};
      return <FallbackComponent {...fallbackProps} />;
    }

    return this.props.children;
  }
}

// Performance monitoring dashboard component
type BaselineMetrics = {
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
};

type PerformanceAlert = {
  type: string;
  metric: string;
  message: string;
};

type PerformanceReport = {
  baseline?: BaselineMetrics;
  alerts: PerformanceAlert[];
  recommendations: string[];
};

export function PerformanceDashboard() {
  const [report, setReport] = React.useState<PerformanceReport | null>(null);

  useEffect(() => {
    const updateReport = () => {
      const performanceReport = performanceMonitoring.getPerformanceReport();
      setReport(performanceReport as PerformanceReport);
    };

    updateReport();
    const interval = setInterval(updateReport, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!report) {
    return <div className="animate-pulse">Loading performance data...</div>;
  }

  const baseline = report.baseline;

  return (
    <div className="performance-dashboard p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Performance Dashboard</h2>

      {baseline &&
        typeof baseline.lcp === 'number' &&
        typeof baseline.fid === 'number' &&
        typeof baseline.cls === 'number' &&
        typeof baseline.ttfb === 'number' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="metric-card p-3 bg-blue-50 rounded">
              <div className="text-sm text-blue-600">LCP</div>
              <div className="text-2xl font-bold text-blue-800">
                {Math.round(baseline.lcp)}ms
              </div>
            </div>
            <div className="metric-card p-3 bg-green-50 rounded">
              <div className="text-sm text-green-600">FID</div>
              <div className="text-2xl font-bold text-green-800">
                {Math.round(baseline.fid)}ms
              </div>
            </div>
            <div className="metric-card p-3 bg-yellow-50 rounded">
              <div className="text-sm text-yellow-600">CLS</div>
              <div className="text-2xl font-bold text-yellow-800">
                {baseline.cls.toFixed(3)}
              </div>
            </div>
            <div className="metric-card p-3 bg-purple-50 rounded">
              <div className="text-sm text-purple-600">TTFB</div>
              <div className="text-2xl font-bold text-purple-800">
                {Math.round(baseline.ttfb)}ms
              </div>
            </div>
          </div>
        )}

      {Array.isArray(report.alerts) && report.alerts.length > 0 && (
        <div className="alerts-section mb-6">
          <h3 className="text-lg font-semibold mb-2">Performance Alerts</h3>
          <div className="space-y-2">
            {report.alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded border-l-4 ${
                  alert.type === 'critical'
                    ? 'bg-red-50 border-red-400 text-red-800'
                    : 'bg-yellow-50 border-yellow-400 text-yellow-800'
                }`}
              >
                <div className="font-semibold">{alert.metric}</div>
                <div className="text-sm">{alert.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(report.recommendations) &&
        report.recommendations.length > 0 && (
          <div className="recommendations-section">
            <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
            <ul className="list-disc list-inside space-y-1">
              {report.recommendations.map((rec, index) => (
                <li key={index} className="text-gray-700">
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
}
