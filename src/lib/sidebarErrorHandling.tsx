import { SidebarErrorBoundary } from '@/components/ui/SidebarErrorBoundary';
import type { ComponentType, ErrorInfo, FC, ReactNode } from 'react';
import { useState } from 'react';

/**
 * HOC to wrap components with sidebar error boundary
 */
export const withSidebarErrorBoundary = <P extends {}>(
  Component: ComponentType<P>,
  options?: {
    enableLogging?: boolean;
    fallback?: ComponentType<{ error?: Error; onRetry?: () => void }>;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
  }
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
export const NavigationItemErrorBoundary: FC<{
  children: ReactNode;
  itemName: string;
  onError?: (error: Error, itemName: string) => void;
}> = ({ children, itemName, onError }) => {
  const [hasError, setHasError] = useState(false);

  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    setHasError(true);

    // Log the specific navigation item error
    import('@/lib/logger').then(({ logger }) => {
      logger.error(`Navigation item "${itemName}" error`, error, {
        component: 'NavigationItemErrorBoundary',
        action: 'handle_error',
        metadata: { itemName, ...errorInfo },
      });
    });

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
