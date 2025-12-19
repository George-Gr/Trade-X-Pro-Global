/**
 * Component: TradingPageGate
 *
 * Purpose: Gate the trading page behind KYC verification
 * Task: TASK 1.3.4 - Trading Access Control
 *
 * Features:
 * - Check KYC status before showing trading UI
 * - Show KycRequired component if not approved
 * - Allow trading if approved
 * - Show notification hooks
 */

import React from 'react';
import { useKycTrading } from '@/hooks/useKycTrading';
import { useKycNotifications } from '@/hooks/useKycNotifications';
import { KycRequired } from './KycRequired';
import { Loader2 } from 'lucide-react';

interface TradingPageGateProps {
  children?: React.ReactNode;
}

export const TradingPageGate: React.FC<TradingPageGateProps> = ({
  children,
} = {}) => {
  const kycState = useKycTrading();

  // Set up notification listener
  useKycNotifications();

  if (kycState.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Checking KYC status...</p>
        </div>
      </div>
    );
  }

  if (!kycState.canTrade) {
    return (
      <KycRequired
        kycStatus={kycState.kycStatus}
        rejectionReason={kycState.rejectionReason}
        daysUntilResubmit={kycState.daysUntilResubmit}
        approvedAt={kycState.approvedAt}
      />
    );
  }

  // User is approved, show trading UI
  return <>{children}</>;
};
