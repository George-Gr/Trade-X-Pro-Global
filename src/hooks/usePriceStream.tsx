import { useState, useEffect, useRef, useCallback } from "react";

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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelayMs = 3000;

  const connect = useCallback(() => {
    if (!enabled || symbols.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      // Use the full WebSocket URL
      const projectRef = 'oaegicsinxhpilsihjxv';
      const wsUrl = `wss://${projectRef}.supabase.co/functions/v1/price-stream`;
      
      console.log('Connecting to price stream:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsLoading(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
        
        // Subscribe to symbols
        ws.send(JSON.stringify({
          type: 'subscribe',
          symbols,
        }));
        
        onConnected?.();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'prices' && message.data) {
            const newPrices = new Map<string, PriceData>();
            
            for (const [symbol, data] of Object.entries(message.data)) {
              const priceInfo = data as any;
              
              if (priceInfo.error) {
                console.error(`Error for ${symbol}:`, priceInfo.error);
                continue;
              }
              
              newPrices.set(symbol, {
                symbol,
                currentPrice: priceInfo.c,
                bid: priceInfo.c * 0.9999,
                ask: priceInfo.c * 1.0001,
                change: priceInfo.d,
                changePercent: priceInfo.dp,
                high: priceInfo.h,
                low: priceInfo.l,
                open: priceInfo.o,
                previousClose: priceInfo.pc,
                timestamp: message.timestamp,
                provider: priceInfo.provider,
                cached: priceInfo.cached,
              });
            }
            
            setPrices(newPrices);
          }
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Connection error');
        onError?.(new Error('WebSocket connection error'));
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setIsLoading(false);
        onDisconnected?.();
        
        // Attempt reconnection
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Reconnecting... Attempt ${reconnectAttemptsRef.current}`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelayMs);
        } else {
          setError('Max reconnection attempts reached');
        }
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
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

  const getPrice = useCallback((symbol: string): PriceData | null => {
    return prices.get(symbol) || null;
  }, [prices]);

  return {
    prices,
    getPrice,
    isConnected,
    isLoading,
    error,
    reconnect,
  };
};
