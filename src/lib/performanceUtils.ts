/**
 * Performance Utilities
 *
 * Debouncing, throttling, and memoization helpers for chart and real-time updates
 */

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };
}

/**
 * Creates a throttled function that only invokes func at most once per every limit milliseconds
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastFunc: ReturnType<typeof setTimeout> | null = null;
  let lastRan: number | null = null;

  return function throttled(...args: Parameters<T>) {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      if (lastFunc) {
        clearTimeout(lastFunc);
      }
      lastFunc = setTimeout(() => {
        if (lastRan !== null && Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - (lastRan || 0)));
    }
  };
}

/**
 * RAF (requestAnimationFrame) throttle for smooth 60fps updates
 */
export function rafThrottle<T extends (...args: unknown[]) => unknown>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  return function throttled(...args: Parameters<T>) {
    lastArgs = args;
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs) {
          func(...lastArgs);
        }
        rafId = null;
      });
    }
  };
}

/**
 * Creates a memoized function that caches results based on arguments
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  func: T,
  options: { maxSize?: number; ttl?: number } = {}
): T {
  const { maxSize = 100, ttl = 0 } = options;
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();

  return function memoized(...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    const now = Date.now();
    const cached = cache.get(key);

    if (cached && (ttl === 0 || now - cached.timestamp < ttl)) {
      return cached.value;
    }

    const result = func(...args) as ReturnType<T>;
    cache.set(key, { value: result, timestamp: now });

    // Evict oldest entries if cache is too large
    if (cache.size > maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }

    return result;
  } as T;
}

/**
 * Batch multiple function calls into a single execution.
 * Returns an object with the batched caller and cleanup methods.
 * **IMPORTANT**: Callers must invoke `cancel()` or `flush()` when components unmount or contexts end to prevent timer leaks.
 * @returns Object with `call` (batched function), `cancel` (discard pending batch), and `flush` (immediately process pending batch)
 */
export function batchCalls<T>(
  func: (items: T[]) => void,
  wait: number
): {
  call: (item: T) => void;
  cancel: () => void;
  flush: () => void;
} {
  let batch: T[] = [];
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const call = function batched(item: T) {
    batch.push(item);

    if (!timeoutId) {
      timeoutId = setTimeout(() => {
        const currentBatch = batch;
        batch = [];
        timeoutId = null;
        func(currentBatch);
      }, wait);
    }
  };

  const cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    batch = [];
  };

  const flush = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (batch.length > 0) {
      const currentBatch = batch;
      batch = [];
      func(currentBatch);
    }
  };

  return { call, cancel, flush };
}

/**
 * Creates a function that limits the rate of calls
 */
export function rateLimit<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
  windowMs: number
): (...args: Parameters<T>) => boolean {
  const calls: number[] = [];

  return function rateLimited(...args: Parameters<T>): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Remove old calls outside the window
    while (calls.length > 0 && (calls[0] ?? 0) < windowStart) {
      calls.shift();
    }

    // Check if under limit
    if (calls.length >= limit) {
      return false;
    }

    calls.push(now);
    func(...args);
    return true;
  };
}

/**
 * Deferred execution - useful for non-critical updates
 */
export function defer<T extends (...args: unknown[]) => unknown>(
  func: T,
  priority: 'high' | 'low' = 'low'
): (...args: Parameters<T>) => void {
  return function deferred(...args: Parameters<T>) {
    if (priority === 'high' && typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => func(...args), { timeout: 100 });
    } else {
      setTimeout(() => func(...args), 0);
    }
  };
}

/**
 * Deep comparison for objects - useful for memoization
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (typeof a !== 'object') return false;

  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);

  if (aKeys.length !== bKeys.length) return false;

  return aKeys.every((key) => deepEqual(aObj[key], bObj[key]));
}

/**
 * Shallow comparison for arrays - useful for dependency checks
 */
export function shallowEqualArrays<T>(a: T[], b: T[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}
