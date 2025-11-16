import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logger } from "@/lib/logger";

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

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <CardTitle className="text-red-600 dark:text-red-400">
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

                {/* Error details in development */}
                {import.meta.env.MODE === "development" && this.state.error && (
                  <div className="bg-red-50 dark:bg-red-950 rounded-lg p-3 space-y-2">
                    <p className="text-xs font-mono text-red-700 dark:text-red-200 break-words">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo?.componentStack && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-red-600 dark:text-red-300 font-semibold">
                          Component Stack
                        </summary>
                        <pre className="mt-2 text-red-600 dark:text-red-300 overflow-auto max-h-40 font-mono text-xs whitespace-pre-wrap break-words">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={this.handleReset}
                    className="flex-1 gap-2"
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

                <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-2">
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
