import { logger } from '@/lib/logger';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Performance monitoring hook to prevent extension host unresponsiveness
 * Tracks memory usage, event listeners, and cleanup issues
 */
export const usePerformanceMonitoring = () => {
  const listenersRef = useRef<Map<string, number>>(new Map());
  const timersRef = useRef<Map<string, number>>(new Map());
  const memoryRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Track event listeners to prevent leaks
  const trackListener = useCallback((type: string, add: boolean = true) => {
    const current = listenersRef.current.get(type) || 0;
    listenersRef.current.set(
      type,
      add ? current + 1 : Math.max(0, current - 1)
    );

    const totalListeners = Array.from(listenersRef.current.values()).reduce(
      (sum, count) => sum + count,
      0
    );

    if (totalListeners > 100) {
      logger.warn(
        `High listener count detected: ${totalListeners}. This may cause performance issues.`
      );

      // Log listener breakdown
      logger.debug('Listener breakdown', {
        metadata: Object.fromEntries(listenersRef.current),
      });
    }
  }, []);

  // Track timers to prevent leaks
  const trackTimer = useCallback((type: string, add: boolean = true) => {
    const current = timersRef.current.get(type) || 0;
    timersRef.current.set(type, add ? current + 1 : Math.max(0, current - 1));

    const totalTimers = Array.from(timersRef.current.values()).reduce(
      (sum, count) => sum + count,
      0
    );

    if (totalTimers > 50) {
      logger.warn(
        `High timer count detected: ${totalTimers}. This may cause performance issues.`
      );
    }
  }, []);

  // Monitor memory usage
  const monitorMemory = useCallback(() => {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (
        performance as Performance & {
          memory?: {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
          };
        }
      ).memory;

      if (!memory) return;

      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      const totalMB = memory.totalJSHeapSize / 1024 / 1024;
      const percentage = (usedMB / totalMB) * 100;

      if (percentage > 80) {
        logger.warn(
          `High memory usage detected: ${percentage.toFixed(
            1
          )}% (${usedMB.toFixed(1)}MB / ${totalMB.toFixed(1)}MB)`
        );
      }
    }
  }, []);

  // Cleanup all tracked resources
  const cleanupAll = useCallback(() => {
    // Clear all timers
    timersRef.current.clear();

    // Clear memory monitoring
    if (memoryRef.current) {
      clearInterval(memoryRef.current);
      memoryRef.current = null;
    }

    // Clear listeners tracking
    listenersRef.current.clear();
  }, []);

  useEffect(() => {
    // Start memory monitoring
    memoryRef.current = setInterval(monitorMemory, 5000);

    // Cleanup on unmount
    return () => {
      cleanupAll();
    };
  }, [monitorMemory, cleanupAll]);

  return {
    trackListener,
    trackTimer,
    cleanupAll,
    getListenerCount: () =>
      Array.from(listenersRef.current.values()).reduce(
        (sum, count) => sum + count,
        0
      ),
    getTimerCount: () =>
      Array.from(timersRef.current.values()).reduce(
        (sum, count) => sum + count,
        0
      ),
  };
};

/**
 * Hook to ensure proper cleanup of event listeners and timers
 */
export const useSafeEventListener = (
  target: EventTarget | null,
  eventType: string,
  handler: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions | boolean
) => {
  const { trackListener } = usePerformanceMonitoring();

  useEffect(() => {
    if (!target) return;

    trackListener(eventType, true);
    target.addEventListener(eventType, handler, options);

    return () => {
      trackListener(eventType, false);
      target.removeEventListener(eventType, handler, options);
    };
  }, [target, eventType, handler, options, trackListener]);
};

/**
 * Hook to ensure proper cleanup of timers
 */
export const useSafeTimer = () => {
  const { trackTimer } = usePerformanceMonitoring();
  const timers = useRef<Set<number>>(new Set());

  const safeSetTimeout = useCallback(
    (callback: () => void, delay: number) => {
      trackTimer('setTimeout', true);
      const id = window.setTimeout(() => {
        timers.current.delete(id);
        trackTimer('setTimeout', false);
        callback();
      }, delay);

      timers.current.add(id);
      return id;
    },
    [trackTimer]
  );

  const safeSetInterval = useCallback(
    (callback: () => void, delay: number) => {
      trackTimer('setInterval', true);
      const id = window.setInterval(callback, delay);
      timers.current.add(id);
      return id;
    },
    [trackTimer]
  );

  const safeClearTimeout = useCallback(
    (id: number) => {
      window.clearTimeout(id);
      timers.current.delete(id);
      trackTimer('setTimeout', false);
    },
    [trackTimer]
  );

  const safeClearInterval = useCallback(
    (id: number) => {
      window.clearInterval(id);
      timers.current.delete(id);
      trackTimer('setInterval', false);
    },
    [trackTimer]
  );

  useEffect(() => {
    const currentTimers = timers.current;
    return () => {
      // Clear all remaining timers
      currentTimers.forEach((id) => {
        window.clearInterval(id);
        window.clearTimeout(id);
      });
      currentTimers.clear();
    };
  }, []);

  return {
    setTimeout: safeSetTimeout,
    setInterval: safeSetInterval,
    clearTimeout: safeClearTimeout,
    clearInterval: safeClearInterval,
  };
};
