/**
 * API Error Boundary
 * 
 * Specialized error boundary for API calls and network requests.
 * Provides detailed error logging and retry mechanisms for network failures.
 */

import * as React from 'react';
import { Wifi, WifiOff, RefreshCw, ExternalLink, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logger } from "@/lib/logger";

interface APIErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string;
  retryCount: number;
  isOffline: boolean;
  errorInfo?: React.ErrorInfo;
}

interface APIErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  fallback?: React.ComponentType<{ error: Error; onRetry: () => void; onOfflineRetry: () => void }>;
  maxRetries?: number;
  endpoint?: string; // API endpoint for better error tracking
  critical?: boolean; // Whether this API call is critical
}

class APIErrorBoundary extends React.Component<
  APIErrorBoundaryProps,
  APIErrorBoundaryState
> {
  private networkStatusHandler?: () => void;

  constructor(props: APIErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: '',
      retryCount: 0,
      isOffline: !navigator.onLine
    };
  }

  componentDidMount() {
    // Listen for network status changes
    this.networkStatusHandler = () => {
      this.setState({ isOffline: !navigator.onLine });
    };
    
    window.addEventListener('online', this.networkStatusHandler);
    window.addEventListener('offline', this.networkStatusHandler);
  }

  componentWillUnmount() {
    if (this.networkStatusHandler) {
      window.removeEventListener('online', this.networkStatusHandler);
      window.removeEventListener('offline', this.networkStatusHandler);
    }
  }

  static getDerivedStateFromError(error: Error): Partial<APIErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `api-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { endpoint, critical = false } = this.props;
    
    // Enhanced API error logging
    logger.error(`API Error Boundary caught an error: ${error.message}`, error, {
      component: "APIErrorBoundary",
      action: "api_error_boundary_catch",
      metadata: {
        errorId: this.state.errorId,
        endpoint,
        critical,
        componentStack: errorInfo?.componentStack,
        retryCount: this.state.retryCount,
        isOffline: this.state.isOffline,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        // Add network-specific context
        networkContext: {
          onLine: navigator.onLine,
          connection: (navigator as unknown as { connection?: { effectiveType?: string } }).connection?.effectiveType || 'unknown',
          referrer: document.referrer
        }
      },
    });

    // Add breadcrumb for API error tracking
    logger.addBreadcrumb(
      "api_error",
      `API call failed${endpoint ? ` to ${endpoint}` : ''}: ${error.message}`,
      critical ? "error" : "warning"
    );

    // Log network status if offline
    if (this.state.isOffline) {
      logger.addBreadcrumb(
        "network",
        "Network connection lost during API call"
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
      logger.warn("Maximum retry attempts reached for API call", {
        component: "APIErrorBoundary",
        action: "max_api_retries_exceeded",
        metadata: { 
          retryCount, 
          maxRetries, 
          endpoint: this.props.endpoint 
        }
      });
      return;
    }

    logger.info("Retrying API call", {
      component: "APIErrorBoundary",
      action: "api_retry_attempt",
      metadata: {
        retryCount: retryCount + 1,
        endpoint: this.props.endpoint,
        isOffline: this.state.isOffline
      }
    });

    this.setState({
      hasError: false,
      error: null,
      errorId: '',
      retryCount: retryCount + 1
    });
  };

  handleOfflineRetry = () => {
    // Check if we're back online
    if (navigator.onLine) {
      this.handleRetry();
    } else {
      logger.info("User attempted retry while offline", {
        component: "APIErrorBoundary",
        action: "offline_retry_attempted"
      });
    }
  };

  handleOpenSupport = () => {
    logger.info("User opened support from API error", {
      component: "APIErrorBoundary",
      action: "open_api_support"
    });
    
    // In a real app, this would open documentation or support
    window.open('https://docs.tradexpro.com/api', '_blank');
  };

  render() {
    const { critical = false, endpoint } = this.props;
    const { isOffline, retryCount } = this.state;
    
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error} 
            onRetry={this.handleRetry}
            onOfflineRetry={this.handleOfflineRetry}
          />
        );
      }

      // Determine error type and icon
      const isNetworkError = isOffline || this.state.error.message.includes('fetch') || this.state.error.message.includes('network');
      const isServerError = this.state.error.message.includes('500') || this.state.error.message.includes('502') || this.state.error.message.includes('503');
      const isAuthError = this.state.error.message.includes('401') || this.state.error.message.includes('403');
      
      const ErrorIcon = isNetworkError ? WifiOff : AlertTriangle;

      // Default fallback UI with API-specific styling
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
          <Card className="w-full max-w-md shadow-lg border-2 border-destructive/20">
            <CardHeader className="border-b bg-destructive/5">
              <div className="flex items-center gap-4">
                <ErrorIcon className="w-6 h-6 text-destructive" />
                <div>
                  <CardTitle className="text-destructive">
                    {isNetworkError ? "Connection Error" : "Service Unavailable"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {isNetworkError
                      ? "Unable to connect to the trading servers"
                      : isServerError
                      ? "Server is experiencing issues"
                      : isAuthError
                      ? "Authentication required"
                      : "API service is temporarily unavailable"
                    }
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {isNetworkError ? (
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {isOffline
                      ? "You appear to be offline. Please check your internet connection and try again."
                      : "Unable to establish a connection to our servers. This might be due to network issues or server maintenance."
                    }
                  </p>
                ) : (
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {isServerError
                      ? "Our servers are currently experiencing issues. Please try again in a few minutes."
                      : isAuthError
                      ? "Your session may have expired. Please refresh the page to continue."
                      : "The API service is temporarily unavailable. Your data is safe and will be restored when service resumes."
                    }
                  </p>
                )}

                {/* Endpoint information */}
                {endpoint && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs font-mono text-muted-foreground">
                      <strong>Endpoint:</strong> {endpoint}
                    </p>
                  </div>
                )}

                {/* Retry section */}
                {retryCount < (this.props.maxRetries || 3) && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={isOffline ? this.handleOfflineRetry : this.handleRetry}
                        className="flex-1"
                        disabled={isOffline}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {isOffline ? "Check Connection" : "Try Again"}
                        {retryCount > 0 && ` (${retryCount}/${this.props.maxRetries || 3})`}
                      </Button>
                      {isNetworkError && (
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => window.location.reload()}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh
                        </Button>
                      )}
                    </div>
                    {isOffline && (
                      <p className="text-xs text-muted-foreground text-center">
                        Waiting for internet connection...
                      </p>
                    )}
                  </div>
                )}

                {/* Navigation options */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      logger.info("User continued without API data", {
                        component: "APIErrorBoundary",
                        action: "continue_without_data"
                      });
                      // Continue with limited functionality
                      this.setState({ hasError: false, error: null, errorId: '', retryCount: 0 });
                    }}
                  >
                    Continue Offline
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={this.handleOpenSupport}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Help
                  </Button>
                </div>

                {/* Error tracking ID */}
                {this.state.errorId && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono text-center mt-2">
                    Error ID: {this.state.errorId}
                    {retryCount > 0 && ` (Retry: ${retryCount})`}
                    {isOffline && " (Offline)"}
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
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <span><strong>Endpoint:</strong> {endpoint || 'Unknown'}</span>
                        <span><strong>Offline:</strong> {this.state.isOffline ? 'Yes' : 'No'}</span>
                        <span><strong>Retries:</strong> {retryCount}</span>
                        <span><strong>Connection:</strong> {(navigator as unknown as { connection?: { effectiveType?: string } }).connection?.effectiveType || 'unknown'}</span>
                      </div>
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

export default APIErrorBoundary;