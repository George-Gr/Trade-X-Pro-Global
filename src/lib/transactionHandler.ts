/**
 * Transaction failure handling with retry logic and compensation
 * Ensures database operations are handled gracefully with proper error recovery
 */

import { logger } from "./logger";
import { toast } from "sonner";

interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryableErrors: string[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  retryableErrors: [
    "network",
    "timeout",
    "connection",
    "PGRST",
    "could not connect",
    "socket",
    "ECONNREFUSED",
  ],
};

interface TransactionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  attempts: number;
  recoverable: boolean;
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: unknown, config: RetryConfig): boolean {
  const errorMessage =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();
  return config.retryableErrors.some((keyword) =>
    errorMessage.includes(keyword.toLowerCase()),
  );
}

/**
 * Calculate exponential backoff delay
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelayMs * Math.pow(2, attempt);
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.3 * delay;
  return Math.min(delay + jitter, config.maxDelayMs);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a database transaction with retry logic
 */
export async function executeTransaction<T>(
  operation: () => Promise<T>,
  operationName: string,
  customConfig?: Partial<RetryConfig>,
): Promise<TransactionResult<T>> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...customConfig };
  let lastError: unknown;
  let attempts = 0;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    attempts = attempt + 1;

    try {
      logger.debug(`Executing ${operationName}, attempt ${attempts}`);
      const result = await operation();

      logger.debug(`${operationName} succeeded on attempt ${attempts}`);
      return {
        success: true,
        data: result,
        attempts,
        recoverable: true,
      };
    } catch (error) {
      lastError = error;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      logger.warn(
        `${operationName} failed on attempt ${attempts}: ${errorMessage}`,
      );

      // Check if we should retry
      if (attempt < config.maxRetries && isRetryableError(error, config)) {
        const delay = calculateDelay(attempt, config);
        logger.info(`Retrying ${operationName} in ${delay}ms...`);
        await sleep(delay);
        continue;
      }

      // No more retries
      break;
    }
  }

  const errorMessage =
    lastError instanceof Error ? lastError.message : String(lastError);
  const isRecoverable = isRetryableError(lastError, config);

  logger.error(`${operationName} failed after ${attempts} attempts`, lastError);

  return {
    success: false,
    error: errorMessage,
    attempts,
    recoverable: isRecoverable,
  };
}

/**
 * Handle transaction result with user feedback
 */
export function handleTransactionResult<T>(
  result: TransactionResult<T>,
  successMessage: string,
  errorMessage: string,
): T | null {
  if (result.success && result.data !== undefined) {
    toast.success(successMessage);
    return result.data;
  }

  // Show appropriate error message
  if (result.recoverable) {
    toast.error(`${errorMessage}. Please try again.`, {
      description: "The operation failed due to a temporary issue.",
      action: {
        label: "Retry",
        onClick: () => window.location.reload(),
      },
    });
  } else {
    toast.error(errorMessage, {
      description: result.error || "An unexpected error occurred.",
    });
  }

  return null;
}

/**
 * Execute a critical trading operation with full error handling
 */
export async function executeTradingOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  onSuccess?: (result: T) => void,
  onFailure?: (error: string) => void,
): Promise<T | null> {
  const result = await executeTransaction(operation, operationName, {
    maxRetries: 2, // Fewer retries for trading operations
    baseDelayMs: 500,
  });

  if (result.success && result.data !== undefined) {
    logger.info(`Trading operation completed: ${operationName}`, {
      metadata: { attempts: result.attempts },
    });
    onSuccess?.(result.data);
    return result.data;
  }

  logger.warn(`Trading operation failed: ${operationName}`, {
    metadata: {
      error: result.error,
      attempts: result.attempts,
      recoverable: result.recoverable,
    },
  });

  onFailure?.(result.error || "Operation failed");
  return null;
}

/**
 * Wrapper for Supabase RPC calls with enhanced error handling
 */
export async function safeRpcCall<T>(
  rpcCall: () => Promise<{ data: T | null; error: { message: string } | null }>,
  operationName: string,
): Promise<TransactionResult<T>> {
  return executeTransaction(async () => {
    const { data, error } = await rpcCall();

    if (error) {
      throw new Error(error.message);
    }

    if (data === null) {
      throw new Error("No data returned from operation");
    }

    return data;
  }, operationName);
}

export default {
  executeTransaction,
  handleTransactionResult,
  executeTradingOperation,
  safeRpcCall,
};
