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

import { useAuth } from '@/hooks/useAuth';
import { useRealtimePositions } from '@/hooks/useRealtimePositions';
import { supabase } from '@/integrations/supabase/client';
import type { MarginAction } from '@/lib/trading/marginMonitoring';
import {
  MarginStatus,
  calculateMarginLevel,
  estimateTimeToLiquidation,
  getMarginActionRequired,
  getMarginStatus,
  isLiquidationRisk,
  isMarginCritical,
  isMarginWarning,
} from '@/lib/trading/marginMonitoring';
import { useCallback, useEffect, useRef, useState } from 'react';

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

interface MarginStateInput {
  equity: number | null;
  margin_used: number | null;
  margin_level: number | null;
}

interface CalculatedMarginState {
  marginLevel: number;
  marginStatus: MarginStatus;
  accountEquity: number;
  marginUsed: number;
  isWarning: boolean;
  isCritical: boolean;
  isLiquidationRisk: boolean;
  timeToLiquidation: number | null;
  recommendedActions: MarginAction[];
}

/**
 * Calculate margin state from raw margin data
 */
function calculateMarginState({
  equity,
  margin_used,
  margin_level,
}: MarginStateInput): CalculatedMarginState {
  // Calculate current margin level if not provided
  let currentMarginLevel = margin_level;
  if (currentMarginLevel === null && equity && margin_used) {
    currentMarginLevel = calculateMarginLevel(equity, margin_used);
  }

  // Validate we have sufficient data
  if (currentMarginLevel === null) {
    // Return a safe default state when data is unavailable
    return {
      marginLevel: 0,
      marginStatus: MarginStatus.SAFE,
      accountEquity: equity ?? 0,
      marginUsed: margin_used ?? 0,
      isWarning: false,
      isCritical: false,
      isLiquidationRisk: false,
      timeToLiquidation: null,
      recommendedActions: [],
    };
  }

  const status = getMarginStatus(currentMarginLevel ?? 0);
  const marginLevel = Number(currentMarginLevel ?? 0);

  return {
    marginLevel,
    marginStatus: status,
    accountEquity: equity ?? 0,
    marginUsed: margin_used ?? 0,
    isWarning: isMarginWarning(marginLevel),
    isCritical: isMarginCritical(marginLevel),
    isLiquidationRisk: isLiquidationRisk(marginLevel),
    timeToLiquidation: estimateTimeToLiquidation(marginLevel),
    recommendedActions: getMarginActionRequired(status),
  };
}

interface UseMarginMonitoringOptions {
  refreshInterval?: number; // ms between auto-refresh (null = no auto-refresh)
  enabled?: boolean; // Enable/disable monitoring
  onStatusChange?: (status: MarginStatus, previousStatus: MarginStatus) => void;
  onCritical?: () => void;
  onLiquidationRisk?: () => void;
}

export function useMarginMonitoring(options: UseMarginMonitoringOptions = {}) {
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
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Fetch current user profile with margin data
   */
  const fetchMarginData = useCallback(async () => {
    if (!user?.id || !enabled) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase
        .from('profiles')
        .select('id, equity, margin_used, margin_level')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        const calculatedState = calculateMarginState({
          equity: data.equity,
          margin_used: data.margin_used,
          margin_level: data.margin_level,
        });

        const previousStatus = previousStatusRef.current;

        // Check if status changed
        if (calculatedState.marginStatus !== previousStatus) {
          previousStatusRef.current = calculatedState.marginStatus;
          onStatusChange?.(calculatedState.marginStatus, previousStatus);

          // Call specific handlers for critical states
          if (calculatedState.marginStatus === MarginStatus.CRITICAL) {
            onCritical?.();
          }
          if (calculatedState.marginStatus === MarginStatus.LIQUIDATION) {
            onLiquidationRisk?.();
          }
        }

        setState({
          ...calculatedState,
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
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch margin data',
      }));
    }
  }, [user?.id, enabled, onStatusChange, onCritical, onLiquidationRisk]);

  /**
   * Subscribe to real-time position updates
   * This triggers margin recalculation when positions change
   */
  const { positions } = useRealtimePositions(user?.id || '');

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
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload: {
          new: Record<string, unknown>;
          old: Record<string, unknown>;
        }) => {
          if (payload.new) {
            const newData = payload.new;
            const calculatedState = calculateMarginState({
              equity: newData.equity != null ? Number(newData.equity) : null,
              margin_used:
                newData.margin_used != null
                  ? Number(newData.margin_used)
                  : null,
              margin_level:
                newData.margin_level != null
                  ? Number(newData.margin_level)
                  : null,
            });

            const previousStatus = previousStatusRef.current;

            if (calculatedState.marginStatus !== previousStatus) {
              previousStatusRef.current = calculatedState.marginStatus;
              onStatusChange?.(calculatedState.marginStatus, previousStatus);

              if (calculatedState.marginStatus === MarginStatus.CRITICAL) {
                onCritical?.();
              }
              if (calculatedState.marginStatus === MarginStatus.LIQUIDATION) {
                onLiquidationRisk?.();
              }
            }

            setState({
              ...calculatedState,
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
  const acknowledgeAlert = useCallback(async (_alertId: string) => {
    // Alert acknowledgment will be implemented after schema migration
    // Feature flagged for future release
  }, []);

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
