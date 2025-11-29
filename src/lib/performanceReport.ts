/**
 * Chart Performance Report Generator
 * Generates comprehensive performance reports for chart optimization
 */

import { ChartPerformanceMonitor } from '@/lib/chartPerformance';
import { monitorChartPerformance } from '@/lib/chartUtils';

export interface PerformanceReport {
  timestamp: string;
  duration: number;
  fps: {
    average: number;
    min: number;
    max: number;
    target: number;
    metTarget: boolean;
  };
  cpu: {
    averageUsage: number;
    peakUsage: number;
    target: number;
    metTarget: boolean;
  };
  memory: {
    averageUsage: number;
    peakUsage: number;
    target: number;
    metTarget: boolean;
  };
  rendering: {
    averageRenderTime: number;
    peakRenderTime: number;
    target: number;
    metTarget: boolean;
  };
  dataProcessing: {
    averageProcessingTime: number;
    peakProcessingTime: number;
    totalOperations: number;
  };
  recommendations: string[];
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export class PerformanceReportGenerator {
  private static instance: PerformanceReportGenerator;
  private metrics: Map<string, number[]> = new Map();
  private startTime: number = 0;
  private isRecording: boolean = false;

  get isRecording(): boolean {
    return this.isRecording;
  }

  static getInstance(): PerformanceReportGenerator {
    if (!PerformanceReportGenerator.instance) {
      PerformanceReportGenerator.instance = new PerformanceReportGenerator();
    }
    return PerformanceReportGenerator.instance;
  }

  startRecording(): void {
    this.startTime = performance.now();
    this.isRecording = true;
    this.metrics.clear();
  }

  stopRecording(): PerformanceReport {
    if (!this.isRecording) {
      throw new Error('Recording not started');
    }

    const duration = performance.now() - this.startTime;
    this.isRecording = false;

    return this.generateReport(duration);
  }

  recordMetric(name: string, value: number): void {
    if (!this.isRecording) return;

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name)!.push(value);
  }

  private generateReport(duration: number): PerformanceReport {
    const fpsData = this.getMetricData('fps');
    const cpuData = this.getMetricData('cpu');
    const memoryData = this.getMetricData('memory');
    const renderData = this.getMetricData('render');
    const processData = this.getMetricData('processing');

    const fps = {
      average: this.average(fpsData),
      min: Math.min(...fpsData),
      max: Math.max(...fpsData),
      target: 60,
      metTarget: this.average(fpsData) >= 55
    };

    const cpu = {
      averageUsage: this.average(cpuData),
      peakUsage: Math.max(...cpuData),
      target: 30,
      metTarget: this.average(cpuData) <= 30
    };

    const memory = {
      averageUsage: this.average(memoryData),
      peakUsage: Math.max(...memoryData),
      target: 50,
      metTarget: this.average(memoryData) <= 50
    };

    const rendering = {
      averageRenderTime: this.average(renderData),
      peakRenderTime: Math.max(...renderData),
      target: 16,
      metTarget: this.average(renderData) <= 16
    };

    const dataProcessing = {
      averageProcessingTime: this.average(processData),
      peakProcessingTime: Math.max(...processData),
      totalOperations: processData.length
    };

    const recommendations = this.generateRecommendations({
      fps,
      cpu,
      memory,
      rendering
    });

    const overallScore = this.calculateOverallScore({
      fps: fps.metTarget,
      cpu: cpu.metTarget,
      memory: memory.metTarget,
      rendering: rendering.metTarget
    });

    const grade = this.calculateGrade(overallScore);

    return {
      timestamp: new Date().toISOString(),
      duration,
      fps,
      cpu,
      memory,
      rendering,
      dataProcessing,
      recommendations,
      overallScore,
      grade
    };
  }

  private getMetricData(name: string): number[] {
    return this.metrics.get(name) || [];
  }

  private average(values: number[]): number {
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  private generateRecommendations(metrics: {
    fps: { metTarget: boolean; average: number };
    cpu: { metTarget: boolean; averageUsage: number };
    memory: { metTarget: boolean; averageUsage: number };
    rendering: { metTarget: boolean; averageRenderTime: number };
  }): string[] {
    const recommendations: string[] = [];

    if (!metrics.fps.metTarget) {
      recommendations.push('FPS below target. Consider reducing chart update frequency or implementing more aggressive virtualization.');
    }

    if (!metrics.cpu.metTarget) {
      recommendations.push('CPU usage too high. Optimize chart calculations and consider using Web Workers for heavy computations.');
    }

    if (!metrics.memory.metTarget) {
      recommendations.push('Memory usage elevated. Check for memory leaks in chart components and implement proper cleanup.');
    }

    if (!metrics.rendering.metTarget) {
      recommendations.push('Render times too slow. Consider using canvas rendering for high-frequency updates.');
    }

    if (metrics.rendering.averageRenderTime > 32) {
      recommendations.push('Severe render performance issues detected. Immediate optimization required.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Excellent performance! Consider these optimizations for even better results:');
      recommendations.push('- Implement progressive loading for large datasets');
      recommendations.push('- Add chart pooling for component reuse');
      recommendations.push('- Consider server-side rendering for initial chart state');
    }

    return recommendations;
  }

  private calculateOverallScore(metrics: {
    fps: boolean;
    cpu: boolean;
    memory: boolean;
    rendering: boolean;
  }): number {
    const weights = { fps: 0.3, cpu: 0.25, memory: 0.2, rendering: 0.25 };
    const score = 
      (metrics.fps ? 1 : 0) * weights.fps +
      (metrics.cpu ? 1 : 0) * weights.cpu +
      (metrics.memory ? 1 : 0) * weights.memory +
      (metrics.rendering ? 1 : 0) * weights.rendering;

    return Math.round(score * 100);
  }

  private calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  // Export report as JSON
  exportReport(report: PerformanceReport): string {
    return JSON.stringify(report, null, 2);
  }

  // Export report as CSV
  exportReportCSV(report: PerformanceReport): string {
    const headers = [
      'Metric', 'Average', 'Min/Max', 'Target', 'Met Target'
    ];
    
    const rows = [
      ['FPS', report.fps.average.toFixed(1), `${report.fps.min}-${report.fps.max}`, report.fps.target.toString(), report.fps.metTarget.toString()],
      ['CPU Usage (%)', report.cpu.averageUsage.toFixed(1), `${report.cpu.peakUsage.toFixed(1)}`, report.cpu.target.toString(), report.cpu.metTarget.toString()],
      ['Memory Usage (%)', report.memory.averageUsage.toFixed(1), `${report.memory.peakUsage.toFixed(1)}`, report.memory.target.toString(), report.memory.metTarget.toString()],
      ['Render Time (ms)', report.rendering.averageRenderTime.toFixed(2), `${report.rendering.peakRenderTime.toFixed(2)}`, report.rendering.target.toString(), report.rendering.metTarget.toString()]
    ];

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    return csv;
  }

  // Generate HTML report
  generateHTMLReport(report: PerformanceReport): string {
    const statusColor = (met: boolean) => met ? '#10B981' : '#EF4444';
    const statusText = (met: boolean) => met ? 'PASS' : 'FAIL';

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Chart Performance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .metric { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .status-pass { color: #10B981; font-weight: bold; }
        .status-fail { color: #EF4444; font-weight: bold; }
        .recommendations { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .score { font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; }
        .grade-a { color: #10B981; }
        .grade-b { color: #3b82f6; }
        .grade-c { color: #f59e0b; }
        .grade-d { color: #ef6b20; }
        .grade-f { color: #ef4444; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Chart Performance Report</h1>
        <p><strong>Generated:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
        <p><strong>Duration:</strong> ${(report.duration / 1000).toFixed(2)} seconds</p>
    </div>

    <div class="score grade-${report.grade.toLowerCase()}">
        Overall Score: ${report.overallScore}/100 (Grade: ${report.grade})
    </div>

    <h2>Performance Metrics</h2>
    <div class="metric">
        <span>FPS</span>
        <span style="color: ${statusColor(report.fps.metTarget)}">${statusText(report.fps.metTarget)}</span>
        <span>Average: ${report.fps.average.toFixed(1)}, Target: ${report.fps.target}</span>
    </div>
    <div class="metric">
        <span>CPU Usage</span>
        <span style="color: ${statusColor(report.cpu.metTarget)}">${statusText(report.cpu.metTarget)}</span>
        <span>Average: ${report.cpu.averageUsage.toFixed(1)}%, Target: ${report.cpu.target}%</span>
    </div>
    <div class="metric">
        <span>Memory Usage</span>
        <span style="color: ${statusColor(report.memory.metTarget)}">${statusText(report.memory.metTarget)}</span>
        <span>Average: ${report.memory.averageUsage.toFixed(1)}%, Target: ${report.memory.target}%</span>
    </div>
    <div class="metric">
        <span>Render Time</span>
        <span style="color: ${statusColor(report.rendering.metTarget)}">${statusText(report.rendering.metTarget)}</span>
        <span>Average: ${report.rendering.averageRenderTime.toFixed(2)}ms, Target: ${report.rendering.target}ms</span>
    </div>

    <div class="recommendations">
        <h3>Recommendations</h3>
        <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
</body>
</html>
    `;
  }
}

// Global performance monitoring
export const globalPerformanceMonitor = PerformanceReportGenerator.getInstance();

// Auto-reporting for production
export const setupAutoReporting = (interval: number = 300000) => { // 5 minutes default
  let reportCount = 0;
  
  const generateReport = () => {
    if (globalPerformanceMonitor.isRecording) {
      const report = globalPerformanceMonitor.stopRecording();
      reportCount++;
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Performance Report #${reportCount}:`, report);
      }
      
      // In production, you might want to send this to your analytics service
      if (process.env.NODE_ENV === 'production') {
        // Send to analytics service
        // analytics.track('chart_performance_report', report);
      }
      
      // Start recording again
      globalPerformanceMonitor.startRecording();
    }
  };

  const intervalId = setInterval(generateReport, interval);
  
  // Start initial recording
  globalPerformanceMonitor.startRecording();
  
  return () => {
    clearInterval(intervalId);
    if (globalPerformanceMonitor.isRecording) {
      globalPerformanceMonitor.stopRecording();
    }
  };
};