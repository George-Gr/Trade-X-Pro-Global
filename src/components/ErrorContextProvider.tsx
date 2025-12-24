import { ErrorContext, ErrorContextType } from '@/contexts/ErrorContext';
import { LogContext, logger } from '@/lib/logger';
import type { ReactElement } from 'react';
import { ReactNode, useCallback } from 'react';

/**
 * Provider component for error tracking context
 *
 * Usage:
 * ```tsx
 * // In App.tsx
 * <ErrorContextProvider>
 *   <YourApp />
 * </ErrorContextProvider>
 * ```
 */
export function ErrorContextProvider({
  children,
}: { children?: ReactNode } = {}): ReactElement {
  const setContext = useCallback((context: Partial<LogContext>) => {
    logger.setGlobalContext(context);
  }, []);

  const clearContext = useCallback(() => {
    logger.clearGlobalContext();
  }, []);

  const getContext = useCallback(() => {
    return logger.getGlobalContext();
  }, []);

  const logError = useCallback((message: string, error?: Error | unknown) => {
    const context = logger.getGlobalContext();
    logger.error(message, error, context);
  }, []);

  const logWarning = useCallback((message: string) => {
    const context = logger.getGlobalContext();
    logger.warn(message, context);
  }, []);

  const addBreadcrumb = useCallback((category: string, message: string) => {
    logger.addBreadcrumb(category, message);
  }, []);

  const getBreadcrumbs = useCallback(() => {
    return logger.getBreadcrumbs();
  }, []);

  const value: ErrorContextType = {
    setContext,
    clearContext,
    getContext,
    logError,
    logWarning,
    addBreadcrumb,
    getBreadcrumbs,
  };

  return (
    <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
  );
}
