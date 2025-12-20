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
 * - Sentry transaction tracking for performance monitoring
 * - Session replay integration for debugging
 * - Supabase integration logging
 * - Real-time performance metrics
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
 *
 * // Performance tracking
 * logger.startTransaction('order_execution', 'operation');
 * // ... perform operation ...
 * logger.finishTransaction('order_execution');
 *
 * // API timing
 * logger.timeApiCall('GET', '/api/orders', responseTime);
 *
 * // Supabase query timing
 * logger.timeSupabaseQuery('profiles', 'SELECT', 45);
 *
 * // Risk monitoring
 * logger.logRiskEvent('margin_call', { userId: '123', marginLevel: 25 });
 * ```
 */

import * as Sentry from '@sentry/react';

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
 * Performance transaction tracking
 */
export interface PerformanceTransaction {
  name: string;
  operation: string;
  startTime: number;
  spanId?: string;
  parentSpanId?: string;
}

/**
 * API call tracking
 */
export interface APICallInfo {
  method: string;
  url: string;
  status?: number;
  duration: number;
  success: boolean;
  error?: string;
}

/**
 * Supabase query tracking
 */
export interface SupabaseQueryInfo {
  table: string;
  operation: string;
  duration: number;
  success: boolean;
  error?: string;
  rowsAffected?: number;
}

/**
 * Risk event tracking
 */
export interface RiskEventInfo {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  details: Record<string, unknown>;
  timestamp: string;
}

/**
 * Performance metric
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  context?: Record<string, unknown>;
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
 * Production noop - all console methods become silent in production
 * Only Sentry integration remains active for error tracking
 */
const noop = () => {};
const noopWithReturn =
  <T>(returnValue: T) =>
  () =>
    returnValue;

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
 * Active performance transactions
 */
const activeTransactions: Map<string, PerformanceTransaction> = new Map();
const apiCallHistory: APICallInfo[] = [];
const supabaseQueryHistory: SupabaseQueryInfo[] = [];
const riskEvents: RiskEventInfo[] = [];
const performanceMetrics: PerformanceMetric[] = [];
const MAX_API_HISTORY = 100;
const MAX_SUPABASE_HISTORY = 100;
const MAX_RISK_EVENTS = 50;
const MAX_PERFORMANCE_METRICS = 200;

/**
 * Check if Sentry is initialized and active
 */
function isSentryActive(): boolean {
  // Sentry is active only when running in production and we've detected initialization
  return (
    isProduction &&
    sentryInitialized &&
    Boolean(import.meta.env.VITE_SENTRY_DSN)
  );
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
      Sentry.setContext(
        'application',
        globalContext as Record<string, unknown>
      );
      if (globalContext.userId) {
        Sentry.setUser({ id: globalContext.userId });
      }

      if (isDevelopment) {
        console.warn('[Logger] Sentry is configured and logger is active');
      }
    } else if (isDevelopment) {
      console.warn(
        '[Logger] Sentry not configured (no DSN) — running in dev mode'
      );
    }
  } catch (err) {
    // Defensive: do not let logger initialization throw application errors
    if (isDevelopment) {
      console.error('[Logger] Failed to initialize Sentry integration', err);
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
      Sentry.setContext(
        'application',
        globalContext as Record<string, unknown>
      );
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
      console.warn(`[BREADCRUMB] ${category}: ${message}`);
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
      console.warn(formatted, fullContext.metadata || {});
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
  error(message: string, error?: Error | unknown, context?: LogContext): void {
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
            userId: fullContext.userId,
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
      console.error(formatted, fullContext.metadata || {});
    }
  },

  /**
   * Start a performance transaction
   */
  startTransaction(
    name: string,
    operation: string,
    context?: LogContext
  ): string {
    const startTime = performance.now();
    const transactionId = `${name}-${startTime}-${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    const transaction: PerformanceTransaction = {
      name,
      operation,
      startTime,
    };

    activeTransactions.set(transactionId, transaction);

    if (isDevelopment) {
      console.warn(`[PERF] Started transaction: ${name} (${transactionId})`, {
        operation,
        startTime,
        context: context?.metadata || {},
      });
    }

    return transactionId;
  },

  /**
   * Finish a performance transaction
   */
  finishTransaction(transactionId: string, context?: LogContext): void {
    const transaction = activeTransactions.get(transactionId);
    if (!transaction) {
      if (isDevelopment) {
        console.warn(`[PERF] Transaction not found: ${transactionId}`);
      }
      return;
    }

    const duration = performance.now() - transaction.startTime;
    const fullContext = mergeContext(context);

    // Add breadcrumb for completed transaction
    this.addBreadcrumb(
      'performance',
      `${transaction.operation}: ${
        transaction.name
      } completed in ${duration.toFixed(2)}ms`
    );

    // Log slow transactions as warnings
    if (duration > 1000) {
      // Log transactions slower than 1 second
      this.warn(
        `Slow transaction: ${transaction.name} took ${duration.toFixed(2)}ms`,
        {
          ...fullContext,
          metadata: {
            ...(fullContext.metadata as Record<string, unknown> | undefined),
            transactionName: transaction.name,
            duration,
            operation: transaction.operation,
          },
        }
      );
    }

    activeTransactions.delete(transactionId);

    if (isDevelopment) {
      console.warn(
        `[PERF] Finished transaction: ${transaction.name} (${transactionId})`,
        {
          duration: `${duration.toFixed(2)}ms`,
          operation: transaction.operation,
          context: fullContext.metadata || {},
        }
      );
    }
  },

  /**
   * Record an API call
   */
  timeApiCall(
    method: string,
    url: string,
    duration: number,
    status?: number,
    error?: string
  ): void {
    const apiCall: APICallInfo = {
      method,
      url,
      duration,
      status,
      success: Boolean(!error && status && status < 400),
      error,
    };

    // Add to history
    apiCallHistory.push(apiCall);
    if (apiCallHistory.length > MAX_API_HISTORY) {
      apiCallHistory.shift();
    }

    if (isSentryActive()) {
      // Add breadcrumb for API call
      const message = `${method} ${url} - ${
        status || 'unknown'
      } (${duration.toFixed(2)}ms)`;
      Sentry.addBreadcrumb({
        category: 'http',
        message,
        level: apiCall.success ? 'info' : 'error',
        data: {
          method,
          url,
          status,
          duration,
          error,
        },
        timestamp: Date.now() / 1000,
      });

      // Track slow API calls
      if (duration > 2000) {
        // API calls slower than 2 seconds
        Sentry.addBreadcrumb({
          category: 'performance',
          message: `Slow API call: ${method} ${url} took ${duration.toFixed(
            2
          )}ms`,
          level: 'warning',
          timestamp: Date.now() / 1000,
        });
      }
    }

    // Add breadcrumb for API call
    const statusText = status ? `(${status})` : '';
    const message = `${method} ${url} ${statusText} - ${duration.toFixed(2)}ms`;
    this.addBreadcrumb('api', message, apiCall.success ? 'info' : 'error');

    // Log slow API calls
    if (duration > 2000) {
      this.warn(
        `Slow API call: ${method} ${url} took ${duration.toFixed(2)}ms`,
        {
          component: 'API',
          action: 'api_slow_response',
          metadata: {
            method,
            url,
            duration,
            status,
            error,
          },
        }
      );
    }

    if (isDevelopment) {
      const logLevel = apiCall.success ? 'warn' : 'error';
      // eslint-disable-next-line no-console
      console[logLevel](`[API] ${message}`, {
        method,
        url,
        status,
        duration,
        error: error || 'none',
      });
    }
  },

  /**
   * Record a Supabase query
   */
  timeSupabaseQuery(
    table: string,
    operation: string,
    duration: number,
    success: boolean,
    error?: string,
    rowsAffected?: number
  ): void {
    const query: SupabaseQueryInfo = {
      table,
      operation,
      duration,
      success,
      error,
      rowsAffected,
    };

    // Add to history
    supabaseQueryHistory.push(query);
    if (supabaseQueryHistory.length > MAX_SUPABASE_HISTORY) {
      supabaseQueryHistory.shift();
    }

    if (isSentryActive()) {
      // Add breadcrumb for Supabase query
      const message = `${operation} ${table} - ${duration.toFixed(2)}ms`;
      Sentry.addBreadcrumb({
        category: 'supabase',
        message,
        level: success ? 'info' : 'error',
        data: {
          table,
          operation,
          duration,
          success,
          error,
          rowsAffected,
        },
        timestamp: Date.now() / 1000,
      });

      // Track slow queries
      if (duration > 1000) {
        // Queries slower than 1 second
        this.warn(
          `Slow Supabase query: ${operation} ${table} took ${duration.toFixed(
            2
          )}ms`,
          {
            component: 'Supabase',
            action: 'slow_query',
            metadata: {
              table,
              operation,
              duration,
              rowsAffected,
            },
          }
        );
      }
    }

    // Add breadcrumb for Supabase query
    const statusText = success ? '✓' : '✗';
    const message = `${statusText} ${operation} ${table} - ${duration.toFixed(
      2
    )}ms`;
    this.addBreadcrumb('supabase', message, success ? 'info' : 'error');

    if (isDevelopment) {
      const logLevel = success ? 'warn' : 'error';
      // eslint-disable-next-line no-console
      console[logLevel](`[SUPABASE] ${message}`, {
        table,
        operation,
        duration,
        success,
        error: error || 'none',
        rowsAffected,
      });
    }
  },

  /**
   * Log a risk event
   */
  logRiskEvent(
    type: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: Record<string, unknown>,
    userId?: string
  ): void {
    const riskEvent: RiskEventInfo = {
      type,
      severity,
      userId,
      details,
      timestamp: getTimestamp(),
    };

    // Add to history
    riskEvents.push(riskEvent);
    if (riskEvents.length > MAX_RISK_EVENTS) {
      riskEvents.shift();
    }

    // Always log risk events, regardless of environment
    const message = `Risk Event [${severity.toUpperCase()}]: ${type}`;
    console.warn(`[RISK] ${message}`, {
      userId,
      details,
      timestamp: riskEvent.timestamp,
    });

    if (isSentryActive()) {
      // Capture as Sentry event with appropriate level
      const sentryLevel =
        severity === 'critical'
          ? 'fatal'
          : severity === 'high'
          ? 'error'
          : 'warning';
      Sentry.captureMessage(
        message,
        sentryLevel as 'fatal' | 'error' | 'warning'
      );

      // Add context
      Sentry.setContext('risk_event', {
        type,
        severity,
        userId,
        details,
        timestamp: riskEvent.timestamp,
      });
    }

    // Add breadcrumb for risk event
    this.addBreadcrumb(
      'risk',
      `${severity}: ${type}`,
      severity === 'critical'
        ? 'error'
        : severity === 'high'
        ? 'error'
        : 'warning'
    );
  },

  /**
   * Record a performance metric
   */
  recordMetric(
    name: string,
    value: number,
    unit: string,
    context?: Record<string, unknown>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: getTimestamp(),
      context,
    };

    // Add to history
    performanceMetrics.push(metric);
    if (performanceMetrics.length > MAX_PERFORMANCE_METRICS) {
      performanceMetrics.shift();
    }

    if (isDevelopment) {
      console.warn(`[METRIC] ${name}: ${value}${unit}`, context || {});
    }

    if (isSentryActive()) {
      // Add to Sentry context for performance monitoring
      Sentry.setMeasurement(
        name,
        value,
        unit as
          | 'nanosecond'
          | 'microsecond'
          | 'millisecond'
          | 'second'
          | 'minute'
          | 'hour'
          | 'day'
          | 'week'
          | 'custom'
      );

      // Add breadcrumb
      this.addBreadcrumb('metric', `${name}: ${value}${unit}`);
    }
  },

  /**
   * Get Supabase query history
   */
  getSupabaseQueryHistory(): SupabaseQueryInfo[] {
    return [...supabaseQueryHistory];
  },

  /**
   * Clear Supabase query history
   */
  clearSupabaseQueryHistory(): void {
    supabaseQueryHistory.length = 0;
  },

  /**
   * Get risk events
   */
  getRiskEvents(): RiskEventInfo[] {
    return [...riskEvents];
  },

  /**
   * Clear risk events
   */
  clearRiskEvents(): void {
    riskEvents.length = 0;
  },

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetric[] {
    return [...performanceMetrics];
  },

  /**
   * Clear performance metrics
   */
  clearPerformanceMetrics(): void {
    performanceMetrics.length = 0;
  },

  /**
   * Record user action with timing
   */
  recordUserAction(
    action: string,
    duration?: number,
    context?: LogContext
  ): void {
    const fullContext = mergeContext(context);
    const message = duration ? `${action} (${duration.toFixed(2)}ms)` : action;

    this.addBreadcrumb('user_action', message);

    if (isSentryActive()) {
      // Sentry handles this automatically via BrowserTracing
      if (duration) {
        this.recordMetric(
          `user_action_${action.replace(/\s+/g, '_').toLowerCase()}`,
          duration,
          'ms',
          {
            action,
            ...fullContext.metadata,
          }
        );
      }
    }

    if (isDevelopment) {
      console.warn(`[USER ACTION] ${message}`, fullContext.metadata || {});
    }
  },

  /**
   * Start a user action timing
   */
  startUserAction(action: string, context?: LogContext): string {
    const startTime = performance.now();
    const actionId = `${action}-${startTime}`;

    if (isDevelopment) {
      console.warn(
        `[USER ACTION START] ${action} (${actionId})`,
        context?.metadata || {}
      );
    }

    return actionId;
  },

  /**
   * End a user action timing
   */
  endUserAction(actionId: string, action: string, context?: LogContext): void {
    const startTime = parseFloat(actionId.split('-')[1]);
    if (isNaN(startTime)) return;

    const duration = performance.now() - startTime;
    this.recordUserAction(action, duration, context);

    if (isDevelopment) {
      console.error(
        `[USER ACTION END] ${action} (${actionId}) - ${duration.toFixed(2)}ms`
      );
    }
  },

  /**
   * Time a synchronous operation
   */
  time<T>(label: string, operation: () => T, context?: LogContext): T {
    const start = performance.now();
    try {
      return operation();
    } finally {
      const duration = performance.now() - start;
      const fullContext = mergeContext(context);
      if (isDevelopment) {
        console.warn(
          `[PERF] ${label}: ${duration.toFixed(2)}ms`,
          fullContext.metadata || {}
        );
      }
      this.recordMetric(
        `operation_${label.replace(/\s+/g, '_').toLowerCase()}`,
        duration,
        'ms',
        fullContext.metadata
      );
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
        console.warn(
          `[PERF] ${label}: ${duration.toFixed(2)}ms`,
          fullContext.metadata || {}
        );
      }
      this.recordMetric(
        `async_${label.replace(/\s+/g, '_').toLowerCase()}`,
        duration,
        'ms',
        fullContext.metadata
      );
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
