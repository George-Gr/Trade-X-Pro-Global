import React from 'react';
import { Card } from '@/components/ui/card';
import { usePortfolioData } from '@/hooks/usePortfolioData';

export const AccountSummary: React.FC = () => {
  const { profile, calculateEquity, calculateFreeMargin, calculateMarginLevel, refresh } = usePortfolioData();

  const equity = calculateEquity();
  const freeMargin = calculateFreeMargin();
  const marginLevel = calculateMarginLevel();

  return (
    <Card className="p-4 bg-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Account Balance</p>
          <p className="text-2xl font-bold font-mono">${(profile?.balance ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-muted-foreground">Equity: <span className="font-mono">${equity.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></p>
        </div>

        <div className="text-right space-y-2">
          <p className="text-sm text-muted-foreground">Margin Level</p>
          <p className="font-mono font-semibold">{Number.isFinite(marginLevel) ? `${marginLevel.toFixed(1)}%` : '—'}</p>
          <p className="text-xs text-muted-foreground">Free: <span className="font-mono">${freeMargin.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></p>
          <button className="btn btn-sm mt-2" onClick={() => refresh()}>Refresh</button>
        </div>
      </div>
    </Card>
  );
};

export default AccountSummary;
