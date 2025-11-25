/**
 * Hook: useLiquidationExecution
 *
 * Purpose: Execute forced liquidation of positions when margin call escalates
 * Task: TASK 1.2.2 - Position Closure Automation & Liquidation Execution
 *
 * Features:
 * - Execute liquidation via edge function with atomic transaction support
 * - Cascade liquidation of multiple positions
 * - Retry logic with exponential backoff
 * - Idempotency key generation to prevent duplicate liquidations
 * - Error handling and recovery
 * - State management for execution progress
 *
 * Returns:
 * {
 *   executeLiquidation: (positionIds: string[], reason: string) => Promise<LiquidationResult>,
 *   isExecuting: boolean,
 *   error: string | null,
 *   lastResult: LiquidationResult | null,
 *   reset: () => void,
 * }
 */

import { useCallback, useState, useRef } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabaseBrowserClient';
import type { LiquidationExecutionResult } from '@/lib/trading/liquidationEngine';

interface LiquidationExecutionParams {
  positionIds: string[];
  reason: string;
  currentPrices: Record<string, number>;
  maxRetries?: number;
  retryDelayMs?: number;
}

interface ExecutionState {
  isExecuting: boolean;
  error: string | null;
  lastResult: LiquidationExecutionResult | null;
  progressPercent: number;
}

/**
 * Generate idempotency key for liquidation to prevent duplicates
 */
function generateIdempotencyKey(positionIds: string[], reason: string): string {
  const timestamp = Date.now();
  const positionHash = positionIds.sort().join('-');
  return `liq-${positionHash}-${reason}-${timestamp}`;
}

/**
 * Execute liquidation via edge function with retry logic
 */
async function executeLiquidationViaEdgeFunction(
  userId: string,
  positionIds: string[],
  reason: string,
  currentPrices: Record<string, number>,
  idempotencyKey: string,
  maxRetries: number = 3,
  retryDelayMs: number = 200
): Promise<LiquidationExecutionResult> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await supabase.functions.invoke('execute-liquidation', {
        body: {
          user_id: userId,
          position_ids: positionIds,
          reason,
          current_prices: currentPrices,
          idempotency_key: idempotencyKey,
        },
      });

      if (response.error) {
        throw new Error(`Edge function error: ${JSON.stringify(response.error)}`);
      }

      if (!response.data) {
        throw new Error('No data returned from edge function');
      }

      // Validate response structure
      const result = response.data as LiquidationExecutionResult;
      if (!result.success || !result.liquidationEventId) {
        throw new Error(`Liquidation failed: ${result.message || 'Unknown error'}`);
      }

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on validation errors
      const errorMessage = lastError.message.toLowerCase();
      if (
        errorMessage.includes('validation') ||
        errorMessage.includes('not found') ||
        errorMessage.includes('unauthorized')
      ) {
        throw lastError;
      }

      // Retry on network errors
      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * retryDelayMs;
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }
    }
  }

  throw new Error(
    `Liquidation failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`
  );
}

export function useLiquidationExecution() {
  const { user } = useAuth();
  const [state, setState] = useState<ExecutionState>({
    isExecuting: false,
    error: null,
    lastResult: null,
    progressPercent: 0,
  });

  const executionRef = useRef<{
    abortController: AbortController | null;
    startTime: number;
  }>({
    abortController: null,
    startTime: 0,
  });

  /**
   * Execute liquidation of specified positions
   * Handles cascade closure and atomic transaction
   */
  const executeLiquidation = useCallback(
    async (params: LiquidationExecutionParams): Promise<LiquidationExecutionResult> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const {
        positionIds,
        reason,
        currentPrices,
        maxRetries = 3,
        retryDelayMs = 200,
      } = params;

      // Validate inputs
      if (!positionIds || positionIds.length === 0) {
        throw new Error('No positions specified for liquidation');
      }

      if (!currentPrices || Object.keys(currentPrices).length === 0) {
        throw new Error('No market prices provided');
      }

      setState({
        isExecuting: true,
        error: null,
        lastResult: null,
        progressPercent: 0,
      });

      executionRef.current.startTime = Date.now();

      try {
        // Generate idempotency key to prevent duplicate liquidations
        const idempotencyKey = generateIdempotencyKey(positionIds, reason);

        // Update progress
        setState((prev) => ({ ...prev, progressPercent: 10 }));

        // Execute liquidation via edge function
        const result = await executeLiquidationViaEdgeFunction(
          user.id,
          positionIds,
          reason,
          currentPrices,
          idempotencyKey,
          maxRetries,
          retryDelayMs
        );

        // Update progress
        setState((prev) => ({ ...prev, progressPercent: 100 }));

        // Success - store result
        setState((prev) => ({
          ...prev,
          isExecuting: false,
          error: null,
          lastResult: result,
          progressPercent: 100,
        }));

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        setState((prev) => ({
          ...prev,
          isExecuting: false,
          error: errorMessage,
          progressPercent: 0,
        }));

        throw error;
      }
    },
    [user?.id]
  );

  /**
   * Reset execution state
   */
  const reset = useCallback(() => {
    setState({
      isExecuting: false,
      error: null,
      lastResult: null,
      progressPercent: 0,
    });

    if (executionRef.current.abortController) {
      executionRef.current.abortController.abort();
      executionRef.current.abortController = null;
    }
  }, []);

  return {
    executeLiquidation,
    isExecuting: state.isExecuting,
    error: state.error,
    lastResult: state.lastResult,
    progressPercent: state.progressPercent,
    reset,
  };
}

export type { LiquidationExecutionParams, ExecutionState, LiquidationExecutionResult };
