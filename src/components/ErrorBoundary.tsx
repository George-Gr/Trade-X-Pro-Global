import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logger } from "@/lib/logger";
import { AlertTriangle, RotateCcw } from "lucide-react";
import * as React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
}

/**
 * ErrorBoundary component to catch and handle React component errors
 * Prevents entire app from crashing due to single component failure
 * Provides user-friendly error UI with retry functionality
 *
 * Logs errors with full context including:
 * - Error message and stack trace
 * - Component that failed
 * - Component stack trace
 * - User ID (if available via logger global context)
 * - Unique error ID for tracking
 *
 * Usage:
 * <ErrorBoundary componentName="TradeForm" onError={(error, info) => console.log(error)}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Generate unique error ID for tracking
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Log error with full context
    logger.error(`ErrorBoundary caught an error: ${error.message}`, error, {
      component: this.props.componentName || "Unknown",
      action: "error_boundary_catch",
      metadata: {
        errorId,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
      },
    });

    // Add breadcrumb for error tracking
    logger.addBreadcrumb(
      "error",
      `Component ${this.props.componentName || "Unknown"} threw error: ${error.message}`
    );

    // Call optional error handler prop for custom logging (e.g., Sentry)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorId,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    });
  };

  /**
   * Render fallback UI for critical components with graceful degradation
   */
  renderCriticalComponentFallback = (componentName: string) => {
    const getFallbackContent = () => {
      switch (componentName) {
        case "TradingViewChart":
          return (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                The chart is temporarily unavailable. You can still place orders using the order form below.
              </p>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-8 text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Chart loading...</p>
              </div>
            </div>
          );

        case "OrderForm":
          return (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                The order form is temporarily unavailable. Please try refreshing the page or contact support.
              </p>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-8 text-center">
                <div className="text-4xl mb-2">📝</div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Order form unavailable</p>
              </div>
            </div>
          );

        case "PositionsTable":
          return (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Position data is temporarily unavailable. Your positions are safe and will be restored when the service is back online.
              </p>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-8 text-center">
                <div className="text-4xl mb-2">💼</div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Positions loading...</p>
              </div>
            </div>
          );

        case "PortfolioDashboard":
          return (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Portfolio data is temporarily unavailable. Your account balance and equity are safe.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Account Balance</p>
                  <p className="text-2xl font-bold">••••••</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Equity</p>
                  <p className="text-2xl font-bold">••••••</p>
                </div>
              </div>
            </div>
          );

        default:
          return (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                This component is temporarily unavailable. Please try refreshing the page.
              </p>
            </div>
          );
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-6 h-6 text-destructive" />
              <CardTitle className="text-destructive">
                Component Unavailable
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {getFallbackContent()}

              {/* Error tracking ID */}
              {this.state.errorId && (
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Error ID: {this.state.errorId}
                </p>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 gap-4"
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.href = "/"}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  Go Home
                </Button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-4">
                If this error persists, please contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Graceful degradation based on component type
      const componentName = this.props.componentName || "Unknown";
      const isCriticalComponent = [
        "TradingViewChart",
        "OrderForm",
        "PositionsTable",
        "PortfolioDashboard"
      ].includes(componentName);

      if (isCriticalComponent) {
        return this.renderCriticalComponentFallback(componentName);
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="border-b">
              <div className="flex items-center gap-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                <CardTitle className="text-destructive">
                  Something went wrong
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  An unexpected error occurred. Our team has been notified and is working to fix it.
                </p>

                {/* Error tracking ID */}
                {this.state.errorId && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Error ID: {this.state.errorId}
                  </p>
                )}

                {/* Error details in development only - prevents information disclosure in production */}
                {import.meta.env.MODE === "development" && this.state.error && (
                  <div className="bg-[hsl(var(--status-error))] dark:bg-[hsl(var(--status-error-dark))] rounded-lg p-4 space-y-2">
                    <p className="text-xs font-mono text-[hsl(var(--status-error-foreground))] dark:text-[hsl(var(--status-error-dark-foreground))] break-words">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo?.componentStack && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-destructive font-semibold">
                          Component Stack
                        </summary>
                        <pre className="mt-2 text-destructive overflow-auto max-h-40 font-mono text-xs whitespace-pre-wrap break-words">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}

                {/* Production error message - generic and safe */}
                {import.meta.env.MODE === "production" && (
                  <div className="bg-[hsl(var(--status-warning))] dark:bg-[hsl(var(--status-warning-dark))] rounded-lg p-4 space-y-2">
                    <p className="text-xs font-mono text-[hsl(var(--status-warning-foreground))] dark:text-[hsl(var(--status-warning-dark-foreground))] break-words">
                      <strong>Security Notice:</strong> An error occurred. For security reasons, detailed error information is not displayed in production.
                    </p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={this.handleReset}
                    className="flex-1 gap-4"
                    size="sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </Button>
                  <Button
                    onClick={() => window.location.href = "/"}
                    variant="outline"
                    className="flex-1"
                    size="sm"
                  >
                    Go Home
                  </Button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-4">
                  If this error persists, please contact support.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
