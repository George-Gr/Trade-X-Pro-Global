import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useOrderExecution } from '../useOrderExecution';

// Mock Supabase at the correct path used by the implementation
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

const { supabase } = await import('@/lib/supabaseBrowserClient');

// Test-specific type interfaces for mocking
interface MockSession {
  data: {
    session: {
      user: { id: string };
    } | null;
  };
}

interface MockFunctionResponse<T = unknown> {
  data: {
    data: T;
  };
}

interface MockErrorResponse {
  data: {
    error: string;
  };
}

interface MockOrderResponse {
  success: boolean;
  order_id: string;
  symbol: string;
  side: string;
  quantity: number;
  execution_price: number;
  margin_required: number;
  status: string;
  new_balance: number;
  new_margin_level: number;
}

// Mock useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('useOrderExecution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure mock functions are properly initialized
    vi.mocked(supabase.auth.getSession).mockClear();
    vi.mocked(supabase.functions.invoke).mockClear();
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
    } as { data: { session: null } });

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
    } as { data: { session: { user: { id: string } } } });

    const mockInvoke = vi.spyOn(supabase.functions, 'invoke');
    mockInvoke.mockResolvedValueOnce({
      data: {
        error: 'Insufficient balance',
      },
    } as { data: { error: string } });

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
    } as { data: { session: { user: { id: string } } } });

    const mockOrderResponse = {
      success: true,
      order_id: 'order-123',
      symbol: 'EURUSD',
      side: 'buy',
      quantity: 1.0,
      execution_price: 1.095,
      fill_price: 1.095,
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
    } as MockFunctionResponse<MockOrderResponse>);

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
      expect(response?.execution_price).toBe(1.095);
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
    } as MockSession);

    const mockOrderResponse = {
      success: true,
      order_id: 'order-124',
      symbol: 'EURUSD',
      side: 'sell',
      quantity: 0.5,
      execution_price: 1.094,
      fill_price: 1.094,
      commission: 1.25,
      margin_required: 109.4,
      status: 'filled',
      new_balance: 10546.2,
      new_margin_level: 600,
    };

    const mockInvoke = vi.spyOn(supabase.functions, 'invoke');
    mockInvoke.mockResolvedValueOnce({
      data: {
        data: mockOrderResponse,
      },
    } as MockFunctionResponse<MockOrderResponse>);

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
      expect(response?.new_balance).toBeCloseTo(10546.2, 2);
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
    } as { data: { session: { user: { id: string } } } });

    const mockOrderResponse = {
      success: true,
      order_id: 'order-125',
      symbol: 'EURUSD',
      side: 'buy',
      quantity: 2.0,
      execution_price: 1.09,
      fill_price: 1.09,
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
    } as MockFunctionResponse<MockOrderResponse>);

    const { result } = renderHook(() => useOrderExecution());

    await act(async () => {
      const response = await result.current.executeOrder({
        symbol: 'EURUSD',
        order_type: 'limit',
        side: 'buy',
        quantity: 2.0,
        price: 1.09,
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
            price: 1.09,
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
    } as MockSession);

    const mockOrderResponse = {
      success: true,
      order_id: 'order-126',
      symbol: 'EURUSD',
      side: 'buy',
      quantity: 1.0,
      execution_price: 1.095,
      fill_price: 1.095,
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
    } as MockFunctionResponse<MockOrderResponse>);

    const { result } = renderHook(() => useOrderExecution());

    await act(async () => {
      const response = await result.current.executeOrder({
        symbol: 'EURUSD',
        order_type: 'market',
        side: 'buy',
        quantity: 1.0,
        stop_loss: 1.085,
        take_profit: 1.105,
      });

      expect(response?.order_id).toBe('order-126');
      expect(mockInvoke).toHaveBeenCalledWith(
        'execute-order',
        expect.objectContaining({
          body: expect.objectContaining({
            stop_loss: 1.085,
            take_profit: 1.105,
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
    } as { data: { session: { user: { id: string } } } });

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
    } as MockSession);

    const mockInvoke = vi.spyOn(supabase.functions, 'invoke');
    mockInvoke.mockResolvedValue({
      data: {
        data: {
          success: true,
          order_id: 'order-128',
          symbol: 'EURUSD',
          side: 'buy',
          quantity: 1.0,
          execution_price: 1.095,
          fill_price: 1.095,
          commission: 2.5,
          margin_required: 219.0,
          status: 'filled',
          new_balance: 9997.5,
          new_margin_level: 500,
        },
      },
    } as MockFunctionResponse<MockOrderResponse>);

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
    mockInvoke.mock.calls.forEach(
      (call: [string, { body?: { idempotency_key?: string } }]) => {
        if (call[1]?.body?.idempotency_key) {
          idempotencyKeys.push(call[1].body.idempotency_key);
        }
      }
    );

    expect(idempotencyKeys.length).toBe(2);
    expect(idempotencyKeys[0]).not.toBe(idempotencyKeys[1]);
  });
});
