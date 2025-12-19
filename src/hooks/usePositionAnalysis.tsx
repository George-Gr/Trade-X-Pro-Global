/**
 * Hook: usePositionAnalysis
 *
 * Detailed position analysis including concentration, correlation, and stress testing
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseBrowserClient';
import { useAuth } from './useAuth';
import {
  analyzeConcentration,
  buildCorrelationMatrix,
  runStressTests,
  assessDiversification,
  ConcentrationAnalysis,
  CorrelationMatrix,
  StressTestResults,
  DiversificationMetrics,
} from '@/lib/risk/positionAnalysis';
import type { Position } from '@/integrations/supabase/types/tables';

interface UsePositionAnalysisReturn {
  concentration: ConcentrationAnalysis | null;
  correlation: CorrelationMatrix | null;
  stressTests: StressTestResults | null;
  diversification: DiversificationMetrics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePositionAnalysis = (): UsePositionAnalysisReturn => {
  const { user } = useAuth();
  const [concentration, setConcentration] =
    useState<ConcentrationAnalysis | null>(null);
  const [correlation, setCorrelation] = useState<CorrelationMatrix | null>(
    null
  );
  const [stressTests, setStressTests] = useState<StressTestResults | null>(
    null
  );
  const [diversification, setDiversification] =
    useState<DiversificationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch open positions
      const { data: positionsData, error: positionsError } = await supabase
        .from('positions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'open');

      if (positionsError) throw positionsError;

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('equity, margin_used')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const positions = positionsData as Position[];

      if (positions.length === 0) {
        setConcentration(null);
        setDiversification(null);
        setError(null);
        setLoading(false);
        return;
      }

      // Calculate total portfolio value
      const totalPortfolioValue =
        positions.reduce(
          (sum, p) => sum + (p.quantity || 0) * (p.current_price || 0),
          0
        ) + (profileData?.equity || 0);

      // Fetch asset specs to get asset classes
      const { data: assetSpecs, error: assetSpecsError } = await supabase
        .from('asset_specs')
        .select('symbol, asset_class')
        .in('symbol', positions.map((p) => p.symbol).filter(Boolean));

      if (assetSpecsError) throw assetSpecsError;

      // Create symbol to asset class mapping
      const symbolToAssetClass: Record<string, string> = {};
      assetSpecs?.forEach((spec) => {
        symbolToAssetClass[spec.symbol] = spec.asset_class || 'Other';
      });

      // Analyze concentration
      const concentrationData = analyzeConcentration(
        positions.map((p) => ({
          symbol: p.symbol || '',
          assetClass: symbolToAssetClass[p.symbol] || 'Other',
          quantity: p.quantity || 0,
          currentPrice: p.current_price || 0,
          marginRequired: p.margin_used || 0,
          unrealizedPnL: p.unrealized_pnl || 0,
        })),
        totalPortfolioValue
      );
      setConcentration(concentrationData);

      // Analyze diversification
      const diversificationData = assessDiversification(
        positions.map((p) => ({
          symbol: p.symbol || '',
          assetClass: symbolToAssetClass[p.symbol] || 'Other',
          quantity: p.quantity || 0,
          currentPrice: p.current_price || 0,
        })),
        totalPortfolioValue
      );
      setDiversification(diversificationData);

      // Run stress tests
      const stressTestData = runStressTests(
        positions.map((p) => ({
          symbol: p.symbol || '',
          side: (p.side as 'long' | 'short') || 'long',
          quantity: p.quantity || 0,
          currentPrice: p.current_price || 0,
          liquidationPrice: calculateLiquidationPrice(
            p.current_price || 0,
            (p.side as 'long' | 'short') || 'long'
          ),
          marginRequired: p.margin_used || 0,
          unrealizedPnL: p.unrealized_pnl || 0,
        })),
        profileData?.equity || 0,
        profileData?.margin_used || 0
      );
      setStressTests(stressTestData);

      // Correlation analysis is skipped if less than 2 positions
      if (positions.length >= 2) {
        // In production, you'd fetch historical price data and build correlation matrix
        // For now, we'll skip correlation as it requires historical data
        setCorrelation(null);
      }

      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to analyze positions';
      setError(message);
      console.error('Position analysis error:', message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    fetchAnalysis();

    if (!user) return;

    const positionsChannel = supabase
      .channel(`position-analysis-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'positions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchAnalysis();
        }
      )
      .subscribe();

    return () => {
      positionsChannel.unsubscribe();
    };
  }, [user, fetchAnalysis]);

  return {
    concentration,
    correlation,
    stressTests,
    diversification,
    loading,
    error,
    refetch: fetchAnalysis,
  };
};

/**
 * Helper function to calculate liquidation price
 */
function calculateLiquidationPrice(
  currentPrice: number,
  side: 'long' | 'short',
  leverage: number = 2
): number {
  if (side === 'long') {
    return currentPrice / leverage;
  } else {
    return currentPrice * leverage;
  }
}
