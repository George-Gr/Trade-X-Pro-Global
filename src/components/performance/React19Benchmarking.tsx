import React from 'react';
import { usePriceStreamConcurrent } from '@/hooks/usePriceStreamConcurrent';
import { useRiskCalculationsBatched } from '@/hooks/useRiskCalculationsBatched';
import { useTradingFormTransitions } from '@/hooks/useTradingTransitions';
import { useBenchmarkRunner } from '@/hooks/useBenchmarkRunner';
import { BenchmarkResultCard } from './BenchmarkResultCard';
import { BenchmarkSummary } from './BenchmarkSummary';
import { LiveMetricsPanel } from './LiveMetricsPanel';
import { performanceMonitoring } from '@/lib/performance/performanceMonitoring';

/**
 * React 19 Performance Benchmarking Suite
 * Comprehensive performance testing for concurrent rendering features
 */

interface React19BenchmarkingProps {
  // No props required for this component
}

export const React19PerformanceBenchmark: React.FC<React19BenchmarkingProps> = () => {
  // Test data for concurrent price streaming
  const { prices, isPending: priceStreamPending } = usePriceStreamConcurrent({
    symbols: [
      'EURUSD',
      'GBPUSD',
      'USDJPY',
      'USDCHF',
      'AUDUSD',
      'USDCAD',
      'NZDUSD',
    ],
    enabled: true,
    priority: 'normal',
    batchUpdates: true,
  });

  // Test data for trading form transitions
  const { formState, isFormPending, updateFormState } =
    useTradingFormTransitions(
      {
        symbol: 'EURUSD',
        orderType: 'market',
        side: 'buy',
        quantity: 0.1,
        price: 1.1,
        leverage: 100,
      },
      {
        priority: 'normal',
        showLoadingState: true,
      }
    );

  // Test data for batched risk calculations
  const { calculations, queueRiskCalculation } = useRiskCalculationsBatched(
    50,
    16
  );

  // Benchmark runner hook
  const {
    results,
    isRunning,
    currentTest,
    metrics,
    runBenchmarks,
  } = useBenchmarkRunner();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-[hsl(var(--card))] rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[hsl(var(--text-high-contrast))]">
              React 19 Performance Benchmarking
            </h2>
            <p className="text-[hsl(var(--muted-contrast))] mt-2">
              Comprehensive testing of concurrent rendering features for trading
              platform optimization
            </p>
          </div>
          <button
            onClick={runBenchmarks}
            disabled={isRunning}
            className={`px-6 py-3 rounded-lg font-medium ${
              isRunning
                ? 'bg-[hsl(var(--disabled))] cursor-not-allowed'
                : 'bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-variant))] text-[hsl(var(--primary-contrast))]'
            }`}
          >
            {isRunning ? 'Running Tests...' : 'Run Benchmarks'}
          </button>
        </div>

        {currentTest && (
          <div className="mb-6 p-4 bg-[hsl(var(--muted))] border border-[hsl(var(--border-glow))] rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[hsl(var(--primary-glow))] mr-3"></div>
              <span className="text-[hsl(var(--primary-contrast))]">{currentTest}</span>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <>
            {/* Summary Metrics */}
            {metrics && <BenchmarkSummary metrics={metrics} />}

            {/* Detailed Results */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[hsl(var(--text-high-contrast))]">
                Detailed Results
              </h3>
              <div className="grid gap-4">
                {results.map((result, index) => (
                  <BenchmarkResultCard key={index} result={result} />
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {metrics && metrics.recommendations.length > 0 && (
              <div className="mt-8 p-6 bg-[hsl(var(--muted))] rounded-lg border border-[hsl(var(--border-glow))]">
                <h3 className="text-lg font-semibold text-[hsl(var(--primary-contrast))] mb-4">
                  Recommendations
                </h3>
                <ul className="space-y-2">
                  {metrics.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                  <span className="text-[hsl(var(--primary-contrast))] mr-2">•</span>
                  <span className="text-[hsl(var(--primary-contrast))]">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Live Performance Monitoring */}
        <LiveMetricsPanel
          prices={prices}
          calculations={calculations}
          formState={formState}
          priceStreamPending={priceStreamPending}
          isFormPending={isFormPending}
        />
      </div>
    </div>
  );
}
