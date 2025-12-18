import React from "react";
import { SidebarErrorBoundary } from "@/components/ui/SidebarErrorBoundary";

/**
 * HOC to wrap components with sidebar error boundary
 */
export const withSidebarErrorBoundary = <P extends {}>(
  Component: React.ComponentType<P>,
  options?: {
    enableLogging?: boolean;
    fallback?: React.ComponentType<{ error?: Error; onRetry?: () => void }>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  },
) => {
  return function WithSidebarErrorBoundary(props: P) {
    return (
      <SidebarErrorBoundary onError={options?.onError}>
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
        Error loading item
      </div>
    );
  }

  return <>{children}</>;
};
