/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSlTpExecution, SLTPExecutionOptions, ClosureResponse } from '../useSlTpExecution';

// Mock the Supabase client at the correct path used by the implementation
vi.mock('@/lib/supabaseBrowserClient', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

const { supabase } = await import('@/lib/supabaseBrowserClient');

describe('useSlTpExecution', () => {
  let invokeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Properly mock the invoke function using spyOn for each test
    invokeSpy = vi.spyOn(supabase.functions, 'invoke');
  });

  afterEach(() => {
    vi.useRealTimers();
    invokeSpy?.mockRestore();
  });

  /**
   * Test 1: Successful execution returns closure data
   */
  it('should execute stop loss and return closure response', async () => {
    const mockResponse: ClosureResponse = {
      closure_id: 'closure-123',
      position_id: 'pos-123',
      reason: 'stop_loss',
      status: 'completed',
      entry_price: 1.0900,
      exit_price: 1.0850,
      quantity_closed: 1.0,
      quantity_remaining: 0,
      realized_pnl: -50,
      pnl_percentage: -0.046,
      commission: 5,
      slippage: 2,
    };

    invokeSpy.mockResolvedValueOnce({
      data: { data: mockResponse },
      error: null,
    } as unknown as ReturnType<typeof supabase.functions.invoke>);

    const { result } = renderHook(() => useSlTpExecution());

    const options: SLTPExecutionOptions = {
      positionId: 'pos-123',
      triggerType: 'stop_loss',
      currentPrice: 1.0850,
    };

    let executionResult: ClosureResponse | null = null;

    await act(async () => {
      executionResult = await result.current.executeStopLossOrTakeProfit(options);
    });

    expect(executionResult).toEqual(mockResponse);
    expect(result.current.lastResult).toEqual(mockResponse);
    expect(result.current.error).toBeNull();
    expect(result.current.isExecuting).toBe(false);
  });

  /**
   * Test 2: Take profit execution
   */
  it('should execute take profit and return closure response', async () => {
    const mockResponse: ClosureResponse = {
      closure_id: 'closure-124',
      position_id: 'pos-124',
      reason: 'take_profit',
      status: 'completed',
      entry_price: 1.0800,
      exit_price: 1.0900,
      quantity_closed: 2.0,
      quantity_remaining: 0,
      realized_pnl: 200,
      pnl_percentage: 0.093,
      commission: 10,
      slippage: 1,
    };

    invokeSpy.mockResolvedValueOnce({
      data: { data: mockResponse },
      error: null,
    } as unknown as ReturnType<typeof supabase.functions.invoke>);

    const { result } = renderHook(() => useSlTpExecution());

    const options: SLTPExecutionOptions = {
      positionId: 'pos-124',
      triggerType: 'take_profit',
      currentPrice: 1.0900,
    };

    let executionResult: ClosureResponse | null = null;

    await act(async () => {
      executionResult = await result.current.executeStopLossOrTakeProfit(options);
    });

    expect(executionResult!.reason).toBe('take_profit');
    expect(executionResult!.realized_pnl).toBe(200);
  });

  /**
   * Test 3: Network error triggers retry
   */
  it('should retry on transient network error', async () => {
    const mockResponse: ClosureResponse = {
      closure_id: 'closure-125',
      position_id: 'pos-125',
      reason: 'stop_loss',
      status: 'completed',
      entry_price: 1.0900,
      exit_price: 1.0850,
      quantity_closed: 1.0,
      quantity_remaining: 0,
      realized_pnl: -50,
      pnl_percentage: -0.046,
      commission: 5,
      slippage: 2,
    };

    // First call fails with transient error, second succeeds
    invokeSpy
      .mockRejectedValueOnce(new Error('ECONNREFUSED'))
      .mockResolvedValueOnce({
        data: { data: mockResponse },
        error: null,
      } as unknown as ReturnType<typeof supabase.functions.invoke>);

    const { result } = renderHook(() => useSlTpExecution());

    const options: SLTPExecutionOptions = {
      positionId: 'pos-125',
      triggerType: 'stop_loss',
      currentPrice: 1.0850,
    };

    let executionResult: ClosureResponse | null = null;

    await act(async () => {
      const promise = result.current.executeStopLossOrTakeProfit(options);
      vi.useRealTimers(); // Use real timers for actual delay
      executionResult = await promise;
      vi.useFakeTimers(); // Go back to fake timers
    });

    expect(executionResult).toEqual(mockResponse);
    expect(invokeSpy).toHaveBeenCalledTimes(2);
  });

  /**
   * Test 4: Permanent error is not retried
   */
  it('should not retry on validation error', async () => {
    invokeSpy.mockRejectedValueOnce(new Error('Invalid position ID'));

    const { result } = renderHook(() => useSlTpExecution());

    const options: SLTPExecutionOptions = {
      positionId: 'invalid-pos',
      triggerType: 'stop_loss',
      currentPrice: 1.0850,
    };

    let thrownError: Error | null = null;

    await act(async () => {
      try {
        await result.current.executeStopLossOrTakeProfit(options);
      } catch (error) {
        thrownError = error as Error;
      }
    });

    expect(thrownError).not.toBeNull();
    expect((thrownError as unknown as Error)?.message).toContain('Invalid position ID');
    // Should only be called once (no retry)
    expect(invokeSpy).toHaveBeenCalledTimes(1);
  });

  /**
   * Test 5: All retries exhausted throws error
   */
  it('should throw error after max retries exhausted', async () => {
    invokeSpy.mockRejectedValue(new Error('ECONNREFUSED'));

    const { result } = renderHook(() => useSlTpExecution());

    const options: SLTPExecutionOptions = {
      positionId: 'pos-126',
      triggerType: 'stop_loss',
      currentPrice: 1.0850,
    };

    let thrownError: Error | null = null;

    await act(async () => {
      try {
        const promise = result.current.executeStopLossOrTakeProfit(options);
        vi.useRealTimers(); // Use real timers for actual delay
        await promise;
        vi.useFakeTimers(); // Go back to fake timers
      } catch (error) {
        thrownError = error as Error;
      }
    });

    expect(thrownError).not.toBeNull();
    expect(invokeSpy).toHaveBeenCalledTimes(3);
  });

  /**
   * Test 6: Idempotency key prevents duplicate execution
   */
  it('should use idempotency key to prevent duplicates', async () => {
    const mockResponse: ClosureResponse = {
      closure_id: 'closure-127',
      position_id: 'pos-127',
      reason: 'stop_loss',
      status: 'completed',
      entry_price: 1.0900,
      exit_price: 1.0850,
      quantity_closed: 1.0,
      quantity_remaining: 0,
      realized_pnl: -50,
      pnl_percentage: -0.046,
      commission: 5,
      slippage: 2,
    };

    invokeSpy.mockResolvedValueOnce({
      data: { data: mockResponse },
      error: null,
    } as unknown as ReturnType<typeof supabase.functions.invoke>);

    const { result } = renderHook(() => useSlTpExecution());

    const idempotencyKey = 'custom-idempotency-key';
    const options: SLTPExecutionOptions = {
      positionId: 'pos-127',
      triggerType: 'stop_loss',
      currentPrice: 1.0850,
      idempotencyKey,
    };

    await act(async () => {
      await result.current.executeStopLossOrTakeProfit(options);
    });

    const callArgs = invokeSpy.mock.calls[0];
    expect(callArgs[1]?.body?.idempotency_key).toBe(idempotencyKey);
  });

});
