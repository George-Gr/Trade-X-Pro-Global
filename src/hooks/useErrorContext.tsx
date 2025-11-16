import { createContext, useContext, useCallback, ReactNode } from 'react';
import { logger, LogContext } from '@/lib/logger';

/**
 * Error context for tracking error information across the application
 * Provides methods to set context and log errors with full information
 */
interface ErrorContextType {
  /**
   * Set the current context (page, component, userId, etc.)
   */
  setContext: (context: Partial<LogContext>) => void;

  /**
   * Clear the current context
   */
  clearContext: () => void;

  /**
   * Get the current context
   */
  getContext: () => LogContext;

  /**
   * Log an error with context
   */
  logError: (message: string, error?: Error | unknown) => void;

  /**
   * Log a warning with context
   */
  logWarning: (message: string) => void;

  /**
   * Add a breadcrumb (action tracking)
   */
  addBreadcrumb: (category: string, message: string) => void;

  /**
   * Get all recorded breadcrumbs
   */
  getBreadcrumbs: () => Array<{
    timestamp: string;
    category: string;
    message: string;
    level: string;
  }>;
}

/**
 * Create the error context
 */
const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

/**
 * Provider component for error tracking context
 */
export function ErrorContextProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const setContext = useCallback((context: Partial<LogContext>) => {
    logger.setGlobalContext(context);
  }, []);

  const clearContext = useCallback(() => {
    logger.clearGlobalContext();
  }, []);

  const getContext = useCallback(() => {
    return logger.getGlobalContext();
  }, []);

  const logError = useCallback(
    (message: string, error?: Error | unknown) => {
      const context = logger.getGlobalContext();
      logger.error(message, error, context);
    },
    []
  );

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

/**
 * Hook to use error context for logging and tracking
 * Must be used within ErrorContextProvider
 *
 * Usage:
 * ```tsx
 * const { logError, setContext, addBreadcrumb } = useErrorContext();
 *
 * // Set context for this component
 * useEffect(() => {
 *   setContext({ component: 'TradeForm', page: 'trading' });
 * }, []);
 *
 * // Log an error
 * try {
 *   await executeOrder();
 * } catch (error) {
 *   logError('Failed to execute order', error);
 * }
 *
 * // Add breadcrumbs for tracking actions
 * addBreadcrumb('user_action', 'User clicked Place Order');
 * ```
 */
export function useErrorContext(): ErrorContextType {
  const context = useContext(ErrorContext);

  if (context === undefined) {
    throw new Error(
      'useErrorContext must be used within ErrorContextProvider. ' +
        'Wrap your application with <ErrorContextProvider> in App.tsx'
    );
  }

  return context;
}

export default useErrorContext;
