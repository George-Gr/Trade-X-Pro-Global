/**
 * Debounced Chart Update Hook
 * Provides debounced updates for chart data to improve performance
 */

import { useCallback, useRef, useEffect, useState } from 'react';

interface DebounceConfig {
  delay: number;
  maxWait?: number;
  leading?: boolean;
  trailing?: boolean;
}

export const useDebouncedChartUpdate = <T>(
  callback: (...args: T[]) => void,
  config: DebounceConfig = { delay: 300 }
) => {
  const { delay, maxWait = 0, leading = false, trailing = true } = config;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>();
  const maxTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>();
  const lastCallTimeRef = useRef<number>();
  const lastInvokeTimeRef = useRef<number>();
  const lastArgsRef = useRef<T[]>();
  const lastThisRef = useRef<unknown>();

  // Core functions - order matters due to dependencies
  const shouldInvoke = useCallback(
    (time: number) => {
      const timeSinceLastCall = time - (lastCallTimeRef.current || 0);
      const timeSinceLastInvoke = time - (lastInvokeTimeRef.current || 0);

      return (
        lastCallTimeRef.current === undefined ||
        timeSinceLastCall >= delay ||
        (maxWait > 0 && timeSinceLastInvoke >= maxWait)
      );
    },
    [delay, maxWait]
  );

  const invokeFunc = useCallback(
    (...args: T[]) => {
      const time = Date.now();
      lastInvokeTimeRef.current = time;
      return callback(...args);
    },
    [callback]
  );

  const getRemainingWait = useCallback(
    (time: number) => {
      const timeSinceLastCall = time - (lastCallTimeRef.current || 0);
      const timeSinceLastInvoke = time - (lastInvokeTimeRef.current || 0);

      const timeWaiting =
        maxWait > 0
          ? Math.min(maxWait - timeSinceLastInvoke, delay - timeSinceLastCall)
          : delay - timeSinceLastCall;

      return Math.max(timeWaiting, 0);
    },
    [maxWait, delay]
  );

  // Declare functions after their dependencies
  const trailingEdge = useCallback(
    (...args: T[]) => {
      timeoutRef.current = undefined;

      if (trailing && lastArgsRef.current) {
        return invokeFunc(...args);
      }
      lastArgsRef.current = undefined;
      lastThisRef.current = undefined;
      return undefined;
    },
    [trailing, invokeFunc]
  );

  const timerExpired = useCallback(
    (...args: T[]) => {
      const time = Date.now();
      if (shouldInvoke(time)) {
        return trailingEdge(...args);
      }
      // Recompute after shouldInvoke check
    },
    [shouldInvoke, trailingEdge]
  );

  const startTimer = useCallback(
    (wait: number, ...args: T[]) => {
      timeoutRef.current = setTimeout(() => {
        const time = Date.now();
        if (shouldInvoke(time)) {
          trailingEdge(...args);
        }
      }, wait);
    },
    [shouldInvoke, trailingEdge]
  );

  const leadingEdge = useCallback(
    (...args: T[]) => {
      lastInvokeTimeRef.current = Date.now();
      timeoutRef.current = setTimeout(() => trailingEdge(...args), delay);
      return leading ? invokeFunc(...args) : undefined;
    },
    [delay, leading, invokeFunc, trailingEdge]
  );

  const debouncedCallback = useCallback(
    (...args: T[]) => {
      const time = Date.now();
      const isInvoking = shouldInvoke(time);

      lastArgsRef.current = args;
      lastThisRef.current = undefined;
      lastCallTimeRef.current = time;

      if (isInvoking) {
        if (timeoutRef.current === undefined) {
          return leadingEdge(...args);
        }
        if (maxWait > 0) {
          timeoutRef.current = setTimeout(() => trailingEdge(...args), delay);
          lastInvokeTimeRef.current = time;
          return invokeFunc(...args);
        }
      }

      if (timeoutRef.current === undefined) {
        timeoutRef.current = setTimeout(() => timerExpired(...args), delay);
      }

      if (maxWait > 0) {
        if (maxTimeoutRef.current === undefined) {
          maxTimeoutRef.current = setTimeout(() => {
            if (timeoutRef.current) {
              return trailingEdge(...args);
            }
          }, maxWait);
        }
      }

      return undefined;
    },
    [
      shouldInvoke,
      leadingEdge,
      timerExpired,
      delay,
      maxWait,
      invokeFunc,
      trailingEdge,
    ]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
    }

    timeoutRef.current = undefined;
    maxTimeoutRef.current = undefined;
    lastCallTimeRef.current = undefined;
    lastInvokeTimeRef.current = undefined;
    lastArgsRef.current = undefined;
    lastThisRef.current = undefined;
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      return trailingEdge(...(lastArgsRef.current || []));
    }
    return undefined;
  }, [trailingEdge]);

  const pending = useCallback(() => {
    return timeoutRef.current !== undefined;
  }, []);

  useEffect(() => {
    return cancel;
  }, [cancel]);

  return [debouncedCallback, cancel, flush, pending] as const;
};

/**
 * Hook for managing chart update batching
 */
export const useChartUpdateBatcher = (batchSize: number = 10) => {
  const updatesRef = useRef<unknown[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>();
  const callbackRef = useRef<((updates: unknown[]) => void) | null>(null);

  const setCallback = useCallback((callback: (updates: unknown[]) => void) => {
    callbackRef.current = callback;
  }, []);

  const flushUpdates = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }

    if (updatesRef.current.length > 0 && callbackRef.current) {
      const updates = [...updatesRef.current];
      updatesRef.current = [];
      callbackRef.current(updates);
    }
  }, []);

  const addUpdate = useCallback(
    (update: unknown) => {
      updatesRef.current.push(update);

      if (updatesRef.current.length >= batchSize) {
        flushUpdates();
      } else if (!timeoutRef.current) {
        // Batch updates within 16ms for 60fps
        timeoutRef.current = setTimeout(flushUpdates, 16);
      }
    },
    [batchSize, flushUpdates]
  );

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    updatesRef.current = [];
  }, []);

  return { setCallback, addUpdate, flushUpdates, clear };
};

/**
 * Hook for progressive chart loading
 */
export const useProgressiveChartLoading = (
  data: unknown[],
  chunkSize: number = 50,
  onLoadProgress?: (progress: number, loadedData: unknown[]) => void
) => {
  const [loadedData, setLoadedData] = useState<unknown[]>([]);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const chunkRef = useRef<unknown[]>([]);
  const indexRef = useRef(0);

  useEffect(() => {
    if (data.length === 0) {
      setLoadedData([]);
      setProgress(1);
      setIsComplete(true);
      return;
    }

    // Reset on data change
    chunkRef.current = [];
    indexRef.current = 0;
    setLoadedData([]);
    setProgress(0);
    setIsComplete(false);

    const loadNextChunk = () => {
      const endIndex = Math.min(indexRef.current + chunkSize, data.length);
      const chunk = data.slice(indexRef.current, endIndex);

      chunkRef.current = [...chunkRef.current, ...chunk];
      indexRef.current = endIndex;

      const newProgress = endIndex / data.length;
      setProgress(newProgress);
      setLoadedData([...chunkRef.current]);

      if (onLoadProgress) {
        onLoadProgress(newProgress, [...chunkRef.current]);
      }

      if (endIndex < data.length) {
        // Continue loading after 16ms for smooth 60fps
        setTimeout(loadNextChunk, 16);
      } else {
        setIsComplete(true);
      }
    };

    // Start loading
    loadNextChunk();
  }, [data, chunkSize, onLoadProgress]);

  return { loadedData, progress, isComplete };
};
