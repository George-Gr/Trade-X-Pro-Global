import { Card } from '@/components/ui/card';
import { PieChart } from 'lucide-react';
import React from 'react';

interface AssetAllocationItem {
  symbol: string;
  value: number;
  percentage: number;
  side: string;
  pnl: number;
  risk: number;
}

interface AssetAllocationCardProps {
  assetAllocation: AssetAllocationItem[];
}

/**
 * AssetAllocationCard component displays the asset allocation and risk information for a portfolio.
 * @param props - The props object.
 * @param props.assetAllocation - An array of AssetAllocationItem objects representing the assets.
 */
export const AssetAllocationCard: React.FC<AssetAllocationCardProps> = ({ assetAllocation }) => {
  return (
    <Card className="p-4 bg-card">
      <div className="flex items-center gap-4 mb-4">
        <PieChart className="h-4 w-4" />
        <h3 className="font-semibold">Asset Allocation & Risk</h3>
      </div>
      {assetAllocation.length > 0 ? (
        <div className="space-y-4">
          {assetAllocation.map((asset) => (
            <div key={asset.symbol}>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  {asset.symbol}
                </span>
                <span className="font-semibold">
                  {asset.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden mb-2">
                <div
                  className={`h-full ${asset.side === 'buy' ? 'bg-profit' : 'bg-loss'}`}
                  style={{ width: `${Math.min(asset.percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>P&L: {asset.pnl >= 0 ? '+' : ''}{asset.pnl.toFixed(2)}%</span>
                <span>Risk: ${asset.risk.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground text-sm py-4">
          No positions
        </p>
      )}
    </Card>
  );
};