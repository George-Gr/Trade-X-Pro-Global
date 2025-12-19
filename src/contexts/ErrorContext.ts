import { createContext, ReactNode } from 'react';
import { logger, LogContext } from '@/lib/logger';

/**
 * Error context for tracking error information across the application
 * Provides methods to set context and log errors with full information
 */
export interface ErrorContextType {
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
export const ErrorContext = createContext<ErrorContextType | undefined>(
  undefined
);
