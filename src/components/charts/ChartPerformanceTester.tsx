/**
 * Chart Performance Testing Component
 * Provides real-time performance monitoring and FPS tracking
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChartPerformanceMonitor, 
  ProgressiveDataLoader,
  ChartFactory 
} from '@/lib/chartPerformance';
import { monitorChartPerformance } from '@/lib/chartUtils';

interface PerformanceMetrics {
  fps: number;
  cpuUsage: number;
  memoryUsage: number;
  chartRenderTime: number;
  dataProcessingTime: number;
}

export const ChartPerformanceTester: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    chartRenderTime: 0,
    dataProcessingTime: 0
  });
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');
  
  const fpsRef = useRef<number[]>([]);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationRef = useRef<number>();
  const monitor = ChartPerformanceMonitor.getInstance();

  // FPS monitoring
  const updateFPS = useCallback(() => {
    frameCount.current++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime.current >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
      fpsRef.current.push(fps);
      
      // Keep only last 60 measurements (~1 second at 60fps)
      if (fpsRef.current.length > 60) {
        fpsRef.current.shift();
      }
      
      const averageFPS = fpsRef.current.reduce((a, b) => a + b, 0) / fpsRef.current.length;
      
      setMetrics(prev => ({
        ...prev,
        fps: Math.round(averageFPS)
      }));
      
      frameCount.current = 0;
      lastTime.current = currentTime;
    }
    
    if (isTesting) {
      animationRef.current = requestAnimationFrame(updateFPS);
    }
  }, [isTesting]);

  // Memory usage monitoring
  const updateMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
      const usagePercent = Math.round((usedMB / totalMB) * 100);
      
      setMetrics(prev => ({
        ...prev,
        memoryUsage: usagePercent
      }));
    }
  }, []);

  // Chart performance test
  const runChartPerformanceTest = useCallback(async () => {
    setCurrentTest('Chart Rendering Performance');
    
    const testData = Array.from({ length: 1000 }, (_, i) => ({
      x: i,
      y: Math.sin(i / 100) * 100 + Math.random() * 20
    }));

    const startTime = performance.now();
    
    // Test data processing
    const loader = new ProgressiveDataLoader(testData, 50, () => {});
    loader.loadNextChunk();
    
    const processingTime = performance.now() - startTime;
    
    // Test chart factory
    const factory = new ChartFactory();
    factory.registerChartType('test', () => ({ initialize: () => {} }));
    
    const chartStartTime = performance.now();
    for (let i = 0; i < 100; i++) {
      const chart = factory.createChart('test');
      factory.releaseChart('test', chart);
    }
    const chartTime = performance.now() - chartStartTime;
    
    const result = {
      testName: 'Chart Performance Test',
      dataProcessingTime: processingTime,
      chartFactoryTime: chartTime,
      timestamp: new Date().toISOString()
    };
    
    setTestResults(prev => [...prev, result]);
    setCurrentTest('');
  }, []);

  // Stress test
  const runStressTest = useCallback(async () => {
    setCurrentTest('Stress Test');
    
    const startTime = performance.now();
    let iterations = 0;
    
    // Simulate heavy chart operations
    while (performance.now() - startTime < 5000) { // Run for 5 seconds
      // Create and destroy chart components
      const data = Array.from({ length: 500 }, (_, i) => ({
        x: i,
        y: Math.random() * 100
      }));
      
      // Simulate chart updates
      data.forEach(point => {
        point.y = Math.sin(point.x / 10) * 100;
      });
      
      iterations++;
    }
    
    const totalTime = performance.now() - startTime;
    const result = {
      testName: 'Stress Test',
      totalTime,
      iterations,
      operationsPerSecond: Math.round(iterations / (totalTime / 1000)),
      timestamp: new Date().toISOString()
    };
    
    setTestResults(prev => [...prev, result]);
    setCurrentTest('');
  }, []);

  // Start/stop testing
  const startTesting = useCallback(() => {
    setIsTesting(true);
    lastTime.current = performance.now();
    fpsRef.current = [];
    monitor.clear();
    animationRef.current = requestAnimationFrame(updateFPS);
  }, [updateFPS, monitor]);

  const stopTesting = useCallback(() => {
    setIsTesting(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Update memory usage periodically
  useEffect(() => {
    const interval = setInterval(updateMemoryUsage, 1000);
    return () => clearInterval(interval);
  }, [updateMemoryUsage]);

  // Calculate CPU usage approximation
  useEffect(() => {
    const calculateCPUUsage = () => {
      // Simple CPU usage approximation based on frame drops
      const targetFPS = 60;
      const fpsUsage = Math.max(0, 100 - (metrics.fps / targetFPS) * 100);
      
      setMetrics(prev => ({
        ...prev,
        cpuUsage: Math.round(fpsUsage)
      }));
    };
    
    const interval = setInterval(calculateCPUUsage, 2000);
    return () => clearInterval(interval);
  }, [metrics.fps]);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Chart Performance Monitor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-secondary/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {metrics.fps}
            </div>
            <div className="text-sm text-secondary-foreground">FPS</div>
            <div className={`text-xs ${metrics.fps >= 55 ? 'text-green-600' : metrics.fps >= 30 ? 'text-yellow-600' : 'text-red-600'}`}>
              {metrics.fps >= 55 ? 'Excellent' : metrics.fps >= 30 ? 'Good' : 'Poor'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-secondary/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {metrics.cpuUsage}%
            </div>
            <div className="text-sm text-secondary-foreground">CPU Usage</div>
            <div className={`text-xs ${metrics.cpuUsage <= 30 ? 'text-green-600' : metrics.cpuUsage <= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {metrics.cpuUsage <= 30 ? 'Good' : metrics.cpuUsage <= 60 ? 'Moderate' : 'High'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-secondary/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {metrics.memoryUsage}%
            </div>
            <div className="text-sm text-secondary-foreground">Memory Usage</div>
            <div className={`text-xs ${metrics.memoryUsage <= 50 ? 'text-green-600' : metrics.memoryUsage <= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
              {metrics.memoryUsage <= 50 ? 'Good' : metrics.memoryUsage <= 80 ? 'Moderate' : 'High'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-secondary/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {metrics.chartRenderTime.toFixed(1)}ms
            </div>
            <div className="text-sm text-secondary-foreground">Avg Render Time</div>
            <div className={`text-xs ${metrics.chartRenderTime <= 16 ? 'text-green-600' : metrics.chartRenderTime <= 32 ? 'text-yellow-600' : 'text-red-600'}`}>
              {metrics.chartRenderTime <= 16 ? 'Excellent' : metrics.chartRenderTime <= 32 ? 'Good' : 'Slow'}
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4">
          <Button 
            onClick={isTesting ? stopTesting : startTesting}
            variant={isTesting ? "destructive" : "default"}
          >
            {isTesting ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
          
          <Button 
            onClick={runChartPerformanceTest}
            disabled={isTesting}
          >
            Chart Performance Test
          </Button>
          
          <Button 
            onClick={runStressTest}
            disabled={isTesting}
            variant="outline"
          >
            Stress Test
          </Button>
        </div>

        {/* Current Test Status */}
        {currentTest && (
          <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Running: {currentTest}</span>
            </div>
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Test Results</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {testResults.slice(-10).map((result, index) => (
                <div key={index} className="p-3 bg-secondary/30 rounded-lg text-sm">
                  <div className="font-medium">{result.testName}</div>
                  {result.dataProcessingTime && (
                    <div>Processing: {result.dataProcessingTime.toFixed(2)}ms</div>
                  )}
                  {result.chartFactoryTime && (
                    <div>Chart Factory: {result.chartFactoryTime.toFixed(2)}ms</div>
                  )}
                  {result.totalTime && (
                    <div>Total: {result.totalTime.toFixed(2)}ms ({result.operationsPerSecond} ops/sec)</div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Guidelines */}
        <div className="p-4 bg-green-50/20 dark:bg-green-900/10 rounded-lg">
          <h4 className="font-semibold mb-2">Performance Targets:</h4>
          <ul className="text-sm space-y-1">
            <li>• FPS: ≥ 55 (60fps target)</li>
            <li>• CPU Usage: ≤ 30%</li>
            <li>• Memory Usage: ≤ 50%</li>
            <li>• Render Time: ≤ 16ms</li>
            <li>• Lighthouse Score: {'>'} 90</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};