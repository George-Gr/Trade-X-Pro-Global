/**
 * Hook: useRealtimePositions
 *
 * Manages real-time position subscriptions via Supabase Realtime.
 * Provides live position updates as prices and P&L change in real-time.
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from '@/lib/supabaseBrowserClient';
import type { Position } from '@/types/position';

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

export function useRealtimePositions(
  userId: string | null,
  options: RealtimeOptions = {}
): UseRealtimePositionsReturn {
  const {
    debounceMs = 100,
    filterSymbol,
    autoSubscribe = true,
    onError,
    onUpdate,
  } = options;

  const { user } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const positionsRef = useRef<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected" | "error"
  >("disconnected");

  const subscriptionRef = useRef<unknown>(null);
  // Mutable ref to hold a reference to the subscribe function. This
  // helps break circular dependencies when other callbacks need to call subscribe
  const subscribeRef = useRef<((filter?: string) => Promise<void>) | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttemptsRef = useRef(5);

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

      if (filterSymbol) {
        query = query.eq("symbol", filterSymbol);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      const loadedPositions: Position[] = (data || []).map((row: unknown) => {
        const r = row as Record<string, unknown>;
        return {
          id: r.id as string,
          user_id: r.user_id as string,
          symbol: r.symbol as string,
          side: (r.side as string) === 'buy' ? 'long' : 'short',
          quantity: r.quantity as number,
          entry_price: r.entry_price as number,
          current_price: r.current_price as number,
          unrealized_pnl: (r.unrealized_pnl as number) || 0,
          margin_used: (r.margin_used as number) || 0,
          margin_level: (r.margin_level as number) || 0,
          status: (r.status as 'open' | 'closed' | 'closing') || 'open',
          opened_at: r.opened_at ? new Date(r.opened_at as string) : new Date((r.created_at as string) || Date.now()),
          leverage: typeof r.leverage === 'number' ? (r.leverage as number) : 1,
          created_at: (r.created_at as string) || (r.opened_at as string) || new Date().toISOString(),
          updated_at: (r.updated_at as string) || new Date().toISOString(),
        };
      });

      setPositions(loadedPositions);
      positionsRef.current = loadedPositions;
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

  const handlePositionUpdate = useCallback(
    (payload: RealtimePositionUpdate, filter?: string) => {
      const { type, new: newRecord, old: oldRecord } = payload;

      // Calculate position delta for UPDATE events
      const calculateDelta = (oldPos: unknown, newPos: unknown) => {
        const old = oldPos as Record<string, unknown>;
        const newP = newPos as Record<string, unknown>;
        if (!old || !newP) return null;
        
        return {
          pnl_change: ((newP.unrealized_pnl as number) || 0) - ((old.unrealized_pnl as number) || 0),
          price_change: ((newP.current_price as number) || 0) - ((old.current_price as number) || 0),
          margin_change: ((newP.margin_used as number) || 0) - ((old.margin_used as number) || 0),
        };
      };

      // Debounce rapid updates for UPDATE events
      if (type === "UPDATE" && newRecord) {
        const delta = calculateDelta(oldRecord, newRecord);
        
        // Only process significant updates (> 0.01% PnL change or > 0.1% price change)
        const shouldUpdate = !delta || 
          Math.abs(delta.pnl_change) > 0.01 || 
          Math.abs(delta.price_change / (oldRecord?.current_price || 1)) > 0.001;
        
        if (!shouldUpdate) {
          return; // Skip insignificant updates
        }
        
        // Clear existing debounce timer
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        
        // Debounce the update
        debounceTimerRef.current = setTimeout(() => {
          setPositions((prev) => {
            const updated = [...prev];
            const index = updated.findIndex((p) => p.id === newRecord.id);
            if (index >= 0) {
              updated[index] = newRecord;
            }
            positionsRef.current = updated;
            if (onUpdate) {
              onUpdate(updated);
            }
            return updated;
          });
        }, debounceMs);
        
        return;
      }

      // Handle INSERT and DELETE immediately (no debouncing)
      setPositions((prev) => {
        let updated = [...prev];

        switch (type) {
          case "INSERT":
            if (newRecord && (!filter || newRecord.symbol === filter)) {
              const exists = updated.some((p) => p.id === newRecord.id);
              if (!exists) {
                updated = [newRecord, ...updated];
              }
            }
            break;

          case "DELETE":
            if (newRecord && (!filter || newRecord.symbol === filter)) {
              updated = updated.filter((p) => p.id !== newRecord.id);
            }
            break;
        }

        positionsRef.current = updated;
        return updated;
      });

      if (onUpdate) {
        onUpdate(positionsRef.current);
      }
    },
    [onUpdate, debounceMs]
  );

  const handleSubscriptionError = useCallback(() => {
    const attempts = reconnectAttemptsRef.current;

    if (attempts < maxReconnectAttemptsRef.current) {
      reconnectAttemptsRef.current = attempts + 1;
      const backoffMs = Math.min(1000 * Math.pow(2, attempts), 30000);

      // Subscription error - will attempt reconnection

      setTimeout(() => {
        const fn = subscribeRef.current;
        if (fn) {
          fn().catch((err: Error) => {
            // Reconnection failed
            setConnectionStatus("error");
          });
        } else {
          // If subscribe is not initialized yet, try again after a short delay.
          setTimeout(() => {
            const fn2 = subscribeRef.current;
            if (fn2) {
              fn2().catch(() => setConnectionStatus("error"));
            } else {
              setConnectionStatus("error");
            }
          }, 500);
        }
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
  }, [onError]);

  const subscribe = useCallback(
    async (filter?: string) => {
      if (!userId) {
        throw new Error("User ID required for subscription");
      }

      try {
        if (subscriptionRef.current) {
          await supabase.removeChannel(subscriptionRef.current as import('@supabase/supabase-js').RealtimeChannel);
        }

        setConnectionStatus("connecting");
        reconnectAttemptsRef.current = 0;

        const channel = supabase
          .channel(`positions:${userId}`)
          .on(
            'postgres_changes' as const,
            {
              event: '*',
              schema: 'public',
              table: 'positions',
              filter: `user_id=eq.${userId}`,
            },
            (payload: any) => {
              if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
              }
              debounceTimerRef.current = setTimeout(() => {
                handlePositionUpdate(payload as RealtimePositionUpdate, filter);
              }, debounceMs);
            }
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              // Position realtime subscription established
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
    [userId, debounceMs, onError, handlePositionUpdate, handleSubscriptionError]
  );

  // Assign the concrete `subscribe` function to the ref so it can be referenced
  // from handleSubscriptionError callback (breaking circular deps).
  subscribeRef.current = subscribe;

  const unsubscribe = useCallback(async () => {
    if (subscriptionRef.current) {
      try {
        await supabase.removeChannel(subscriptionRef.current as any);
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

  const refresh = useCallback(async () => {
    await loadPositions();
  }, [loadPositions]);

  useEffect(() => {
    if (!userId || !user) return;

    loadPositions().then(() => {
      if (autoSubscribe) {
        const fn = subscribeRef.current;
        if (fn) {
          fn().catch((err) => {
            // Failed to subscribe to realtime updates
          });
        }
      }
    });

    return () => {
      unsubscribe().catch((err) => {
        // Error during cleanup
      });
    };
  }, [userId, user, autoSubscribe, loadPositions, unsubscribe]);

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
