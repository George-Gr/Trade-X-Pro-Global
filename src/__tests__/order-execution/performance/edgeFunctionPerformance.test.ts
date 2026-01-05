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
};

/**
 * Performance test suite for edge function integration
 * These tests are designed to run outside of standard CI
 * and should be executed manually or in performance-focused environments
 */

const { executeWithIdempotency } = await import('@/lib/idempotency');
const { checkRateLimit, rateLimiter } = await import('@/lib/rateLimiter');

describe('Edge Function Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Initialize the shared mockQueryClient instance
    mockQueryClient = {
      invalidateQueries: vi.fn(),
      refetchQueries: vi.fn(),
      setQueryData: vi.fn(),
    };
  });

  describe('High-Iteration Performance', () => {
    it('should handle 1000+ order executions efficiently', async () => {
      // Skip this test in standard CI environments
      if (process.env.CI && !process.env.RUN_PERFORMANCE_TESTS) {
        return;
      }

      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 999,
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

      // Simulate high-volume trading session
      await act(async () => {
        for (let i = 0; i < 1000; i++) {
          await result.current.executeOrder({
            symbol: `PAIR${i % 50}`,
            order_type: 'market',
            side: i % 2 === 0 ? 'buy' : 'sell',
            quantity: 1.0,
          });

          // Force garbage collection periodically if available
          if (i % 100 === 0 && global.gc) {
            global.gc();
          }
        }
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Verify all executions were processed
      expect(vi.mocked(executeWithIdempotency)).toHaveBeenCalledTimes(1000);

      // Performance assertion: should complete within reasonable time
      // In a real environment, this would be much faster than the mocked version
      expect(executionTime).toBeLessThan(30000); // 30 seconds threshold
    });

    it('should handle 5000 order executions with memory management', async () => {
      // Skip this test in standard CI environments
      if (process.env.CI && !process.env.RUN_PERFORMANCE_TESTS) {
        return;
      }

      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 4999,
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

      // Simulate very high-volume trading session
      await act(async () => {
        for (let i = 0; i < 5000; i++) {
          await result.current.executeOrder({
            symbol: `PAIR${i % 100}`,
            order_type: 'market',
            side: i % 2 === 0 ? 'buy' : 'sell',
            quantity: 1.0,
          });

          // Force garbage collection periodically if available
          if (i % 500 === 0 && global.gc) {
            global.gc();
          }
        }
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Verify all executions were processed
      expect(vi.mocked(executeWithIdempotency)).toHaveBeenCalledTimes(5000);

      // Performance assertion: should complete within reasonable time
      expect(executionTime).toBeLessThan(120000); // 2 minutes threshold
    });

    it('should handle concurrent high-volume order execution', async () => {
      // Skip this test in standard CI environments
      if (process.env.CI && !process.env.RUN_PERFORMANCE_TESTS) {
        return;
      }

      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 999,
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

      // Simulate concurrent high-volume execution
      await act(async () => {
        const promises = [];
        for (let i = 0; i < 100; i++) {
          promises.push(
            result.current.executeOrder({
              symbol: `PAIR${i % 20}`,
              order_type: 'market',
              side: i % 2 === 0 ? 'buy' : 'sell',
              quantity: 1.0,
            })
          );
        }
        await Promise.all(promises);
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Verify all executions were processed
      expect(vi.mocked(executeWithIdempotency)).toHaveBeenCalledTimes(100);

      // Performance assertion: concurrent execution should be faster
      expect(executionTime).toBeLessThan(10000); // 10 seconds threshold
    });
  });

  describe('Memory Usage Monitoring', () => {
    it('should not leak memory during extended sessions', async () => {
      // Skip this test in standard CI environments
      if (process.env.CI && !process.env.RUN_PERFORMANCE_TESTS) {
        return;
      }

      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 999,
        resetIn: 0,
      });
      vi.mocked(rateLimiter.execute).mockImplementation(
        async (_: unknown, fn: () => Promise<EdgeFunctionResponse>) => fn()
      );
      vi.mocked(executeWithIdempotency).mockResolvedValue(
        mockEdgeFunctionResponses.marketOrderSuccess
      );

      const { result, unmount } = renderHook(() => useOrderExecution());

      // Take initial memory snapshot if available
      let initialMemory = 0;
      if (global.gc) {
        global.gc();
        initialMemory = process.memoryUsage().heapUsed;
      }

      // Execute many orders
      await act(async () => {
        for (let i = 0; i < 1000; i++) {
          await result.current.executeOrder({
            symbol: `PAIR${i % 50}`,
            order_type: 'market',
            side: i % 2 === 0 ? 'buy' : 'sell',
            quantity: 1.0,
          });

          if (i % 100 === 0 && global.gc) {
            global.gc();
          }
        }
      });

      // Clean up
      unmount();

      // Force garbage collection and check memory
      if (global.gc) {
        global.gc();
        const finalMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = finalMemory - initialMemory;

        // Memory increase should be reasonable (less than 50MB)
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      }
    });
  });
});
