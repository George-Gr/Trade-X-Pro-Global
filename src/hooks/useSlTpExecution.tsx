import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseBrowserClient';

/**
 * Represents the trigger type for SL/TP execution
 */
export type TriggerType = 'stop_loss' | 'take_profit';

/**
 * Options for executing a stop loss or take profit closure
 */
export interface SLTPExecutionOptions {
  positionId: string;
  triggerType: TriggerType;
  currentPrice: number;
  idempotencyKey?: string;
}

/**
 * Response from successful SL/TP closure
 */
export interface ClosureResponse {
  closure_id: string;
  position_id: string;
  reason: TriggerType;
  status: 'partial' | 'completed';
  entry_price: number;
  exit_price: number;
  quantity_closed: number;
  quantity_remaining: number;
  realized_pnl: number;
  pnl_percentage: number;
  commission: number;
  slippage: number;
}

/**
 * Internal state for SL/TP execution hook
 */
interface SLTPExecutionState {
  isExecuting: boolean;
  error: string | null;
  lastResult: ClosureResponse | null;
}

/**
 * Hook for executing stop loss and take profit closures
 *
 * Provides automatic closure of positions when SL/TP triggers.
 * Implements retry logic with exponential backoff for resilience.
 *
 * @returns Object with execution function and state
 *
 * @example
 * ```tsx
 * const { executeStopLossOrTakeProfit, isExecuting, error } = useSlTpExecution();
 *
 * await executeStopLossOrTakeProfit({
 *   positionId: 'pos-123',
 *   triggerType: 'stop_loss',
 *   currentPrice: 1.0850,
 * });
 * ```
 */
export const useSlTpExecution = () => {
  const [state, setState] = useState<SLTPExecutionState>({
    isExecuting: false,
    error: null,
    lastResult: null,
  });

  // Track ongoing executions to prevent duplicate calls
  const executingRef = useRef<Set<string>>(new Set());

  /**
   * Execute SL/TP closure via edge function
   * @throws Error if execution fails after retries
   */
  const executeStopLossOrTakeProfit = useCallback(
    async (options: SLTPExecutionOptions): Promise<ClosureResponse> => {
      const idempotencyKey =
        options.idempotencyKey || 
        `${options.triggerType}_${options.positionId}_${Date.now()}`;

      // Prevent duplicate execution for same position/trigger
      if (executingRef.current.has(options.positionId)) {
        throw new Error(`${options.triggerType} already executing for position ${options.positionId}`);
      }

      executingRef.current.add(options.positionId);

      setState((prev) => ({ ...prev, isExecuting: true, error: null }));

      try {
        const result = await executeWithRetry(options, idempotencyKey);
        setState((prev) => ({ ...prev, lastResult: result }));
        return result;
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? error.message
            : 'Unknown error occurred during SL/TP execution';
        setState((prev) => ({ ...prev, error: errorMsg }));
        throw error;
      } finally {
        setState((prev) => ({ ...prev, isExecuting: false }));
        executingRef.current.delete(options.positionId);
      }
    },
    []
  );

  return {
    executeStopLossOrTakeProfit,
    isExecuting: state.isExecuting,
    error: state.error,
    lastResult: state.lastResult,
  };
};

/**
 * Execute closure with exponential backoff retry logic
 *
 * Retries up to 3 times with backoff: 200ms, 400ms, 800ms
 * Only retries on transient errors (network, timeout, rate limit)
 *
 * @throws Error if all retries exhausted or permanent error
 */
async function executeWithRetry(
  options: SLTPExecutionOptions,
  idempotencyKey: string,
  maxRetries = 3
): Promise<ClosureResponse> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await executeClosureViaEdgeFunction(options, idempotencyKey);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is transient
      const isTransient = isTransientError(error);

      if (!isTransient || attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff: 200ms, 400ms, 800ms
      const backoffMs = Math.pow(2, attempt) * 100;
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  throw lastError || new Error('Failed to execute SL/TP closure');
}

/**
 * Determine if an error is transient (should retry) or permanent
 */
function isTransientError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('econnrefused') ||
      message.includes('timeout') ||
      message.includes('econnreset') ||
      message.includes('network')
    );
  }

  // Check for HTTP status codes that indicate transient errors
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status?: number }).status;
    return status === 429 || status === 503 || status === 504;
  }

  return false;
}

/**
 * Call the close-position edge function
 *
 * Invokes Supabase edge function to close the position atomically
 * with P&L calculation, commission, and slippage
 */
async function executeClosureViaEdgeFunction(
  options: SLTPExecutionOptions,
  idempotencyKey: string
): Promise<ClosureResponse> {
  const { data, error } = await supabase.functions.invoke('close-position', {
    body: {
      position_id: options.positionId,
      reason: options.triggerType,
      idempotency_key: idempotencyKey,
      quantity: undefined, // Full position closure
    },
  });

  if (error) {
    throw new Error(`Edge function error: ${error.message || String(error)}`);
  }

  if (!data || !data.data) {
    throw new Error('Invalid response from close-position function');
  }

  // Extract and validate closure response
  const closure = data.data as ClosureResponse;

  if (!closure.closure_id || !closure.position_id) {
    throw new Error('Incomplete closure response from edge function');
  }

  return closure;
}
