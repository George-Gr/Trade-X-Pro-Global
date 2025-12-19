/**
 * Unit tests for usePositionClose hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock dependencies
vi.mock('@/lib/supabaseBrowserClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/lib/rateLimiter', () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true, remaining: 10, resetIn: 0 })),
  rateLimiter: {
    execute: vi.fn((_key: string, fn: () => unknown) => fn()),
  },
}));
vi.mock('@/lib/idempotency', () => ({
  generateIdempotencyKey: vi.fn(() => 'test-idempotency-key'),
  executeWithIdempotency: vi.fn(
    (_key: string, _operation: string, fn: () => unknown) => fn()
  ),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import {
  usePositionClose,
  ClosePositionRequest,
} from '@/hooks/usePositionClose';
import { supabase } from '@/lib/supabaseBrowserClient';
import { checkRateLimit } from '@/lib/rateLimiter';

describe('usePositionClose', () => {
  const mockSession = {
    user: { id: 'test-user-id', email: 'test@example.com' },
    access_token: 'test-token',
  };

  const mockCloseRequest: ClosePositionRequest = {
    position_id: 'position-123',
    quantity: 1.0,
  };

  const mockCloseResponse = {
    order_id: 'order-456',
    fill_id: 'fill-789',
    position_id: 'position-123',
    closed_quantity: 1.0,
    close_price: 1.09,
    realized_pnl: 50.0,
    commission: 0.5,
    margin_released: 100.0,
    lots_closed: [
      {
        lot_id: 'lot-001',
        quantity_closed: 1.0,
        entry_price: 1.085,
        exit_price: 1.09,
        pnl: 50.0,
      },
    ],
    position_status: 'closed',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    } as never);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with isClosing as false', () => {
    const { result } = renderHook(() => usePositionClose());
    expect(result.current.isClosing).toBe(false);
  });

  it('should return null when rate limit is exceeded', async () => {
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: false,
      remaining: 0,
      resetIn: 5000,
    });

    const { result } = renderHook(() => usePositionClose());

    let closeResult: unknown;
    await act(async () => {
      closeResult = await result.current.closePosition(mockCloseRequest);
    });

    expect(closeResult).toBeNull();
  });

  it('should return null when user is not authenticated', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);

    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 10,
      resetIn: 0,
    });

    const { result } = renderHook(() => usePositionClose());

    let closeResult: unknown;
    await act(async () => {
      closeResult = await result.current.closePosition(mockCloseRequest);
    });

    expect(closeResult).toBeNull();
  });

  it('should close position successfully', async () => {
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 10,
      resetIn: 0,
    });

    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: mockCloseResponse,
      error: null,
    } as never);

    const { result } = renderHook(() => usePositionClose());

    let closeResult: unknown;
    await act(async () => {
      closeResult = await result.current.closePosition(mockCloseRequest);
    });

    expect(closeResult).toMatchObject({
      position_id: 'position-123',
      closed_quantity: 1.0,
      realized_pnl: 50.0,
    });
  });

  it('should handle close position errors', async () => {
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 10,
      resetIn: 0,
    });

    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { error: 'Position not found' },
      error: null,
    } as never);

    const { result } = renderHook(() => usePositionClose());

    let closeResult: unknown;
    await act(async () => {
      closeResult = await result.current.closePosition(mockCloseRequest);
    });

    expect(closeResult).toBeNull();
  });

  it('should handle partial close', async () => {
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 10,
      resetIn: 0,
    });

    const partialCloseResponse = {
      ...mockCloseResponse,
      closed_quantity: 0.5,
      position_status: 'partial',
    };

    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: partialCloseResponse,
      error: null,
    } as never);

    const { result } = renderHook(() => usePositionClose());

    const partialRequest: ClosePositionRequest = {
      position_id: 'position-123',
      quantity: 0.5,
    };

    let closeResult: unknown;
    await act(async () => {
      closeResult = await result.current.closePosition(partialRequest);
    });

    expect(closeResult).toMatchObject({
      closed_quantity: 0.5,
      position_status: 'partial',
    });
  });

  it('should set isClosing during position close', async () => {
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 10,
      resetIn: 0,
    });

    let resolveInvoke: (value: unknown) => void;
    const invokePromise = new Promise((resolve) => {
      resolveInvoke = resolve;
    });

    vi.mocked(supabase.functions.invoke).mockReturnValue(
      invokePromise as never
    );

    const { result } = renderHook(() => usePositionClose());

    // Start close
    const closePromise = act(async () => {
      return result.current.closePosition(mockCloseRequest);
    });

    // Should be closing
    await waitFor(() => {
      expect(result.current.isClosing).toBe(true);
    });

    // Resolve the invoke
    resolveInvoke!({ data: mockCloseResponse, error: null });

    await closePromise;

    // Should no longer be closing
    expect(result.current.isClosing).toBe(false);
  });

  it('should handle duplicate request errors', async () => {
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 10,
      resetIn: 0,
    });

    vi.mocked(supabase.functions.invoke).mockRejectedValue(
      new Error('Request already being processed')
    );

    const { result } = renderHook(() => usePositionClose());

    let closeResult: unknown;
    await act(async () => {
      closeResult = await result.current.closePosition(mockCloseRequest);
    });

    expect(closeResult).toBeNull();
  });

  it('should close entire position when quantity not specified', async () => {
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 10,
      resetIn: 0,
    });

    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: mockCloseResponse,
      error: null,
    } as never);

    const { result } = renderHook(() => usePositionClose());

    const fullCloseRequest: ClosePositionRequest = {
      position_id: 'position-123',
      // No quantity - should close entire position
    };

    await act(async () => {
      await result.current.closePosition(fullCloseRequest);
    });

    expect(supabase.functions.invoke).toHaveBeenCalled();
  });

  it('should provide rate limit status', () => {
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 3,
      resetIn: 45000,
    });

    const { result } = renderHook(() => usePositionClose());
    const status = result.current.getRateLimitStatus();

    expect(status).toEqual({
      allowed: true,
      remaining: 3,
      resetIn: 45000,
    });
  });

  it('should handle network errors gracefully', async () => {
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 10,
      resetIn: 0,
    });

    vi.mocked(supabase.functions.invoke).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => usePositionClose());

    let closeResult: unknown;
    await act(async () => {
      closeResult = await result.current.closePosition(mockCloseRequest);
    });

    expect(closeResult).toBeNull();
  });

  it('should calculate P&L display correctly for profit', async () => {
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 10,
      resetIn: 0,
    });

    const profitResponse = {
      ...mockCloseResponse,
      realized_pnl: 150.5,
    };

    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: profitResponse,
      error: null,
    } as never);

    const { result } = renderHook(() => usePositionClose());

    let closeResult: unknown;
    await act(async () => {
      closeResult = await result.current.closePosition(mockCloseRequest);
    });

    expect((closeResult as { realized_pnl: number }).realized_pnl).toBe(150.5);
  });

  it('should calculate P&L display correctly for loss', async () => {
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 10,
      resetIn: 0,
    });

    const lossResponse = {
      ...mockCloseResponse,
      realized_pnl: -75.25,
    };

    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: lossResponse,
      error: null,
    } as never);

    const { result } = renderHook(() => usePositionClose());

    let closeResult: unknown;
    await act(async () => {
      closeResult = await result.current.closePosition(mockCloseRequest);
    });

    expect((closeResult as { realized_pnl: number }).realized_pnl).toBe(-75.25);
  });
});
