/**
 * Hook: useDebouncedValue
 * 
 * Returns a debounced version of a value that only updates after a delay
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Debounces a value - useful for search inputs, price displays, etc.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttles a value - useful for real-time price updates
 */
export function useThrottledValue<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdate = useRef<number>(0);
  const pendingValue = useRef<T>(value);

  useEffect(() => {
    pendingValue.current = value;
    const now = Date.now();

    if (now - lastUpdate.current >= limit) {
      setThrottledValue(value);
      lastUpdate.current = now;
    } else {
      const timer = setTimeout(() => {
        setThrottledValue(pendingValue.current);
        lastUpdate.current = Date.now();
      }, limit - (now - lastUpdate.current));

      return () => clearTimeout(timer);
    }
  }, [value, limit]);

  return throttledValue;
}

/**
 * Creates a debounced callback
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Creates a throttled callback
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number
): T {
  const lastRan = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRan.current >= limit) {
        callbackRef.current(...args);
        lastRan.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          callbackRef.current(...args);
          lastRan.current = Date.now();
        }, limit - (now - lastRan.current));
      }
    },
    [limit]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

/**
 * RAF-throttled callback for smooth animations
 */
export function useRAFCallback<T extends (...args: unknown[]) => unknown>(
  callback: T
): T {
  const rafRef = useRef<number | null>(null);
  const argsRef = useRef<Parameters<T> | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const rafCallback = useCallback(
    (...args: Parameters<T>) => {
      argsRef.current = args;
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          if (argsRef.current) {
            callbackRef.current(...argsRef.current);
          }
          rafRef.current = null;
        });
      }
    },
    []
  ) as T;

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return rafCallback;
}

export default useDebouncedValue;
