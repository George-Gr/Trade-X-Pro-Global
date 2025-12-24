import React from 'react';

interface BenchmarkMetrics {
  totalTests: number;
  passedTests: number;
  averageImprovement: number;
  categoryScores: Record<string, number>;
  recommendations: string[];
}

interface BenchmarkSummaryProps {
  metrics: BenchmarkMetrics;
}

export const BenchmarkSummary: React.FC<BenchmarkSummaryProps> = ({ metrics }) => {
  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-[hsl(var(--success))] to-[hsl(var(--primary))] rounded-lg border border-[hsl(var(--success))]">
      <h3 className="text-lg font-semibold text-[hsl(var(--text-high-contrast))] mb-4">
        Performance Summary
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-[hsl(var(--success-contrast))]">
            {metrics.totalTests}
          </div>
          <div className="text-sm text-[hsl(var(--muted-contrast))]">Total Tests</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[hsl(var(--primary-contrast))]">
            {metrics.passedTests}
          </div>
          <div className="text-sm text-[hsl(var(--muted-contrast))]">Passed Tests</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[hsl(var(--primary-contrast))]">
            {metrics.averageImprovement.toFixed(1)}%
          </div>
          <div className="text-sm text-[hsl(var(--muted-contrast))]">Avg Improvement</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[hsl(var(--warning-contrast))]">
            {Math.round(
              (metrics.passedTests / metrics.totalTests) * 100
            )}
            %
          </div>
          <div className="text-sm text-[hsl(var(--muted-contrast))]">Success Rate</div>
        </div>
      </div>
    </div>
  );
};