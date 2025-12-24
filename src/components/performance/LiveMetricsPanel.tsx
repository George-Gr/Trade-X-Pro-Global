import React from 'react';
import { performanceMonitoring } from '@/lib/performance/performanceMonitoring';

interface LiveMetricsPanelProps {
  prices: Map<string, number>;
  calculations: Map<string, any>;
  formState: Record<string, any>;
  priceStreamPending: boolean;
  isFormPending: boolean;
}

export const LiveMetricsPanel: React.FC<LiveMetricsPanelProps> = ({
  prices,
  calculations,
  formState,
  priceStreamPending,
  isFormPending,
}) => {
  return (
    <div className="mt-8 p-6 bg-[hsl(var(--background-elevated))] rounded-lg">
      <h3 className="text-lg font-semibold text-[hsl(var(--text-high-contrast))] mb-4">
        Live Performance Metrics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-xl font-bold text-[hsl(var(--text-high-contrast))]">
            {prices.size}
          </div>
          <div className="text-sm text-[hsl(var(--muted-contrast))]">Active Streams</div>
          <div className="text-xs text-[hsl(var(--muted-contrast))]"
            {priceStreamPending ? 'Updating...' : 'Ready'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-[hsl(var(--text-high-contrast))]">
            {Object.keys(formState).length}
          </div>
          <div className="text-sm text-[hsl(var(--muted-contrast))]">Form Fields</div>
          <div className="text-xs text-[hsl(var(--muted-contrast))]">
            {isFormPending ? 'Pending' : 'Stable'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-[hsl(var(--text-high-contrast))]">
            {calculations.size}
          </div>
          <div className="text-sm text-[hsl(var(--muted-contrast))]">Risk Calculations</div>
          <div className="text-xs text-[hsl(var(--muted-contrast))]">Batched</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-[hsl(var(--text-high-contrast))]">
            {performanceMonitoring.getTimeSeriesData('react-render')
              .length || 0}
          </div>
          <div className="text-sm text-[hsl(var(--muted-contrast))]">Render Events</div>
          <div className="text-xs text-[hsl(var(--muted-contrast))]">Tracked</div>
        </div>
      </div>
    </div>
  );
};