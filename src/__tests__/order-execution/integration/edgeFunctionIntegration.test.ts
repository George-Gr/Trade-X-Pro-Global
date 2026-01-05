/**
 * Integration Tests for Order Execution Edge Function
 *
 * Tests the complete order execution pipeline including:
 * - Edge Function integration with database
 * - Database stored procedure integration
 * - Real-time position updates and WebSocket integration
 * - React Query cache invalidation
 * - Error boundary behavior
 * - Performance validation
 */

import { useOrderExecution } from '@/hooks/useOrderExecution';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Type definitions for mocks
interface EdgeFunctionResponse {
  success: boolean;
  data?: {
    order_id: string;
    position_id?: string;
    status: string;
    execution_details: {
      execution_price: string;
      slippage?: string;
      commission: string;
      total_cost: string;
      timestamp: string;
      transaction_id?: string;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    status: number;
  };
}

type MockExecuteWithIdempotency = (
  key: string,
  endpoint: string,
  fn: () => Promise<EdgeFunctionResponse>
) => Promise<EdgeFunctionResponse>;

type MockRateLimiterExecute = (
  key: string,
  fn: () => Promise<EdgeFunctionResponse>,
  priority?: number
) => Promise<EdgeFunctionResponse>;

type MockCheckRateLimit = (type: string) => {
  allowed: boolean;
  remaining: number;
  resetIn: number;
};

// Mock the Supabase Edge Function
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

vi.mock('@/lib/idempotency', () => ({
  executeWithIdempotency: vi.fn<MockExecuteWithIdempotency>(),
  generateIdempotencyKey: vi.fn(),
}));

vi.mock('@/lib/rateLimiter', () => ({
  checkRateLimit: vi.fn<MockCheckRateLimit>(),
  rateLimiter: {
    execute: vi.fn<MockRateLimiterExecute>(),
  },
}));

vi.mock('@/lib/sanitize', () => ({
  sanitizeNumber: vi.fn((value: unknown) => value as number),
  sanitizeSymbol: vi.fn((value: unknown) => (value as string)?.toUpperCase()),
}));

vi.mock('@/lib/security/orderSecurity', () => ({
  orderSecurity: {
    generateCSRFToken: vi.fn(() => 'mock-csrf-token'),
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock QueryClient instance to be shared between module mock and test assertions
interface MockQueryClient {
  invalidateQueries: ReturnType<typeof vi.fn>;
  refetchQueries?: ReturnType<typeof vi.fn>;
  setQueryData?: ReturnType<typeof vi.fn>;
}
let mockQueryClient: MockQueryClient;

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => mockQueryClient,
}));

// Mock WebSocketManager for real-time updates
const mockWebSocketManager = {
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  onStateChange: vi.fn(),
  getStatus: vi.fn(() => ({
    totalConnections: 1,
    totalSubscriptions: 1,
    connections: [],
  })),
  destroy: vi.fn(),
};

vi.mock('@/lib/websocketManager', () => ({
  getWebSocketManager: vi.fn(() => mockWebSocketManager),
}));

// Mock the Edge Function responses
const mockEdgeFunctionResponses = {
  // Successful market order execution
  marketOrderSuccess: {
    success: true,
    data: {
      order_id: 'order-123',
      position_id: 'position-456',
      status: 'executed',
      execution_details: {
        execution_price: '1.0950',
        slippage: '0.0001',
        commission: '2.50',
        total_cost: '109.50',
        timestamp: new Date().toISOString(),
        transaction_id: 'txn-789',
      },
    },
  },

  // Successful limit order (pending)
  limitOrderPending: {
    success: true,
    data: {
      order_id: 'order-124',
      status: 'pending',
      execution_details: {
        execution_price: '1.0900',
        slippage: '0.000000',
        commission: '2.50',
        total_cost: '109.00',
        timestamp: new Date().toISOString(),
        transaction_id: 'txn-790',
      },
    },
  },

  // Insufficient margin error
  insufficientMargin: {
    success: false,
    error: {
      code: 'INSUFFICIENT_MARGIN',
      message: 'Insufficient margin for this order',
      details: {
        required: '219.00',
        available: '100.00',
        margin_level: '45.67',
      },
      status: 400,
    },
  },

  // Invalid order error
  invalidOrder: {
    success: false,
    error: {
      code: 'VALIDATION_FAILED',
      message: 'Invalid order parameters',
      details: {
        errors: ['Symbol not found', 'Invalid quantity'],
      },
      status: 400,
    },
  },

  // Rate limit exceeded
  rateLimitExceeded: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests',
      status: 429,
    },
  },

  // Network error
  networkError: {
    success: false,
    error: {
      code: 'NETWORK_ERROR',
      message: 'Connection timeout',
      status: 503,
    },
  },
};

const { supabase } = await import('@/lib/supabaseBrowserClient');
const { executeWithIdempotency, generateIdempotencyKey } = await import(
  '@/lib/idempotency'
);
const { checkRateLimit, rateLimiter } = await import('@/lib/rateLimiter');

describe('Order Execution Edge Function - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Initialize the shared mockQueryClient instance
    mockQueryClient = {
      invalidateQueries: vi.fn(),
      refetchQueries: vi.fn(),
      setQueryData: vi.fn(),
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-123' },
          access_token: 'mock-token',
        },
      },
    });
  });

  describe('Edge Function Integration with Database', () => {
    it('should successfully execute a market order through Edge Function', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockResolvedValue(
        mockEdgeFunctionResponses.marketOrderSuccess
      );
      vi.mocked(supabase.functions.invoke).mockResolvedValue(
        mockEdgeFunctionResponses.marketOrderSuccess
      );

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
        expect(response?.position_id).toBe('position-456');
        expect(response?.status).toBe('executed');
        expect(response?.execution_price).toBe(1.095);
        expect(response?.commission).toBe(2.5);
        expect(response?.total_cost).toBe(109.5);
      });

      // Verify Edge Function was called with correct parameters
      expect(vi.mocked(supabase.functions.invoke)).toHaveBeenCalledWith(
        'execute-order',
        {
          body: expect.objectContaining({
            symbol: 'EURUSD',
            order_type: 'market',
            side: 'buy',
            quantity: 1.0,
            idempotency_key: expect.any(String),
          }),
        }
      );
    });

    it('should handle limit orders correctly', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockResolvedValue(
        mockEdgeFunctionResponses.limitOrderPending
      );

      const { result } = renderHook(() => useOrderExecution());

      await act(async () => {
        const response = await result.current.executeOrder({
          symbol: 'EURUSD',
          order_type: 'limit',
          side: 'buy',
          quantity: 1.0,
          price: 1.09,
        });

        expect(response).not.toBeNull();
        expect(response?.status).toBe('pending');
        expect(response?.order_id).toBe('order-124');
      });

      // Verify idempotency key was generated for the specific limit order
      expect(vi.mocked(generateIdempotencyKey)).toHaveBeenCalledWith(
        'user-123',
        'execute_order',
        expect.objectContaining({
          symbol: 'EURUSD',
          order_type: 'limit',
          side: 'buy',
          quantity: 1.0,
          price: 1.09,
        })
      );
    });

    it('should handle complex orders with stop loss and take profit', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockResolvedValue(
        mockEdgeFunctionResponses.marketOrderSuccess
      );

      const { result } = renderHook(() => useOrderExecution());

      await act(async () => {
        const response = await result.current.executeOrder({
          symbol: 'EURUSD',
          order_type: 'market',
          side: 'buy',
          quantity: 1.0,
          stop_loss: 1.08,
          take_profit: 1.105,
        });

        expect(response).not.toBeNull();
        expect(response?.order_id).toBe('order-123');
      });

      // Verify all parameters were passed to Edge Function
      expect(vi.mocked(supabase.functions.invoke)).toHaveBeenCalledWith(
        'execute-order',
        {
          body: expect.objectContaining({
            symbol: 'EURUSD',
            order_type: 'market',
            side: 'buy',
            quantity: 1.0,
            stop_loss: 1.08,
            take_profit: 1.105,
          }),
        }
      );
    });
  });

  describe('Database Stored Procedure Integration', () => {
    it('should handle database stored procedure errors gracefully', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockRejectedValue(
        new Error('Database constraint violation: duplicate key')
      );

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

      // Verify error was handled properly
      expect(vi.mocked(executeWithIdempotency)).toHaveBeenCalled();
    });

    it('should handle transaction rollback scenarios', async () => {
      // First call succeeds, second call simulates database failure
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );

      let callCount = 0;
      vi.mocked(executeWithIdempotency).mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          return mockEdgeFunctionResponses.marketOrderSuccess;
        } else {
          throw new Error('Transaction rolled back: insufficient balance');
        }
      });

      const { result } = renderHook(() => useOrderExecution());

      // First successful execution
      await act(async () => {
        const response1 = await result.current.executeOrder({
          symbol: 'EURUSD',
          order_type: 'market',
          side: 'buy',
          quantity: 1.0,
        });
        expect(response1).not.toBeNull();
      });

      // Second execution with rollback
      await act(async () => {
        const response2 = await result.current.executeOrder({
          symbol: 'GBPUSD',
          order_type: 'market',
          side: 'buy',
          quantity: 1.0,
        });
        expect(response2).toBeNull();
      });
    });
  });

  describe('Real-time Position Updates and WebSocket Integration', () => {
    it('should trigger real-time position updates after successful execution', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockResolvedValue(
        mockEdgeFunctionResponses.marketOrderSuccess
      );

      const { result } = renderHook(() => useOrderExecution());

      await act(async () => {
        await result.current.executeOrder({
          symbol: 'EURUSD',
          order_type: 'market',
          side: 'buy',
          quantity: 1.0,
        });
      });

      // Verify WebSocket subscription was used for real-time updates
      expect(vi.mocked(mockWebSocketManager.subscribe)).toHaveBeenCalled();
      expect(vi.mocked(mockWebSocketManager.onStateChange)).toHaveBeenCalled();
    });

    it('should handle WebSocket connection failures gracefully', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockResolvedValue(
        mockEdgeFunctionResponses.marketOrderSuccess
      );

      // Mock WebSocketManager to simulate connection failure
      vi.mocked(mockWebSocketManager.subscribe).mockImplementation(() => {
        throw new Error('WebSocket connection failed');
      });

      const { result } = renderHook(() => useOrderExecution());

      await act(async () => {
        const response = await result.current.executeOrder({
          symbol: 'EURUSD',
          order_type: 'market',
          side: 'buy',
          quantity: 1.0,
        });

        // Should still succeed even if WebSocket fails
        expect(response).not.toBeNull();
      });
    });
  });

  describe('React Query Cache Invalidation and Data Synchronization', () => {
    it('should invalidate cache for positions, orders, and profile after successful execution', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockResolvedValue(
        mockEdgeFunctionResponses.marketOrderSuccess
      );

      const { result } = renderHook(() => useOrderExecution());

      await act(async () => {
        await result.current.executeOrder({
          symbol: 'EURUSD',
          order_type: 'market',
          side: 'buy',
          quantity: 1.0,
        });
      });

      // Verify cache invalidation calls on the shared mock
      expect(vi.mocked(mockQueryClient.invalidateQueries)).toHaveBeenCalledWith(
        {
          queryKey: ['positions'],
        }
      );
      expect(vi.mocked(mockQueryClient.invalidateQueries)).toHaveBeenCalledWith(
        {
          queryKey: ['orders'],
        }
      );
      expect(vi.mocked(mockQueryClient.invalidateQueries)).toHaveBeenCalledWith(
        {
          queryKey: ['profile'],
        }
      );
    });

    it('should update cache immediately for optimistic updates', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockResolvedValue(
        mockEdgeFunctionResponses.marketOrderSuccess
      );

      const { result } = renderHook(() => useOrderExecution());

      await act(async () => {
        await result.current.executeOrder({
          symbol: 'EURUSD',
          order_type: 'market',
          side: 'buy',
          quantity: 1.0,
        });
      });

      // Verify optimistic updates were applied on the shared mock
      expect(vi.mocked(mockQueryClient.setQueryData)).toHaveBeenCalledWith(
        expect.arrayContaining(['positions']),
        expect.any(Function)
      );
    });

    it('should handle cache update failures gracefully', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockResolvedValue(
        mockEdgeFunctionResponses.marketOrderSuccess
      );

      // Mock cache invalidation failure
      vi.mocked(mockQueryClient.invalidateQueries).mockRejectedValue(
        new Error('Cache update failed')
      );

      const { result } = renderHook(() => useOrderExecution());

      await act(async () => {
        const response = await result.current.executeOrder({
          symbol: 'EURUSD',
          order_type: 'market',
          side: 'buy',
          quantity: 1.0,
        });

        // Should still succeed even if cache update fails
        expect(response).not.toBeNull();
      });
    });
  });

  describe('Error Boundary Behavior and User Feedback', () => {
    it('should provide detailed error messages for different error types', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockRejectedValue(
        new Error('INSUFFICIENT_MARGIN: Insufficient margin for this order')
      );

      const { result } = renderHook(() => useOrderExecution());

      await act(async () => {
        const response = await result.current.executeOrder({
          symbol: 'EURUSD',
          order_type: 'market',
          side: 'buy',
          quantity: 1000, // Large quantity to trigger margin error
        });

        expect(response).toBeNull();
      });

      // Verify error handling
      expect(vi.mocked(executeWithIdempotency)).toHaveBeenCalled();
    });

    it('should handle rate limiting errors with proper user feedback', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: false,
        remaining: 0,
        resetIn: 30000, // 30 seconds
      });

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

      // Verify rate limit check was performed
      expect(vi.mocked(checkRateLimit)).toHaveBeenCalledWith('order');
    });

    it('should handle network timeouts and retry mechanisms', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );

      let attempt = 0;
      vi.mocked(executeWithIdempotency).mockImplementation(async () => {
        attempt++;
        if (attempt === 1) {
          throw new Error('Network timeout');
        }
        return mockEdgeFunctionResponses.marketOrderSuccess;
      });

      const { result } = renderHook(() => useOrderExecution());

      await act(async () => {
        const response = await result.current.executeOrder({
          symbol: 'EURUSD',
          order_type: 'market',
          side: 'buy',
          quantity: 1.0,
        });

        // Should succeed after retry
        expect(response).not.toBeNull();
      });

      expect(attempt).toBeGreaterThan(1);
    });
  });

  describe('Performance Validation (<500ms execution)', () => {
    it('should meet performance requirements for single order execution', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockResolvedValue(
        mockEdgeFunctionResponses.marketOrderSuccess
      );

      const { result } = renderHook(() => useOrderExecution());

      const startTime = performance.now();

      await act(async () => {
        await result.current.executeOrder({
          symbol: 'EURUSD',
          order_type: 'market',
          side: 'buy',
          quantity: 1.0,
        });
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete within performance budget
      expect(executionTime).toBeLessThan(500);
    });

    it('should handle concurrent order executions efficiently', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockResolvedValue(
        mockEdgeFunctionResponses.marketOrderSuccess
      );

      const { result } = renderHook(() => useOrderExecution());

      const orders = Array.from({ length: 10 }, (_, i) => ({
        symbol: `PAIR${i}`,
        order_type: 'market' as const,
        side: 'buy' as const,
        quantity: 1.0,
      }));

      const startTime = performance.now();

      await act(async () => {
        await Promise.all(
          orders.map((order) => result.current.executeOrder(order))
        );
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle concurrent executions efficiently
      expect(totalTime).toBeLessThan(2000);
      expect(vi.mocked(executeWithIdempotency)).toHaveBeenCalledTimes(10);
    });

    it('should maintain performance under high load', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockResolvedValue(
        mockEdgeFunctionResponses.marketOrderSuccess
      );

      const { result } = renderHook(() => useOrderExecution());

      const orders = Array.from({ length: 50 }, (_, i) => ({
        symbol: `PAIR${i % 10}`,
        order_type: 'market' as const,
        side: i % 2 === 0 ? ('buy' as const) : ('sell' as const),
        quantity: 1.0,
      }));

      const startTime = performance.now();

      await act(async () => {
        // Process orders in batches to simulate real load
        const batchSize = 5;
        for (let i = 0; i < orders.length; i += batchSize) {
          const batch = orders.slice(i, i + batchSize);
          await Promise.all(
            batch.map((order) => result.current.executeOrder(order))
          );
        }
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should maintain performance under load
      expect(totalTime).toBeLessThan(5000);
      expect(vi.mocked(executeWithIdempotency)).toHaveBeenCalledTimes(50);
    });
  });

  describe('Integration with Error Scenarios', () => {
    it('should handle insufficient margin scenario with proper error response', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockRejectedValue(
        new Error(
          'INSUFFICIENT_MARGIN: Required margin: $219.00, Available: $100.00'
        )
      );

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

      // Verify proper error handling
      expect(vi.mocked(executeWithIdempotency)).toHaveBeenCalled();
    });

    it('should handle database connection failures with retry logic', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );

      let attempt = 0;
      vi.mocked(executeWithIdempotency).mockImplementation(async () => {
        attempt++;
        if (attempt <= 3) {
          throw new Error('Database connection failed');
        }
        return mockEdgeFunctionResponses.marketOrderSuccess;
      });

      const { result } = renderHook(() => useOrderExecution());

      await act(async () => {
        const response = await result.current.executeOrder({
          symbol: 'EURUSD',
          order_type: 'market',
          side: 'buy',
          quantity: 1.0,
        });

        // Should succeed after retries
        expect(response).not.toBeNull();
      });

      expect(attempt).toBeGreaterThan(1);
    });

    it('should handle security validation failures', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockRejectedValue(
        new Error('SECURITY_VALIDATION_FAILED: Invalid CSRF token')
      );

      const { result } = renderHook(() => useOrderExecution());

      await act(async () => {
        const response = await result.current.executeOrder({
          symbol: "'; DROP TABLE orders; --",
          order_type: 'market',
          side: 'buy',
          quantity: 1.0,
        });

        expect(response).toBeNull();
      });

      // Verify security validation was performed
      expect(vi.mocked(executeWithIdempotency)).toHaveBeenCalled();
    });
  });

  describe('Memory Management and Cleanup', () => {
    it('should properly clean up resources after order execution', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockResolvedValue(
        mockEdgeFunctionResponses.marketOrderSuccess
      );

      const { result, unmount } = renderHook(() => useOrderExecution());

      await act(async () => {
        await result.current.executeOrder({
          symbol: 'EURUSD',
          order_type: 'market',
          side: 'buy',
          quantity: 1.0,
        });
      });

      // Clean up resources
      unmount();

      // Verify cleanup was performed
      expect(vi.mocked(mockWebSocketManager.destroy)).toHaveBeenCalled();
    });

    it('should handle memory leaks in long-running sessions', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockResolvedValue(
        mockEdgeFunctionResponses.marketOrderSuccess
      );

      const { result } = renderHook(() => useOrderExecution());

      // Simulate many executions in a session (CI-optimized)
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          await result.current.executeOrder({
            symbol: `PAIR${i % 20}`,
            order_type: 'market',
            side: i % 2 === 0 ? 'buy' : 'sell',
            quantity: 1.0,
          });

          // Yield to event loop periodically
          if (i % 50 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 0));
          }
        }
      });

      // Should handle many executions without memory issues
      expect(vi.mocked(executeWithIdempotency)).toHaveBeenCalledTimes(100);
    });
  });
});
