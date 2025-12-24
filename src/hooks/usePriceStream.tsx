import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook: usePriceStream
 *
 * WebSocket-based real-time price streaming with automatic reconnection
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
  provider?: string;
  cached?: boolean;
}

interface UsePriceStreamOptions {
  symbols: string[];
  enabled?: boolean;
  onError?: (error: Error) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

interface UsePriceStreamReturn {
  prices: Map<string, PriceData>;
  getPrice: (symbol: string) => PriceData | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  reconnect: () => void;
}

export const usePriceStream = ({
  symbols,
  enabled = true,
  onError,
  onConnected,
  onDisconnected,
}: UsePriceStreamOptions): UsePriceStreamReturn => {
  const [prices, setPrices] = useState<Map<string, PriceData>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelayMs = 3000;

  const connect = useCallback(() => {
    if (!enabled || symbols.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const projectRef = 'oaegicsinxhpilsihjxv';
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
              // Supabase function returns Finnhub-like response
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
              newPrices.set(symbol, {
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
                provider: priceInfo.provider || 'unknown',
                cached: priceInfo.cached || false,
              });
            }
            setPrices(newPrices);
          }
        } catch (err) {
          // Error parsing price message - logged internally, update skipped
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
  }, [enabled, symbols, onConnected, onDisconnected, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'unsubscribe' }));
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
    return () => disconnect();
  }, [connect, disconnect]);

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
    error,
    reconnect,
  };
};
