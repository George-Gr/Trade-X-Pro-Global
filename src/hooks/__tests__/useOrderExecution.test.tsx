import { describe, it, expect, vi } from 'vitest';

// Vitest provides beforeEach/afterEach as globals when globals: true is set in vitest.config.ts
// Add TypeScript declarations to avoid TS errors
declare let beforeEach: (fn: () => void | Promise<void>) => void;
declare let afterEach: (fn: () => void | Promise<void>) => void;
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOrderExecution } from '../useOrderExecution';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('useOrderExecution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with isExecuting=false', () => {
    const { result } = renderHook(() => useOrderExecution());
    expect(result.current.isExecuting).toBe(false);
  });

  it('should return null and show error if user is not authenticated', async () => {
    const mockGetSession = vi.spyOn(supabase.auth, 'getSession');
    mockGetSession.mockResolvedValueOnce({
      data: { session: null },
    } as { data: { session: null } } );

    const { result } = renderHook(() => useOrderExecution());

    await act(async () => {
      const response = await result.current.executeOrder({
        symbol: 'EURUSD',
        order_type: 'market',
        side: 'buy',
        quantity: 1.0,
      });
      expect(response).toBeNull();
    });
  });

  it('should handle edge function error response', async () => {
    const mockGetSession = vi.spyOn(supabase.auth, 'getSession');
    mockGetSession.mockResolvedValueOnce({
      data: {
        session: {
          user: { id: 'user-123' },
        },
      },
    } as { data: { session: { user: { id: string } } } } );

    const mockInvoke = vi.spyOn(supabase.functions, 'invoke');
    mockInvoke.mockResolvedValueOnce({
      data: {
        error: 'Insufficient balance',
      },
    } as { data: { error: string } } );

    const { result } = renderHook(() => useOrderExecution());

    await act(async () => {
      const response = await result.current.executeOrder({
        symbol: 'EURUSD',
        order_type: 'market',
        side: 'buy',
        quantity: 1.0,
      });
      expect(response).toBeNull();
    });
  });

  it('should successfully execute a market buy order', async () => {
    const mockGetSession = vi.spyOn(supabase.auth, 'getSession');
    mockGetSession.mockResolvedValueOnce({
      data: {
        session: {
          user: { id: 'user-123' },
        },
      },
    } as { data: { session: { user: { id: string } } } } );

    const mockOrderResponse = {
      success: true,
      order_id: 'order-123',
      symbol: 'EURUSD',
      side: 'buy',
      quantity: 1.0,
      execution_price: 1.0950,
      fill_price: 1.0950,
      commission: 2.5,
      margin_required: 219.0,
      status: 'filled',
      new_balance: 9997.5,
      new_margin_level: 500,
    };

    const mockInvoke = vi.spyOn(supabase.functions, 'invoke');
    mockInvoke.mockResolvedValueOnce({
      data: {
        data: mockOrderResponse,
      },
    } as { data: { data: typeof mockOrderResponse } } );

    const { result } = renderHook(() => useOrderExecution());

    await act(async () => {
      const response = await result.current.executeOrder({
        symbol: 'EURUSD',
        order_type: 'market',
        side: 'buy',
        quantity: 1.0,
      });

      expect(response).not.toBeNull();
      expect(response?.order_id).toBe('order-123');
      expect(response?.symbol).toBe('EURUSD');
      expect(response?.side).toBe('buy');
      expect(response?.quantity).toBe(1.0);
      expect(response?.execution_price).toBe(1.0950);
      expect(response?.commission).toBe(2.5);
      expect(response?.status).toBe('filled');
    });
  });

  it('should successfully execute a market sell order', async () => {
    const mockGetSession = vi.spyOn(supabase.auth, 'getSession');
    mockGetSession.mockResolvedValueOnce({
      data: {
        session: {
          user: { id: 'user-123' },
        },
      },
    } as { data: { session: { user: { id: string } } } } );

    const mockOrderResponse = {
      success: true,
      order_id: 'order-124',
      symbol: 'EURUSD',
      side: 'sell',
      quantity: 0.5,
      execution_price: 1.0940,
      fill_price: 1.0940,
      commission: 1.25,
      margin_required: 109.4,
      status: 'filled',
      new_balance: 10546.20,
      new_margin_level: 600,
    };

    const mockInvoke = vi.spyOn(supabase.functions, 'invoke');
    mockInvoke.mockResolvedValueOnce({
      data: {
        data: mockOrderResponse,
      },
    } as { data: { data: typeof mockOrderResponse } } );

    const { result } = renderHook(() => useOrderExecution());

    await act(async () => {
      const response = await result.current.executeOrder({
        symbol: 'EURUSD',
        order_type: 'market',
        side: 'sell',
        quantity: 0.5,
      });

      expect(response).not.toBeNull();
      expect(response?.order_id).toBe('order-124');
      expect(response?.side).toBe('sell');
      expect(response?.quantity).toBe(0.5);
      expect(response?.new_balance).toBeCloseTo(10546.20, 2);
    });
  });

  it('should handle limit order with price parameter', async () => {
    const mockGetSession = vi.spyOn(supabase.auth, 'getSession');
    mockGetSession.mockResolvedValueOnce({
      data: {
        session: {
          user: { id: 'user-123' },
        },
      },
    } as { data: { session: { user: { id: string } } } } );

    const mockOrderResponse = {
      success: true,
      order_id: 'order-125',
      symbol: 'EURUSD',
      side: 'buy',
      quantity: 2.0,
      execution_price: 1.0900,
      fill_price: 1.0900,
      commission: 5.0,
      margin_required: 436.0,
      status: 'pending',
      new_balance: 9995.0,
      new_margin_level: 450,
    };

    const mockInvoke = vi.spyOn(supabase.functions, 'invoke');
    mockInvoke.mockResolvedValueOnce({
      data: {
        data: mockOrderResponse,
      },
    } as { data: { data: typeof mockOrderResponse } } );

    const { result } = renderHook(() => useOrderExecution());

    await act(async () => {
      const response = await result.current.executeOrder({
        symbol: 'EURUSD',
        order_type: 'limit',
        side: 'buy',
        quantity: 2.0,
        price: 1.0900,
      });

      expect(response?.status).toBe('pending');
      expect(mockInvoke).toHaveBeenCalledWith(
        'execute-order',
        expect.objectContaining({
          body: expect.objectContaining({
            symbol: 'EURUSD',
            order_type: 'limit',
            side: 'buy',
            quantity: 2.0,
            price: 1.0900,
          }),
        })
      );
    });
  });

  it('should include stop loss and take profit in order', async () => {
    const mockGetSession = vi.spyOn(supabase.auth, 'getSession');
    mockGetSession.mockResolvedValueOnce({
      data: {
        session: {
          user: { id: 'user-123' },
        },
      },
    } as { data: { session: { user: { id: string } } } } );

    const mockOrderResponse = {
      success: true,
      order_id: 'order-126',
      symbol: 'EURUSD',
      side: 'buy',
      quantity: 1.0,
      execution_price: 1.0950,
      fill_price: 1.0950,
      commission: 2.5,
      margin_required: 219.0,
      status: 'filled',
      new_balance: 9997.5,
      new_margin_level: 500,
    };

    const mockInvoke = vi.spyOn(supabase.functions, 'invoke');
    mockInvoke.mockResolvedValueOnce({
      data: {
        data: mockOrderResponse,
      },
    } as { data: { data: typeof mockOrderResponse } } );

    const { result } = renderHook(() => useOrderExecution());

    await act(async () => {
      const response = await result.current.executeOrder({
        symbol: 'EURUSD',
        order_type: 'market',
        side: 'buy',
        quantity: 1.0,
        stop_loss: 1.0850,
        take_profit: 1.1050,
      });

      expect(response?.order_id).toBe('order-126');
      expect(mockInvoke).toHaveBeenCalledWith(
        'execute-order',
        expect.objectContaining({
          body: expect.objectContaining({
            stop_loss: 1.0850,
            take_profit: 1.1050,
          }),
        })
      );
    });
  });

  it('should handle network errors gracefully', async () => {
    const mockGetSession = vi.spyOn(supabase.auth, 'getSession');
    mockGetSession.mockResolvedValueOnce({
      data: {
        session: {
          user: { id: 'user-123' },
        },
      },
    } as { data: { session: { user: { id: string } } } } );

    const mockInvoke = vi.spyOn(supabase.functions, 'invoke');
    mockInvoke.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useOrderExecution());

    await act(async () => {
      const response = await result.current.executeOrder({
        symbol: 'EURUSD',
        order_type: 'market',
        side: 'buy',
        quantity: 1.0,
      });

      expect(response).toBeNull();
    });
  });

  it('should generate unique idempotency keys for each order', async () => {
    const mockGetSession = vi.spyOn(supabase.auth, 'getSession');
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-123' },
        },
      },
    } as unknown);

    const mockInvoke = vi.spyOn(supabase.functions, 'invoke');
    mockInvoke.mockResolvedValue({
      data: {
        data: {
          success: true,
          order_id: 'order-128',
          symbol: 'EURUSD',
          side: 'buy',
          quantity: 1.0,
          execution_price: 1.0950,
          fill_price: 1.0950,
          commission: 2.5,
          margin_required: 219.0,
          status: 'filled',
          new_balance: 9997.5,
          new_margin_level: 500,
        },
      },
    } as unknown as Awaited<ReturnType<typeof supabase.functions.invoke>>);

    const { result } = renderHook(() => useOrderExecution());

    const idempotencyKeys: string[] = [];

    await act(async () => {
      await result.current.executeOrder({
        symbol: 'EURUSD',
        order_type: 'market',
        side: 'buy',
        quantity: 1.0,
      });

      await result.current.executeOrder({
        symbol: 'EURUSD',
        order_type: 'market',
        side: 'buy',
        quantity: 1.0,
      });
    });

    // Extract idempotency keys from invoke calls
    mockInvoke.mock.calls.forEach((call: any) => {
      if (call[1]?.body?.idempotency_key) {
        idempotencyKeys.push(call[1].body.idempotency_key);
      }
    });

    expect(idempotencyKeys.length).toBe(2);
    expect(idempotencyKeys[0]).not.toBe(idempotencyKeys[1]);
  });
});
