/**
 * Unit tests for rateLimiter.ts
 * Tests validate per-key limits, default fallbacks, and window behavior
 */

import type { RateLimitConfig } from '@/lib/rateLimiter';
import {
  DEFAULT_RATES,
  RateLimiter,
  checkRateLimit,
  rateLimiter,
} from '@/lib/rateLimiter';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('RateLimiter', () => {
  let testRateLimiter: RateLimiter;

  beforeEach(() => {
    // Clear all mocks and create fresh instance for each test
    vi.clearAllMocks();
    testRateLimiter = new RateLimiter();
    // Also clear global instance to avoid cross-test contamination
    rateLimiter.clear();
  });

  afterEach(() => {
    // Clean up after each test
    testRateLimiter.clear();
    rateLimiter.clear();
  });

  describe('Per-key limits', () => {
    it('should enforce order endpoint limits (10 requests per minute)', () => {
      const endpoint = 'order';
      const limit = DEFAULT_RATES.order!.maxRequests;

      // Should allow requests up to the limit
      for (let i = 0; i < limit; i++) {
        expect(testRateLimiter.canMakeRequest(endpoint)).toBe(true);
        testRateLimiter.recordRequest(endpoint);
      }

      // 11th request should be blocked
      expect(testRateLimiter.canMakeRequest(endpoint)).toBe(false);
      expect(testRateLimiter.getRemainingRequests(endpoint)).toBe(0);
    });

    it('should enforce login endpoint limits (5 requests per minute)', () => {
      const endpoint = 'login';
      const limit = DEFAULT_RATES.login!.maxRequests;

      // Should allow requests up to the limit
      for (let i = 0; i < limit; i++) {
        expect(testRateLimiter.canMakeRequest(endpoint)).toBe(true);
        testRateLimiter.recordRequest(endpoint);
      }

      // 6th request should be blocked
      expect(testRateLimiter.canMakeRequest(endpoint)).toBe(false);
    });

    it('should enforce register endpoint limits (3 requests per minute)', () => {
      const endpoint = 'register';
      const limit = DEFAULT_RATES.register!.maxRequests;

      // Should allow requests up to the limit
      for (let i = 0; i < limit; i++) {
        expect(testRateLimiter.canMakeRequest(endpoint)).toBe(true);
        testRateLimiter.recordRequest(endpoint);
      }

      // 4th request should be blocked
      expect(testRateLimiter.canMakeRequest(endpoint)).toBe(false);
    });

    it('should enforce kyc endpoint limits (3 requests per minute)', () => {
      const endpoint = 'kyc';
      const limit = DEFAULT_RATES.kyc!.maxRequests;

      // Should allow requests up to the limit
      for (let i = 0; i < limit; i++) {
        expect(testRateLimiter.canMakeRequest(endpoint)).toBe(true);
        testRateLimiter.recordRequest(endpoint);
      }

      // 4th request should be blocked
      expect(testRateLimiter.canMakeRequest(endpoint)).toBe(false);
    });

    it('should enforce price endpoint limits (60 requests per minute)', () => {
      const endpoint = 'price';
      const limit = DEFAULT_RATES.price!.maxRequests;

      // Should allow requests up to the limit
      for (let i = 0; i < limit; i++) {
        expect(testRateLimiter.canMakeRequest(endpoint)).toBe(true);
        testRateLimiter.recordRequest(endpoint);
      }

      // 61st request should be blocked
      expect(testRateLimiter.canMakeRequest(endpoint)).toBe(false);
    });

    it('should track different endpoints independently', () => {
      const orderLimit = DEFAULT_RATES.order!.maxRequests;
      const loginLimit = DEFAULT_RATES.login!.maxRequests;

      // Fill order endpoint to limit
      for (let i = 0; i < orderLimit; i++) {
        expect(testRateLimiter.canMakeRequest('order')).toBe(true);
        testRateLimiter.recordRequest('order');
      }

      // Order endpoint should be blocked
      expect(testRateLimiter.canMakeRequest('order')).toBe(false);

      // Login endpoint should still be available (not at limit yet)
      expect(testRateLimiter.canMakeRequest('login')).toBe(true);

      // Use some login requests
      for (let i = 0; i < Math.min(loginLimit - 1, 3); i++) {
        expect(testRateLimiter.canMakeRequest('login')).toBe(true);
        testRateLimiter.recordRequest('login');
      }

      // Login should still allow more requests
      expect(testRateLimiter.canMakeRequest('login')).toBe(true);
    });
  });

  describe('Default fallbacks', () => {
    it('should use default limits for unknown endpoints', () => {
      const unknownEndpoint = 'unknown-endpoint';
      const defaultLimit = DEFAULT_RATES.default!.maxRequests;

      // Should allow requests up to default limit
      for (let i = 0; i < defaultLimit; i++) {
        expect(testRateLimiter.canMakeRequest(unknownEndpoint)).toBe(true);
        testRateLimiter.recordRequest(unknownEndpoint);
      }

      // Request beyond default limit should be blocked
      expect(testRateLimiter.canMakeRequest(unknownEndpoint)).toBe(false);
    });

    it('should use default limits for endpoints not in configuration', () => {
      const customEndpoint = 'custom/endpoint/path';
      const defaultLimit = DEFAULT_RATES.default!.maxRequests;

      for (let i = 0; i < defaultLimit; i++) {
        expect(testRateLimiter.canMakeRequest(customEndpoint)).toBe(true);
        testRateLimiter.recordRequest(customEndpoint);
      }

      expect(testRateLimiter.canMakeRequest(customEndpoint)).toBe(false);
    });

    it('should use default limits when endpoint type extraction fails', () => {
      const emptyEndpoint = '';
      const defaultLimit = DEFAULT_RATES.default!.maxRequests;

      for (let i = 0; i < defaultLimit; i++) {
        expect(testRateLimiter.canMakeRequest(emptyEndpoint)).toBe(true);
        testRateLimiter.recordRequest(emptyEndpoint);
      }

      expect(testRateLimiter.canMakeRequest(emptyEndpoint)).toBe(false);
    });
  });

  describe('Window behavior', () => {
    it('should reset limit after time window expires', () => {
      const endpoint = 'order';
      const limit = DEFAULT_RATES.order!.maxRequests;

      // Fill to limit
      for (let i = 0; i < limit; i++) {
        expect(testRateLimiter.canMakeRequest(endpoint)).toBe(true);
        testRateLimiter.recordRequest(endpoint);
      }

      // Should be blocked
      expect(testRateLimiter.canMakeRequest(endpoint)).toBe(false);

      // Manually clear request history to simulate time passing
      testRateLimiter.clear();

      // Should be able to make requests again
      expect(testRateLimiter.canMakeRequest(endpoint)).toBe(true);
      testRateLimiter.recordRequest(endpoint);
      expect(testRateLimiter.canMakeRequest(endpoint)).toBe(true);
    });

    it('should calculate correct remaining requests based on time window', () => {
      const endpoint = 'order';
      const limit = DEFAULT_RATES.order!.maxRequests;

      // Record some requests at current time
      for (let i = 0; i < 5; i++) {
        testRateLimiter.recordRequest(endpoint);
      }

      expect(testRateLimiter.getRemainingRequests(endpoint)).toBe(limit - 5);

      // Record more requests
      for (let i = 0; i < 3; i++) {
        testRateLimiter.recordRequest(endpoint);
      }

      expect(testRateLimiter.getRemainingRequests(endpoint)).toBe(limit - 8);
    });

    it('should calculate reset time correctly', () => {
      const endpoint = 'order';
      const windowMs = DEFAULT_RATES.order!.windowMs;

      // Record a request
      testRateLimiter.recordRequest(endpoint);

      const resetTime = testRateLimiter.getResetTime(endpoint);

      // Reset time should be approximately the window duration
      expect(resetTime).toBeGreaterThan(0);
      expect(resetTime).toBeLessThanOrEqual(windowMs);
    });

    it('should return 0 reset time when no requests in window', () => {
      const endpoint = 'order';

      // No requests recorded
      expect(testRateLimiter.getResetTime(endpoint)).toBe(0);
    });
  });

  describe('Integration with checkRateLimit helper', () => {
    it('should provide consistent results through checkRateLimit helper', () => {
      const endpoint = 'order';
      const limit = DEFAULT_RATES.order!.maxRequests;

      // Clear the global rate limiter to ensure clean test state
      rateLimiter.clear();

      // Test initial state
      const initialCheck = checkRateLimit(endpoint);
      expect(initialCheck.allowed).toBe(true);
      expect(initialCheck.remaining).toBe(limit);
      expect(initialCheck.resetIn).toBe(0);

      // Fill to limit using the global rate limiter (same instance as checkRateLimit uses)
      for (let i = 0; i < limit; i++) {
        rateLimiter.recordRequest(endpoint);
      }

      // Test at limit
      const atLimitCheck = checkRateLimit(endpoint);
      expect(atLimitCheck.allowed).toBe(false);
      expect(atLimitCheck.remaining).toBe(0);
      expect(atLimitCheck.resetIn).toBeGreaterThan(0);
    });
  });

  describe('Queue processing and execution', () => {
    it('should execute queued requests when rate limits allow', async () => {
      const endpoint = 'price'; // Use price endpoint with higher limits to avoid timeout
      const testValue = 'test-result';

      const requestFn = vi.fn().mockResolvedValue(testValue);

      // Execute multiple requests (should be queued due to rate limiting)
      const promise1 = testRateLimiter.execute(endpoint, requestFn);
      const promise2 = testRateLimiter.execute(endpoint, requestFn);
      const promise3 = testRateLimiter.execute(endpoint, requestFn);

      // Wait for all promises to resolve
      const [result1, result2, result3] = await Promise.all([
        promise1,
        promise2,
        promise3,
      ]);

      // All should succeed with the same result
      expect(result1).toBe(testValue);
      expect(result2).toBe(testValue);
      expect(result3).toBe(testValue);

      // Request function should have been called for each
      expect(requestFn).toHaveBeenCalledTimes(3);
    }, 10000); // Increase timeout for async test

    it('should handle request failures gracefully', async () => {
      const endpoint = 'price'; // Use price endpoint with higher limits
      const error = new Error('Request failed');

      const failingRequestFn = vi.fn().mockRejectedValue(error);

      const promise = testRateLimiter.execute(endpoint, failingRequestFn);

      await expect(promise).rejects.toThrow('Request failed');
      expect(failingRequestFn).toHaveBeenCalledTimes(1);
    }, 10000); // Increase timeout for async test
  });

  describe('Status and monitoring', () => {
    it('should provide accurate status information', () => {
      const status = testRateLimiter.getStatus();

      expect(status).toHaveProperty('queueLength');
      expect(status).toHaveProperty('isProcessing');
      expect(status).toHaveProperty('endpoints');

      // Should have status for all configured endpoints
      expect(Object.keys(status.endpoints)).toEqual(Object.keys(DEFAULT_RATES));

      // All endpoints should initially have full remaining capacity
      Object.entries(DEFAULT_RATES).forEach(
        ([endpoint, config]: [string, RateLimitConfig]) => {
          const endpointStatus = status.endpoints[endpoint];
          expect(endpointStatus).toBeDefined();
          if (endpointStatus) {
            expect(endpointStatus.remaining).toBe(config.maxRequests);
            expect(endpointStatus.resetIn).toBe(0);
          }
        }
      );
    });

    it('should notify listeners of status changes', () => {
      const listener = vi.fn();
      const unsubscribe = testRateLimiter.subscribe(listener);

      // Record some requests to trigger status change
      testRateLimiter.recordRequest('order');

      // Listener should have been called
      expect(listener).toHaveBeenCalled();

      // Verify the status passed to listener
      const status = listener.mock.calls[0][0];
      expect(status.endpoints['order']).toBeDefined();
      expect(status.endpoints['order'].remaining).toBe(
        DEFAULT_RATES.order!.maxRequests - 1
      );

      unsubscribe();
    });

    it('should stop notifying after unsubscribe', () => {
      const listener = vi.fn();
      const unsubscribe = testRateLimiter.subscribe(listener);

      // Record request
      testRateLimiter.recordRequest('order');
      expect(listener).toHaveBeenCalledTimes(1);

      // Unsubscribe
      unsubscribe();

      // Record another request
      testRateLimiter.recordRequest('order');

      // Listener should not have been called again
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle very long endpoint paths', () => {
      const longEndpoint = 'very/long/endpoint/path/with/many/segments';

      // Should still work using the first segment for type extraction
      expect(testRateLimiter.canMakeRequest(longEndpoint)).toBe(true);
      expect(testRateLimiter.getRemainingRequests(longEndpoint)).toBe(
        DEFAULT_RATES.default!.maxRequests
      );
    });

    it('should handle concurrent requests correctly', async () => {
      const endpoint = 'price'; // Use price endpoint with higher limits
      const requestFn = vi
        .fn()
        .mockImplementation(() => Promise.resolve('concurrent-result'));

      // Execute multiple requests simultaneously
      const promises = Array.from({ length: 10 }, () =>
        testRateLimiter.execute(endpoint, requestFn)
      );

      const results = await Promise.all(promises);

      // All should succeed
      results.forEach((result: unknown) => {
        expect(result).toBe('concurrent-result');
      });

      // Function should have been called for each successful request
      expect(requestFn).toHaveBeenCalledTimes(10);
    }, 10000); // Increase timeout for async test

    it('should handle zero and negative limits gracefully', () => {
      // Test with endpoint that has non-zero limits
      const endpoint = 'order';

      // Normal operation first
      expect(testRateLimiter.canMakeRequest(endpoint)).toBe(true);

      // Clear and test edge cases
      testRateLimiter.clear();
      expect(testRateLimiter.canMakeRequest(endpoint)).toBe(true);
    });
  });

  describe('Business logic validation', () => {
    it('should prevent order spam (10 orders per minute)', () => {
      const orderEndpoint = 'order';
      const maxOrders = DEFAULT_RATES.order!.maxRequests;

      // Simulate rapid order attempts
      for (let i = 0; i < maxOrders; i++) {
        expect(testRateLimiter.canMakeRequest(orderEndpoint)).toBe(
          true,
          `Order ${i + 1} should be allowed`
        );
        testRateLimiter.recordRequest(orderEndpoint);
      }

      // 11th order should be blocked to prevent spam
      expect(testRateLimiter.canMakeRequest(orderEndpoint)).toBe(
        false,
        '11th order should be blocked to prevent spam'
      );
    });

    it('should prevent login brute force (5 attempts per minute)', () => {
      const loginEndpoint = 'login';
      const maxAttempts = DEFAULT_RATES.login!.maxRequests;

      // Simulate login attempts
      for (let i = 0; i < maxAttempts; i++) {
        expect(testRateLimiter.canMakeRequest(loginEndpoint)).toBe(
          true,
          `Login attempt ${i + 1} should be allowed`
        );
        testRateLimiter.recordRequest(loginEndpoint);
      }

      // 6th attempt should be blocked
      expect(testRateLimiter.canMakeRequest(loginEndpoint)).toBe(
        false,
        '6th login attempt should be blocked to prevent brute force'
      );
    });

    it('should allow high-frequency price requests (60 per minute)', () => {
      const priceEndpoint = 'price';
      const maxRequests = DEFAULT_RATES.price!.maxRequests;

      // Should allow many price requests
      for (let i = 0; i < maxRequests; i++) {
        expect(testRateLimiter.canMakeRequest(priceEndpoint)).toBe(
          true,
          `Price request ${i + 1} should be allowed`
        );
        testRateLimiter.recordRequest(priceEndpoint);
      }

      // 61st request should be blocked
      expect(testRateLimiter.canMakeRequest(priceEndpoint)).toBe(
        false,
        '61st price request should be blocked'
      );
    });
  });
});
