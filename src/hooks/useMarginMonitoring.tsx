/**
 * Hook: useMarginMonitoring
 *
 * Purpose: Real-time margin level monitoring with status and action tracking
 * Task: TASK 1.2.4 - Margin Level Monitoring & Alerts
 *
 * Features:
 * - Real-time margin level updates from Realtime subscriptions
 * - Automatic status classification (SAFE, WARNING, CRITICAL, LIQUIDATION)
 * - Action recommendations based on margin status
 * - Time-to-liquidation estimation
 * - Manual refresh capability
 * - Error handling and reconnection
 * - Normalized data structures
 *
 * Returns:
 * {
 *   marginLevel: number | null,
 *   marginStatus: MarginStatus,
 *   isWarning: boolean,
 *   isCritical: boolean,
 *   isLiquidationRisk: boolean,
 *   timeToLiquidation: number | null,
 *   recommendedActions: MarginAction[],
 *   isLoading: boolean,
 *   error: string | null,
 *   lastUpdated: Date | null,
 *   refresh: () => Promise<void>,
 *   acknowledgeAlert: (alertId: string) => Promise<void>,
 * }
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { useRealtimePositions } from "./useRealtimePositions";
import {
  MarginStatus,
  getMarginStatus,
  calculateMarginLevel,
  isMarginWarning,
  isMarginCritical,
  isLiquidationRisk,
  getMarginActionRequired,
  estimateTimeToLiquidation,
  type MarginAction,
} from "@/lib/trading/marginMonitoring";
import { supabase } from "@/integrations/supabase/client";

interface MarginMonitoringState {
  marginLevel: number | null;
  marginStatus: MarginStatus;
  accountEquity: number | null;
  marginUsed: number | null;
  isWarning: boolean;
  isCritical: boolean;
  isLiquidationRisk: boolean;
  timeToLiquidation: number | null;
  recommendedActions: MarginAction[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface UseMarginMonitoringOptions {
  refreshInterval?: number; // ms between auto-refresh (null = no auto-refresh)
  enabled?: boolean; // Enable/disable monitoring
  onStatusChange?: (status: MarginStatus, previousStatus: MarginStatus) => void;
  onCritical?: () => void;
  onLiquidationRisk?: () => void;
}

export function useMarginMonitoring(
  options: UseMarginMonitoringOptions = {}
) {
  const {
    refreshInterval = null,
    enabled = true,
    onStatusChange,
    onCritical,
    onLiquidationRisk,
  } = options;

  const { user } = useAuth();
  const [state, setState] = useState<MarginMonitoringState>({
    marginLevel: null,
    marginStatus: MarginStatus.SAFE,
    accountEquity: null,
    marginUsed: null,
    isWarning: false,
    isCritical: false,
    isLiquidationRisk: false,
    timeToLiquidation: null,
    recommendedActions: [],
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const previousStatusRef = useRef<MarginStatus>(MarginStatus.SAFE);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch current user profile with margin data
   */
  const fetchMarginData = useCallback(async () => {
    if (!user?.id || !enabled) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase
        .from("profiles")
        .select("id, equity, margin_used, margin_level")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        // Calculate current margin level if not in DB
        let currentMarginLevel = data.margin_level;
        if (
          currentMarginLevel === null &&
          data.equity &&
          data.margin_used
        ) {
          currentMarginLevel = calculateMarginLevel(
            data.equity,
            data.margin_used
          );
        }

        const status = getMarginStatus(currentMarginLevel ?? 0);
        const previousStatus = previousStatusRef.current;

        // Check if status changed
        if (status !== previousStatus) {
          previousStatusRef.current = status;
          onStatusChange?.(status, previousStatus);

          // Call specific handlers for critical states
          if (status === MarginStatus.CRITICAL) {
            onCritical?.();
          }
          if (status === MarginStatus.LIQUIDATION) {
            onLiquidationRisk?.();
          }
        }

        setState({
          marginLevel: currentMarginLevel,
          marginStatus: status,
          accountEquity: data.equity,
          marginUsed: data.margin_used,
          isWarning: isMarginWarning(currentMarginLevel ?? 0),
          isCritical: isMarginCritical(currentMarginLevel ?? 0),
          isLiquidationRisk: isLiquidationRisk(currentMarginLevel ?? 0),
          timeToLiquidation: estimateTimeToLiquidation(
            currentMarginLevel ?? 0
          ),
          recommendedActions: getMarginActionRequired(status),
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        });
      }
    } catch (error) {
      // Error silently handled - UI shows error state
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch margin data",
      }));
    }
  }, [user?.id, enabled, onStatusChange, onCritical, onLiquidationRisk]);

  /**
   * Subscribe to real-time position updates
   * This triggers margin recalculation when positions change
   */
  const { positions } = useRealtimePositions(user?.id);

  // Recalculate margin when positions change
  useEffect(() => {
    if (positions.length > 0) {
      fetchMarginData();
    }
  }, [positions, fetchMarginData]);

  /**
   * Set up auto-refresh interval
   */
  useEffect(() => {
    if (!enabled || !refreshInterval) return;

    refreshTimerRef.current = setInterval(fetchMarginData, refreshInterval);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [enabled, refreshInterval, fetchMarginData]);

  /**
   * Subscribe to profile updates for margin changes
   */
  useEffect(() => {
    if (!user?.id || !enabled) return;

    const channel = supabase
      .channel(`margin-updates-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            const newData = payload.new as Record<string, unknown>;
            let currentMarginLevel = newData.margin_level;

            if (
              currentMarginLevel === null &&
              newData.equity &&
              newData.margin_used
            ) {
              currentMarginLevel = calculateMarginLevel(
                Number(newData.equity),
                Number(newData.margin_used)
              ) as number;
            }

            const status = getMarginStatus(Number(currentMarginLevel ?? 0));
            const previousStatus = previousStatusRef.current;

            if (status !== previousStatus) {
              previousStatusRef.current = status;
              onStatusChange?.(status, previousStatus);

              if (status === MarginStatus.CRITICAL) {
                onCritical?.();
              }
              if (status === MarginStatus.LIQUIDATION) {
                onLiquidationRisk?.();
              }
            }

            setState({
              marginLevel: Number(currentMarginLevel ?? 0),
              marginStatus: status,
              accountEquity: Number(newData.equity),
              marginUsed: Number(newData.margin_used),
              isWarning: isMarginWarning(Number(currentMarginLevel ?? 0)),
              isCritical: isMarginCritical(Number(currentMarginLevel ?? 0)),
              isLiquidationRisk: isLiquidationRisk(Number(currentMarginLevel ?? 0)),
              timeToLiquidation: estimateTimeToLiquidation(
                Number(currentMarginLevel ?? 0)
              ),
              recommendedActions: getMarginActionRequired(status),
              isLoading: false,
              error: null,
              lastUpdated: new Date(),
            });
          }
        }
      )
      .subscribe();

    return () => {
      // Properly unsubscribe from channel before removing to prevent memory leaks
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [user?.id, enabled, onStatusChange, onCritical, onLiquidationRisk]);

  /**
   * Initial fetch on mount
   */
  useEffect(() => {
    fetchMarginData();
  }, [fetchMarginData]);

  /**
   * Refresh margin data manually
   */
  const refresh = useCallback(async () => {
    await fetchMarginData();
  }, [fetchMarginData]);

  /**
   * Acknowledge a margin alert (mark as read)
   * Note: This will be implemented once margin_alerts table is added to Supabase types
   */
  const acknowledgeAlert = useCallback(
    async (alertId: string) => {
      // Alert acknowledgment will be implemented after schema migration
      // Feature flagged for future release
    },
    []
  );

  return {
    marginLevel: state.marginLevel,
    marginStatus: state.marginStatus,
    accountEquity: state.accountEquity,
    marginUsed: state.marginUsed,
    isWarning: state.isWarning,
    isCritical: state.isCritical,
    isLiquidationRisk: state.isLiquidationRisk,
    timeToLiquidation: state.timeToLiquidation,
    recommendedActions: state.recommendedActions,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    refresh,
    acknowledgeAlert,
  };
}

// Export types for external use
export type { MarginMonitoringState, UseMarginMonitoringOptions };
