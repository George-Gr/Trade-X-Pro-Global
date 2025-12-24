import React, { ComponentType, Suspense, lazy } from 'react';

/**
 * React 19 Suspense patterns for data fetching optimization
 * Implements React.lazy with Suspense boundaries for heavy trading components
 */

// Interface definitions
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

interface SkeletonLoaderProps {
  variant?: 'default' | 'portfolio' | 'positions' | 'charts' | 'orders';
}

// Type definitions for data fetchingmn n  
interface PortfolioData {
  portfolio: string;
}

interface PositionsData {
  positions: string;
}

interface PrefetchData {
  [key: string]: unknown;
}

type WindowWithIdleCallback = Window & {
  requestIdleCallback?: (callback: () => void) => number;
};

// Enhanced fallback components with better UX
const TradingSkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'default',
}) => {
  const skeletonVariants = {
    default: (
      <div className="space-y-4 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    ),
    portfolio: (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 p-4 rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 bg-gray-50 rounded"
              >
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/5"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    positions: (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border border-gray-200 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-5 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    charts: (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="h-8 w-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    ),
    orders: (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-50 p-3 rounded flex justify-between"
              >
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/5"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  };

  return skeletonVariants[variant];
};

// Error fallback components with retry functionality
const TradingErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => (
  <div className="p-6 text-center">
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
        <svg
          className="w-6 h-6 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-red-800 mb-2">
        Trading Data Error
      </h3>
      <p className="text-red-600 mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

// High-priority Suspense boundary for critical trading data
export const CriticalTradingSuspense: React.FC<{
  children: React.ReactNode;
  fallback?: React.ComponentType;
  onError?: (error: Error) => void;
}> = ({ children, fallback: Fallback, onError }) => {
  return (
    <Suspense
      fallback={
        Fallback ? (
          React.createElement(Fallback)
        ) : (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading trading data...</p>
            </div>
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
};

// Mock components for demonstration (would be actual components in production)
const MockComponent: React.FC = () => <div>Component loaded successfully</div>;

export const LazyPortfolioDashboard = lazy(() =>
  Promise.resolve({ default: MockComponent })
);

export const LazyPositionsTable = lazy(() =>
  Promise.resolve({ default: MockComponent })
);

export const LazyTradingChart = lazy(() =>
  Promise.resolve({ default: MockComponent })
);

export const LazyOrdersHistory = lazy(() =>
  Promise.resolve({ default: MockComponent })
);

export const LazyRiskDashboard = lazy(() =>
  Promise.resolve({ default: MockComponent })
);

export const LazyWatchlistManager = lazy(() =>
  Promise.resolve({ default: MockComponent })
);

// Enhanced Suspense wrappers with specific fallback UIs
export const PortfolioSuspense: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <CriticalTradingSuspense>
    <Suspense fallback={<TradingSkeletonLoader variant="portfolio" />}>
      {children}
    </Suspense>
  </CriticalTradingSuspense>
);

export const PositionsSuspense: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <CriticalTradingSuspense>
    <Suspense fallback={<TradingSkeletonLoader variant="positions" />}>
      {children}
    </Suspense>
  </CriticalTradingSuspense>
);

export const ChartsSuspense: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <CriticalTradingSuspense>
    <Suspense fallback={<TradingSkeletonLoader variant="charts" />}>
      {children}
    </Suspense>
  </CriticalTradingSuspense>
);

export const OrdersSuspense: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <CriticalTradingSuspense>
    <Suspense fallback={<TradingSkeletonLoader variant="orders" />}>
      {children}
    </Suspense>
  </CriticalTradingSuspense>
);

// Data prefetching utilities for better UX
export class SuspensePrefetcher {
  private static prefetchPromises = new Map<string, Promise<unknown>>();

  /**
   * Prefetch component data to reduce loading time
   */
  static prefetchComponent<T>(
    componentName: string,
    loader: () => Promise<T>
  ): Promise<T> {
    if (!this.prefetchPromises.has(componentName)) {
      this.prefetchPromises.set(componentName, loader());
    }
    return this.prefetchPromises.get(componentName)! as Promise<T>;
  }

  /**
   * Prefetch portfolio data
   */
  static prefetchPortfolio(): Promise<PortfolioData> {
    return this.prefetchComponent('portfolio', async () => {
      // Simulate data fetching
      await new Promise((resolve) => setTimeout(resolve, 100));
      return { portfolio: 'data' };
    });
  }

  /**
   * Prefetch positions data
   */
  static prefetchPositions(): Promise<PositionsData> {
    return this.prefetchComponent('positions', async () => {
      // Simulate data fetching
      await new Promise((resolve) => setTimeout(resolve, 150));
      return { positions: 'data' };
    });
  }

  /**
   * Clear prefetch cache
   */
  static clearCache(): void {
    this.prefetchPromises.clear();
  }
}

// Internal hook for managing Suspense boundaries
function useSuspenseBoundary() {
  const [isPending, setIsPending] = React.useState(false);

  const withSuspense = <T extends ComponentType<unknown>>(
    Component: T,
    fallback?: React.ComponentType<unknown>
  ): ComponentType<unknown> => {
    const WrappedComponent = (props: unknown) => (
      <Suspense
        fallback={
          fallback ? React.createElement(fallback) : <TradingSkeletonLoader />
        }
      >
        {/* @ts-expect-error - Dynamic component props */}
        <Component {...props} />
      </Suspense>
    );

    return WrappedComponent as ComponentType<unknown>;
  };

  return {
    withSuspense,
    isPending,
    setIsPending,
  };
}

// Progressive loading wrapper for heavy components
export function ProgressiveSuspenseLoader({
  children,
  priority = 'normal',
}: {
  children: React.ReactNode;
  priority?: 'high' | 'normal' | 'low';
}) {
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    if (priority === 'high') {
      // Load high priority components immediately
      setIsLoaded(true);
    } else {
      // Use requestIdleCallback for non-critical components
      const loadComponent = () => setIsLoaded(true);

      if ('requestIdleCallback' in window) {
        const typedWindow = window as WindowWithIdleCallback;
        if (typedWindow.requestIdleCallback) {
          typedWindow.requestIdleCallback(loadComponent);
        } else {
          setTimeout(loadComponent, 0);
        }
      } else {
        setTimeout(loadComponent, 0);
      }
    }
  }, [priority]);

  return (
    <Suspense fallback={<TradingSkeletonLoader />}>
      {isLoaded ? children : null}
    </Suspense>
  );
}

// Error recovery patterns for Suspense
export class SuspenseErrorRecovery {
  private static retryAttempts = new Map<string, number>();
  private static maxRetries = 3;

  /**
   * Retry failed Suspense operations with exponential backoff
   */
  static async retrySuspenseOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const attempts = this.retryAttempts.get(operationName) || 0;

    try {
      const result = await operation();
      this.retryAttempts.delete(operationName); // Clear on success
      return result;
    } catch (error) {
      const newAttempts = attempts + 1;
      this.retryAttempts.set(operationName, newAttempts);

      if (newAttempts <= this.maxRetries) {
        const delay = Math.pow(2, newAttempts) * 1000; // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.retrySuspenseOperation(operationName, operation);
      }

      throw error;
    }
  }

  /**
   * Reset retry attempts for a specific operation
   */
  static resetRetryAttempts(operationName: string): void {
    this.retryAttempts.delete(operationName);
  }
}
