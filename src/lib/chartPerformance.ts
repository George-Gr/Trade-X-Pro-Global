/**
 * Chart Performance Optimization Utilities
 * Provides virtualization, animation frame management, and performance optimizations
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface ChartPerformanceConfig {
  maxDataPoints: number;
  virtualizationThreshold: number;
  updateInterval: number;
  debounceDelay: number;
  enablePooling: boolean;
}

export const DEFAULT_PERFORMANCE_CONFIG: ChartPerformanceConfig = {
  maxDataPoints: 1000,
  virtualizationThreshold: 100,
  updateInterval: 16, // ~60fps
  debounceDelay: 300,
  enablePooling: true
};

/**
 * Virtualizes large datasets by showing only visible portion
 */
export class ChartDataVirtualizer {
  private data: any[] = [];
  private viewportSize: number = 100;
  private offset: number = 0;
  private frameId: number | null = null;

  constructor(data: any[], viewportSize: number = 100) {
    this.data = data;
    this.viewportSize = viewportSize;
  }

  setViewport(offset: number, size: number): void {
    this.offset = Math.max(0, Math.min(this.data.length - size, offset));
    this.viewportSize = size;
  }

  getVisibleData(): any[] {
    const start = this.offset;
    const end = Math.min(this.offset + this.viewportSize, this.data.length);
    return this.data.slice(start, end);
  }

  getTotalLength(): number {
    return this.data.length;
  }

  getOffset(): number {
    return this.offset;
  }

  needsVirtualization(): boolean {
    return this.data.length > DEFAULT_PERFORMANCE_CONFIG.virtualizationThreshold;
  }

  // Smooth scrolling animation using requestAnimationFrame
  smoothScroll(targetOffset: number, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      if (this.frameId) {
        cancelAnimationFrame(this.frameId);
      }

      const startOffset = this.offset;
      const distance = targetOffset - startOffset;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out quad for smooth animation
        const easedProgress = 1 - (1 - progress) * (1 - progress);
        
        const currentOffset = startOffset + distance * easedProgress;
        this.setViewport(Math.round(currentOffset), this.viewportSize);
        
        if (progress < 1) {
          this.frameId = requestAnimationFrame(animate);
        } else {
          this.frameId = null;
          resolve();
        }
      };

      this.frameId = requestAnimationFrame(animate);
    });
  }

  destroy(): void {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }
}

/**
 * Manages requestAnimationFrame for smooth chart updates
 */
export class AnimationFrameManager {
  private frameId: number | null = null;
  private isRunning: boolean = false;
  private callback: FrameRequestCallback;

  constructor(callback: FrameRequestCallback) {
    this.callback = callback;
  }

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    const animate = (timestamp: number) => {
      if (!this.isRunning) return;
      this.callback(timestamp);
      this.frameId = requestAnimationFrame(animate);
    };
    
    this.frameId = requestAnimationFrame(animate);
  }

  stop(): void {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.isRunning = false;
  }

  isAnimating(): boolean {
    return this.isRunning;
  }
}

/**
 * Debounced function wrapper for chart updates
 */
export class DebouncedChartUpdater {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private callback: (...args: unknown[]) => void;
  private delay: number;

  constructor(callback: (...args: unknown[]) => void, delay: number) {
    this.callback = callback;
    this.delay = delay;
  }

  update(...args: any[]): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.timeoutId = setTimeout(() => {
      this.callback(...args);
      this.timeoutId = null;
    }, this.delay);
  }

  flush(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.callback();
      this.timeoutId = null;
    }
  }
}

/**
 * Pool of chart components for reuse
 */
export class ChartPool {
  private pool: Map<string, any[]> = new Map();
  private maxSize: number = 10;
  private usageCount: Map<string, number> = new Map();
  private lastUsed: Map<string, number> = new Map();

  setMaxSize(size: number): void {
    this.maxSize = size;
    // Clean up excess items
    for (const [key, poolItems] of this.pool) {
      while (poolItems.length > size) {
        poolItems.pop();
      }
    }
  }

  acquire<T extends { _poolId?: string }>(key: string, factory: () => T): T {
    const pool = this.pool.get(key) || [];
    
    if (pool.length > 0) {
      // Get least recently used item
      pool.sort((a, b) => (this.lastUsed.get(a._poolId!) || 0) - (this.lastUsed.get(b._poolId!) || 0));
      const instance = pool.pop()!;
      
      // Update usage tracking
      this.usageCount.set(instance._poolId!, (this.usageCount.get(instance._poolId!) || 0) + 1);
      this.lastUsed.set(instance._poolId!, Date.now());
      
      return instance;
    }
    
    // Create new instance
    const newInstance = factory();
    const poolId = `${key}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add pool metadata
    (newInstance as { _poolId: string })._poolId = poolId;
    this.usageCount.set(poolId, 1);
    this.lastUsed.set(poolId, Date.now());
    
    return newInstance;
  }

  release(key: string, instance: any): void {
    if (!instance._poolId) {
      console.warn('Attempting to release non-pooled instance');
      return;
    }

    const pool = this.pool.get(key) || [];
    
    if (pool.length < this.maxSize) {
      // Reset instance state before returning to pool
      this.resetInstance(instance);
      pool.push(instance);
      this.pool.set(key, pool);
    }
    // If pool is full, instance will be garbage collected
  }

  private resetInstance(instance: any): void {
    // Reset common chart instance properties
    if (instance.clear) {
      instance.clear();
    }
    if (instance.reset) {
      instance.reset();
    }
    // Reset canvas context if applicable
    if (instance.getContext) {
      const ctx = instance.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, instance.width, instance.height);
      }
    }
  }

  clear(): void {
    this.pool.clear();
    this.usageCount.clear();
    this.lastUsed.clear();
  }

  getPoolSize(key: string): number {
    return this.pool.get(key)?.length || 0;
  }

  getUsageStats(key?: string): { totalInstances: number; totalUsage: number; avgUsage: number } {
    if (key) {
      const pool = this.pool.get(key) || [];
      const usageCounts = pool.map(item => this.usageCount.get(item._poolId) || 0);
      const totalUsage = usageCounts.reduce((sum, count) => sum + count, 0);
      
      return {
        totalInstances: pool.length,
        totalUsage,
        avgUsage: pool.length > 0 ? totalUsage / pool.length : 0
      };
    }

    // Overall stats
    const allPools = Array.from(this.pool.values()).flat();
    const totalUsage = allPools.reduce((sum, item) => sum + (this.usageCount.get(item._poolId) || 0), 0);
    
    return {
      totalInstances: allPools.length,
      totalUsage,
      avgUsage: allPools.length > 0 ? totalUsage / allPools.length : 0
    };
  }

  // Cleanup old instances
  cleanup(maxAge: number = 300000): void { // 5 minutes default
    const now = Date.now();
    
    for (const [key, pool] of this.pool) {
      const activeItems = pool.filter(item => {
        const lastUsed = this.lastUsed.get(item._poolId) || 0;
        return (now - lastUsed) < maxAge;
      });
      
      this.pool.set(key, activeItems);
      
      // Remove tracking data for cleaned items
      pool.forEach(item => {
        if (!activeItems.includes(item)) {
          this.usageCount.delete(item._poolId);
          this.lastUsed.delete(item._poolId);
        }
      });
    }
  }

  // Periodic cleanup
  startCleanupTimer(interval: number = 60000): () => void { // 1 minute default
    const timer = setInterval(() => {
      this.cleanup();
    }, interval);

    return () => {
      clearInterval(timer);
    };
  }
}

/**
 * High-performance chart factory with pooling support
 */
export class ChartFactory {
  private pool: ChartPool = new ChartPool();
  private factories: Map<string, (...args: any[]) => any> = new Map();

  registerChartType(type: string, factory: (...args: any[]) => any): void {
    this.factories.set(type, factory);
  }

  createChart(type: string, ...args: any[]): any {
    if (!this.factories.has(type)) {
      throw new Error(`Unknown chart type: ${type}`);
    }

    // Try to acquire from pool first
    const factoryFn = this.factories.get(type)!;
    const chart = this.pool.acquire(type, () => {
      return factoryFn(...args);
    });

    // Initialize chart with arguments
    if (chart.initialize) {
      chart.initialize(...args);
    }

    return chart;
  }

  releaseChart(type: string, chart: any): void {
    this.pool.release(type, chart);
  }

  getStats(): any {
    return this.pool.getUsageStats();
  }

  cleanup(): void {
    this.pool.clear();
  }
}

/**
 * Hook for managing chart performance optimizations
 */
export const useChartPerformance = (
  data: any[],
  config: Partial<ChartPerformanceConfig> = DEFAULT_PERFORMANCE_CONFIG
) => {
  const mergedConfig = { ...DEFAULT_PERFORMANCE_CONFIG, ...config };
  const [visibleData, setVisibleData] = useState<any[]>(data);
  const [isVirtualized, setIsVirtualized] = useState(false);
  
  const virtualizerRef = useRef<ChartDataVirtualizer>(
    new ChartDataVirtualizer(data, mergedConfig.virtualizationThreshold)
  );
  const frameManagerRef = useRef<AnimationFrameManager>();
  const debouncerRef = useRef<DebouncedChartUpdater>();
  const poolRef = useRef<ChartPool>(new ChartPool());

  // Update virtualizer when data changes
  useEffect(() => {
    virtualizerRef.current = new ChartDataVirtualizer(data, mergedConfig.virtualizationThreshold);
    setIsVirtualized(virtualizerRef.current.needsVirtualization());
    
    if (!isVirtualized || data.length <= mergedConfig.virtualizationThreshold) {
      setVisibleData(data);
    }
  }, [data, mergedConfig.virtualizationThreshold, isVirtualized]);

  const updateViewport = useCallback((offset: number, size: number) => {
    if (!isVirtualized) return;
    
    virtualizerRef.current.setViewport(offset, size);
    setVisibleData(virtualizerRef.current.getVisibleData());
  }, [isVirtualized]);

  const startAnimation = useCallback(() => {
    if (frameManagerRef.current?.isAnimating()) return;
    
    frameManagerRef.current = new AnimationFrameManager((timestamp) => {
      // Animation logic can be added here
      // For now, we just ensure smooth 60fps updates
    });
    
    frameManagerRef.current.start();
  }, []);

  const stopAnimation = useCallback(() => {
    if (frameManagerRef.current) {
      frameManagerRef.current.stop();
    }
  }, []);

  const debouncedUpdate = useCallback(<T>(callback: (...args: T[]) => void, ...args: T[]) => {
    if (!debouncerRef.current) {
      debouncerRef.current = new DebouncedChartUpdater(callback, mergedConfig.debounceDelay);
    }
    
    debouncerRef.current.update(...args);
  }, [mergedConfig.debounceDelay]);

  const acquireFromPool = useCallback(<T>(key: string, factory: () => T): T => {
    return poolRef.current.acquire(key, factory);
  }, []);

  const releaseToPool = useCallback((key: string, instance: any) => {
    poolRef.current.release(key, instance);
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup
      stopAnimation();
      if (debouncerRef.current) {
        debouncerRef.current.flush();
      }
    };
  }, [stopAnimation]);

  return {
    visibleData,
    isVirtualized,
    updateViewport,
    startAnimation,
    stopAnimation,
    debouncedUpdate,
    acquireFromPool,
    releaseToPool,
    totalDataPoints: data.length,
    virtualizationThreshold: mergedConfig.virtualizationThreshold
  };
};

/**
 * Progressive data loader for large datasets
 */
export class ProgressiveDataLoader {
  private data: any[] = [];
  private chunkSize: number;
  private currentIndex: number = 0;
  private isLoading: boolean = false;
  private onChunkLoaded: (chunk: any[], isComplete: boolean) => void;

  constructor(data: any[], chunkSize: number, onChunkLoaded: (chunk: any[], isComplete: boolean) => void) {
    this.data = data;
    this.chunkSize = chunkSize;
    this.onChunkLoaded = onChunkLoaded;
  }

  loadNextChunk(): void {
    if (this.isLoading || this.currentIndex >= this.data.length) return;
    
    this.isLoading = true;
    const endIndex = Math.min(this.currentIndex + this.chunkSize, this.data.length);
    const chunk = this.data.slice(this.currentIndex, endIndex);
    
    // Simulate async loading
    setTimeout(() => {
      this.currentIndex = endIndex;
      this.isLoading = false;
      const isComplete = this.currentIndex >= this.data.length;
      
      this.onChunkLoaded(chunk, isComplete);
      
      if (!isComplete) {
        this.loadNextChunk();
      }
    }, 16); // ~60fps
  }

  reset(): void {
    this.currentIndex = 0;
    this.isLoading = false;
  }

  getProgress(): number {
    return this.data.length > 0 ? this.currentIndex / this.data.length : 0;
  }
}

/**
 * Performance monitor for chart operations
 */
export class ChartPerformanceMonitor {
  private measurements: Map<string, number[]> = new Map();
  private static instance: ChartPerformanceMonitor;

  static getInstance(): ChartPerformanceMonitor {
    if (!ChartPerformanceMonitor.instance) {
      ChartPerformanceMonitor.instance = new ChartPerformanceMonitor();
    }
    return ChartPerformanceMonitor.instance;
  }

  measure(operation: string, callback: () => void): void {
    const start = performance.now();
    callback();
    const end = performance.now();
    const duration = end - start;

    if (!this.measurements.has(operation)) {
      this.measurements.set(operation, []);
    }

    this.measurements.get(operation)!.push(duration);

    // Keep only last 100 measurements
    const measurements = this.measurements.get(operation)!;
    if (measurements.length > 100) {
      measurements.shift();
    }
  }

  getAverageTime(operation: string): number {
    const times = this.measurements.get(operation) || [];
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  getLatestTime(operation: string): number {
    const times = this.measurements.get(operation) || [];
    return times.length > 0 ? times[times.length - 1] : 0;
  }

  clear(): void {
    this.measurements.clear();
  }
}

/**
 * Optimized data processing for charts
 */
export const optimizeChartData = (data: any[], config: ChartPerformanceConfig = DEFAULT_PERFORMANCE_CONFIG): any[] => {
  if (data.length <= config.maxDataPoints) {
    return data;
  }

  // Downsample large datasets
  const step = Math.ceil(data.length / config.maxDataPoints);
  const optimized = [];

  for (let i = 0; i < data.length; i += step) {
    optimized.push(data[i]);
  }

  return optimized;
};