/**
 * Optimized Canvas Chart Component
 * High-performance chart rendering using HTML5 Canvas for large datasets
 */

import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { useChartPerformance } from '@/lib/chartPerformance';
import { useChartWorker } from '@/hooks/useChartWorker';

interface CanvasChartProps {
  data: { x: number | string; y: number }[];
  width: number;
  height: number;
  type?: 'line' | 'area' | 'scatter';
  color?: string;
  loading?: boolean;
  className?: string;
}

interface ChartConfig {
  padding: { top: number; right: number; bottom: number; left: number };
  gridLines: number;
  animationDuration: number;
}

const DEFAULT_CONFIG: ChartConfig = {
  padding: { top: 20, right: 20, bottom: 30, left: 40 },
  gridLines: 5,
  animationDuration: 300
};

export const OptimizedCanvasChart: React.FC<CanvasChartProps> = ({
  data,
  width,
  height,
  type = 'line',
  color = '#3b82f6',
  loading = false,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const { calculateTrend, normalizeData, getLoadingState } = useChartWorker();
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Use performance optimizations
  const { visibleData, isVirtualized, startAnimation, stopAnimation } = useChartPerformance(data, {
    virtualizationThreshold: 50,
    debounceDelay: 100
  });

  // Process data with worker
  const processData = useCallback(async () => {
    if (!data || data.length === 0) {
      setProcessedData([]);
      return;
    }

    setIsLoading(true);
    
    try {
      // Normalize data using worker
      const normalizedData = await normalizeData(data.map(d => ({ value: d.y })));
      
      const processed = normalizedData.map((d, index) => ({
        x: data[index].x,
        y: d.value,
        originalY: data[index].y
      }));
      
      setProcessedData(processed);
    } catch (error) {
      console.error('Error processing chart data:', error);
      setProcessedData(data);
    } finally {
      setIsLoading(false);
    }
  }, [data, normalizeData]);

  useEffect(() => {
    processData();
  }, [processData]);

  // Calculate chart dimensions
  const dimensions = useMemo(() => {
    const { padding } = DEFAULT_CONFIG;
    return {
      chartWidth: width - padding.left - padding.right,
      chartHeight: height - padding.top - padding.bottom,
      padding
    };
  }, [width, height]);

  // Convert data points to screen coordinates
  const convertToScreenCoords = useCallback((dataPoints: any[]) => {
    if (dataPoints.length === 0) return [];

    const { chartWidth, chartHeight, padding } = dimensions;
    
    const xValues = dataPoints.map(d => d.x);
    const yValues = dataPoints.map(d => d.y);
    
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    
    return dataPoints.map((point, index) => {
      const x = padding.left + ((point.x - xMin) / (xRange || 1)) * chartWidth;
      const y = padding.top + chartHeight - ((point.y - yMin) / (yRange || 1)) * chartHeight;
      
      return {
        x,
        y,
        index,
        original: point
      };
    });
  }, [dimensions]);

  // Draw grid lines
  const drawGridLines = useCallback((ctx: CanvasRenderingContext2D) => {
    const { chartWidth, chartHeight, padding } = dimensions;
    const { gridLines } = DEFAULT_CONFIG;
    
    ctx.strokeStyle = 'rgba(107, 114, 128, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    
    // Vertical grid lines
    for (let i = 0; i <= gridLines; i++) {
      const x = padding.left + (i / gridLines) * chartWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (i / gridLines) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
  }, [dimensions]);

  // Draw line chart
  const drawLineChart = useCallback((ctx: CanvasRenderingContext2D, points: any[]) => {
    if (points.length < 2) return;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Create path
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      const current = points[i];
      const previous = points[i - 1];
      
      // Smooth curve using quadratic bezier
      const mx = (previous.x + current.x) / 2;
      const my = (previous.y + current.y) / 2;
      
      ctx.quadraticCurveTo(previous.x, previous.y, mx, my);
    }
    
    ctx.stroke();
    
    // Draw points
    ctx.fillStyle = color;
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [color]);

  // Draw area chart
  const drawAreaChart = useCallback((ctx: CanvasRenderingContext2D, points: any[]) => {
    if (points.length < 2) return;
    
    const { padding, chartHeight } = dimensions;
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, `${color}40`);
    gradient.addColorStop(1, `${color}05`);
    
    // Draw area
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      const current = points[i];
      const previous = points[i - 1];
      
      const mx = (previous.x + current.x) / 2;
      const my = (previous.y + current.y) / 2;
      
      ctx.quadraticCurveTo(previous.x, previous.y, mx, my);
    }
    
    // Close path
    ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
    ctx.lineTo(points[0].x, padding.top + chartHeight);
    ctx.closePath();
    ctx.fill();
    
    // Draw line on top
    drawLineChart(ctx, points);
  }, [dimensions, color, drawLineChart]);

  // Render chart
  const renderChart = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!canvas || !ctx || processedData.length === 0) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Convert data to screen coordinates
    const screenPoints = convertToScreenCoords(processedData);
    
    if (screenPoints.length === 0) return;
    
    // Draw grid
    drawGridLines(ctx);
    
    // Draw chart based on type
    switch (type) {
      case 'area':
        drawAreaChart(ctx, screenPoints);
        break;
      case 'line':
      default:
        drawLineChart(ctx, screenPoints);
        break;
    }
  }, [processedData, width, height, type, convertToScreenCoords, drawGridLines, drawLineChart, drawAreaChart]);

  // Animation effect
  const animateChart = useCallback(() => {
    let startTime: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / DEFAULT_CONFIG.animationDuration, 1);
      
      // Apply easing
      const easedProgress = progress < 0.5 
        ? 2 * progress * progress 
        : -1 + (4 - 2 * progress) * progress;
      
      // Render with current progress
      renderChart();
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [renderChart]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        
        // Scale context for high DPI displays
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(devicePixelRatio, devicePixelRatio);
        }
        
        renderChart();
      }
    };
    
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [width, height, renderChart]);

  // Handle data changes
  useEffect(() => {
    if (isLoading || getLoadingState('normalizeData')) return;
    
    renderChart();
    
    if (!loading) {
      animateChart();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [processedData, isLoading, loading, getLoadingState, renderChart, animateChart]);

  // Start/stop animations based on visibility
  useEffect(() => {
    if (loading || isLoading) {
      startAnimation();
    } else {
      stopAnimation();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [loading, isLoading, startAnimation, stopAnimation]);

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        width={width * (window.devicePixelRatio || 1)}
        height={height * (window.devicePixelRatio || 1)}
        style={{ width, height }}
        className="border border-border rounded-lg"
      />
      {(isLoading || loading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};