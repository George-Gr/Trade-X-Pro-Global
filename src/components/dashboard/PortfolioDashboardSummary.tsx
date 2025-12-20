import type { FC } from 'react';
import AccountSummary from './AccountSummary';
import AssetAllocation from './AssetAllocation';
import EquityChart from './EquityChart';
import ExportToolbar from './ExportToolbar';
import PerformanceMetrics from './PerformanceMetrics';
import RecentPnLChart from './RecentPnLChart';

export const PortfolioDashboardSummary: FC = () => {
  return (
    <div className="space-y-6">
      {/* Export toolbar */}
      <div className="flex justify-end">
        <ExportToolbar />
      </div>

      <AccountSummary />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <EquityChart />
        </div>
        <div className="space-y-4">
          <AssetAllocation />
          <PerformanceMetrics />
        </div>
      </div>

      <RecentPnLChart />
    </div>
  );
};

export default PortfolioDashboardSummary;
