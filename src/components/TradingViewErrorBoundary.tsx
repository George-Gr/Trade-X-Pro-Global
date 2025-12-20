/**
 * TradingView Error Boundary
 *
 * Specialized error boundary for TradingView widgets that handles
 * common TradingView-specific errors gracefully.
 * Note: Error notifications are displayed via the UI fallback, not toast.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface TradingViewErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

interface TradingViewErrorBoundaryProps {
  children: React.ReactNode;
  widgetType?: string; // e.g., "Advanced Chart", "Markets Widget", etc.
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  fallback?: React.ComponentType<{
    error: Error;
    onRetry: () => void;
    widgetType?: string;
  }>;
}

class TradingViewErrorBoundary extends React.Component<
  TradingViewErrorBoundaryProps,
  TradingViewErrorBoundaryState
> {
  constructor(props: TradingViewErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<TradingViewErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `tv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging and monitoring
    console.error(
      'TradingView Error Boundary caught an error:',
      error,
      errorInfo
    );

    // Call custom error handler if provided (e.g., for logging services)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Error will be displayed in the fallback UI below
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: '',
    });
  };

  handleGoHome = () => {
    // Navigate to home page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            onRetry={this.handleRetry}
            widgetType={this.props.widgetType}
          />
        );
      }

      // Default fallback UI
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50 p-4">
          <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-6 border border-border">
            <div className="flex items-center justify-center w-12 h-12 bg-destructive/10 rounded-full mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>

            <h3 className="text-lg font-semibold text-center mb-2">
              Chart Widget Error
            </h3>

            <p className="text-sm text-muted-foreground text-center mb-4">
              The {this.props.widgetType || 'chart widget'} encountered an error
              and has been temporarily disabled.
            </p>

            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={this.handleRetry}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              <Button
                variant="secondary"
                className="w-full"
                onClick={this.handleGoHome}
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>

            {/* Error tracking ID */}
            {this.state.errorId && (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono text-center mt-4">
                Error ID: {this.state.errorId}
              </p>
            )}

            {/* Error details in development */}
            {import.meta.env.MODE === 'development' && this.state.error && (
              <details className="mt-4 text-xs">
                <summary className="cursor-pointer text-[hsl(var(--status-error-foreground))] dark:text-[hsl(var(--status-error-dark-foreground))] font-semibold">
                  Technical Details
                </summary>
                <div className="bg-[hsl(var(--status-error))] dark:bg-[hsl(var(--status-error-dark))] rounded-lg p-4 mt-2">
                  <p className="font-mono text-[hsl(var(--status-error-foreground))] dark:text-[hsl(var(--status-error-dark-foreground))] break-words">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </p>
                  {this.state.error
                    .toString()
                    .includes('Symbol.toStringTag') && (
                    <p className="text-xs text-destructive mt-2">
                      This appears to be a TradingView compatibility issue. The
                      compatibility layer should handle this automatically.
                    </p>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default TradingViewErrorBoundary;
