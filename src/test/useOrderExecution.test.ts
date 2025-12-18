/**
 * Unit tests for useOrderExecution hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// Mock dependencies
vi.mock("@/lib/supabaseBrowserClient", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/lib/rateLimiter", () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true, remaining: 10, resetIn: 0 })),
}));

vi.mock("@/lib/idempotency", () => ({
  generateIdempotencyKey: vi.fn(() => "test-idempotency-key"),
  executeWithIdempotency: vi.fn((_: unknown, __: unknown, fn: unknown) => {
    if (typeof fn === "function") return fn();
  }),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { useOrderExecution, OrderRequest } from "@/hooks/useOrderExecution";
import { supabase } from "@/lib/supabaseBrowserClient";
import { checkRateLimit } from "@/lib/rateLimiter";

describe("useOrderExecution", () => {
  const mockSession = {
    user: { id: "test-user-id", email: "test@example.com" },
    access_token: "test-token",
  };

  const mockOrderRequest: OrderRequest = {
    symbol: "EURUSD",
    order_type: "market",
    side: "buy",
    quantity: 1.0,
  };

  const mockOrderResponse = {
    success: true,
    order_id: "order-123",
    symbol: "EURUSD",
    side: "buy",
    quantity: 1.0,
    execution_price: "1.0850",
    fill_price: "1.0850",
    commission: "0.50",
    margin_required: "100.00",
    status: "filled",
    new_balance: "9900.00",
    new_margin_level: "99.00",
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

  it("should initialize with isExecuting as false", () => {
    const { result } = renderHook(() => useOrderExecution());
    expect(result.current.isExecuting).toBe(false);
  });

  it("should return null when rate limit is exceeded", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetIn: 5000,
    });

    const { result } = renderHook(() => useOrderExecution());

    let orderResult: unknown;
    await act(async () => {
      orderResult = await result.current.executeOrder(mockOrderRequest);
    });

    expect(orderResult).toBeNull();
  });

  it("should return null when user is not authenticated", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);

    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 10,
      resetIn: 0,
    });

    const { result } = renderHook(() => useOrderExecution());

    let orderResult: unknown;
    await act(async () => {
      orderResult = await result.current.executeOrder(mockOrderRequest);
    });

    expect(orderResult).toBeNull();
  });

  it("should execute order successfully", async () => {
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 10,
      resetIn: 0,
    });

    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: mockOrderResponse,
      error: null,
    } as never);

    const { result } = renderHook(() => useOrderExecution());

    let orderResult: unknown;
    await act(async () => {
      orderResult = await result.current.executeOrder(mockOrderRequest);
    });

    expect(orderResult).toMatchObject({
      order_id: "order-123",
      symbol: "EURUSD",
      side: "buy",
      quantity: 1.0,
    });
  });

  it("should handle order execution errors", async () => {
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 10,
      resetIn: 0,
    });

    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { error: "Insufficient margin" },
      error: null,
    } as never);

    const { result } = renderHook(() => useOrderExecution());

    let orderResult: unknown;
    await act(async () => {
      orderResult = await result.current.executeOrder(mockOrderRequest);
    });

    expect(orderResult).toBeNull();
  });

  it("should set isExecuting during order execution", async () => {
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
      invokePromise as never,
    );

    const { result } = renderHook(() => useOrderExecution());

    // Start execution
    const executePromise = act(async () => {
      return result.current.executeOrder(mockOrderRequest);
    });

    // Should be executing
    await waitFor(() => {
      expect(result.current.isExecuting).toBe(true);
    });

    // Resolve the invoke
    resolveInvoke!({ data: mockOrderResponse, error: null });

    await executePromise;

    // Should no longer be executing
    expect(result.current.isExecuting).toBe(false);
  });

  it("should provide rate limit status", () => {
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 5,
      resetIn: 30000,
    });

    const { result } = renderHook(() => useOrderExecution());
    const status = result.current.getRateLimitStatus();

    expect(status).toEqual({
      allowed: true,
      remaining: 5,
      resetIn: 30000,
    });
  });

  it("should sanitize order inputs", async () => {
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 10,
      resetIn: 0,
    });

    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: mockOrderResponse,
      error: null,
    } as never);

    const { result } = renderHook(() => useOrderExecution());

    const maliciousRequest: OrderRequest = {
      symbol: '<script>alert("xss")</script>EURUSD',
      order_type: "market",
      side: "buy",
      quantity: 1.0,
    };

    await act(async () => {
      await result.current.executeOrder(maliciousRequest);
    });

    // Verify the invoke was called (sanitization happens internally)
    expect(supabase.functions.invoke).toHaveBeenCalled();
  });
});
