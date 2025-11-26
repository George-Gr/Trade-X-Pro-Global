/**
 * Sidebar Error Boundary Component
 * 
 * Provides error boundary protection for the sidebar navigation,
 * preventing navigation errors from crashing the entire application.
 * Implements graceful degradation and recovery mechanisms.
 */

import * as React from "react";
import { AlertTriangle, RefreshCw, Home, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface SidebarErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface SidebarErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; onRetry?: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  enableLogging?: boolean;
}

/**
 * Error boundary for sidebar navigation components
 * Catches JavaScript errors anywhere in the child component tree,
 * logs the error, and displays a fallback UI instead of crashing.
 */
export class SidebarErrorBoundary extends React.Component<
  SidebarErrorBoundaryProps,
  SidebarErrorBoundaryState
> {
  constructor(props: SidebarErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<SidebarErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log error to console for debugging
    console.error('Sidebar Error Boundary caught an error:', error, errorInfo);

    // Log to external error tracking service if enabled
    if (this.props.enableLogging) {
      this.logErrorToService(error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Show toast notification for critical navigation errors
    if (typeof window !== 'undefined') {
      // Use setTimeout to ensure toast is shown after re-render
      setTimeout(() => {
        const { toast } = useToast();
        toast({
          title: "Navigation Error",
          description: "We're experiencing issues with the navigation menu. Please try refreshing the page.",
          variant: "destructive",
        });
      }, 100);
    }
  }

  logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    // In a real application, you would send this to your error tracking service
    // such as Sentry, LogRocket, or a custom logging endpoint
    
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userId: this.getUserId(), // You could extract this from auth context
    };

    // Example: Send to console (replace with actual error tracking service)
    if (typeof window !== 'undefined') {
      // In production, replace this with your error tracking service
      console.group('🚨 Sidebar Error Report');
      console.error('Error:', errorData.message);
      console.error('Stack:', errorData.stack);
      console.error('Component Stack:', errorData.componentStack);
      console.error('Additional Info:', errorData);
      console.groupEnd();
    }
  };

  getUserId = (): string | null => {
    // Extract user ID from your auth system
    // This is a placeholder - implement based on your authentication system
    try {
      // Example: return localStorage.getItem('userId');
      // Example: return auth.currentUser?.id;
      return null;
    } catch {
      return null;
    }
  };

  handleRetry = () => {
    // Reset error state and retry
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    // Force page reload to recover from error
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            onRetry={this.handleRetry}
          />
        );
      }

      // Default fallback UI
      return <SidebarErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

/**
 * Default fallback UI for sidebar errors
 */
const SidebarErrorFallback: React.FC<{
  error?: Error;
  onRetry?: () => void;
}> = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center min-h-[200px]">
      <div className="text-destructive mb-3">
        <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
      </div>
      <h3 className="font-semibold text-lg mb-1">Navigation Unavailable</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        We're experiencing issues with the navigation menu. This could be due to a temporary error or network issue.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRetry}
          className="flex-1"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        <Button 
          variant="default" 
          size="sm"
          onClick={() => window.location.reload()}
          className="flex-1"
        >
          <Settings className="h-4 w-4 mr-2" />
          Reload Page
        </Button>
      </div>

      {error && (
        <details className="mt-4 text-xs text-muted-foreground max-w-sm">
          <summary className="cursor-pointer hover:text-foreground">
            Error Details (for developers)
          </summary>
          <div className="mt-2 p-2 bg-muted rounded-md overflow-auto max-h-32">
            <code className="font-mono whitespace-pre-wrap break-words">
              {error.message}
            </code>
          </div>
        </details>
      )}
    </div>
  );
};

/**
 * Minimal fallback for critical errors that still shows essential navigation
 */
export const SidebarMinimalFallback: React.FC<{
  error?: Error;
  onRetry?: () => void;
}> = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header placeholder */}
      <div className="h-6 bg-muted/50" />
      
      {/* Minimal navigation */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="text-destructive mb-2">
          <AlertTriangle className="h-8 w-8 mx-auto" />
        </div>
        <h4 className="font-medium mb-1">Navigation Error</h4>
        <p className="text-xs text-muted-foreground mb-3 text-center px-4">
          Navigation temporarily unavailable
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRetry}
        >
          Retry
        </Button>
      </div>
      
      {/* Actions placeholder */}
      <div className="p-4 space-y-1">
        <div className="h-10 bg-muted/50 rounded flex items-center px-3 text-xs text-muted-foreground">
          Limited functionality
        </div>
      </div>
    </div>
  );
};

/**
 * HOC to wrap components with sidebar error boundary
 */
export const withSidebarErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    enableLogging?: boolean;
    fallback?: React.ComponentType<{ error?: Error; onRetry?: () => void }>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  }
) => {
  return function WithSidebarErrorBoundary(props: P) {
    return (
      <SidebarErrorBoundary
        enableLogging={options?.enableLogging}
        fallback={options?.fallback}
        onError={options?.onError}
      >
        <Component {...props} />
      </SidebarErrorBoundary>
    );
  };
};

/**
 * Error boundary specifically for navigation items
 */
export const NavigationItemErrorBoundary: React.FC<{
  children: React.ReactNode;
  itemName: string;
  onError?: (error: Error, itemName: string) => void;
}> = ({ children, itemName, onError }) => {
  const [hasError, setHasError] = React.useState(false);

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    setHasError(true);
    
    // Log the specific navigation item error
    console.error(`Navigation item "${itemName}" error:`, error, errorInfo);
    
    if (onError) {
      onError(error, itemName);
    }
  };

  if (hasError) {
    return (
      <div 
        className="flex gap-3 px-4 py-2 text-muted-foreground text-sm cursor-not-allowed opacity-50"
        title={`"${itemName}" is temporarily unavailable due to an error`}
      >
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{itemName}</span>
      </div>
    );
  }

  return (
    <SidebarErrorBoundary
      onError={(error, errorInfo) => handleError(error, errorInfo)}
    >
      {children}
    </SidebarErrorBoundary>
  );
};

export default SidebarErrorBoundary;