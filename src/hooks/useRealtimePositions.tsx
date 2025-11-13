/**
 * Hook: useRealtimePositions
 *
 * Manages real-time position subscriptions via Supabase Realtime.
 * Provides live position updates as prices and P&L change in real-time.
 *
 * Features:
 * - Auto-reconnection on connection loss
 * - Debouncing to prevent UI thrashing
 * - Optional filtering by symbol or asset class
 * - Multiple concurrent subscriptions support
 * - Memory cleanup on unmount
 * - Comprehensive error handling
 *
 * Integrates with:
 * - Supabase Realtime for position changes
 * - update-positions Edge Function for position metrics
 * - usePositionUpdate hook for manual refreshes
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// TYPES
// ============================================================================

export interface Position {
  id: string;
  user_id: string;
  symbol: string;
  side: "long" | "short";
  quantity: number;
  entry_price: number;
  current_price: number;
  unrealized_pnl: number;
  margin_used: number;
  margin_level: number;
  status: "open" | "closing" | "closed";
  created_at: string;
  updated_at: string;
}

export interface RealtimePositionUpdate {
  type: "INSERT" | "UPDATE" | "DELETE";
  new: Position | null;
  old: Position | null;
  eventId?: string;
  errors?: string[] | null;
}

export interface RealtimeOptions {
  debounceMs?: number;
  filterSymbol?: string;
  filterAsset?: string;
  autoSubscribe?: boolean;
  onError?: (error: Error) => void;
  onUpdate?: (positions: Position[]) => void;
}

export interface UseRealtimePositionsReturn {
  positions: Position[];
  isLoading: boolean;
  error: Error | null;
  isSubscribed: boolean;
  connectionStatus: "connected" | "connecting" | "disconnected" | "error";
  subscribe: (filter?: string) => Promise<void>;
  unsubscribe: () => Promise<void>;
  refresh: () => Promise<void>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useRealtimePositions(
  userId: string | null,
  options: RealtimeOptions = {}
): UseRealtimePositionsReturn {
  const {
    debounceMs = 100,
    filterSymbol,
    filterAsset,
    autoSubscribe = true,
    onError,
    onUpdate,
  } = options;

  const { user } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected" | "error"
  >("disconnected");

  const subscriptionRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttemptsRef = useRef(5);

  // =========================================================================
  // LOAD INITIAL POSITIONS
  // =========================================================================

  const loadPositions = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setConnectionStatus("connecting");

      let query = supabase
        .from("positions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "open")
        .order("opened_at", { ascending: false });

      // Apply filters if specified
      if (filterSymbol) {
        query = query.eq("symbol", filterSymbol);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      // Type the data properly - positions from Supabase may have different field names
      const loadedPositions: Position[] = (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        symbol: row.symbol,
        side: row.side,
        quantity: row.quantity,
        entry_price: row.entry_price,
        current_price: row.current_price,
        unrealized_pnl: row.unrealized_pnl || 0,
        margin_used: row.margin_used || 0,
        margin_level: row.margin_level || 0,
        status: row.status,
        created_at: row.opened_at || new Date().toISOString(),
        updated_at: row.updated_at || new Date().toISOString(),
      }));

      setPositions(loadedPositions);
      setConnectionStatus("connected");
      setError(null);
      setIsLoading(false);

      if (onUpdate) {
        onUpdate(loadedPositions);
      }

      return loadedPositions;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setConnectionStatus("error");
      setIsLoading(false);

      if (onError) {
        onError(error);
      }

      return [];
    }
  }, [userId, filterSymbol, onUpdate, onError]);

  // =========================================================================
  // SUBSCRIBE TO REALTIME UPDATES
  // =========================================================================

  const subscribe = useCallback(
    async (filter?: string) => {
      if (!userId) {
        throw new Error("User ID required for subscription");
      }

      try {
        // Unsubscribe from previous subscription if exists
        if (subscriptionRef.current) {
          await supabase.removeChannel(subscriptionRef.current);
        }

        setConnectionStatus("connecting");
        reconnectAttemptsRef.current = 0;

        // Create subscription channel
        const channel = supabase
          .channel(`positions:${userId}`)
          .on(
            "postgres_changes" as any,
            {
              event: "*",
              schema: "public",
              table: "positions",
              filter: `user_id=eq.${userId}`,
            },
            (payload: RealtimePositionUpdate) => {
              // Debounce rapid updates
              if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
              }

              debounceTimerRef.current = setTimeout(() => {
                handlePositionUpdate(payload, filter);
              }, debounceMs);
            }
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              console.log("Position realtime subscription established");
              setConnectionStatus("connected");
              setIsSubscribed(true);
              setError(null);
            } else if (status === "CHANNEL_ERROR") {
              handleSubscriptionError();
            }
          });

        subscriptionRef.current = channel;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setConnectionStatus("error");

        if (onError) {
          onError(error);
        }

        throw error;
      }
    },
    [userId, debounceMs, onError]
  );

  // =========================================================================
  // HANDLE POSITION UPDATES
  // =========================================================================

  const handlePositionUpdate = useCallback(
    (payload: RealtimePositionUpdate, filter?: string) => {
      const { type, new: newRecord } = payload;

      setPositions((prev) => {
        let updated = [...prev];

        switch (type) {
          case "INSERT":
            if (newRecord && (!filter || newRecord.symbol === filter)) {
              // Prevent duplicates
              const exists = updated.some((p) => p.id === newRecord.id);
              if (!exists) {
                updated = [newRecord, ...updated];
              }
            }
            break;

          case "UPDATE":
            if (newRecord && (!filter || newRecord.symbol === filter)) {
              const index = updated.findIndex((p) => p.id === newRecord.id);
              if (index >= 0) {
                updated[index] = newRecord;
              }
            }
            break;

          case "DELETE":
            if (newRecord && (!filter || newRecord.symbol === filter)) {
              updated = updated.filter((p) => p.id !== newRecord.id);
            }
            break;
        }

        return updated;
      });

      if (onUpdate) {
        onUpdate(positions);
      }
    },
    [onUpdate, positions]
  );

  // =========================================================================
  // HANDLE SUBSCRIPTION ERRORS & AUTO-RECONNECTION
  // =========================================================================

  const handleSubscriptionError = useCallback(() => {
    const attempts = reconnectAttemptsRef.current;

    if (attempts < maxReconnectAttemptsRef.current) {
      reconnectAttemptsRef.current = attempts + 1;
      const backoffMs = Math.min(1000 * Math.pow(2, attempts), 30000); // Exponential backoff up to 30s

      console.warn(
        `Subscription error. Reconnecting in ${backoffMs}ms (attempt ${attempts + 1})`
      );

      setTimeout(() => {
        subscribe().catch((err) => {
          console.error("Reconnection failed:", err);
          setConnectionStatus("error");
        });
      }, backoffMs);
    } else {
      const error = new Error(
        "Max reconnection attempts exceeded. Check your connection and try again."
      );
      setError(error);
      setConnectionStatus("error");

      if (onError) {
        onError(error);
      }
    }
  }, [subscribe, onError]);

  // =========================================================================
  // UNSUBSCRIBE
  // =========================================================================

  const unsubscribe = useCallback(async () => {
    if (subscriptionRef.current) {
      try {
        await supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
        setIsSubscribed(false);
        setConnectionStatus("disconnected");
      } catch (err) {
        console.error("Error unsubscribing:", err);
      }
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  // =========================================================================
  // REFRESH
  // =========================================================================

  const refresh = useCallback(async () => {
    await loadPositions();
  }, [loadPositions]);

  // =========================================================================
  // EFFECTS
  // =========================================================================

  // Initial load and auto-subscribe
  useEffect(() => {
    if (!userId || !user) return;

    loadPositions().then(() => {
      if (autoSubscribe) {
        subscribe().catch((err) => {
          console.error("Failed to subscribe to realtime updates:", err);
        });
      }
    });

    return () => {
      unsubscribe().catch((err) => {
        console.error("Error during cleanup:", err);
      });
    };
  }, [userId, user, autoSubscribe, loadPositions, subscribe, unsubscribe]);

  // =========================================================================
  // RETURN HOOK STATE
  // =========================================================================

  return {
    positions,
    isLoading,
    error,
    isSubscribed,
    connectionStatus,
    subscribe,
    unsubscribe,
    refresh,
  };
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * BASIC USAGE - Subscribe to all positions:
 *
 * function PositionsTable() {
 *   const { positions, isLoading, error, connectionStatus } = useRealtimePositions(userId);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorAlert error={error} />;
 *
 *   return (
 *     <div>
 *       <StatusBadge status={connectionStatus} />
 *       <table>
 *         <tbody>
 *           {positions.map(pos => (
 *             <tr key={pos.id}>
 *               <td>{pos.symbol}</td>
 *               <td>{pos.unrealized_pnl.toFixed(2)}</td>
 *               <td>{pos.margin_level.toFixed(2)}%</td>
 *             </tr>
 *           ))}
 *         </tbody>
 *       </table>
 *     </div>
 *   );
 * }
 */

/**
 * FILTERED BY SYMBOL - Subscribe to specific asset only:
 *
 * function BtcPositionMonitor() {
 *   const { positions, connectionStatus } = useRealtimePositions(userId, {
 *     filterSymbol: 'BTC/USD',
 *     debounceMs: 200,
 *     onUpdate: (positions) => {
 *       console.log('BTC position updated:', positions[0]);
 *     }
 *   });
 *
 *   return <BtcPositionCard position={positions[0]} />;
 * }
 */

/**
 * MANUAL SUBSCRIPTION CONTROL:
 *
 * function DashboardWithToggle() {
 *   const { positions, subscribe, unsubscribe, isSubscribed } = useRealtimePositions(userId, {
 *     autoSubscribe: false  // Don't auto-subscribe
 *   });
 *
 *   return (
 *     <div>
 *       <button onClick={() => subscribe()}>Subscribe</button>
 *       <button onClick={() => unsubscribe()}>Unsubscribe</button>
 *       <p>{isSubscribed ? 'Connected' : 'Disconnected'}</p>
 *       <PositionsList positions={positions} />
 *     </div>
 *   );
 * }
 */

/**
 * WITH ERROR HANDLING AND AUTO-RECONNECTION:
 *
 * function ResilientPositionMonitor() {
 *   const { positions, error, connectionStatus, refresh } = useRealtimePositions(userId, {
 *     onError: (error) => {
 *       console.error('Position update failed:', error);
 *       showNotification({
 *         type: 'error',
 *         message: 'Connection lost. Auto-reconnecting...',
 *       });
 *     },
 *     onUpdate: (positions) => {
 *       // Trigger analytics, alerts, etc.
 *       checkMarginLevels(positions);
 *     }
 *   });
 *
 *   return (
 *     <div>
 *       {connectionStatus === 'error' && (
 *         <ErrorBanner>
 *           Connection lost
 *           <button onClick={refresh}>Reconnect</button>
 *         </ErrorBanner>
 *       )}
 *       <PositionsList positions={positions} />
 *     </div>
 *   );
 * }
 */
