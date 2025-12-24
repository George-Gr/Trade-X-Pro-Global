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

interface TradingErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// Trading-specific error boundary
export class TradingErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  TradingErrorBoundaryState
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
    performanceMonitoring.recordCustomTiming(
      'trading-error-boundary',
      performance.now(),
      0
    );
    performanceMonitoring.markUserAction('trading-route-error');

    // Log error details
    console.error('Trading route error boundary caught:', error, errorInfo);

    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <TradingErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={() => window.location.reload()}
          routeName={this.props.routeName}
        />
      );
    }

    return this.props.children;
  }
}

interface PortfolioErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// Portfolio-specific error boundary
export class PortfolioErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  PortfolioErrorBoundaryState
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

    performanceMonitoring.recordCustomTiming(
      'portfolio-error-boundary',
      performance.now(),
      0
    );
    performanceMonitoring.markUserAction('portfolio-route-error');

    console.error('Portfolio route error boundary caught:', error, errorInfo);

    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <PortfolioErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={() =>
            this.setState({ hasError: false, error: null, errorInfo: null })
          }
          routeName={this.props.routeName}
        />
      );
    }

    return this.props.children;
  }
}

interface KYCErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// KYC-specific error boundary
export class KYCErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  KYCErrorBoundaryState
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

    performanceMonitoring.recordCustomTiming(
      'kyc-error-boundary',
      performance.now(),
      0
    );
    performanceMonitoring.markUserAction('kyc-route-error');

    console.error('KYC route error boundary caught:', error, errorInfo);

    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <KYCErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={() =>
            this.setState({ hasError: false, error: null, errorInfo: null })
          }
          routeName={this.props.routeName}
        />
      );
    }

    return this.props.children;
  }
}

interface AdminErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// Admin-specific error boundary
export class AdminErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  AdminErrorBoundaryState
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

    performanceMonitoring.recordCustomTiming(
      'admin-error-boundary',
      performance.now(),
      0
    );
    performanceMonitoring.markUserAction('admin-route-error');

    console.error('Admin route error boundary caught:', error, errorInfo);

    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <AdminErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={() =>
            this.setState({ hasError: false, error: null, errorInfo: null })
          }
          routeName={this.props.routeName}
        />
      );
    }

    return this.props.children;
  }
}

interface DashboardErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// Dashboard-specific error boundary
export class DashboardErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  DashboardErrorBoundaryState
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

    performanceMonitoring.recordCustomTiming(
      'dashboard-error-boundary',
      performance.now(),
      0
    );
    performanceMonitoring.markUserAction('dashboard-route-error');

    console.error('Dashboard route error boundary caught:', error, errorInfo);

    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <DashboardErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={() =>
            this.setState({ hasError: false, error: null, errorInfo: null })
          }
          routeName={this.props.routeName}
        />
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
  return ErrorBoundary || React.Component;
}
