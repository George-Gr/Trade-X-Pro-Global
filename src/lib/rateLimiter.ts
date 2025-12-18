/**
 * Client-side rate limiting with request queue
 * Prevents DoS attacks, order spamming, and API cost overruns
 */

import { logger } from "./logger";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  retryAfterMs?: number;
}

interface RequestRecord {
  timestamp: number;
  endpoint: string;
}

interface QueuedRequest<T> {
  id: string;
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  priority: number;
  endpoint: string;
  timestamp: number;
}

// Default rate limits per endpoint type
const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  order: { maxRequests: 10, windowMs: 60000 }, // 10 orders per minute
  login: { maxRequests: 5, windowMs: 60000 }, // 5 login attempts per minute
  register: { maxRequests: 3, windowMs: 60000 }, // 3 registrations per minute
  price: { maxRequests: 60, windowMs: 60000 }, // 60 price requests per minute
  default: { maxRequests: 100, windowMs: 60000 }, // 100 requests per minute default
};

class RateLimiter {
  private requestHistory: RequestRecord[] = [];
  private requestQueue: QueuedRequest<unknown>[] = [];
  private isProcessing = false;
  private backoffMultiplier = 1;
  private maxBackoffMultiplier = 8;
  private listeners: Set<(status: RateLimitStatus) => void> = new Set();

  /**
   * Check if a request is allowed under rate limits
   */
  canMakeRequest(endpoint: string): boolean {
    const config = this.getConfig(endpoint);
    const now = Date.now();

    // Clean old requests outside the window
    this.requestHistory = this.requestHistory.filter(
      (r) => r.endpoint === endpoint && now - r.timestamp < config.windowMs,
    );

    const recentRequests = this.requestHistory.filter(
      (r) => r.endpoint === endpoint,
    );
    return recentRequests.length < config.maxRequests;
  }

  /**
   * Record a request
   */
  recordRequest(endpoint: string): void {
    this.requestHistory.push({
      timestamp: Date.now(),
      endpoint,
    });
    this.notifyListeners();
  }

  /**
   * Get remaining requests for an endpoint
   */
  getRemainingRequests(endpoint: string): number {
    const config = this.getConfig(endpoint);
    const now = Date.now();

    const recentRequests = this.requestHistory.filter(
      (r) => r.endpoint === endpoint && now - r.timestamp < config.windowMs,
    );

    return Math.max(0, config.maxRequests - recentRequests.length);
  }

  /**
   * Get time until rate limit resets
   */
  getResetTime(endpoint: string): number {
    const config = this.getConfig(endpoint);
    const now = Date.now();

    const endpointRequests = this.requestHistory.filter(
      (r) => r.endpoint === endpoint,
    );
    if (endpointRequests.length === 0) return 0;

    const oldestRequest = Math.min(...endpointRequests.map((r) => r.timestamp));
    const resetTime = oldestRequest + config.windowMs - now;

    return Math.max(0, resetTime);
  }

  /**
   * Execute a request with rate limiting and queuing
   */
  async execute<T>(
    endpoint: string,
    requestFn: () => Promise<T>,
    priority: number = 5,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = `${endpoint}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const queuedRequest: QueuedRequest<T> = {
        id,
        execute: requestFn,
        resolve: resolve as (value: unknown) => void,
        reject,
        priority,
        endpoint,
        timestamp: Date.now(),
      };

      // Add to queue sorted by priority (higher = more important)
      this.requestQueue.push(queuedRequest as QueuedRequest<unknown>);
      this.requestQueue.sort((a, b) => b.priority - a.priority);

      this.processQueue();
    });
  }

  /**
   * Process queued requests
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) return;

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue[0];

      if (!this.canMakeRequest(request.endpoint)) {
        const resetTime = this.getResetTime(request.endpoint);
        logger.warn(
          `Rate limit reached for ${request.endpoint}, waiting ${resetTime}ms`,
        );

        // Wait with progressive backoff
        const waitTime = Math.min(resetTime, 1000 * this.backoffMultiplier);
        await this.sleep(waitTime);
        this.backoffMultiplier = Math.min(
          this.backoffMultiplier * 2,
          this.maxBackoffMultiplier,
        );
        continue;
      }

      // Reset backoff on successful request allowance
      this.backoffMultiplier = 1;

      // Remove from queue
      this.requestQueue.shift();

      try {
        this.recordRequest(request.endpoint);
        const result = await request.execute();
        request.resolve(result);
      } catch (error) {
        // Apply backoff on failure
        this.backoffMultiplier = Math.min(
          this.backoffMultiplier * 2,
          this.maxBackoffMultiplier,
        );
        request.reject(
          error instanceof Error ? error : new Error(String(error)),
        );
      }

      // Small delay between requests
      await this.sleep(100);
    }

    this.isProcessing = false;
    this.notifyListeners();
  }

  /**
   * Get rate limit status
   */
  getStatus(): RateLimitStatus {
    return {
      queueLength: this.requestQueue.length,
      isProcessing: this.isProcessing,
      endpoints: Object.keys(DEFAULT_LIMITS).reduce(
        (acc, endpoint) => {
          acc[endpoint] = {
            remaining: this.getRemainingRequests(endpoint),
            resetIn: this.getResetTime(endpoint),
          };
          return acc;
        },
        {} as Record<string, { remaining: number; resetIn: number }>,
      ),
    };
  }

  /**
   * Subscribe to status changes
   */
  subscribe(listener: (status: RateLimitStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const status = this.getStatus();
    this.listeners.forEach((listener) => listener(status));
  }

  private getConfig(endpoint: string): RateLimitConfig {
    // Extract endpoint type from full endpoint path
    const endpointType = endpoint.split("/")[0] || endpoint;
    return DEFAULT_LIMITS[endpointType] || DEFAULT_LIMITS["default"];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Clear rate limit history (for testing)
   */
  clear(): void {
    this.requestHistory = [];
    this.requestQueue = [];
    this.isProcessing = false;
    this.backoffMultiplier = 1;
  }
}

export interface RateLimitStatus {
  queueLength: number;
  isProcessing: boolean;
  endpoints: Record<string, { remaining: number; resetIn: number }>;
}

// Singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Hook-friendly rate limit check
 */
export function checkRateLimit(endpoint: string): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
} {
  return {
    allowed: rateLimiter.canMakeRequest(endpoint),
    remaining: rateLimiter.getRemainingRequests(endpoint),
    resetIn: rateLimiter.getResetTime(endpoint),
  };
}

export default rateLimiter;
