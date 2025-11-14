import React from 'react';
import AccountSummary from './AccountSummary';
import EquityChart from './EquityChart';
import AssetAllocation from './AssetAllocation';
import PerformanceMetrics from './PerformanceMetrics';
import { Card } from '@/components/ui/card';

export const PortfolioDashboardSummary: React.FC = () => {
  return (
    <div className="space-y-6">
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

      <Card className="p-4 bg-card">
        <h3 className="font-semibold">Recent P&L</h3>
        <p className="text-sm text-muted-foreground">Recent P&L chart coming soon</p>
      </Card>
    </div>
  );
};

export default PortfolioDashboardSummary;
