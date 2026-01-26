import { Card } from '@/components/ui/card';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { usePortfolioCalculations } from '@/hooks/usePortfolioCalculations';
import { PortfolioMetricsCards } from './PortfolioMetricsCards';
import { TimePnLTracking } from './TimePnLTracking';
import { PnLBreakdownCard } from './PnLBreakdownCard';
import { PerformanceMetricsCard } from './PerformanceMetricsCard';
import { HoldingsTable } from './HoldingsTable';
import { AssetAllocationCard } from './AssetAllocationCard';

/**
 * EnhancedPortfolioDashboard Component
 *
 * Advanced portfolio overview with enhanced analytics:
 * - Comprehensive metrics with time-based P&L tracking
 * - Advanced asset allocation with risk metrics
 * - Performance analytics with Sharpe ratio and drawdown
 * - Interactive holdings with real-time updates
 * - Equity curve and risk management indicators
 * - Multi-timeframe performance tracking
 */
export const EnhancedPortfolioDashboard = () => {
  const { profile, positions, loading, error } = usePortfolioData();
  const { metrics, assetAllocation, performanceMetrics } = usePortfolioCalculations({
    profile,
    positions,
  });

  if (error) {
    return (      <Card className="p-4 border-destructive/20 bg-destructive/5">
        <p className="text-destructive">
          Unable to load portfolio data
        </p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6 bg-card">
        <div className="text-center text-muted-foreground">
          Loading enhanced portfolio analytics...
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Key Metrics Row */}
      <PortfolioMetricsCards metrics={metrics} />

      {/* Time-based P&L Tracking */}
      <TimePnLTracking performanceMetrics={performanceMetrics} />

      {/* Enhanced P&L Breakdown and Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PnLBreakdownCard metrics={metrics} />
        <PerformanceMetricsCard performanceMetrics={performanceMetrics} />
      </div>

      {/* Holdings and Enhanced Asset Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <HoldingsTable positions={positions || []} />
        </div>
        <AssetAllocationCard assetAllocation={assetAllocation} />
      </div>
    </div>
  );
};

export default EnhancedPortfolioDashboard;