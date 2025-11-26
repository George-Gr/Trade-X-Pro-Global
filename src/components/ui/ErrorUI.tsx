/**
 * Error UI Components for Supabase Connection Issues
 * 
 * Provides graceful error handling for:
 * - Network failures
 * - Realtime subscription disconnects
 * - Query timeouts
 */

import * as React from "react";
import { AlertCircle, WifiOff, RefreshCw, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorUIProps {
  error?: string | null;
  onRetry?: () => void;
  title?: string;
  description?: string;
  variant?: "inline" | "card" | "banner";
  dismissible?: boolean;
  onDismiss?: () => void;
}

/**
 * Generic error message component for inline errors within cards
 */
export const ErrorMessage: React.FC<ErrorUIProps> = ({
  error,
  onRetry,
  title = "Error Loading Data",
  description,
  dismissible = false,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-md">
      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-red-900">{title}</div>
        {description && <div className="text-xs text-red-700 mt-1">{description}</div>}
        {error && <div className="text-xs text-red-600 mt-1 font-mono break-words">{error}</div>}
      </div>
      {(onRetry || dismissible) && (
        <div className="flex gap-1 flex-shrink-0">
          {onRetry && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={onRetry}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
          {dismissible && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={handleDismiss}
            >
              ✕
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Network disconnection error banner
 */
export const NetworkErrorBanner: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
      <WifiOff className="h-5 w-5 text-yellow-600 flex-shrink-0" />
      <div className="flex-1">
        <div className="font-medium text-sm text-yellow-900">Connection Lost</div>
        <div className="text-xs text-yellow-700 mt-0.5">
          Unable to connect to the server. Real-time updates are disabled. Your data will sync when connection restores.
        </div>
      </div>
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-3 text-xs flex-shrink-0"
          onClick={onRetry}
        >
          Retry
        </Button>
      )}
    </div>
  );
};

/**
 * Realtime subscription error alert
 */
export const RealtimeErrorAlert: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => {
  return (
    <Card className="border-yellow-200 bg-yellow-50 mb-4">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Zap className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-yellow-900">Real-time Updates Paused</div>
            <div className="text-xs text-yellow-700 mt-1">
              Live data updates are temporarily unavailable. Data will be refreshed automatically when the connection recovers.
            </div>
            {onRetry && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2 h-7 px-2 text-xs"
                onClick={onRetry}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Try Again
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Fallback content for when data cannot be loaded
 */
export const DataLoadingFallback: React.FC<{
  title?: string;
  description?: string;
  onRetry?: () => void;
}> = ({
  title = "Unable to Load Data",
  description = "There was a problem loading this data. Please try again later.",
  onRetry,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry} className="h-8">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Connection status indicator badge
 */
export const ConnectionStatus: React.FC<{
  isConnected: boolean;
  showLabel?: boolean;
}> = ({ isConnected, showLabel = true }) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "h-2 w-2 rounded-full transition-colors",
          isConnected ? "bg-green-500" : "bg-red-500"
        )}
      />
      {showLabel && (
        <span className={cn("text-xs font-medium", isConnected ? "text-green-700" : "text-red-700")}>
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      )}
    </div>
  );
};

/**
 * HOC to wrap components with error boundary and retry logic
 */
export const withErrorHandling = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    title?: string;
    description?: string;
    showRetry?: boolean;
  }
) => {
  return function WithErrorHandling(props: P & { error?: string; onRetry?: () => void }) {
    const { error, onRetry, ...componentProps } = props;

    if (error) {
      return (
        <ErrorMessage
          error={error}
          title={options?.title}
          description={options?.description}
          onRetry={options?.showRetry !== false ? onRetry : undefined}
        />
      );
    }

    return <Component {...(componentProps as P)} />;
  };
};

export default {
  ErrorMessage,
  NetworkErrorBanner,
  RealtimeErrorAlert,
  DataLoadingFallback,
  ConnectionStatus,
  withErrorHandling,
};
