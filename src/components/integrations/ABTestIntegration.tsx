import React, { useEffect, useMemo, useState } from 'react';
import {
  experimentManager,
  ExperimentResult,
} from '../../lib/ab-testing/experimentManager';
import { cn } from '../../lib/utils';
import {
  CTAVariant,
  DepositCTA,
  DownloadAppCTA,
  TradingSignupCTA,
} from '../ab-testing/CTAVariant';
import { ABTestResultsPanel } from './ABTestResultsPanel';

interface ABTestIntegrationProps {
  children: React.ReactNode;
  userId: string;
  enableABTesting?: boolean;
  experimentId?: string;
}

export function ABTestIntegration({
  children,
  userId: _userId,
  enableABTesting = true,
  experimentId = 'signup_cta_optimization',
}: ABTestIntegrationProps) {
  const [isExperimentActive, setIsExperimentActive] = useState(false);
  const [experimentResults, setExperimentResults] = useState<
    ExperimentResult[] | null
  >(null);

  useEffect(() => {
    if (enableABTesting) {
      // Check if experiment is active
      const experiments = experimentManager.getActiveExperiments();
      const currentExperiment = experiments.find(
        (exp: { id: string }) => exp.id === experimentId
      );
      setIsExperimentActive(!!currentExperiment);

      // Get experiment results
      if (currentExperiment) {
        const results = experimentManager.getResults(experimentId);
        setExperimentResults(results);
      }
    }
  }, [enableABTesting, experimentId]);

  return (
    <div
      className={cn('ab-test-container', {
        'ab-test-active': isExperimentActive,
      })}
    >
      {children}
      {isExperimentActive && experimentResults && (
        <ABTestResultsPanel results={experimentResults} />
      )}
    </div>
  );
}

// CTA Testing wrapper component
export function CTATestWrapper({
  children,
  userId,
  experimentType = 'signup',
}: {
  children: React.ReactNode;
  userId: string;
  experimentType?: 'signup' | 'deposit' | 'download';
}) {
  const experimentIds = {
    signup: 'signup_cta_optimization',
    deposit: 'deposit_cta_optimization',
    download: 'download_cta_optimization',
  };

  const experimentId = experimentIds[experimentType];

  return (
    <CTAVariant
      experimentId={experimentId}
      userId={userId}
      trackConversion={true}
    >
      {children}
    </CTAVariant>
  );
}

// Pre-configured CTA experiments for quick setup - moved to separate file

// Quick CTA components for immediate use
export function QuickSignupCTA({
  userId,
  onSignup,
  variant = 'auto', // 'auto', 'urgency', 'social', 'benefit'
}: {
  userId: string;
  onSignup?: () => void;
  variant?: 'auto' | 'urgency' | 'social' | 'benefit';
}) {
  const currentVariant = useMemo(() => {
    if (variant !== 'auto') {
      return variant;
    } else {
      // Auto-select best performing variant based on experiment results
      const results = experimentManager.getResults('signup_cta_optimization');
      if (results && results.length > 0) {
        const best = results.reduce(
          (best: ExperimentResult, current: ExperimentResult) =>
            current.conversionRate > best.conversionRate ? current : best
        );
        return best.variantName.toLowerCase().includes('urgency')
          ? 'urgency'
          : 'social';
      }
      return 'social'; // fallback default
    }
  }, [variant]);

  const getCTAContent = () => {
    switch (currentVariant) {
      case 'urgency':
        return {
          text: 'Start Trading Now',
          className:
            'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700',
        };
      case 'social':
        return {
          text: 'Join 50,000+ Traders',
          className: 'bg-green-600 text-white hover:bg-green-700',
        };
      default:
        return {
          text: 'Get Started',
          className: '',
        };
    }
  };

  const { text, className } = getCTAContent();

  return (
    <TradingSignupCTA userId={userId} onSignup={onSignup} className={className}>
      {text}
    </TradingSignupCTA>
  );
}

export function QuickDepositCTA({
  userId,
  onDeposit,
}: {
  userId: string;
  onDeposit?: () => void;
}) {
  return (
    <DepositCTA userId={userId} onDeposit={onDeposit}>
      Make Deposit
    </DepositCTA>
  );
}

export function QuickDownloadCTA({
  userId,
  onDownload,
}: {
  userId: string;
  onDownload?: () => void;
}) {
  return (
    <DownloadAppCTA userId={userId} onDownload={onDownload}>
      Download App
    </DownloadAppCTA>
  );
}
