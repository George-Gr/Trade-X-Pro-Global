import { logger } from '@/lib/logger';
import type { ComponentProps, ComponentType } from 'react';
import React, { Suspense, lazy } from 'react';

// NodeJS namespace for timeout types
declare global {
  namespace NodeJS {
    interface Timeout {}
  }
}

/**
 * Performance Optimization Utilities
 *
 * Provides lazy loading, memoization, and performance monitoring utilities
 * for TradeX Pro React application.
 */

/**
 * Lazy Load Component with Error Boundary and Fallback
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = lazy(importFn);

  return function LazyWrapper(
    props: ComponentProps<T> & { children?: React.ReactNode }
  ) {
    const [hasError, setHasError] = React.useState(false);

    if (hasError) {
      return (
        <div className="p-4 text-center">
          <h3 className="text-lg font-semibold text-destructive">
            Failed to load component
          </h3>
          <p className="text-sm text-muted-foreground">
            Please refresh the page and try again.
          </p>
        </div>
      );
    }

    return (
      <ErrorBoundary
        onError={() => setHasError(true)}
        fallback={
          fallback ? (
            React.createElement(fallback)
          ) : (
            <ComponentLoadingSkeleton />
          )
        }
      >
        <Suspense
          fallback={
            fallback ? (
              React.createElement(fallback)
            ) : (
              <ComponentLoadingSkeleton />
            )
          }
        >
          <LazyComponent {...(props as ComponentProps<T>)} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}

/**
 * Simple Error Boundary for Lazy Components
 */
class ErrorBoundary extends React.Component<
  { onError: () => void; fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: {
    onError: () => void;
    fallback: React.ReactNode;
    children: React.ReactNode;
  }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  override componentDidCatch() {
    this.props.onError();
  }
  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * Loading Skeleton for Components
 */
export function ComponentLoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-muted rounded-lg h-64 w-full"></div>
    </div>
  );
}

/**
 * Memoization Utilities
 */
export const memoize = <Args extends unknown[], R>(
  fn: (...args: Args) => R,
  keyFn?: (...args: Args) => string
): ((...args: Args) => R) => {
  const cache = new Map<string, R>();

  return (...args: Args): R => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);

    // Clean up cache if it gets too large
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value as string | undefined;
      if (firstKey !== undefined) cache.delete(firstKey);
    }

    return result;
  };
};

/**
 * Debouncing Utility
 */
export function debounce<Args extends unknown[], R>(
  func: (...args: Args) => R,
  wait: number,
  immediate = false
): (...args: Args) => void {
  let timeout: number | null = null;

  return function executedFunction(...args: Args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout !== null) clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);

    if (callNow) func(...args);
  };
}

/**
 * Throttling Utility
 */
export function throttle<Args extends unknown[]>(
  func: (...args: Args) => void,
  limit: number
): (...args: Args) => void {
  let inThrottle = false;

  return (...args: Args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Virtualization Hook for Long Lists
 */
export function useVirtualization<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleItems = React.useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + 1
    );

    return {
      startIndex,
      endIndex,
      visibleItems: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    ...visibleItems,
    handleScroll,
  };
}

/**
 * Image Lazy Loading Hook
 */
export function useImageLazyLoading() {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const ref = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { ref, isIntersecting };
}

/**
 * Performance Monitoring Hook
 */
export function usePerformanceMonitor(componentName: string) {
  React.useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Send to analytics if needed
      if (
        typeof window !== 'undefined' &&
        (window as unknown as Record<string, unknown>).gtag
      ) {
        const gtag = (window as unknown as Record<string, unknown>).gtag as (
          event: string,
          action: string,
          data: Record<string, unknown>
        ) => void;
        gtag('event', 'component_render', {
          component: componentName,
          render_time: renderTime,
          is_slow: renderTime > 100,
        });
      }
    };
  }, [componentName]);
}
/**
 * Resize Observer Hook
 */
export function useResizeObserver<T extends HTMLElement = HTMLElement>() {
  const ref = React.useRef<T>(null);
  const [size, setSize] = React.useState<{
    width: number;
    height: number;
  } | null>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { ref, size };
}

/**
 * Memory Usage Monitor
 */

// Interface for Performance Memory API
interface PerformanceMemory {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

export function useMemoryMonitor() {
  const [memory, setMemory] = React.useState<PerformanceMemory | null>(null);

  React.useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (
          performance as Performance & { memory?: PerformanceMemory }
        ).memory;
        if (memory) {
          setMemory(memory);
        }
      }
    };

    checkMemory();
    const interval = setInterval(checkMemory, 5000);

    return () => clearInterval(interval);
  }, []);

  return memory;
}

/**
 * Network Status Monitor
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [connection, setConnection] = React.useState<unknown>(null);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection type if available
    if ('connection' in navigator) {
      setConnection(
        (navigator as Record<string, unknown>).connection as ReturnType<
          typeof setConnection
        > | null
      );
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, connection };
}

/**
 * Component Performance Profiler
 */
export function PerformanceProfiler({
  id,
  children,
  onRender,
}: {
  id: string;
  children: React.ReactNode;
  onRender?: React.ProfilerOnRenderCallback;
}) {
  const onRenderCallback: React.ProfilerOnRenderCallback = React.useCallback(
    (...params: Parameters<React.ProfilerOnRenderCallback>) => {
      if (onRender) {
        onRender(...params);
      }

      const actualDuration = params[2] as number;
      // Log slow renders
      if (actualDuration > 16) {
        logger.warn(
          `Slow render detected: ${params[0]} took ${actualDuration.toFixed(
            2
          )}ms`,
          {
            component: params[0],
          }
        );
      }
    },
    [onRender]
  );

  if (import.meta.env.DEV) {
    return (
      <React.Profiler id={id} onRender={onRenderCallback}>
        {children}
      </React.Profiler>
    );
  }

  return <>{children}</>;
}

/**
 * Bundle Size Optimizer
 */
export const BundleOptimizer = {
  // Check if component should be lazy loaded
  shouldLazyLoad: (componentName: string, threshold = 10240) => {
    // In development, always lazy load for faster initial load
    if (import.meta.env.DEV) {
      return true;
    }

    // In production, check if component exceeds threshold
    // This is a simplified check - in reality you'd want to measure actual bundle size
    const componentSize = componentName.length * 100; // Rough estimate
    return componentSize > threshold;
  },

  // Get component chunk name for better debugging
  getChunkName: (componentName: string) => {
    return `${componentName}-chunk`;
  },
};

export default {
  createLazyComponent,
  ComponentLoadingSkeleton,
  memoize,
  debounce,
  throttle,
  useVirtualization,
  useImageLazyLoading,
  usePerformanceMonitor,
  useResizeObserver,
  useMemoryMonitor,
  useNetworkStatus,
  PerformanceProfiler,
  BundleOptimizer,
};
