/**
 * Hook: useRiskMetrics
 *
 * Real-time risk metrics monitoring and calculations
 * Provides margin level, capital at risk, risk classification, and alerts
 */

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import {
  calculateRiskMetrics,
  assessPortfolioRisk,
  classifyRiskLevel,
  RiskMetrics,
  PortfolioRiskAssessment,
} from "@/lib/risk/riskMetrics";
import type { Position } from "@/integrations/supabase/types/tables";

// Interface for position risk data
interface PositionRiskData {
  symbol: string;
  quantity: number;
  positionValue: number;
}

interface UseRiskMetricsReturn {
  riskMetrics: RiskMetrics | null;
  portfolioRiskAssessment: PortfolioRiskAssessment | null;
  loading: boolean;
  error: string | null;
  isCloseOnlyMode: boolean;
  isLiquidationRisk: boolean;
  refetch: () => Promise<void>;
}

export const useRiskMetrics = (): UseRiskMetricsReturn => {
  const { user } = useAuth();
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [portfolioRiskAssessment, setPortfolioRiskAssessment] =
    useState<PortfolioRiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile and positions data
  const fetchRiskData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("equity, margin_used, balance")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch open positions
      const { data: positionsData, error: positionsError } = await supabase
        .from("positions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "open");

      if (positionsError) throw positionsError;

      // Convert positions to format needed for calculations
      const positions = (positionsData as Position[]).map(p => ({
        positionValue: (p.quantity || 0) * (p.current_price || 0),
        marginRequired: p.margin_used || 0,
      }));

      // Calculate risk metrics
      const metrics = calculateRiskMetrics(
        profileData.equity || 0,
        profileData.margin_used || 0,
        positions
      );

      setRiskMetrics(metrics);

      // Calculate portfolio risk assessment
      const concentration = calculateConcentration(positionsData as Position[]);
      const assessment = assessPortfolioRisk(
        metrics,
        Array.isArray(positionsData)
          ? positionsData.map((p: Position) => ({
              symbol: typeof p.symbol === 'string' ? p.symbol : String(p.symbol ?? ''),
              quantity: typeof p.quantity === 'number' ? p.quantity : Number(p.quantity ?? 0),
              positionValue: (Number(p.quantity ?? 0)) * (Number(p.current_price ?? 0)),
            }))
          : [],
        concentration
      );
      setPortfolioRiskAssessment(assessment);

      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch risk metrics";
      setError(message);
      console.error("Risk metrics error:", message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    fetchRiskData();

    if (!user) return;

    // Subscribe to profile changes
    const profileChannel = supabase
      .channel(`risk-profile-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        () => {
          fetchRiskData();
        }
      )
      .subscribe();

    // Subscribe to position changes
    const positionsChannel = supabase
      .channel(`risk-positions-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "positions",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchRiskData();
        }
      )
      .subscribe();

    return () => {
      profileChannel.unsubscribe();
      positionsChannel.unsubscribe();
    };
  }, [user, fetchRiskData]);

  // Derived states
  const isCloseOnlyMode = useMemo(() => {
    if (!riskMetrics) return false;
    return riskMetrics.currentMarginLevel < riskMetrics.marginCallThreshold;
  }, [riskMetrics]);

  const isLiquidationRisk = useMemo(() => {
    if (!riskMetrics) return false;
    return riskMetrics.currentMarginLevel < riskMetrics.liquidationThreshold;
  }, [riskMetrics]);

  return {
    riskMetrics,
    portfolioRiskAssessment,
    loading,
    error,
    isCloseOnlyMode,
    isLiquidationRisk,
    refetch: fetchRiskData,
  };
};

/**
 * Helper function to calculate position concentration
 */
function calculateConcentration(positions: Position[]): number {
  if (positions.length === 0) return 0;

  const totalValue = positions.reduce(
    (sum, p) => sum + (p.quantity || 0) * (p.current_price || 0),
    0
  );

  if (totalValue === 0) return 0;

  // Find largest position concentration
  const largestValue = Math.max(
    ...positions.map(p => (p.quantity || 0) * (p.current_price || 0))
  );

  return (largestValue / totalValue) * 100;
}
