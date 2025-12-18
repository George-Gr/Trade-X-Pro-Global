/**
 * Trading Error Boundary
 *
 * Specialized error boundary for trading-related components that handles
 * critical trading errors with enhanced logging and user-friendly fallbacks.
 */

import React from "react";
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logger } from "@/lib/logger";

interface TradingErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string;
  retryCount: number;
  errorInfo?: React.ErrorInfo;
}

interface TradingErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  fallback?: React.ComponentType<{
    error: Error;
    onRetry: () => void;
    onReset: () => void;
  }>;
  maxRetries?: number;
  critical?: boolean; // Whether this is a critical trading component
}

class TradingErrorBoundary extends React.Component<
  TradingErrorBoundaryProps,
  TradingErrorBoundaryState
> {
  constructor(props: TradingErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: "",
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(
    error: Error,
  ): Partial<TradingErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `trading-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { critical = false } = this.props;

    // Enhanced error logging for trading components
    logger.error(
      `Trading Error Boundary caught an error: ${error.message}`,
      error,
      {
        component: "TradingErrorBoundary",
        action: "trading_error_boundary_catch",
        metadata: {
          errorId: this.state.errorId,
          critical,
          componentStack: errorInfo?.componentStack,
          retryCount: this.state.retryCount,
          timestamp: new Date().toISOString(),
          // Add trading-specific context
          tradingContext: {
            // These would be populated by the trading system
            currentPosition: null,
            activeOrders: null,
            marketStatus: null,
          },
        },
      },
    );

    // Add breadcrumb for trading error tracking
    logger.addBreadcrumb(
      "error",
      `Trading component error: ${error.message}`,
      critical ? "error" : "warning",
    );

    // Log as critical error if marked as such
    if (critical) {
      logger.addBreadcrumb(
        "critical",
        `CRITICAL: Trading component failed - ${error.message}`,
      );
    }

    // Update state with errorInfo
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    const { retryCount } = this.state;
    const { maxRetries = 3 } = this.props;

    if (retryCount >= maxRetries) {
      logger.warn("Maximum retry attempts reached for trading component", {
        component: "TradingErrorBoundary",
        action: "max_retries_exceeded",
        metadata: { retryCount, maxRetries },
      });
      return;
    }

    this.setState({
      hasError: false,
      error: null,
      errorId: "",
      retryCount: retryCount + 1,
    });

    logger.addBreadcrumb(
      "info",
      `Retrying trading component (attempt ${retryCount + 1})`,
    );
  };

  handleReset = () => {
    logger.info("Trading component reset requested by user", {
      component: "TradingErrorBoundary",
      action: "trading_component_reset",
    });

    this.setState({
      hasError: false,
      error: null,
      errorId: "",
      retryCount: 0,
    });
  };

  handleGoHome = () => {
    logger.info("User navigated away from trading error", {
      component: "TradingErrorBoundary",
      action: "user_navigate_away",
    });

    // Navigate to home page
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  render() {
    const { critical = false } = this.props;

    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            onRetry={this.handleRetry}
            onReset={this.handleReset}
          />
        );
      }

      // Default fallback UI with trading-specific styling
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
          <Card className="w-full max-w-md shadow-lg border-2 border-destructive/20">
            <CardHeader className="border-b bg-destructive/5">
              <div className="flex items-center gap-4">
                {critical ? (
                  <ShieldAlert className="w-6 h-6 text-destructive" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                )}
                <div>
                  <CardTitle
                    className={
                      critical ? "text-destructive" : "text-foreground"
                    }
                  >
                    {critical
                      ? "Trading System Error"
                      : "Trading Component Error"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {critical
                      ? "Your trading session has been paused for safety"
                      : "A trading component encountered an error"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {critical
                    ? "We've detected a critical issue with the trading system. Your positions are secure, but trading has been temporarily disabled."
                    : "An unexpected error occurred in the trading interface. Your data is safe and can be restored."}
                </p>

                {/* Retry section */}
                {this.state.retryCount < (this.props.maxRetries || 3) && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Auto-save is active. You can try to restore the component.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={this.handleRetry}
                        className="flex-1"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again ({this.state.retryCount + 1}/
                        {this.props.maxRetries || 3})
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={this.handleReset}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                )}

                {/* Navigation options */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={this.handleGoHome}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                  {critical && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        logger.info(
                          "User contacted support from critical trading error",
                          {
                            component: "TradingErrorBoundary",
                            action: "contact_support_from_error",
                          },
                        );
                        // In a real app, this would open support chat or email
                        window.open("mailto:support@tradexpro.com", "_blank");
                      }}
                    >
                      Contact Support
                    </Button>
                  )}
                </div>

                {/* Error tracking ID */}
                {this.state.errorId && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono text-center mt-2">
                    Error ID: {this.state.errorId}
                    {this.state.retryCount > 0 &&
                      ` (Retry: ${this.state.retryCount})`}
                  </p>
                )}

                {/* Error details in development */}
                {import.meta.env.MODE === "development" && this.state.error && (
                  <details className="mt-4 text-xs">
                    <summary className="cursor-pointer text-destructive font-semibold">
                      Technical Details
                    </summary>
                    <div className="bg-destructive/5 dark:bg-destructive/10 rounded-lg p-4 mt-2 border border-destructive/20">
                      <p className="font-mono text-sm break-words">
                        <strong>Error:</strong> {this.state.error.toString()}
                      </p>
                      {this.state.errorInfo?.componentStack && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-destructive font-semibold mt-2">
                            Component Stack
                          </summary>
                          <pre className="mt-2 text-destructive overflow-auto max-h-40 font-mono text-xs whitespace-pre-wrap break-words">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </details>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        This error boundary is specifically designed for trading
                        components and includes enhanced error tracking for
                        financial operations.
                      </p>
                    </div>
                  </details>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default TradingErrorBoundary;
