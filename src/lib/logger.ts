/**
 * Centralized Logging System for TradePro
 * 
 * Features:
 * - Development: Console output with context
 * - Production: Silent with optional Sentry integration
 * - Context tracking: User ID, page, action, component, timestamp
 * - Error tracking with full stack traces
 * - Breadcrumb support for tracking user actions
 * - Performance monitoring (log execution time)
 * 
 * Usage:
 * ```typescript
 * import { logger } from '@/lib/logger';
 * 
 * // Basic logging
 * logger.info('User logged in');
 * 
 * // With context
 * logger.info('Order executed', { 
 *   userId: user.id, 
 *   orderId: order.id, 
 *   symbol: 'EURUSD' 
 * });
 * 
 * // Error logging
 * logger.error('Order failed', error, {
 *   userId: user.id,
 *   action: 'execute_order'
 * });
 * 
 * // With breadcrumbs (for tracking action sequences)
 * logger.addBreadcrumb('user_interaction', 'Clicked Place Order');
 * ```
 */

import * as Sentry from "@sentry/react";

/**
 * Log context information
 */
export interface LogContext {
  userId?: string;
  page?: string;
  action?: string;
  component?: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

/**
 * Breadcrumb entry for action tracking
 */
export interface Breadcrumb {
  timestamp: string;
  category: string;
  message: string;
  level: 'info' | 'warning' | 'error';
}

const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';

/**
 * Track whether Sentry has been initialized
 */
let sentryInitialized = false;

/**
 * Global context that can be set once and reused in all logs
 */
let globalContext: LogContext = {};

/**
 * Breadcrumb storage (limited to last 50 for memory efficiency)
 */
const breadcrumbs: Breadcrumb[] = [];
const MAX_BREADCRUMBS = 50;

/**
 * Check if Sentry is initialized and active
 */
function isSentryActive(): boolean {
  // Sentry is active only when running in production and we've detected initialization
  return isProduction && sentryInitialized && Boolean(import.meta.env.VITE_SENTRY_DSN);
}

export function initializeSentry(): void {
  try {
    const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
    if (isProduction && dsn) {
      // Verify Sentry client is present
      // There is no public API to check init state, but the hub client will be present after init
      // Mark sentry as initialized so logger will route errors/breadcrumbs to Sentry
      sentryInitialized = true;

      // Sync current global context to Sentry
      Sentry.setContext('application', globalContext as Record<string, unknown>);
      if (globalContext.userId) {
        Sentry.setUser({ id: globalContext.userId });
      }

      if (isDevelopment) {
        console.log('[Logger] Sentry is configured and logger is active');
      }
    } else if (isDevelopment) {
      console.log('[Logger] Sentry not configured (no DSN) — running in dev mode');
    }
  } catch (err) {
    // Defensive: do not let logger initialization throw application errors
    if (isDevelopment) {
      console.warn('[Logger] Failed to initialize Sentry integration', err);
    }
    sentryInitialized = false;
  }
}

/**
 * Format timestamp as ISO string
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Format log message with context
 */
function formatLogMessage(
  level: string,
  message: string,
  context?: LogContext
): string {
  const timestamp = context?.timestamp || getTimestamp();
  const contextStr = context?.component ? ` [${context.component}]` : '';
  const actionStr = context?.action ? ` {${context.action}}` : '';
  return `[${timestamp}] [${level}]${contextStr}${actionStr} ${message}`;
}

/**
 * Merge global context with provided context
 */
function mergeContext(context?: LogContext): LogContext {
  return {
    ...globalContext,
    ...context,
    timestamp: context?.timestamp || getTimestamp(),
  };
}

/**
 * Centralized logger with context support and Sentry integration
 */
export const logger = {
  /**
   * Set global context (userId, page) to be included in all subsequent logs
   */
  setGlobalContext(context: Partial<LogContext>): void {
    globalContext = { ...globalContext, ...context };
    if (isSentryActive()) {
      Sentry.setContext('application', globalContext as Record<string, unknown>);
    }
  },

  /**
   * Clear global context
   */
  clearGlobalContext(): void {
    globalContext = {};
    if (isSentryActive()) {
      Sentry.setContext('application', {});
    }
  },

  /**
   * Get current global context
   */
  getGlobalContext(): LogContext {
    return { ...globalContext };
  },

  /**
   * Add a breadcrumb for tracking action sequences
   */
  addBreadcrumb(
    category: string,
    message: string,
    level: 'info' | 'warning' | 'error' = 'info'
  ): void {
    const breadcrumb: Breadcrumb = {
      timestamp: getTimestamp(),
      category,
      message,
      level,
    };

    breadcrumbs.push(breadcrumb);
    if (breadcrumbs.length > MAX_BREADCRUMBS) {
      breadcrumbs.shift();
    }

    if (isDevelopment) {
      console.log(`[BREADCRUMB] ${category}: ${message}`);
    }

    if (isSentryActive()) {
      Sentry.addBreadcrumb({
        category,
        message,
        level: level as 'info' | 'warning' | 'error',
        timestamp: Date.now() / 1000,
      });
    }
  },

  /**
   * Get all breadcrumbs
   */
  getBreadcrumbs(): Breadcrumb[] {
    return [...breadcrumbs];
  },

  /**
   * Clear breadcrumbs
   */
  clearBreadcrumbs(): void {
    breadcrumbs.length = 0;
  },

  /**
   * Log informational message
   */
  info(message: string, context?: LogContext): void {
    const fullContext = mergeContext(context);

    if (isDevelopment) {
      const formatted = formatLogMessage('INFO', message, fullContext);
      console.log(formatted, fullContext.metadata || {});
    }

    if (isSentryActive()) {
      Sentry.captureMessage(message, 'info');
      if (fullContext.userId) {
        Sentry.setUser({ id: fullContext.userId });
      }
    }
  },

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    const fullContext = mergeContext(context);

    if (isDevelopment) {
      const formatted = formatLogMessage('WARN', message, fullContext);
      console.warn(formatted, fullContext.metadata || {});
    }

    this.addBreadcrumb('warning', message, 'warning');

    if (isSentryActive()) {
      Sentry.captureMessage(message, 'warning');
      if (fullContext.userId) {
        Sentry.setUser({ id: fullContext.userId });
      }
    }
  },

  /**
   * Log error message with optional error object
   */
  error(
    message: string,
    error?: Error | unknown,
    context?: LogContext
  ): void {
    const fullContext = mergeContext(context);

    if (isDevelopment) {
      const formatted = formatLogMessage('ERROR', message, fullContext);
      if (error instanceof Error) {
        console.error(formatted, {
          name: error.name,
          message: error.message,
          stack: error.stack,
          ...fullContext.metadata,
        });
      } else {
        console.error(formatted, error, fullContext.metadata || {});
      }
    }

    this.addBreadcrumb('error', message, 'error');

    if (isSentryActive()) {
      if (error instanceof Error) {
        Sentry.captureException(error, {
          tags: {
            component: fullContext.component,
            action: fullContext.action,
            page: fullContext.page,
          },
          contexts: {
            application: {
              userId: fullContext.userId,
              page: fullContext.page,
              action: fullContext.action,
              component: fullContext.component,
            },
          },
          extra: fullContext.metadata,
        });
      } else {
        Sentry.captureMessage(`${message}: ${JSON.stringify(error)}`, 'error');
      }

      if (fullContext.userId) {
        Sentry.setUser({ id: fullContext.userId });
      }
    }
  },

  /**
   * Debug log (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (isDevelopment) {
      const fullContext = mergeContext(context);
      const formatted = formatLogMessage('DEBUG', message, fullContext);
      console.debug(formatted, fullContext.metadata || {});
    }
  },

  /**
   * Time a synchronous operation
   */
  time<T>(
    label: string,
    operation: () => T,
    context?: LogContext
  ): T {
    const start = performance.now();
    try {
      return operation();
    } finally {
      const duration = performance.now() - start;
      const fullContext = mergeContext(context);
      if (isDevelopment) {
        console.log(
          `[PERF] ${label}: ${duration.toFixed(2)}ms`,
          fullContext.metadata || {}
        );
      }
    }
  },

  /**
   * Time an async operation
   */
  async timeAsync<T>(
    label: string,
    operation: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    const start = performance.now();
    try {
      return await operation();
    } finally {
      const duration = performance.now() - start;
      const fullContext = mergeContext(context);
      if (isDevelopment) {
        console.log(
          `[PERF] ${label}: ${duration.toFixed(2)}ms`,
          fullContext.metadata || {}
        );
      }
    }
  },
};

/**
 * Create a scoped logger for a specific domain/component
 * Automatically includes domain in all log messages
 */
export function createDomainLogger(domain: string) {
  return {
    info: (message: string, context?: LogContext) =>
      logger.info(`[${domain}] ${message}`, context),

    warn: (message: string, context?: LogContext) =>
      logger.warn(`[${domain}] ${message}`, context),

    error: (message: string, error?: Error | unknown, context?: LogContext) =>
      logger.error(`[${domain}] ${message}`, error, context),

    debug: (message: string, context?: LogContext) =>
      logger.debug(`[${domain}] ${message}`, context),

    addBreadcrumb: (category: string, message: string) =>
      logger.addBreadcrumb(`${domain}:${category}`, message),
  };
}

export default logger;
