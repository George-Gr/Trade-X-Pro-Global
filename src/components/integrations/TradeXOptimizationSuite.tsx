import React, { useEffect } from 'react';
import {
  PerformanceIntegration,
  PerformanceDashboard,
} from './PerformanceIntegration';
import { ABTestIntegration, QuickSignupCTA } from './ABTestIntegration';
import { initializeCTAExperiments } from '../../lib/ab-testing/ctaExperiments';
import {
  AnalyticsIntegration,
  QuickAnalyticsSetup,
  PerformanceCorrelation,
} from './AnalyticsIntegration';
import { SEOIntegration, QuickSEOSetup, TradingSEO } from './SEOIntegration';
import {
  AccessibilityIntegration,
  QuickAccessibilitySetup,
} from './AccessibilityIntegration';
import { GranularSkeleton } from '../ui/GranularSkeleton';
import { cn } from '../../lib/utils';

interface TradeXOptimizationSuiteProps {
  children: React.ReactNode;
  userId?: string;
  pageType?: 'landing' | 'signup' | 'trade' | 'portfolio' | 'about';
  tradingType?: 'forex' | 'stocks' | 'cfds' | 'crypto';
  enableAllOptimizations?: boolean;
  customConfig?: {
    performance?: {
      enableMonitoring?: boolean;
      enableWebVitals?: boolean;
      enablePreloading?: boolean;
      customThresholds?: Record<string, number>;
    };
    abTesting?: {
      enableTesting?: boolean;
      autoInitializeExperiments?: boolean;
      experimentId?: string;
    };
    analytics?: {
      enableAnalytics?: boolean;
      enableHeatMapping?: boolean;
      enableFunnelTracking?: boolean;
    };
    seo?: {
      enableSEO?: boolean;
      dynamicMetaTags?: boolean;
      structuredData?: boolean;
    };
    accessibility?: {
      enableAccessibility?: boolean;
      enableEnhancedFeatures?: boolean;
      enableSettingsPanel?: boolean;
    };
  };
  loading?: boolean;
  error?: Error | null;
}

export function TradeXOptimizationSuite({
  children,
  userId = 'anonymous',
  pageType = 'landing',
  tradingType = 'forex',
  enableAllOptimizations = true,
  customConfig = {},
  loading = false,
  error = null,
}: TradeXOptimizationSuiteProps) {
  const [isInitialized, setIsInitialized] = React.useState(false);

  const initializeOptimizationSystems = React.useCallback(() => {
    console.warn('🚀 Initializing TradeX Pro Optimization Suite...');

    // Initialize A/B testing experiments
    if (customConfig.abTesting?.autoInitializeExperiments !== false) {
      try {
        const experimentIds = initializeCTAExperiments();
        console.warn('✅ A/B Testing experiments initialized:', experimentIds);
      } catch (error) {
        console.warn('⚠️ A/B Testing initialization failed:', error);
      }
    }

    // Initialize analytics
    try {
      // Analytics will be automatically initialized by the AnalyticsIntegration component
      console.warn('✅ Analytics system ready');
    } catch (error) {
      console.warn('⚠️ Analytics initialization failed:', error);
    }

    // Initialize accessibility features
    try {
      // Accessibility features will be automatically initialized by the AccessibilityIntegration component
      console.warn('✅ Accessibility features ready');
    } catch (error) {
      console.warn('⚠️ Accessibility initialization failed:', error);
    }

    console.warn('🎯 TradeX Pro Optimization Suite fully initialized');
  }, [customConfig.abTesting?.autoInitializeExperiments]);

  useEffect(() => {
    if (enableAllOptimizations) {
      // Initialize all optimization systems
      initializeOptimizationSystems();
      setIsInitialized(true);
    }
  }, [enableAllOptimizations, initializeOptimizationSystems]);

  if (loading) {
    return (
      <div className="optimization-suite-loading">
        <GranularSkeleton type="hero" />
        <GranularSkeleton type="card" />
        <GranularSkeleton type="chart" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="optimization-suite-error p-8 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-red-800 font-semibold mb-2">
          Optimization System Error
        </h2>
        <p className="text-red-600 mb-4">
          The optimization suite encountered an error and some features may not
          be available.
        </p>
        <details className="text-red-600">
          <summary className="cursor-pointer">Error Details</summary>
          <pre className="mt-2 text-xs">{error.message}</pre>
        </details>
      </div>
    );
  }

  const config = {
    performance: {
      enableMonitoring: true,
      enableWebVitals: true,
      enablePreloading: true,
      customThresholds: {
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        ttfb: 600,
      },
      ...customConfig.performance,
    },
    abTesting: {
      enableTesting: true,
      autoInitializeExperiments: true,
      experimentId: `${pageType}_cta_optimization`,
      ...customConfig.abTesting,
    },
    analytics: {
      enableAnalytics: true,
      enableHeatMapping: true,
      enableFunnelTracking: true,
      ...customConfig.analytics,
    },
    seo: {
      enableSEO: true,
      dynamicMetaTags: true,
      structuredData: true,
      ...customConfig.seo,
    },
    accessibility: {
      enableAccessibility: true,
      enableEnhancedFeatures: true,
      enableSettingsPanel: false, // Disabled by default for production
      ...customConfig.accessibility,
    },
  };

  return (
    <div
      className={cn('tradex-optimization-suite', 'relative min-h-screen', {
        'optimization-active': enableAllOptimizations && isInitialized,
        [`page-${pageType}`]: true,
        [`trading-${tradingType}`]: true,
      })}
    >
      {/* Performance Integration */}
      {config.performance.enableMonitoring && (
        <PerformanceIntegration
          enablePerformanceMonitoring={config.performance.enableMonitoring}
          enableWebVitalsTracking={config.performance.enableWebVitals}
          enablePreloading={config.performance.enablePreloading}
          customThresholds={config.performance.customThresholds}
        >
          {/* Analytics Integration */}
          {config.analytics.enableAnalytics && (
            <AnalyticsIntegration
              enableAnalytics={config.analytics.enableAnalytics}
              enableHeatMapping={config.analytics.enableHeatMapping}
              enableFunnelTracking={config.analytics.enableFunnelTracking}
              userId={userId}
            >
              {/* A/B Testing Integration */}
              {config.abTesting.enableTesting && (
                <ABTestIntegration
                  enableABTesting={config.abTesting.enableTesting}
                  experimentId={config.abTesting.experimentId}
                  userId={userId}
                >
                  {/* SEO Integration */}
                  {config.seo.enableSEO && (
                    <SEOIntegration
                      enableSEO={config.seo.enableSEO}
                      pageType={pageType}
                    >
                      {/* Accessibility Integration */}
                      {config.accessibility.enableAccessibility && (
                        <AccessibilityIntegration
                          enableAccessibility={
                            config.accessibility.enableAccessibility
                          }
                          enableEnhancedFeatures={
                            config.accessibility.enableEnhancedFeatures
                          }
                          enableSettingsPanel={
                            config.accessibility.enableSettingsPanel
                          }
                        >
                          {/* Main Content */}
                          <MainContentWrapper>{children}</MainContentWrapper>
                        </AccessibilityIntegration>
                      )}

                      {/* SEO Components */}
                      {!config.accessibility.enableAccessibility && (
                        <MainContentWrapper>{children}</MainContentWrapper>
                      )}

                      {/* Trading-specific SEO */}
                      <TradingSEO tradingType={tradingType} />
                    </SEOIntegration>
                  )}

                  {/* SEO-only content */}
                  {!config.seo.enableSEO && (
                    <MainContentWrapper>{children}</MainContentWrapper>
                  )}
                </ABTestIntegration>
              )}

              {/* Analytics-only content */}
              {!config.abTesting.enableTesting && (
                <MainContentWrapper>{children}</MainContentWrapper>
              )}

              {/* Analytics Setup */}
              <QuickAnalyticsSetup />
              <PerformanceCorrelation />
            </AnalyticsIntegration>
          )}

          {/* Analytics-only setup */}
          {!config.analytics.enableAnalytics && (
            <MainContentWrapper>{children}</MainContentWrapper>
          )}
        </PerformanceIntegration>
      )}

      {/* Development-only dashboards */}
      {process.env.NODE_ENV === 'development' && (
        <DevDashboards
          showPerformance={config.performance.enableMonitoring}
          showAnalytics={config.analytics.enableAnalytics}
          showABTesting={config.abTesting.enableTesting}
        />
      )}

      {/* Optimization status indicator */}
      {enableAllOptimizations && (
        <OptimizationStatusIndicator
          isInitialized={isInitialized}
          config={config}
        />
      )}
    </div>
  );
}

// Main content wrapper with loading states
function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const [isContentReady, setIsContentReady] = React.useState(false);

  useEffect(() => {
    // Set content as ready immediately (no artificial delay)
    setIsContentReady(true);
  }, []);

  if (!isContentReady) {
    return (
      <div className="content-loading">
        <GranularSkeleton type="hero" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GranularSkeleton type="card" />
          <GranularSkeleton type="card" />
          <GranularSkeleton type="card" />
        </div>
      </div>
    );
  }

  return <div className="main-content-ready">{children}</div>;
}

// Development dashboards (only shown in development)
function DevDashboards({
  showPerformance,
  showAnalytics,
  showABTesting,
}: {
  showPerformance: boolean;
  showAnalytics: boolean;
  showABTesting: boolean;
}) {
  const [showDashboards, setShowDashboards] = React.useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    // Enable dashboards with Ctrl+Shift+D
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setShowDashboards(!showDashboards);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showDashboards]);

  if (!showDashboards) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-xs z-50">
        Press Ctrl+Shift+D to toggle dev dashboards
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[80vh] overflow-auto">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Development Dashboards</h2>
          <button
            onClick={() => setShowDashboards(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {showPerformance && (
            <div>
              <h3 className="font-semibold mb-2">Performance</h3>
              <PerformanceDashboard />
            </div>
          )}

          {showAnalytics && (
            <div>
              <h3 className="font-semibold mb-2">Analytics</h3>
              <div className="text-sm text-gray-600">
                Analytics dashboard would be here
              </div>
            </div>
          )}

          {showABTesting && (
            <div>
              <h3 className="font-semibold mb-2">A/B Testing</h3>
              <div className="text-sm text-gray-600">
                A/B testing results would be here
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Optimization status indicator
function OptimizationStatusIndicator({
  isInitialized,
  config,
}: {
  isInitialized: boolean;
  config: Record<string, unknown>;
}) {
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    // Auto-show for 3 seconds on initialization
    if (isInitialized) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isInitialized]);

  if (!isVisible) return null;

  const activeFeatures = Object.entries(config)
    .filter(([_, enabled]) => enabled)
    .map(([feature]) => feature);

  return (
    <div className="fixed top-4 left-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium">
          Optimization Suite Active ({activeFeatures.length} features)
        </span>
      </div>
    </div>
  );
}

// Quick setup hooks for easy integration - moved to separate file

// Pre-configured optimization presets - moved to separate file
export { OPTIMIZATION_PRESETS } from '../../lib/performance/optimizationPresets';
