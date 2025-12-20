import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  executeWithIdempotency,
  generateIdempotencyKey,
  getCompletedRequest,
  isRequestPending,
  markRequestCompleted,
  markRequestFailed,
  markRequestPending,
  stopCleanupInterval,
} from '../idempotency';

// Mock logger to prevent console noise during tests
vi.mock('../logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Idempotency Manager', () => {
  beforeEach(() => {
    // Clear internal maps by "expiring" everything or relying on module reset depending on implementation.
    // Since the module state is internal to the module scope, we can't easily reset it without
    // reloading the module or exposing a reset method.
    // For unit testing here, we'll use unique keys for each test to avoid collisions.
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('generateIdempotencyKey', () => {
    it('should generate consistent keys for same inputs', () => {
      // We need to mock Date.now so it's consistent
      const now = 1000000;
      vi.setSystemTime(now);
      const key2 = generateIdempotencyKey('user1', 'trade', { id: 1 });
      const key3 = generateIdempotencyKey('user1', 'trade', { id: 1 });

      expect(key2).toBe(key3);
    });

    it('should generate different keys for different params', () => {
      vi.setSystemTime(1000000);
      const key1 = generateIdempotencyKey('user1', 'trade', { id: 1 });
      const key2 = generateIdempotencyKey('user1', 'trade', { id: 2 });

      expect(key1).not.toBe(key2);
    });
  });

  describe('Request State Management', () => {
    it('should handle pending state correctly', () => {
      const key = 'test-pending-key';
      expect(isRequestPending(key)).toBe(false);

      markRequestPending(key, '/api/test');
      expect(isRequestPending(key)).toBe(true);
    });

    it('should handle completed state correctly', () => {
      const key = 'test-completed-key';
      const result = { success: true };

      markRequestPending(key, '/api/test');
      markRequestCompleted(key, result);

      expect(isRequestPending(key)).toBe(false);
      expect(getCompletedRequest(key)).toEqual(result);
    });

    it('should handle failed state correctly', () => {
      const key = 'test-failed-key';
      markRequestPending(key, '/api/test');
      markRequestFailed(key);

      // Should be removable/retryable after failure
      // (The implementation removes it after a timeout)
      expect(isRequestPending(key)).toBe(false); // status is 'failed', not 'pending'

      vi.advanceTimersByTime(1100); // Wait for cleanup timeout
      // After cleanup, it should be completely gone
      expect(isRequestPending(key)).toBe(false);
    });
  });

  describe('executeWithIdempotency', () => {
    it('should execute a fresh request', async () => {
      const key = 'exec-fresh-key';
      const mockFn = vi.fn().mockResolvedValue('success');

      const result = await executeWithIdempotency(key, '/api/exec', mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should return cached result for duplicate completed request', async () => {
      const key = 'exec-cached-key';
      const mockFn = vi.fn().mockResolvedValue('success');

      // First call
      await executeWithIdempotency(key, '/api/exec', mockFn);

      // Second call
      const result = await executeWithIdempotency(key, '/api/exec', mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1); // Still only called once
    });

    it('should block duplicate pending request', async () => {
      const key = 'exec-pending-key';

      // Start a long running request
      let finishRequest: (value: string) => void;
      const longRequest = new Promise<string>((resolve) => {
        finishRequest = resolve;
      });

      const promise1 = executeWithIdempotency(
        key,
        '/api/exec',
        () => longRequest
      );

      // Try to call again while pending
      await expect(
        executeWithIdempotency(key, '/api/exec', () => Promise.resolve('fail'))
      ).rejects.toThrow('Request is already being processed');

      finishRequest!('done');
      await promise1;
    });

    it('should retry after failure', async () => {
      const key = 'exec-fail-key';
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('First fail'))
        .mockResolvedValueOnce('Success retry');

      // First attempt fails
      await expect(
        executeWithIdempotency(key, '/api/exec', mockFn)
      ).rejects.toThrow('First fail');

      // Advance time to allow cleanup
      vi.advanceTimersByTime(1100);

      // Second attempt succeeds
      const result = await executeWithIdempotency(key, '/api/exec', mockFn);
      expect(result).toBe('Success retry');
    });
  });

  describe('Cleanup', () => {
    it('should allow stopping cleanup interval', () => {
      // This is hard to test black-box style, but we can verify it doesn't crash
      expect(() => stopCleanupInterval()).not.toThrow();
    });
  });
});
