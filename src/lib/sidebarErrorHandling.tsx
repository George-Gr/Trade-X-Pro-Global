import {
  useState,
  type FC,
  type ComponentType,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import { SidebarErrorBoundary } from '@/components/ui/SidebarErrorBoundary';

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
