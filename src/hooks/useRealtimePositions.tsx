/**
 * Hook: useRealtimePositions
 *
 * Manages real-time position subscriptions via Supabase Realtime.
 * Provides live position updates as prices and P&L change in real-time.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Position } from '@/types/position';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';

// Debug flag for realtime logging
const DEBUG_REALTIME = process.env.NODE_ENV === 'development';

// WebSocket connection management utility
class WebSocketConnectionManager {
  private static instance: WebSocketConnectionManager;
  private connections = new Map<
    string,
    {
      url: string;
      connectedAt: number;
      lastActivity: number;
      connection: import('@supabase/supabase-js').RealtimeChannel | null;
      isClosed: boolean;
    }
  >();
  private connectionLimit = 5; // Maximum concurrent connections

  static getInstance(): WebSocketConnectionManager {
    if (!WebSocketConnectionManager.instance) {
      WebSocketConnectionManager.instance = new WebSocketConnectionManager();
    }
    return WebSocketConnectionManager.instance;
  }

  registerConnection(
    id: string,
    url: string,
    connection: import('@supabase/supabase-js').RealtimeChannel
  ): void {
    if (this.connections.size >= this.connectionLimit) {
      this.cleanupOldestConnection();
    }

    this.connections.set(id, {
      url,
      connectedAt: Date.now(),
      lastActivity: Date.now(),
      connection,
      isClosed: false,
    });

    if (DEBUG_REALTIME) {
      console.warn(
        `🔗 Registered WebSocket connection ${id}. Active: ${this.connections.size}/${this.connectionLimit}`
      );
    }
  }

  updateActivity(
    id: string,
    connection: import('@supabase/supabase-js').RealtimeChannel
  ): void {
    const conn = this.connections.get(id);
    if (conn) {
      conn.lastActivity = Date.now();
      conn.connection = connection;
    }
  }

  unregisterConnection(id: string): void {
    const conn = this.connections.get(id);
    if (conn && conn.connection && !conn.isClosed) {
      try {
        // Close the connection if it exists and isn't already closed
        supabase.removeChannel(conn.connection);
        conn.isClosed = true;
        if (DEBUG_REALTIME) {
          console.warn(`🔌 Closed WebSocket connection ${id}`);
        }
      } catch (error) {
        if (DEBUG_REALTIME) {
          console.warn(
            `⚠️  Failed to close WebSocket connection ${id}:`,
            error
          );
        }
      }
    }

    this.connections.delete(id);
    if (DEBUG_REALTIME) {
      console.warn(
        `🔌 Unregistered WebSocket connection ${id}. Active: ${this.connections.size}/${this.connectionLimit}`
      );
    }
  }

  cleanupOldestConnection(): void {
    let oldestId: string | null = null;
    let oldestTime = Date.now();

    this.connections.forEach((connection, id) => {
      if (connection.lastActivity < oldestTime) {
        oldestTime = connection.lastActivity;
        oldestId = id;
      }
    });

    if (oldestId) {
      const conn = this.connections.get(oldestId);

      if (conn && conn.connection && !conn.isClosed) {
        if (DEBUG_REALTIME) {
          console.warn(
            `⚠️  Closing oldest WebSocket connection ${oldestId} to make room for new connection`
          );
        }

        try {
          // Close the connection before removing from map
          supabase.removeChannel(conn.connection);
          conn.isClosed = true;
          if (DEBUG_REALTIME) {
            console.warn(
              `🔌 Successfully closed WebSocket connection ${oldestId}`
            );
          }
        } catch (error) {
          if (DEBUG_REALTIME) {
            console.warn(
              `⚠️  Failed to close WebSocket connection ${oldestId}:`,
              error
            );
          }
        }
      }

      // Directly remove from connections map and emit debug logs
      this.connections.delete(oldestId);
      if (DEBUG_REALTIME) {
        console.warn(
          `🔌 Removed WebSocket connection ${oldestId} from tracking. Active: ${this.connections.size}/${this.connectionLimit}`
        );
      }
    }
  }

  getConnectionStats(): { total: number; oldest: number; averageAge: number } {
    const now = Date.now();
    const connections = Array.from(this.connections.values());
    const ages = connections.map((c) => now - c.connectedAt);

    return {
      total: connections.length,
      oldest: Math.max(...ages, 0),
      averageAge:
        ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0,
    };
  }
}

const connectionManager = WebSocketConnectionManager.getInstance();

export interface RealtimePositionUpdate {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
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
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
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
  const queryClient = useQueryClient();

  // State management
  const [positions, setPositions] = useState<Position[]>([]);
  const positionsRef = useRef<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'connecting' | 'disconnected' | 'error'
  >('disconnected');

  // Enhanced subscription management with cleanup verification
  const subscriptionRef = useRef<unknown>(null);
  const cleanupTimerRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionStartTimeRef = useRef<number>(0);
  const memoryLeakDetectorRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionIdRef = useRef<string>(crypto.randomUUID());

  // Mutable ref to hold a reference to the subscribe function. This
  // helps break circular dependencies when other callbacks need to call subscribe
  const subscribeRef = useRef<((filter?: string) => Promise<void>) | null>(
    null
  );
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttemptsRef = useRef(5);

  // Memory leak detection and cleanup verification
  const verifySubscriptionCleanup = useCallback(async () => {
    if (subscriptionRef.current) {
      const currentSubscriptionId = subscriptionIdRef.current;
      if (DEBUG_REALTIME) {
        console.warn(
          `⚠️  Subscription cleanup verification failed for ${currentSubscriptionId}`
        );
        console.warn(
          `Subscription has been active for ${
            Date.now() - subscriptionStartTimeRef.current
          }ms`
        );
      }

      // Force cleanup if subscription is still active after 5 minutes
      if (Date.now() - subscriptionStartTimeRef.current > 300000) {
        if (DEBUG_REALTIME) {
          console.error(
            `🚨 Force unsubscribing stale subscription ${currentSubscriptionId}`
          );
        }
        try {
          await supabase.removeChannel(
            subscriptionRef.current as import('@supabase/supabase-js').RealtimeChannel
          );
        } catch (err) {
          if (DEBUG_REALTIME) {
            console.error('Failed to force unsubscribe:', err);
          }
        }
        subscriptionRef.current = null;
        setIsSubscribed(false);
      }
    }
  }, []);

  const loadPositions = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setConnectionStatus('connecting');

      let query = supabase
        .from('positions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'open')
        .order('opened_at', { ascending: false });

      if (filterSymbol) {
        query = query.eq('symbol', filterSymbol);
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
          opened_at: r.opened_at
            ? new Date(r.opened_at as string)
            : new Date((r.created_at as string) || Date.now()),
          leverage: typeof r.leverage === 'number' ? (r.leverage as number) : 1,
          created_at:
            (r.created_at as string) ||
            (r.opened_at as string) ||
            new Date().toISOString(),
          updated_at: (r.updated_at as string) || new Date().toISOString(),
        };
      });

      setPositions(loadedPositions);
      positionsRef.current = loadedPositions;
      setConnectionStatus('connected');
      setError(null);
      setIsLoading(false);

      // Invalidate React Query cache to keep other components in sync
      queryClient.setQueryData(['positions', userId], loadedPositions);

      if (onUpdate) {
        onUpdate(loadedPositions);
      }

      return loadedPositions;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setConnectionStatus('error');
      setIsLoading(false);

      if (onError) {
        onError(error);
      }

      return [];
    }
  }, [userId, filterSymbol, onUpdate, onError, queryClient]);

  const handlePositionUpdate = useCallback(
    (payload: RealtimePositionUpdate, filter?: string) => {
      const { type, new: newRecord, old: oldRecord } = payload;

      // Invalidate React Query caches for related data
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['profile', userId] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });

        // For significant changes, invalidate the main positions query
        if (type === 'INSERT' || type === 'DELETE') {
          queryClient.invalidateQueries({ queryKey: ['positions', userId] });
        }
      }

      // Calculate position delta for UPDATE events
      const calculateDelta = (oldPos: unknown, newPos: unknown) => {
        const old = oldPos as Record<string, unknown>;
        const newP = newPos as Record<string, unknown>;
        if (!old || !newP) return null;

        return {
          pnl_change:
            ((newP.unrealized_pnl as number) || 0) -
            ((old.unrealized_pnl as number) || 0),
          price_change:
            ((newP.current_price as number) || 0) -
            ((old.current_price as number) || 0),
          margin_change:
            ((newP.margin_used as number) || 0) -
            ((old.margin_used as number) || 0),
        };
      };

      // Debounce rapid updates for UPDATE events
      if (type === 'UPDATE' && newRecord) {
        const delta = calculateDelta(oldRecord, newRecord);

        // Only process significant updates (> 0.01% PnL change or > 0.1% price change)
        const shouldUpdate =
          !delta ||
          Math.abs(delta.pnl_change) > 0.01 ||
          Math.abs(delta.price_change / (oldRecord?.current_price || 1)) >
            0.001;

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

            // Update React Query cache
            if (userId) {
              queryClient.setQueryData(['positions', userId], updated);
            }

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
          case 'INSERT':
            if (newRecord && (!filter || newRecord.symbol === filter)) {
              const exists = updated.some((p) => p.id === newRecord.id);
              if (!exists) {
                updated = [newRecord, ...updated];
              }
            }
            break;

          case 'DELETE':
            if (oldRecord && (!filter || oldRecord.symbol === filter)) {
              updated = updated.filter((p) => p.id !== oldRecord.id);
            }
            break;
        }

        positionsRef.current = updated;

        // Update React Query cache
        if (userId) {
          queryClient.setQueryData(['positions', userId], updated);
        }

        return updated;
      });

      if (onUpdate) {
        onUpdate(positionsRef.current);
      }
    },
    [onUpdate, debounceMs, userId, queryClient]
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
          fn().catch(() => {
            // Reconnection failed
            setConnectionStatus('error');
          });
        } else {
          // If subscribe is not initialized yet, try again after a short delay.
          setTimeout(() => {
            const fn2 = subscribeRef.current;
            if (fn2) {
              fn2().catch(() => setConnectionStatus('error'));
            } else {
              setConnectionStatus('error');
            }
          }, 500);
        }
      }, backoffMs);
    } else {
      const error = new Error(
        'Max reconnection attempts exceeded. Check your connection and try again.'
      );
      setError(error);
      setConnectionStatus('error');

      if (onError) {
        onError(error);
      }
    }
  }, [onError]);

  // Enhanced subscription cleanup with verification
  const unsubscribe = useCallback(async () => {
    if (subscriptionRef.current) {
      try {
        if (DEBUG_REALTIME) {
          console.warn(
            `📤 Unsubscribing from positions realtime ${subscriptionIdRef.current}`
          );
        }
        await supabase.removeChannel(
          subscriptionRef.current as import('@supabase/supabase-js').RealtimeChannel
        );
        subscriptionRef.current = null;
        setIsSubscribed(false);
        setConnectionStatus('disconnected');

        // Clear cleanup timer
        if (cleanupTimerRef.current) {
          clearTimeout(cleanupTimerRef.current);
          cleanupTimerRef.current = null;
        }

        // Clear memory leak detector
        if (memoryLeakDetectorRef.current) {
          clearInterval(memoryLeakDetectorRef.current);
          memoryLeakDetectorRef.current = null;
        }

        // Unregister from connection manager
        connectionManager.unregisterConnection(subscriptionIdRef.current);

        if (DEBUG_REALTIME) {
          console.warn(
            `✅ Successfully unsubscribed from positions realtime ${subscriptionIdRef.current}`
          );
        }
      } catch (err) {
        if (DEBUG_REALTIME) {
          console.error(
            `❌ Failed to unsubscribe from positions realtime ${subscriptionIdRef.current}:`,
            err
          );
        }
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  }, []);

  const subscribe = useCallback(
    async (filter?: string) => {
      if (!userId) {
        throw new Error('User ID required for subscription');
      }

      try {
        // Clean up existing subscription
        if (subscriptionRef.current) {
          await supabase.removeChannel(
            subscriptionRef.current as import('@supabase/supabase-js').RealtimeChannel
          );
        }

        setConnectionStatus('connecting');
        reconnectAttemptsRef.current = 0;
        subscriptionStartTimeRef.current = Date.now();

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
            (payload: unknown) => {
              if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
              }
              debounceTimerRef.current = setTimeout(() => {
                handlePositionUpdate(payload as RealtimePositionUpdate, filter);
              }, debounceMs);
            }
          )
          .subscribe((status: string) => {
            if (status === 'SUBSCRIBED') {
              // Position realtime subscription established
              setConnectionStatus('connected');
              setIsSubscribed(true);
              setError(null);

              // Start memory leak detection
              if (memoryLeakDetectorRef.current) {
                clearInterval(memoryLeakDetectorRef.current);
              }
              memoryLeakDetectorRef.current = setInterval(() => {
                const activeTime =
                  Date.now() - subscriptionStartTimeRef.current;
                if (activeTime > 1800000) {
                  if (DEBUG_REALTIME) {
                    console.warn(
                      `⚠️  Position subscription ${
                        subscriptionIdRef.current
                      } has been active for ${Math.floor(
                        activeTime / 60000
                      )} minutes`
                    );
                  }
                }
              }, 300000); // Check every 5 minutes

              // Register with connection manager
              connectionManager.registerConnection(
                subscriptionIdRef.current,
                `supabase:positions:${userId}`,
                channel
              );
              connectionManager.updateActivity(
                subscriptionIdRef.current,
                channel
              );

              if (DEBUG_REALTIME) {
                console.warn(
                  `📥 Subscribed to positions realtime ${subscriptionIdRef.current}`
                );
              }
            } else if (status === 'CHANNEL_ERROR') {
              handleSubscriptionError();
            }
          });

        subscriptionRef.current = channel;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setConnectionStatus('error');

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

  const refresh = useCallback(async () => {
    await loadPositions();
  }, [loadPositions]);

  useEffect(() => {
    if (!userId || !user) return;

    loadPositions().then(() => {
      if (autoSubscribe) {
        const fn = subscribeRef.current;
        if (fn) {
          fn().catch(() => {
            // Failed to subscribe to realtime updates
          });
        }
      }
    });

    return () => {
      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // Enhanced cleanup with verification
      // Note: Removed console.warn to avoid React hooks exhaustive-deps warnings
      // The unsubscribe function handles cleanup verification internally

      unsubscribe().catch((err) => {
        if (DEBUG_REALTIME) {
          console.error(`❌ Error during cleanup of subscription:`, err);
        }
      });

      // Call verifySubscriptionCleanup to ensure proper cleanup
      verifySubscriptionCleanup().catch((err) => {
        if (DEBUG_REALTIME) {
          console.error(
            `❌ Error during subscription cleanup verification:`,
            err
          );
        }
      });
    };
  }, [
    userId,
    user,
    autoSubscribe,
    loadPositions,
    unsubscribe,
    verifySubscriptionCleanup,
  ]);

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
