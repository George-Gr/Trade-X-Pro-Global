import React from 'react';

interface BenchmarkResult {
  name: string;
  description: string;
  before: number;
  after: number;
  improvement: number;
  category: 'rendering' | 'updates' | 'fetching' | 'calculations';
  isSignificant: boolean;
}

interface BenchmarkResultCardProps {
  result: BenchmarkResult;
}

export const BenchmarkResultCard: React.FC<BenchmarkResultCardProps> = ({ result }) => {
  return (
    <div
      className={`p-4 rounded-lg border-2 ${
        result.isSignificant
          ? 'bg-[hsl(var(--status-safe))] border-[hsl(var(--status-safe-border))]'
          : 'bg-[hsl(var(--status-warning))] border-[hsl(var(--status-warning-border))]'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-[hsl(var(--text-high-contrast))]">
            {result.name}
          </h4>
          <p className="text-sm text-[hsl(var(--muted-contrast))]">
            {result.description}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            result.isSignificant
              ? 'bg-[hsl(var(--status-safe))] text-[hsl(var(--status-safe-foreground))]'
              : 'bg-[hsl(var(--status-warning))] text-[hsl(var(--status-warning-foreground))]'
          }`}
        >
          {result.improvement > 0 ? '+' : ''}
          {result.improvement.toFixed(1)}%
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-[hsl(var(--muted-contrast))]">Before:</span>
          <span className="ml-2 font-mono">
            {result.before.toFixed(2)}ms
          </span>
        </div>
        <div>
          <span className="text-[hsl(var(--muted-contrast))]">After:</span>
          <span className="ml-2 font-mono">
            {result.after.toFixed(2)}ms
          </span>
        </div>
      </div>
      <div className="mt-2 text-xs text-[hsl(var(--muted-contrast))]">
        Category: {result.category}
      </div>
    </div>
  );
};