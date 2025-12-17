import { visualizer } from 'rollup-plugin-visualizer';

/**
 * Bundle Analyzer Configuration
 * 
 * Provides detailed bundle analysis for performance optimization.
 * Run: npm run build:analyze
 * View: dist/stats.html
 */

export default function createBundleAnalyzer() {
  return visualizer({
    filename: 'dist/stats.html',
    open: true,
    gzipSize: true,
    brotliSize: true,
    template: 'treemap', // 'treemap', 'sunburst', 'network'
  });
}