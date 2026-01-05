// Dynamic import utilities for code splitting and bundle optimization
import {
  createElement,
  useEffect,
  useState,
  type ComponentProps,
  type ComponentType,
} from 'react';
import { trackCustomMetric } from '../../hooks/useWebVitalsEnhanced';

// Network Information API types
interface NetworkInformation {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

interface DynamicImportOptions {
  timeout?: number;
  retries?: number;
  fallback?: () => void;
  preload?: boolean;
}

interface PreloadedModule {
  path: string;
  module: unknown;
  timestamp: number;
}

/**
 * Manages dynamic module imports with caching, retry logic, timeout handling, and performance monitoring.
 * Implements singleton pattern for centralized import state and preloading coordination.
 */
export class DynamicImportManager {
  private static instance: DynamicImportManager;
  private preloadedModules: Map<string, PreloadedModule> = new Map();
  private importCache: Map<string, Promise<unknown>> = new Map();
  private importStats: Map<
    string,
    { attempts: number; success: number; failures: number; avgTime: number }
  > = new Map();

  /**
   * Retrieves or creates the singleton instance of DynamicImportManager.
   * @returns The singleton DynamicImportManager instance
   */
  static getInstance(): DynamicImportManager {
    if (!DynamicImportManager.instance) {
      DynamicImportManager.instance = new DynamicImportManager();
    }
    return DynamicImportManager.instance;
  }

  /**
   * Initializes the DynamicImportManager with performance monitoring and service worker message handling.
   */
  constructor() {
    this.setupPerformanceObserver();
    this.setupServiceWorkerMessageHandler();
  }

  private setupPerformanceObserver() {
    // Monitor dynamic import performance
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(
        (list: PerformanceObserverEntryList) => {
          const entries = list.getEntries();
          entries.forEach((entry: PerformanceEntry) => {
            if (
              entry.name.includes('dynamic-import') ||
              (entry as unknown as { initiatorType?: string }).initiatorType ===
                'fetch'
            ) {
              this.trackImportPerformance(entry);
            }
          });
        }
      );
      observer.observe({ entryTypes: ['navigation', 'resource'] });
    }
  }

  private setupServiceWorkerMessageHandler() {
    // Listen for preload requests from service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'PRECACHE_MODULE') {
          this.preloadModule(event.data.path);
        }
      });
    }
  }

  /**
   * Dynamically imports a module with caching, retries, timeout, and fallback support.
   * Returns cached/preloaded modules if available and fresh. Deduplicates concurrent imports.
   * @template T The type of the imported module
   * @param path The module path or import specifier
   * @param options Configuration: timeout (ms), retries (count), fallback (function), preload (flag)
   * @returns Promise resolving to the imported module of type T
   * @throws Error if import fails after all retries and fallback (if provided) also fails
   */
  async importModule<T = unknown>(
    path: string,
    options: DynamicImportOptions = {}
  ): Promise<T> {
    const { timeout = 5000, retries = 2, fallback } = options;

    // Check if already preloaded
    const preloaded = this.preloadedModules.get(path);
    if (preloaded && Date.now() - preloaded.timestamp < 300000) {
      // 5 minutes cache
      return preloaded.module as T;
    }

    // Check if already importing
    if (this.importCache.has(path)) {
      return this.importCache.get(path)! as Promise<T>;
    }

    const importPromise = this.performImport<T>(
      path,
      timeout,
      retries,
      fallback
    );
    this.importCache.set(path, importPromise);

    try {
      const result = await importPromise;
      this.importCache.delete(path);
      return result;
    } catch (error) {
      this.importCache.delete(path);
      throw error;
    }
  }

  private async performImport<T>(
    path: string,
    timeout: number,
    retries: number,
    fallback?: () => void
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        const startTime = performance.now();

        // Add timeout to the import
        const importPromise = this.executeImport<T>(path);
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(
            () => reject(new Error(`Import timeout after ${timeout}ms`)),
            timeout
          );
        });

        const result = await Promise.race([importPromise, timeoutPromise]);

        const endTime = performance.now();
        this.recordSuccess(path, endTime - startTime);

        // Track successful import
        trackCustomMetric(
          `dynamic_import_${path}`,
          endTime - startTime,
          'Performance'
        );

        return result;
      } catch (error) {
        lastError = error as Error;
        this.recordFailure(path);

        if (attempt <= retries) {
          // Wait before retry with exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }

    // If all retries failed, try fallback
    if (fallback) {
      try {
        fallback();
        const defaultResult = {} as T;
        return defaultResult;
      } catch (fallbackError) {
        try {
          const { logger: fallbackLogger } = await import('@/lib/logger');
          fallbackLogger.error('Fallback also failed:', fallbackError);
        } catch {
          // Logger unavailable - fail silently
        }
      }
    }

    throw lastError!;
  }

  private async executeImport<T>(path: string): Promise<T> {
    // Use dynamic import with module federation support
    const module = await import(/* @vite-ignore */ path);

    // Handle different module export patterns
    if (module.default) {
      return module.default;
    }

    return module;
  }

  private trackImportPerformance(entry: PerformanceEntry) {
    if (entry.entryType === 'navigation') {
      // Track navigation performance for dynamic routes
      trackCustomMetric('dynamic_route_load', entry.duration, 'Performance');
    } else if (entry.entryType === 'resource') {
      // Track resource loading for code chunks
      if (entry.name.includes('.js') || entry.name.includes('.chunk')) {
        trackCustomMetric('chunk_load_time', entry.duration, 'Performance');
      }
    }
  }

  private recordSuccess(path: string, duration: number) {
    const stats = this.importStats.get(path) || {
      attempts: 0,
      success: 0,
      failures: 0,
      avgTime: 0,
    };
    stats.attempts++;
    stats.success++;
    stats.avgTime =
      (stats.avgTime * (stats.success - 1) + duration) / stats.success;
    this.importStats.set(path, stats);
  }

  private recordFailure(path: string) {
    const stats = this.importStats.get(path) || {
      attempts: 0,
      success: 0,
      failures: 0,
      avgTime: 0,
    };
    stats.attempts++;
    stats.failures++;
    this.importStats.set(path, stats);
  }

  /**
   * Preloads a module and caches it for future use.
   * Silently ignores preload failures with a logger warning.
   * @param path The module path to preload
   * @returns Promise that resolves when preload completes or fails (never throws)
   */
  async preloadModule(path: string): Promise<void> {
    if (this.preloadedModules.has(path)) {
      return; // Already preloaded
    }

    try {
      const module = await this.importModule(path);
      this.preloadedModules.set(path, {
        path,
        module,
        timestamp: Date.now(),
      });
    } catch (error) {
      const { logger: preloadLogger } = await import('@/lib/logger');
      preloadLogger.warn(`Failed to preload module ${path}`, {
        component: 'DynamicImportManager',
        action: 'preload_module',
        metadata: { path, error },
      });
    }
  }

  // Preload commonly used modules based on user behavior
  /**
   * Preloads commonly used modules based on network connection quality.
   * On 4G or high-speed connections, preloads full set of modules.
   * On 3G, preloads minimal critical modules only.
   * Silently skips preload if network API is unavailable.
   */
  preloadCommonModules() {
    const commonPaths = [
      './components/ui/Button',
      './components/ui/Card',
      './components/forms/TradingForm',
      './hooks/useTradingData',
      './hooks/usePriceStream',
      './lib/format',
      './lib/validationRules',
    ];

    // Preload modules based on network conditions
    if ('connection' in navigator) {
      const connection = (
        navigator as Navigator & { connection?: NetworkInformation }
      ).connection;
      if (
        connection &&
        (connection.effectiveType === '4g' || connection.downlink > 2)
      ) {
        // Good connection - preload more modules
        commonPaths.forEach((path) => this.preloadModule(path));
      } else if (connection && connection.effectiveType === '3g') {
        // Moderate connection - preload fewer modules
        commonPaths.slice(0, 3).forEach((path) => this.preloadModule(path));
      }
      // Slow connection - skip preloading
    }
  }

  // Route-based code splitting
  /**
   * Dynamically imports a route component based on the provided route path.
   * Supports predefined routes: /trade, /portfolio, /history, /settings, /admin.
   * @param routePath The application route path
   * @returns Promise resolving to the imported route component
   * @throws Error if the route path is not found in the route map
   */
  async loadRouteComponents(routePath: string): Promise<unknown> {
    const routeMap: Record<string, string> = {
      '/trade': './pages/Trade',
      '/portfolio': './pages/Portfolio',
      '/history': './pages/History',
      '/settings': './pages/Settings',
      '/admin': './pages/Admin',
    };

    const componentPath = routeMap[routePath];
    if (!componentPath) {
      throw new Error(`No component found for route: ${routePath}`);
    }

    return this.importModule(componentPath);
  }

  // Lazy load heavy components with priority
  /**
   * Lazily loads heavy components with adjustable priority scheduling.
   * Supports TradingViewChart, AdvancedAnalytics, RiskDashboard, and ReportGenerator.
   * @param componentName The name of the heavy component to load
   * @param priority Loading priority: 'high' (immediate), 'medium' (normal), 'low' (deferred)
   * @returns Promise resolving to the imported heavy component
   * @throws Error if the component name is not found in the component registry
   */
  async loadHeavyComponent(
    componentName: string,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<unknown> {
    const heavyComponents: Record<
      string,
      { path: string; size: number; priority: number }
    > = {
      TradingViewChart: {
        path: './components/charts/TradingViewChart',
        size: 500000,
        priority: 1,
      },
      AdvancedAnalytics: {
        path: './components/analytics/AdvancedAnalytics',
        size: 300000,
        priority: 2,
      },
      RiskDashboard: {
        path: './pages/AdminRiskDashboard',
        size: 400000,
        priority: 1,
      },
      ReportGenerator: {
        path: './components/reports/ReportGenerator',
        size: 250000,
        priority: 3,
      },
    };

    const component = heavyComponents[componentName];
    if (!component) {
      throw new Error(`Heavy component not found: ${componentName}`);
    }

    // Only load if priority is high enough for current device
    if (this.shouldLoadComponent(component.priority, priority)) {
      return this.importModule(component.path);
    }

    // Return a placeholder component
    return () => null;
  }

  private shouldLoadComponent(
    componentPriority: number,
    requestPriority: 'high' | 'medium' | 'low'
  ): boolean {
    const priorityMap = { high: 1, medium: 2, low: 3 };
    return componentPriority <= priorityMap[requestPriority];
  }

  // Get import statistics for monitoring
  /**
   * Retrieves import statistics for all loaded modules including success/failure rates.
   * @returns Map of module paths to statistics (attempts, success count, failure count, average load time, and percentages)
   */
  getImportStats(): Record<
    string,
    {
      attempts: number;
      success: number;
      failures: number;
      avgTime: number;
      successRate: string;
      failureRate: string;
    }
  > {
    const stats: Record<
      string,
      {
        attempts: number;
        success: number;
        failures: number;
        avgTime: number;
        successRate: string;
        failureRate: string;
      }
    > = {};
    this.importStats.forEach((value, key) => {
      stats[key] = {
        ...value,
        successRate:
          value.attempts > 0
            ? ((value.success / value.attempts) * 100).toFixed(2) + '%'
            : '0%',
        failureRate:
          value.attempts > 0
            ? ((value.failures / value.attempts) * 100).toFixed(2) + '%'
            : '0%',
      };
    });
    return stats;
  }

  // Clean up old preloaded modules
  /**
   * Removes preloaded modules older than the specified maximum age.
   * Helps manage memory by cleaning up stale cached modules.
   * @param maxAge Maximum age in milliseconds before a module is considered stale (default: 5 minutes)
   */
  cleanupPreloadedModules(maxAge: number = 300000): void {
    // 5 minutes default
    const now = Date.now();
    for (const [path, module] of this.preloadedModules.entries()) {
      if (now - module.timestamp > maxAge) {
        this.preloadedModules.delete(path);
      }
    }
  }
}

// Singleton instance
export const dynamicImportManager = DynamicImportManager.getInstance();

// Utility functions for React components
export function useDynamicImport<T = unknown>(
  path: string,
  options?: DynamicImportOptions
) {
  const [module, setModule] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isCancelled = false;

    dynamicImportManager
      .importModule<T>(path, options)
      .then((result) => {
        if (!isCancelled) {
          setModule(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [path, options]);

  return { module, loading, error };
}

// HOC for dynamic component loading
export function withDynamicImport<
  T extends ComponentType<Record<string, unknown>>
>(importFunc: () => Promise<{ default: T }>, fallback?: ComponentType) {
  return function DynamicComponent(props: ComponentProps<T>) {
    const [Component, setComponent] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let isCancelled = false;

      importFunc()
        .then(({ default: LoadedComponent }) => {
          if (!isCancelled) {
            setComponent(() => LoadedComponent);
            setLoading(false);
          }
        })
        .catch(async (error) => {
          const { logger: loaderLogger } = await import('@/lib/logger');
          loaderLogger.error('Failed to load dynamic component', error);
          if (!isCancelled) {
            setLoading(false);
          }
        });

      return () => {
        isCancelled = true;
      };
    }, []);

    if (loading) {
      return fallback
        ? createElement(fallback)
        : createElement('div', null, 'Loading...');
    }

    if (!Component) {
      return fallback
        ? createElement(fallback)
        : createElement('div', null, 'Failed to load component');
    }

    return createElement(Component, props);
  };
}

// Preload critical modules on app start
export function initializePreloading() {
  // Preload critical modules after app loads
  window.addEventListener('load', () => {
    setTimeout(() => {
      dynamicImportManager.preloadCommonModules();
    }, 1000);
  });

  // Periodic cleanup
  setInterval(() => {
    dynamicImportManager.cleanupPreloadedModules();
  }, 60000); // Every minute
}
