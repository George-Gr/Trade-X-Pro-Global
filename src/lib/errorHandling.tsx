import React from 'react';
import { ErrorMessage } from '@/components/ui/ErrorUI';

/**
 * HOC to wrap components with error boundary and retry logic
 */
export const withErrorHandling = <P extends {}>(
  Component: React.ComponentType<P>,
  options?: {
    title?: string;
    description?: string;
    showRetry?: boolean;
  }
): React.ComponentType<P> => {
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
