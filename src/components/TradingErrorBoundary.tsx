/**
 * Trading Error Boundary
 *
 * Specialized error boundary for trading-related components that handles
 * critical trading errors with enhanced logging and user-friendly fallbacks.
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getActionableErrorMessage } from '@/lib/errorMessageService';
import { logger } from '@/lib/logger';
import {
  AlertTriangle,
  Home,
  Lock,
  RefreshCw,
  ShieldAlert,
  TrendingDown,
  WifiOff,
} from 'lucide-react';
import React from 'react';

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
      errorId: '',
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<TradingErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `trading-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { critical = false } = this.props;

    // Enhanced error logging for trading components
    logger.error(
      `Trading Error Boundary caught an error: ${error.message}`,
      error,
      {
        component: 'TradingErrorBoundary',
        action: 'trading_error_boundary_catch',
        metadata: {
          errorId: this.state.errorId,
          critical,
          componentStack: errorInfo?.componentStack,
          retryCount: this.state.retryCount,
          timestamp: new Date().toISOString(),
          // Add trading-specific context
          tradingContext: {
            // These would be populated by the trading system in a real scenario
            // For now, we log placeholders
            currentPosition: null,
            activeOrders: null,
            marketStatus: null,
          },
        },
      }
    );

    // Add breadcrumb for trading error tracking
    logger.addBreadcrumb(
      'error',
      `Trading component error: ${error.message}`,
      critical ? 'error' : 'warning'
    );

    // Log as critical error if marked as such
    if (critical) {
      logger.addBreadcrumb(
        'critical',
        `CRITICAL: Trading component failed - ${error.message}`
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
      logger.warn('Maximum retry attempts reached for trading component', {
        component: 'TradingErrorBoundary',
        action: 'max_retries_exceeded',
        metadata: { retryCount, maxRetries },
      });
      return;
    }

    this.setState({
      hasError: false,
      error: null,
      errorId: '',
      retryCount: retryCount + 1,
    });

    logger.addBreadcrumb(
      'info',
      `Retrying trading component (attempt ${retryCount + 1})`
    );
  };

  handleReset = () => {
    logger.info('Trading component reset requested by user', {
      component: 'TradingErrorBoundary',
      action: 'trading_component_reset',
    });

    this.setState({
      hasError: false,
      error: null,
      errorId: '',
      retryCount: 0,
    });
  };

  handleGoHome = () => {
    logger.info('User navigated away from trading error', {
      component: 'TradingErrorBoundary',
      action: 'user_navigate_away',
    });

    // Navigate to home page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  getErrorIcon = (errorCode?: string) => {
    if (!errorCode) return AlertTriangle;

    switch (errorCode) {
      case 'INSUFFICIENT_MARGIN':
      case 'INSUFFICIENT_BALANCE':
        return TrendingDown;
      case 'MARKET_DATA_UNAVAILABLE':
      case 'INTERNAL_ERROR':
        return WifiOff;
      case 'RATE_LIMIT_EXCEEDED':
      case 'RISK_LIMIT_VIOLATION':
        return ShieldAlert;
      case 'VALIDATION_FAILED':
        return Lock;
      default:
        return AlertTriangle;
    }
  };

  override render() {
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

      // Get actionable error details
      const actionableError = getActionableErrorMessage(this.state.error);
      const ErrorIcon = this.getErrorIcon(actionableError.errorCode);
      const canRetry = this.state.retryCount < (this.props.maxRetries || 3);

      // Default fallback UI with trading-specific styling
      return (
        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
          <Card className="w-full max-w-md shadow-lg border-2 border-destructive/20">
            <CardHeader className="border-b bg-destructive/5 pb-4">
              <div className="flex items-center gap-4">
                <div
                  className={`p-2 rounded-full ${
                    critical
                      ? 'bg-destructive/10'
                      : 'bg-orange-100 dark:bg-orange-900/20'
                  }`}
                >
                  <ErrorIcon
                    className={`w-8 h-8 ${
                      critical ? 'text-destructive' : 'text-orange-500'
                    }`}
                  />
                </div>
                <div>
                  <CardTitle
                    className={`text-lg font-bold ${
                      critical ? 'text-destructive' : 'text-foreground'
                    }`}
                  >
                    {actionableError.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {critical
                      ? 'Trading paused for safety'
                      : 'Component encountered an issue'}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border text-sm">
                  <p className="font-medium text-foreground mb-1">
                    What happened:
                  </p>
                  <p className="text-muted-foreground">
                    {actionableError.description}
                  </p>
                </div>

                {actionableError.suggestion && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30 text-sm">
                    <p className="font-medium text-blue-700 dark:text-blue-400 mb-1">
                      Suggestion:
                    </p>
                    <p className="text-blue-600 dark:text-blue-300">
                      {actionableError.suggestion}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {/* Retry section */}
                {canRetry && (
                  <div className="flex gap-3">
                    <Button
                      variant="default"
                      onClick={this.handleRetry}
                      className="flex-1"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                    <Button
                      variant="outline"
                      onClick={this.handleReset}
                      className="flex-1"
                    >
                      Reset View
                    </Button>
                  </div>
                )}

                {/* Navigation options */}
                <div className="flex gap-3">
                  <Button
                    variant={canRetry ? 'secondary' : 'default'}
                    className="flex-1"
                    onClick={this.handleGoHome}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                  {critical && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        logger.info(
                          'User contacted support from critical trading error',
                          {
                            component: 'TradingErrorBoundary',
                            action: 'contact_support_from_error',
                          }
                        );
                        // In a real app, this would open support chat or email
                        window.open('mailto:support@tradexpro.com', '_blank');
                      }}
                    >
                      Contact Support
                    </Button>
                  )}
                </div>
              </div>

              {/* Error tracking ID */}
              {this.state.errorId && (
                <div className="text-center pt-2 border-t">
                  <p className="text-xs text-muted-foreground font-mono">
                    Error ID: {this.state.errorId}
                  </p>
                </div>
              )}

              {/* Error details in development */}
              {import.meta.env.MODE === 'development' && this.state.error && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors font-medium">
                    Show Technical Details
                  </summary>
                  <div className="bg-slate-950 text-slate-50 rounded-lg p-4 mt-2 overflow-auto max-h-60">
                    <p className="font-mono mb-2 text-red-400">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo?.componentStack && (
                      <pre className="font-mono opacity-70 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default TradingErrorBoundary;
