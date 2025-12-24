import { performanceMonitoring } from '@/lib/performance/performanceMonitoring';
import { getWebSocketManager } from '@/lib/websocketManager';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Interface for trading performance metrics
 */
export interface TradingPerformanceMetrics {
  renderTime: number;
  updateLatency: number;
  messageRate: number;
  memoryDelta: number;
  fps: number;
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
) {
  const { trackRender = true, trackMemory = false, trackFps = false } = options;
  const renderStartTime = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const lastFpsTime = useRef<number>(0);
  const fpsRequestId = useRef<number | null>(null);

  // Track render start
  if (trackRender) {
    renderStartTime.current = performance.now();
  }

  // FPS Tracking
  const trackFrame = useCallback(() => {
    frameCount.current++;
    const now = performance.now();

    if (now - lastFpsTime.current >= 1000) {
      const fps = Math.round(
        (frameCount.current * 1000) / (now - lastFpsTime.current)
      );
      performanceMonitoring.recordCustomTiming(`${componentName}-FPS`, 0, fps);
      frameCount.current = 0;
      lastFpsTime.current = now;
    }

    fpsRequestId.current = requestAnimationFrame(trackFrame);
  }, [componentName]);

  useEffect(() => {
    // Component Mount
    performanceMonitoring.markUserAction(`mount-${componentName}`);

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
    };
  }, [componentName, trackFps, trackFrame]);

  // Track render completion
  useEffect(() => {
    if (trackRender) {
      const renderTime = performance.now() - renderStartTime.current;
      performanceMonitoring.recordCustomTiming(
        `${componentName}-render`,
        renderStartTime.current,
        renderTime
      );

      // Log slow renders (>16ms is dropping frames at 60fps)
      if (renderTime > 16) {
        // console.warn(`Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    }
  }); // Run on every render

  // WebSocket Latency Check
  const checkLatency = useCallback(async () => {
    const wsManager = getWebSocketManager();
    const status = wsManager.getStatus();

    // Just report subscription count as proxy for load
    performanceMonitoring.recordCustomTiming(
      `${componentName}-subscriptions`,
      0,
      status.totalSubscriptions
    );
  }, [componentName]);

  return {
    checkLatency,
  };
}
