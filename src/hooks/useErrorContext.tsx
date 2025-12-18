import { useContext } from "react";
import { ErrorContext, ErrorContextType } from "@/contexts/ErrorContext";

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
      "useErrorContext must be used within ErrorContextProvider. " +
        "Wrap your application with <ErrorContextProvider> in App.tsx",
    );
  }

  return context;
}

export default useErrorContext;
