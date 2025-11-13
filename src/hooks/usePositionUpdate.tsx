/**
 * Hook: usePositionUpdate
 *
 * Manages real-time position updates via Edge Function.
 * Handles fetching current position data, subscribing to Realtime updates,
 * and managing loading/error states.
 *
 * Integrates with:
 * - update-positions Edge Function for position metric updates
 * - Supabase Realtime for live broadcasting
 * - useAuth for user context
 * - React Query for caching and invalidation
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// TYPES
// ============================================================================

export interface PositionMetrics {
  position_id: string;
  symbol: string;
  side: "long" | "short";
  quantity: number;
  entry_price: number;
  current_price: number;
  unrealized_pnl: number;
  margin_used: number;
  margin_level: number;
  margin_status: "SAFE" | "WARNING" | "CRITICAL" | "LIQUIDATION";
}

export interface PositionUpdate {
  id: string;
  symbol: string;
  current_price: number;
  unrealized_pnl: number;
  margin_level: number;
  margin_status: string;
  updated_at: string;
}

export interface UpdateError {
  position_id: string;
  symbol: string;
  error: string;
}

export interface UsePositionUpdateOptions {
  enabled?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  onUpdate?: (metrics: PositionMetrics[]) => void;
  onError?: (error: Error) => void;
}

export interface UsePositionUpdateReturn {
  positions: PositionMetrics[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  manualUpdate: (
    positionIds?: string[],
    prices?: Record<string, number>
  ) => Promise<PositionMetrics[]>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function usePositionUpdate(
  options: UsePositionUpdateOptions = {}
): UsePositionUpdateReturn {
  const {
    enabled = true,
    autoRefresh = true,
    refreshInterval = 5000, // 5 seconds
    onUpdate,
    onError,
  } = options;

  const { user } = useAuth();
  const [positions, setPositions] = useState<PositionMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const realtimeChannelRef = useRef<any>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // =========================================================================
  // FETCH POSITIONS FROM EDGE FUNCTION
  // =========================================================================

  const fetchPositions = useCallback(
    async (
      positionIds?: string[],
      prices?: Record<string, number>
    ): Promise<PositionMetrics[]> => {
      if (!user) {
        setError(new Error("User not authenticated"));
        return [];
      }

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          throw new Error("No active session");
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-positions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionData.session.access_token}`,
            },
            body: JSON.stringify({
              user_id: user.id,
              positions: positionIds,
              prices,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();

        if (data.updated && Array.isArray(data.updated)) {
          setPositions(data.updated);
          setLastUpdated(new Date());
          setError(null);

          if (onUpdate) {
            onUpdate(data.updated);
          }

          if (data.errors && data.errors.length > 0) {
            console.warn("Some positions failed to update:", data.errors);
          }

          return data.updated;
        }

        throw new Error("Invalid response format");
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);

        if (onError) {
          onError(error);
        }

        return [];
      }
    },
    [user, onUpdate, onError]
  );

  // =========================================================================
  // INITIAL LOAD
  // =========================================================================

  useEffect(() => {
    if (!enabled || !user) return;

    setIsLoading(true);
    fetchPositions()
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, [user, enabled, fetchPositions]);

  // =========================================================================
  // REALTIME SUBSCRIPTION
  // =========================================================================

  useEffect(() => {
    if (!enabled || !user) return;

    // Subscribe to realtime position updates
    const channel = supabase
      .channel(`positions:${user.id}`)
      .on(
        "broadcast",
        {
          event: "position:updated",
        },
        (payload: { payload: PositionUpdate }) => {
          setPositions((prev) => {
            const updated = [...prev];
            const index = updated.findIndex(
              (p) => p.position_id === payload.payload.id
            );

            if (index >= 0) {
              updated[index] = {
                ...updated[index],
                current_price: payload.payload.current_price,
                unrealized_pnl: payload.payload.unrealized_pnl,
                margin_level: payload.payload.margin_level,
                margin_status: payload.payload
                  .margin_status as PositionMetrics["margin_status"],
              };
            }

            return updated;
          });

          setLastUpdated(new Date());
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Position realtime subscription established");
        } else if (status === "CHANNEL_ERROR") {
          console.error("Position realtime subscription error");
        }
      });

    realtimeChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, user]);

  // =========================================================================
  // AUTO REFRESH
  // =========================================================================

  useEffect(() => {
    if (!enabled || !autoRefresh || !user) return;

    const interval = setInterval(async () => {
      setIsRefreshing(true);
      try {
        await fetchPositions();
      } catch (err) {
        console.error("Auto-refresh failed:", err);
      } finally {
        setIsRefreshing(false);
      }
    }, refreshInterval);

    refreshIntervalRef.current = interval;

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [enabled, autoRefresh, refreshInterval, user, fetchPositions]);

  // =========================================================================
  // PUBLIC METHODS
  // =========================================================================

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchPositions();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchPositions]);

  const manualUpdate = useCallback(
    async (positionIds?: string[], prices?: Record<string, number>) => {
      setIsRefreshing(true);
      try {
        return await fetchPositions(positionIds, prices);
      } finally {
        setIsRefreshing(false);
      }
    },
    [fetchPositions]
  );

  // =========================================================================
  // RETURN HOOK STATE
  // =========================================================================

  return {
    positions,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
    manualUpdate,
  };
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * BASIC USAGE:
 *
 * function PositionsTable() {
 *   const { positions, isLoading, error } = usePositionUpdate();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorAlert error={error} />;
 *
 *   return (
 *     <table>
 *       <tbody>
 *         {positions.map(pos => (
 *           <tr key={pos.position_id}>
 *             <td>{pos.symbol}</td>
 *             <td>{pos.unrealized_pnl.toFixed(2)}</td>
 *             <td>{pos.margin_status}</td>
 *           </tr>
 *         ))}
 *       </tbody>
 *     </table>
 *   );
 * }
 */

/**
 * ADVANCED USAGE WITH OPTIONS:
 *
 * function PortfolioDashboard() {
 *   const { positions, refresh, manualUpdate, lastUpdated } = usePositionUpdate({
 *     autoRefresh: true,
 *     refreshInterval: 10000,
 *     onUpdate: (metrics) => {
 *       console.log('Positions updated:', metrics);
 *     },
 *     onError: (error) => {
 *       showNotification('Position update failed: ' + error.message);
 *     },
 *   });
 *
 *   return (
 *     <div>
 *       <PositionsList positions={positions} />
 *       <button onClick={() => refresh()}>Refresh Now</button>
 *       <button onClick={() => manualUpdate(['pos-1', 'pos-2'])}>
 *         Update Selected
 *       </button>
 *       <p>Last updated: {lastUpdated?.toLocaleTimeString()}</p>
 *     </div>
 *   );
 * }
 */

/**
 * SIMULATION/BACKTESTING USAGE:
 *
 * async function simulateScenario() {
 *   const { manualUpdate } = usePositionUpdate({ autoRefresh: false });
 *
 *   // Simulate price moves
 *   await manualUpdate(undefined, {
 *     'BTC/USD': 42000,
 *     'EURUSD': 1.0950,
 *   });
 * }
 */
