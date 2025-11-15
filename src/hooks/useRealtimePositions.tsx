/**
 * Hook: useRealtimePositions
 *
 * Manages real-time position subscriptions via Supabase Realtime.
 * Provides live position updates as prices and P&L change in real-time.
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
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

  const subscriptionRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
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
        opened_at: row.opened_at ? new Date(row.opened_at) : new Date(row.created_at || Date.now()),
        leverage: typeof row.leverage === 'number' ? row.leverage : 1,
        created_at: row.created_at || row.opened_at || new Date().toISOString(),
        updated_at: row.updated_at || new Date().toISOString(),
      }));

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
      const { type, new: newRecord } = payload;

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

        positionsRef.current = updated;
        return updated;
      });

      if (onUpdate) {
        onUpdate(positionsRef.current);
      }
    },
    [onUpdate]
  );

  const handleSubscriptionError = useCallback(() => {
    const attempts = reconnectAttemptsRef.current;

    if (attempts < maxReconnectAttemptsRef.current) {
      reconnectAttemptsRef.current = attempts + 1;
      const backoffMs = Math.min(1000 * Math.pow(2, attempts), 30000);

      console.warn(
        `Subscription error. Reconnecting in ${backoffMs}ms (attempt ${attempts + 1})`
      );

      setTimeout(() => {
        subscribe().catch((err: Error) => {
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
  }, [onError]);

  const subscribe = useCallback(
    async (filter?: string) => {
      if (!userId) {
        throw new Error("User ID required for subscription");
      }

      try {
        if (subscriptionRef.current) {
          await supabase.removeChannel(subscriptionRef.current);
        }

        setConnectionStatus("connecting");
        reconnectAttemptsRef.current = 0;

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
    [userId, debounceMs, onError, handlePositionUpdate, handleSubscriptionError]
  );

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

  const refresh = useCallback(async () => {
    await loadPositions();
  }, [loadPositions]);

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
