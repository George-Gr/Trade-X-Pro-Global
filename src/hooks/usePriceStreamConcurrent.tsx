import { useCallback, useEffect, useRef, useState, useTransition } from 'react';

/**
 * Enhanced price streaming hook with React 19 concurrent rendering
 * Optimized for high-frequency market data updates
 */

/**
 * Price data for a market instrument
 * @property symbol - Trading symbol identifier
 * @property currentPrice - Current market price
 * @property bid - Current bid price
 * @property ask - Current ask price
 * @property change - Price change from previous close
 * @property changePercent - Percentage price change
 * @property high - Daily high price
 * @property low - Daily low price
 * @property open - Opening price
 * @property previousClose - Previous day's closing price
 * @property timestamp - Price update timestamp
 * @property provider - Data source provider (optional)
 * @property cached - Whether data is from cache (optional)
 */
export interface PriceData {
  symbol: string;
  currentPrice: number;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
  provider?: string | undefined;
  cached?: boolean | undefined;
}

interface UsePriceStreamOptions {
  symbols: string[];
  enabled?: boolean;
  onError?: (error: Error) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  // React 19 concurrent rendering options
  priority?: 'high' | 'normal' | 'low';
  batchUpdates?: boolean;
  debounceMs?: number;
}

interface UsePriceStreamReturn {
  prices: Map<string, PriceData>;
  getPrice: (symbol: string) => PriceData | null;
  isConnected: boolean;
  isLoading: boolean;
  isPending: boolean; // React 19 transition state
  error: string | null;
  reconnect: () => void;
  // Concurrent rendering utilities
  updatePricesConcurrently: (newPrices: Map<string, PriceData>) => void;
  clearStaleData: () => void;
}

/**
 * High-performance concurrent price stream with React 19 features
 * Uses startTransition for non-blocking updates and automatic batching
 */
export const usePriceStreamConcurrent = ({
  symbols,
  enabled = true,
  onError,
  onConnected,
  onDisconnected,
  priority = 'normal',
  batchUpdates = true,
  debounceMs = 16, // ~60fps batching
}: UsePriceStreamOptions): UsePriceStreamReturn => {
  // Priority-based state management
  const [prices, setPrices] = useState<Map<string, PriceData>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Refs for performance optimization
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelayMs = 3000;
  const batchUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const staleDataTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<Map<string, PriceData>>(new Map());

  // Priority-based update scheduling
  const scheduleUpdate = useCallback(
    (updateFn: () => void) => {
      if (priority === 'high') {
        // Immediate update for critical market data
        updateFn();
      } else {
        // Batch normal/low priority updates
        startTransition(updateFn);
      }
    },
    [priority, startTransition]
  );

  // Concurrent price updates with batching
  const updatePricesConcurrently = useCallback(
    (newPrices: Map<string, PriceData>) => {
      if (batchUpdates && priority !== 'high') {
        // Batch updates for better performance
        newPrices.forEach((price, symbol) => {
          pendingUpdatesRef.current.set(symbol, price);
        });

        if (batchUpdateTimerRef.current) {
          clearTimeout(batchUpdateTimerRef.current);
        }

        batchUpdateTimerRef.current = setTimeout(() => {
          scheduleUpdate(() => {
            setPrices((prev) => {
              const updated = new Map(prev);
              pendingUpdatesRef.current.forEach((price, symbol) => {
                updated.set(symbol, price);
              });
              pendingUpdatesRef.current.clear();
              return updated;
            });
          });
        }, debounceMs);
      } else {
        // Immediate update for high priority
        scheduleUpdate(() => {
          setPrices(newPrices);
        });
      }
    },
    [batchUpdates, priority, scheduleUpdate, debounceMs]
  );

  // Clean up stale data automatically
  const clearStaleData = useCallback(() => {
    const now = Date.now();
    const staleThreshold = 30000; // 30 seconds

    scheduleUpdate(() => {
      setPrices((prev) => {
        const updated = new Map();
        let hasStaleData = false;

        prev.forEach((price, symbol) => {
          if (now - price.timestamp < staleThreshold) {
            updated.set(symbol, price);
          } else {
            hasStaleData = true;
          }
        });

        return hasStaleData ? updated : prev;
      });
    });
  }, [scheduleUpdate]);

  const connect = useCallback(() => {
    if (!enabled || symbols.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_REF;
      if (!projectRef) {
        throw new Error(
          'Missing VITE_SUPABASE_PROJECT_REF environment variable'
        );
      }
      const wsUrl = `wss://${projectRef}.supabase.co/functions/v1/price-stream`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsLoading(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
        ws.send(
          JSON.stringify({
            type: 'subscribe',
            symbols,
          })
        );
        onConnected?.();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'prices' && message.data) {
            const newPrices = new Map<string, PriceData>();

            for (const [symbol, data] of Object.entries(message.data)) {
              const priceInfo = data as {
                c: number;
                d: number;
                dp: number;
                h: number;
                l: number;
                o: number;
                pc: number;
                t: number;
                provider?: string;
                cached?: boolean;
                error?: boolean;
              };

              if (priceInfo.error) {
                continue;
              }

              const priceData: PriceData = {
                symbol,
                currentPrice: Number(priceInfo.c) || 0,
                bid: Number(priceInfo.c) * 0.9999 || 0,
                ask: Number(priceInfo.c) * 1.0001 || 0,
                change: Number(priceInfo.d) || 0,
                changePercent: Number(priceInfo.dp) || 0,
                high: Number(priceInfo.h) || 0,
                low: Number(priceInfo.l) || 0,
                open: Number(priceInfo.o) || 0,
                previousClose: Number(priceInfo.pc) || 0,
                timestamp: Number(priceInfo.t) || Date.now(),
              };

              // Only add optional properties if they have values
              if (priceInfo.provider) {
                priceData.provider = priceInfo.provider;
              }
              if (priceInfo.cached !== undefined) {
                priceData.cached = priceInfo.cached;
              }

              newPrices.set(symbol, priceData);
            }

            // Use concurrent rendering for price updates
            updatePricesConcurrently(newPrices);
          }
        } catch (err) {
          // Optionally notify caller of parse errors for debugging
          if (onError && err instanceof Error) {
            onError(err);
          }
        }
      };

      ws.onerror = () => {
        setError('Connection error');
        onError?.(new Error('WebSocket connection error'));
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsLoading(false);
        onDisconnected?.();

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelayMs);
        } else {
          setError('Max reconnection attempts reached');
        }
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setIsLoading(false);
    }
  }, [
    enabled,
    symbols,
    onConnected,
    onDisconnected,
    onError,
    updatePricesConcurrently,
  ]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      try {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'unsubscribe' }));
        }
      } catch (error) {
        // Ignore send errors during cleanup
      }
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect, disconnect]);

  useEffect(() => {
    connect();

    // Set up automatic stale data cleanup
    staleDataTimerRef.current = setInterval(() => {
      clearStaleData();
    }, 60000); // Check every minute

    return () => {
      disconnect();
      if (staleDataTimerRef.current) {
        clearInterval(staleDataTimerRef.current);
      }
    };
  }, [connect, disconnect, clearStaleData]);

  const getPrice = useCallback(
    (symbol: string): PriceData | null => {
      return prices.get(symbol) || null;
    },
    [prices]
  );

  return {
    prices,
    getPrice,
    isConnected,
    isLoading,
    isPending,
    error,
    reconnect,
    updatePricesConcurrently,
    clearStaleData,
  };
};
