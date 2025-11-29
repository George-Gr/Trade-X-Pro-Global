/**
 * Hook: useRiskMetrics
 *
 * Real-time risk metrics monitoring and calculations
 * Provides margin level, capital at risk, risk classification, and alerts
 */

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "./useAuth";
import {
  calculateRiskMetrics,
  assessPortfolioRisk,
  classifyRiskLevel,
  RiskMetrics,
  PortfolioRiskAssessment,
} from "@/lib/risk/riskMetrics";
import type { Position } from "@/integrations/supabase/types/tables";

const getSupabaseClient = async () => {
  const { supabase } = await import("@/integrations/supabase/client");
  return supabase;
};

// Interface for position risk data
interface PositionRiskData {
  symbol: string;
  quantity: number;
  positionValue: number;
}

interface UseRiskMetricsReturn {
  riskMetrics: RiskMetrics | null;
  portfolioRiskAssessment: PortfolioRiskAssessment | null;
  marginTrend: number[]; // Last 7 days of margin levels for sparkline
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
  const [marginTrend, setMarginTrend] = useState<number[]>([]);
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
      const supabase = await getSupabaseClient();

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

      // Try to fetch margin history (last 7 days) for sparkline
      let marginHistoryData: any[] = [];
      let historyError: any = null;
      
      try {
        const { data, error } = await supabase
          .from('margin_history' as any)
          .select('margin_level')
          .eq('user_id', user.id)
          .gt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: true });

        if (error) {
          console.warn("margin_history table not found, trying margin_call_events fallback:", error);
          historyError = error;
          
          // Fallback to margin_call_events for margin level data
          const { data: callEventsData, error: callEventsError } = await supabase
            .from('margin_call_events' as any)
            .select('margin_level, triggered_at')
            .eq('user_id', user.id)
            .gt('triggered_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .order('triggered_at', { ascending: true });

          if (callEventsError) {
            console.warn("Failed to fetch margin_call_events:", callEventsError);
          } else {
            marginHistoryData = callEventsData || [];
            console.log("Using margin_call_events as fallback for margin history");
          }
        } else {
          marginHistoryData = data || [];
        }
      } catch (err) {
        console.warn("Error fetching margin history:", err);
        historyError = err;
      }

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

      // Set margin trend from history
      if (marginHistoryData && marginHistoryData.length > 0) {
        // Handle both margin_history and margin_call_events formats
        const trend = marginHistoryData.map((d: any) => {
          // If it's margin_call_events format, use margin_level field
          if ('margin_level' in d) {
            return d.margin_level;
          }
          // If it's margin_history format, use margin_level field
          return d.margin_level || 0;
        }).filter((level: number) => level > 0); // Filter out invalid levels
        
        if (trend.length > 0) {
          setMarginTrend(trend);
        } else {
          // If no valid data, use current margin level as single data point
          setMarginTrend([metrics.currentMarginLevel]);
        }
      } else {
        // If no history, use current margin level as single data point
        setMarginTrend([metrics.currentMarginLevel]);
      }

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
    let isMounted = true;
    let profileChannel: any = null;
    let positionsChannel: any = null;

    const setup = async () => {
      if (!user) return;
      await fetchRiskData();

      try {
        const supabase = await getSupabaseClient();
        if (!isMounted) return;

        // Subscribe to profile changes
        profileChannel = supabase
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
        positionsChannel = supabase
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
      } catch (error) {
        console.error("Failed to set up risk metrics subscriptions", error);
      }
    };

    setup();

    return () => {
      isMounted = false;
      profileChannel?.unsubscribe();
      positionsChannel?.unsubscribe();
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
    marginTrend,
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
