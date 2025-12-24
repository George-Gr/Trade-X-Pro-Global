import { logger } from '@/lib/logger';
import { performanceMonitoring } from '@/lib/performance/performanceMonitoring';
import React, { Component, ReactNode } from 'react';
import {
  AdminErrorFallback,
  DashboardErrorFallback,
  KYCErrorFallback,
  PortfolioErrorFallback,
  TradingErrorFallback,
} from './RouteErrorFallbacks';

// Generic route error boundary props
interface RouteErrorBoundaryProps {
  children: ReactNode;
  routeName: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// Shared error boundary state interface
interface RouteErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// Trading-specific error boundary
// Uses local state reset for retry to maintain consistency with other error boundaries
// and preserve user state. Avoids full page reload which could lose trading context.
export class TradingErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log to performance monitoring
    const startTime = performance.now();
    performanceMonitoring.recordCustomTiming(
      'trading-error-boundary',
      startTime,
      performance.now() - startTime
    );
    performanceMonitoring.markUserAction('trading-route-error');

    // Log error details
    logger.error('Trading route error boundary caught', error, {
      action: 'route_error_boundary',
      page: 'trading',
      component: 'TradingErrorBoundary',
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });

    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <TradingErrorFallback
          error={this.state.error}
          onRetry={() =>
            this.setState({ hasError: false, error: null, errorInfo: null })
          }
        />
      );
    }

    return this.props.children;
  }
}

// Portfolio-specific error boundary
export class PortfolioErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log to performance monitoring
    const startTime = performance.now();
    performanceMonitoring.recordCustomTiming(
      'portfolio-error-boundary',
      startTime,
      performance.now() - startTime
    );
    performanceMonitoring.markUserAction('portfolio-route-error');

    logger.error('Portfolio route error boundary caught', error, {
      action: 'route_error_boundary',
      page: 'portfolio',
      component: 'PortfolioErrorBoundary',
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });

    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <PortfolioErrorFallback
          error={this.state.error}
          onRetry={() =>
            this.setState({ hasError: false, error: null, errorInfo: null })
          }
        />
      );
    }

    return this.props.children;
  }
}

// KYC-specific error boundary
export class KYCErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log to performance monitoring
    const startTime = performance.now();
    performanceMonitoring.recordCustomTiming(
      'kyc-error-boundary',
      startTime,
      performance.now() - startTime
    );
    performanceMonitoring.markUserAction('kyc-route-error');

    logger.error('KYC route error boundary caught', error, {
      action: 'route_error_boundary',
      page: 'kyc',
      component: 'KYCErrorBoundary',
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });

    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <KYCErrorFallback
          error={this.state.error}
          onRetry={() =>
            this.setState({ hasError: false, error: null, errorInfo: null })
          }
        />
      );
    }

    return this.props.children;
  }
}

// Admin-specific error boundary
export class AdminErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log to performance monitoring
    const startTime = performance.now();
    performanceMonitoring.recordCustomTiming(
      'admin-error-boundary',
      startTime,
      performance.now() - startTime
    );
    performanceMonitoring.markUserAction('admin-route-error');

    logger.error('Admin route error boundary caught', error, {
      action: 'route_error_boundary',
      page: 'admin',
      component: 'AdminErrorBoundary',
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });

    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <AdminErrorFallback
          error={this.state.error}
          onRetry={() =>
            this.setState({ hasError: false, error: null, errorInfo: null })
          }
        />
      );
    }

    return this.props.children;
  }
}

// Dashboard-specific error boundary
export class DashboardErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log to performance monitoring
    const startTime = performance.now();
    performanceMonitoring.recordCustomTiming(
      'dashboard-error-boundary',
      startTime,
      performance.now() - startTime
    );
    performanceMonitoring.markUserAction('dashboard-route-error');

    logger.error('Dashboard route error boundary caught', error, {
      action: 'route_error_boundary',
      page: 'dashboard',
      component: 'DashboardErrorBoundary',
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });

    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <DashboardErrorFallback
          error={this.state.error}
          onRetry={() =>
            this.setState({ hasError: false, error: null, errorInfo: null })
          }
        />
      );
    }

    return this.props.children;
  }
}

// Default error boundary for routes without specific boundaries
export class DefaultRouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log to performance monitoring
    const startTime = performance.now();
    performanceMonitoring.recordCustomTiming(
      'default-route-error-boundary',
      startTime,
      performance.now() - startTime
    );
    performanceMonitoring.markUserAction('default-route-error');

    logger.error('Default route error boundary caught', error, {
      action: 'route_error_boundary',
      page: 'default',
      component: 'DefaultRouteErrorBoundary',
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });

    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Something went wrong
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                We're sorry, but something unexpected happened while loading
                this page.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Reload Page
              </button>
              <button
                onClick={() =>
                  this.setState({
                    hasError: false,
                    error: null,
                    errorInfo: null,
                  })
                }
                className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Try Again
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-4 p-3 bg-gray-100 rounded-md">
                <details className="text-xs text-gray-600">
                  <summary>Error details (development only)</summary>
                  <pre className="mt-2 whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Error fallback components moved to RouteErrorFallbacks.tsx

// Route error boundary registry
export const routeErrorBoundaries = {
  '/dashboard': DashboardErrorBoundary,
  '/trade': TradingErrorBoundary,
  '/portfolio': PortfolioErrorBoundary,
  '/kyc': KYCErrorBoundary,
  '/admin': AdminErrorBoundary,
  '/admin/risk': AdminErrorBoundary,
  '/admin/performance': AdminErrorBoundary,
} as const;

// Error boundary factory
export function createRouteErrorBoundary(routePath: string) {
  const ErrorBoundary =
    routeErrorBoundaries[routePath as keyof typeof routeErrorBoundaries];
  return ErrorBoundary || DefaultRouteErrorBoundary;
}
