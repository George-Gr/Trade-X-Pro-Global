import { performanceMonitoring } from '@/lib/performance/performanceMonitoring';
import { logger } from '../logger';

import type React from 'react';

// Generic component type to replace 'any'
export type GenericComponent = React.ComponentType<Record<string, unknown>>;

// Placeholder component for missing routes
export const PlaceholderComponent: GenericComponent = () => null;

// Route-based code splitting configuration
/**
 * Configuration interface for route-based code splitting and lazy loading.
 * Defines properties for route paths, components, preload strategies, and performance optimization.
 */
export interface RouteConfig {
  /** Route path pattern or exact match string */
  path: string;
  /** Dynamic import function that returns a Promise resolving to the route component */
  component: () => Promise<GenericComponent>;
  /** Whether to preload this route (default: false) */
  preload?: boolean;
  /** Route loading priority level (default: 'normal') */
  priority?: 'critical' | 'high' | 'normal' | 'low';
  /** Error boundary component name for this route */
  errorBoundary?: string;
  /** Loading component name to show while route loads */
  loadingComponent?: string;
  /** Route loading timeout in milliseconds (default: 10000ms) */
  timeout?: number;
  /** Delay before preloading in milliseconds (default: 100ms) */
  preloadDelay?: number;
  /** Bundle chunk names for code splitting optimization */
  chunks?: string[];
  /** Route dependencies that should be loaded first */
  dependencies?: string[];
}

// Performance tracking for route loading
export class RoutePerformanceTracker {
  private static routeTimings = new Map<string, number>();

  static markRouteStart(routeId: string) {
    const startTime = performance.now();
    this.routeTimings.set(routeId, startTime);
    performanceMonitoring.markUserAction(`route-start-${routeId}`);
  }

  static markRouteComplete(routeId: string) {
    const startTime = this.routeTimings.get(routeId);
    if (startTime) {
      const duration = performance.now() - startTime;
      performanceMonitoring.recordCustomTiming(
        `route-load-${routeId}`,
        startTime,
        duration
      );
      this.routeTimings.delete(routeId);
    }
  }

  static markRouteError(routeId: string, error: Error) {
    const startTime = this.routeTimings.get(routeId);
    if (startTime) {
      const duration = performance.now() - startTime;
      performanceMonitoring.recordCustomTiming(
        `route-error-${routeId}`,
        startTime,
        duration
      );
      this.routeTimings.delete(routeId);
    }

    logger.error(`Route loading failed for ${routeId}`, error, {
      action: 'route_loading',
      component: `RoutePerformanceTracker-${routeId}`,
      timestamp: new Date().toISOString(),
    });
  }
}

// Route-based code splitting groups
export const routeGroups = {
  // Critical trading routes - highest priority
  trading: ['/dashboard', '/trade', '/portfolio'],

  // Admin routes - high priority for admin users
  admin: ['/admin', '/admin/risk', '/admin/performance'],

  // Multi-step workflows - progressive loading
  workflows: ['/kyc', '/register', '/settings'],

  // Market data and analysis - medium priority
  markets: ['/markets/*', '/education/*'],

  // Static content - low priority
  static: ['/company/*', '/legal/*'],

  // Development and testing - low priority
  dev: ['/dev/*'],
};

// Route preload strategies
export const preloadStrategies = {
  // Preload critical routes after app initialization
  critical: ['/dashboard', '/trade'],

  // Prefetch likely next routes after navigation
  prefetch: {
    '/dashboard': ['/trade', '/portfolio'],
    '/trade': ['/portfolio', '/history'],
    '/portfolio': ['/trade', '/history'],
    '/kyc': ['/dashboard'],
  },

  // Progressive loading for complex routes
  progressive: {
    '/trade': {
      immediate: ['chart-panel', 'trading-panel'],
      delayed: ['technical-indicators', 'economic-calendar'],
      lazy: ['market-sentiment', 'trading-signals'],
    },
    '/portfolio': {
      immediate: ['positions-table', 'portfolio-summary'],
      delayed: ['price-alerts', 'trailing-stops'],
      lazy: ['performance-metrics'],
    },
  },
};

// Route error boundaries configuration
export const routeErrorBoundaries = {
  '/dashboard': 'DashboardErrorBoundary',
  '/trade': 'TradingErrorBoundary',
  '/portfolio': 'PortfolioErrorBoundary',
  '/kyc': 'KYCErrorBoundary',
  '/admin': 'AdminErrorBoundary',
  '/admin/risk': 'RiskManagementErrorBoundary',
};

// Loading component mappings
export const routeLoadingComponents = {
  trading: 'TradingPageLoading',
  admin: 'AdminPageLoading',
  portfolio: 'PortfolioPageLoading',
  kyc: 'KYCPageLoading',
  default: 'DefaultRouteLoading',
};

// Route chunk names for optimization
export const routeChunks = {
  dashboard: 'dashboard-chunk',
  trade: 'trading-chunk',
  portfolio: 'portfolio-chunk',
  history: 'history-chunk',
  kyc: 'kyc-chunk',
  admin: 'admin-chunk',
  risk: 'risk-management-chunk',
  markets: 'markets-chunk',
  education: 'education-chunk',
  company: 'company-chunk',
  legal: 'legal-chunk',
};

// Utility function to create route configuration
export function createRouteConfig(config: Partial<RouteConfig>): RouteConfig {
  return {
    path: '',
    component: () => Promise.resolve(PlaceholderComponent),
    priority: 'normal',
    timeout: 10000,
    preloadDelay: 100,
    chunks: [],
    dependencies: [],
    ...config,
  } as RouteConfig;
}

// Route preloader utility
export class RoutePreloader {
  private static preloadedRoutes = new Map<string, GenericComponent>();
  private static preloadPromises = new Map<string, Promise<GenericComponent>>();

  static preload(
    routeId: string,
    importFn: () => Promise<GenericComponent>
  ): Promise<GenericComponent> {
    if (this.preloadedRoutes.has(routeId)) {
      return Promise.resolve(this.preloadedRoutes.get(routeId)!);
    }

    if (this.preloadPromises.has(routeId)) {
      return this.preloadPromises.get(routeId)!;
    }

    const preloadPromise = importFn()
      .then((module: GenericComponent) => {
        this.preloadedRoutes.set(routeId, module);
        this.preloadPromises.delete(routeId);
        return module;
      })
      .catch((error) => {
        this.preloadPromises.delete(routeId);
        throw error;
      });

    this.preloadPromises.set(routeId, preloadPromise);
    return preloadPromise;
  }

  static preloadCriticalRoutes(
    routeImports: Record<string, () => Promise<GenericComponent>>
  ) {
    preloadStrategies.critical.forEach((route) => {
      const routeId = route.replace('/', '');
      const importFn = routeImports[routeId];
      if (importFn) {
        // Delay preload to not block initial render
        setTimeout(() => {
          this.preload(routeId, importFn);
        }, 100);
      }
    });
  }

  static prefetchNextRoutes(
    currentRoute: string,
    routeImports: Record<string, () => Promise<GenericComponent>>
  ) {
    const nextRoutes =
      preloadStrategies.prefetch[
        currentRoute as keyof typeof preloadStrategies.prefetch
      ];
    if (!nextRoutes) return;

    nextRoutes.forEach((route, index) => {
      const routeId = route.replace('/', '');
      const importFn = routeImports[routeId];
      if (importFn) {
        // Stagger prefetch requests
        setTimeout(() => {
          this.preload(routeId, importFn);
        }, (index + 1) * 200);
      }
    });
  }

  static clearPreloadedRoutes() {
    this.preloadedRoutes.clear();
    this.preloadPromises.clear();
  }
}
