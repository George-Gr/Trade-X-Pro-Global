import React from 'react';
import AccountSummary from './AccountSummary';
import EquityChart from './EquityChart';
import AssetAllocation from './AssetAllocation';
import PerformanceMetrics from './PerformanceMetrics';
import RecentPnLChart from './RecentPnLChart';
import ExportToolbar from './ExportToolbar';

export const PortfolioDashboardSummary: React.FC = () => {
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
