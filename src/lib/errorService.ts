/**
 * Centralized Error Service
 *
 * Provides consistent error handling, classification, and recovery strategies
 * across the entire application.
 */

import * as Sentry from "@sentry/react";
import { logger } from "./logger";

// Error classification types
export type ErrorSeverity = "low" | "medium" | "high" | "critical";
export type ErrorCategory =
  | "network"
  | "validation"
  | "auth"
  | "database"
  | "trading"
  | "unknown";
export type RecoveryAction =
  | "retry"
  | "refresh"
  | "logout"
  | "contact_support"
  | "none";

export interface ClassifiedError {
  originalError: unknown;
  message: string;
  userMessage: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  recoveryAction: RecoveryAction;
  retryable: boolean;
  code?: string;
  details?: Record<string, unknown>;
}

// Error patterns for classification
const ERROR_PATTERNS = {
  network: [
    /network/i,
    /fetch/i,
    /timeout/i,
    /ECONNREFUSED/i,
    /ENOTFOUND/i,
    /failed to fetch/i,
    /net::/i,
  ],
  auth: [
    /unauthorized/i,
    /unauthenticated/i,
    /jwt/i,
    /token/i,
    /session/i,
    /login/i,
    /401/,
    /403/,
  ],
  validation: [
    /validation/i,
    /invalid/i,
    /required/i,
    /must be/i,
    /cannot be/i,
    /format/i,
  ],
  database: [
    /postgres/i,
    /supabase/i,
    /database/i,
    /rls/i,
    /constraint/i,
    /duplicate/i,
    /foreign key/i,
  ],
  trading: [
    /margin/i,
    /balance/i,
    /position/i,
    /order/i,
    /insufficient/i,
    /liquidation/i,
  ],
};

// User-friendly messages by category
const USER_MESSAGES: Record<ErrorCategory, string> = {
  network: "Connection issue. Please check your internet and try again.",
  auth: "Your session has expired. Please log in again.",
  validation: "Please check your input and try again.",
  database: "Unable to process your request. Please try again.",
  trading: "Trading operation failed. Please review and try again.",
  unknown: "Something went wrong. Please try again or contact support.",
};

// Recovery actions by category
const RECOVERY_ACTIONS: Record<ErrorCategory, RecoveryAction> = {
  network: "retry",
  auth: "logout",
  validation: "none",
  database: "retry",
  trading: "refresh",
  unknown: "contact_support",
};

/**
 * Extract error message from various error types
 */
function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object") {
    const errorObj = error as Record<string, unknown>;
    if ("message" in errorObj && typeof errorObj.message === "string") {
      return errorObj.message;
    }
    if ("error" in errorObj && typeof errorObj.error === "string") {
      return errorObj.error;
    }
    if (
      "error_description" in errorObj &&
      typeof errorObj.error_description === "string"
    ) {
      return errorObj.error_description;
    }
  }
  return "An unknown error occurred";
}

/**
 * Extract error code if available
 */
function extractErrorCode(error: unknown): string | undefined {
  if (error && typeof error === "object") {
    const errorObj = error as Record<string, unknown>;
    if ("code" in errorObj && typeof errorObj.code === "string") {
      return errorObj.code;
    }
    if ("status" in errorObj && typeof errorObj.status === "number") {
      return String(errorObj.status);
    }
  }
  return undefined;
}

/**
 * Classify error category based on message patterns
 */
function classifyCategory(message: string, code?: string): ErrorCategory {
  // Check code-based classification first
  if (code === "401" || code === "403") return "auth";
  if (code === "422" || code === "400") return "validation";
  if (code === "500" || code === "502" || code === "503") return "database";

  // Pattern-based classification
  for (const [category, patterns] of Object.entries(ERROR_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        return category as ErrorCategory;
      }
    }
  }

  return "unknown";
}

/**
 * Determine error severity
 */
function classifySeverity(
  category: ErrorCategory,
  code?: string,
): ErrorSeverity {
  // Critical errors
  if (category === "auth") return "high";
  if (category === "trading") return "high";
  if (code === "500" || code === "502" || code === "503") return "critical";

  // Medium severity
  if (category === "database") return "medium";
  if (category === "network") return "medium";

  // Low severity
  if (category === "validation") return "low";

  return "medium";
}

/**
 * Determine if error is retryable
 */
function isRetryable(category: ErrorCategory, code?: string): boolean {
  // Network and some database errors are retryable
  if (category === "network") return true;
  if (category === "database" && code !== "23505") return true; // Not duplicate key

  // Auth errors should redirect, not retry
  if (category === "auth") return false;

  // Validation errors need user input
  if (category === "validation") return false;

  return false;
}

/**
 * Main error classification function
 */
export function classifyError(error: unknown): ClassifiedError {
  const message = extractErrorMessage(error);
  const code = extractErrorCode(error);
  const category = classifyCategory(message, code);
  const severity = classifySeverity(category, code);

  return {
    originalError: error,
    message,
    userMessage: USER_MESSAGES[category],
    severity,
    category,
    recoveryAction: RECOVERY_ACTIONS[category],
    retryable: isRetryable(category, code),
    code,
    details:
      error && typeof error === "object"
        ? (error as Record<string, unknown>)
        : undefined,
  };
}

/**
 * Report error to monitoring service
 */
export function reportError(
  error: unknown,
  context?: Record<string, unknown>,
  user?: { id: string; email?: string },
): void {
  const classified = classifyError(error);

  // Log to console in development
  logger.error("Error reported:", {
    ...classified,
    context,
    userId: user?.id,
  });

  // Report to Sentry based on severity
  if (classified.severity === "critical" || classified.severity === "high") {
    if (user) {
      Sentry.setUser({ id: user.id, email: user.email });
    }
    Sentry.captureException(error, {
      tags: {
        category: classified.category,
        severity: classified.severity,
        code: classified.code,
      },
      extra: {
        ...context,
        userMessage: classified.userMessage,
        recoveryAction: classified.recoveryAction,
      },
    });
  }
}

/**
 * Create a user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  const classified = classifyError(error);
  return classified.userMessage;
}

/**
 * Async error handler with retry logic
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    context?: Record<string, unknown>;
    onError?: (error: ClassifiedError) => void;
  } = {},
): Promise<{ data: T | null; error: ClassifiedError | null }> {
  const { maxRetries = 3, retryDelay = 1000, context, onError } = options;
  let lastError: ClassifiedError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const data = await operation();
      return { data, error: null };
    } catch (err) {
      lastError = classifyError(err);

      // Don't retry non-retryable errors
      if (!lastError.retryable || attempt === maxRetries) {
        reportError(err, { ...context, attempt, maxRetries });
        onError?.(lastError);
        return { data: null, error: lastError };
      }

      // Exponential backoff
      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return { data: null, error: lastError };
}

/**
 * Error boundary fallback renderer helper
 */
export function getErrorBoundaryFallback(error: Error, componentStack: string) {
  const classified = classifyError(error);

  return {
    title: "Something went wrong",
    message: classified.userMessage,
    recoveryAction: classified.recoveryAction,
    showRetry: classified.retryable,
    showContactSupport: classified.recoveryAction === "contact_support",
    details: import.meta.env.DEV
      ? { error: error.message, stack: componentStack }
      : undefined,
  };
}

export default {
  classifyError,
  reportError,
  getUserFriendlyMessage,
  withErrorHandling,
  getErrorBoundaryFallback,
};
