import { performanceMonitoring } from '@/lib/performance/performanceMonitoring';
import { getWebSocketManager } from '@/lib/websocketManager';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

/**
 * Type guard to check if performance.memory API is available
 */
function hasMemoryApi(
  performance: Performance
): performance is Performance & {
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
} {
  return (
    'memory' in performance && 
    typeof (performance as unknown as { memory: unknown }).memory === 'object' &&
    performance.memory !== null
  );
}

/**
 * Interface for trading performance metrics
 */
export interface TradingPerformanceMetrics {
  renderTime: number;
  updateLatency: number;
  messageRate: number;
  memoryUsed: number;
  memoryTotal: number;
  memoryDelta: number;
  fps: number;
  hasMemoryApi: boolean;
}

/**
 * Hook for tracking performance in high-frequency trading components
 * Optimized for React 19 concurrent features
 *
 * @param componentName Unique identifier for the component
 * @param trackRender Whether to track render times (default: true)
 * @param trackMemory Whether to track memory usage (default: false - expensive)
 */
export function useTradingPerformance(
  componentName: string,
  options: {
    trackRender?: boolean;
    trackMemory?: boolean;
    trackFps?: boolean;
  } = {}
): TradingPerformanceMetrics & { checkLatency: () => Promise<void> } {
  const { trackRender = true, trackMemory = false, trackFps = false } = options;
  const renderStartTime = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const lastFpsTime = useRef<number>(0);
  const fpsRequestId = useRef<number | null>(null);
  const memoryStartTime = useRef<number>(0);
  const memoryIntervalId = useRef<NodeJS.Timeout | null>(null);
  const memorySamples = useRef<
    { used: number; total: number; timestamp: number }[]
  >([]);

  // Performance metrics state
  const [metrics, setMetrics] = useState<TradingPerformanceMetrics>({
    renderTime: 0,
    updateLatency: 0,
    messageRate: 0,
    memoryUsed: 0,
    memoryTotal: 0,
    memoryDelta: 0,
    fps: 0,
    hasMemoryApi: false,
  });

  // Memory Sampling Function
  const sampleMemory = useCallback(() => {
    // Check if performance.memory API is available
    if (typeof performance !== 'undefined' && hasMemoryApi(performance)) {
      const memory = performance.memory;
      const sample = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        timestamp: performance.now(),
      };

      // Store sample (keep only last 100 samples to prevent memory bloat)
      memorySamples.current.push(sample);
      if (memorySamples.current.length > 100) {
        memorySamples.current.shift();
      }

      // Update metrics with latest memory values
      setMetrics((prev) => ({
        ...prev,
        memoryUsed: memory.usedJSHeapSize,
        memoryTotal: memory.totalJSHeapSize,
        hasMemoryApi: true,
      }));

      // Record to performance monitoring
      performanceMonitoring.recordCustomTiming(
        `${componentName}-memory-used`,
        0,
        memory.usedJSHeapSize
      );
      performanceMonitoring.recordCustomTiming(
        `${componentName}-memory-total`,
        0,
        memory.totalJSHeapSize
      );
    } else {
      // Memory API not available
      setMetrics((prev) => ({
        ...prev,
        hasMemoryApi: false,
      }));
    }
  }, [componentName]);

  // FPS Tracking
  const trackFrame = useCallback(() => {
    frameCount.current++;
    const now = performance.now();

    if (now - lastFpsTime.current >= 1000) {
      const fps = Math.round(
        (frameCount.current * 1000) / (now - lastFpsTime.current)
      );
      performanceMonitoring.recordCustomTiming(`${componentName}-FPS`, 0, fps);

      // Update metrics state
      setMetrics((prev) => ({ ...prev, fps }));

      frameCount.current = 0;
      lastFpsTime.current = now;
    }

    fpsRequestId.current = requestAnimationFrame(trackFrame);
  }, [componentName]);

  useEffect(() => {
    // Component Mount
    performanceMonitoring.markUserAction(`mount-${componentName}`);

    if (trackMemory) {
      memoryStartTime.current = performance.now();
      // Initial memory sample
      sampleMemory();
      // Start memory sampling interval (every 5 seconds)
      memoryIntervalId.current = setInterval(sampleMemory, 5000);
    }

    if (trackFps) {
      lastFpsTime.current = performance.now();
      fpsRequestId.current = requestAnimationFrame(trackFrame);
    }

    return () => {
      // Component Unmount
      performanceMonitoring.markUserAction(`unmount-${componentName}`);

      if (fpsRequestId.current) {
        cancelAnimationFrame(fpsRequestId.current);
      }

      // Clear memory sampling interval
      if (memoryIntervalId.current) {
        clearInterval(memoryIntervalId.current);
        memoryIntervalId.current = null;
      }

      // Calculate final memory delta if tracking
      if (
        trackMemory &&
        memoryStartTime.current > 0 &&
        memorySamples.current.length > 0
      ) {
        // Capture current samples to avoid stale closure
        const samples = [...memorySamples.current];
        const firstSample = samples[0];
        const lastSample = samples[samples.length - 1];
        if (firstSample && lastSample) {
          const memoryDelta = lastSample.used - firstSample.used;
          setMetrics((prev) => ({ ...prev, memoryDelta }));
        }
      }
    };
  }, [componentName, trackFps, trackFrame, trackMemory, sampleMemory]);

  // Track render start in layout effect to avoid side effects during render
  useLayoutEffect(() => {
    if (trackRender) {
      renderStartTime.current = performance.now();
    }
  }, [trackRender]);

  // Track render completion
  useEffect(() => {
    if (trackRender) {
      const renderTime = performance.now() - renderStartTime.current;
      performanceMonitoring.recordCustomTiming(
        `${componentName}-render`,
        renderStartTime.current,
        renderTime
      );

      // Update render time metric
      setMetrics((prev) => ({ ...prev, renderTime }));

      // Log slow renders (>16ms is dropping frames at 60fps)
      if (renderTime > 16) {
        // console.warn(`Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    }
  }, [trackRender, componentName]); // Run on every render

  // WebSocket Latency Check
  const checkLatency = useCallback(async () => {
    const wsManager = getWebSocketManager();
    const status = wsManager.getStatus();
    const startTime = performance.now();

    // Calculate update latency based on connection activity
    let updateLatency = 0;
    if (status.connections.length > 0) {
      // Use subscription count as a proxy for activity
      // Higher subscription count typically means more active connections
      updateLatency = Math.min(status.totalSubscriptions * 10, 1000); // Scale 0-1000ms
    }

    // Calculate message rate based on subscription density
    const messageRate =
      status.totalConnections > 0
        ? Math.round((status.totalSubscriptions / status.totalConnections) * 10)
        : 0;

    // Update metrics
    setMetrics((prev) => ({
      ...prev,
      updateLatency,
      messageRate,
    }));

    // Just report subscription count as proxy for load
    performanceMonitoring.recordCustomTiming(
      `${componentName}-subscriptions`,
      0,
      status.totalSubscriptions
    );
  }, [componentName]);

  return {
    ...metrics,
    checkLatency,
  };
}
