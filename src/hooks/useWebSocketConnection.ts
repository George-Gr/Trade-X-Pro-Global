/**
 * Hook: useWebSocketConnection
 * 
 * React hook for managing WebSocket subscriptions with connection pooling
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { getWebSocketManager, type ConnectionState } from '@/lib/websocketManager';

interface UseWebSocketOptions {
  table: string;
  event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  filter?: string;
  onData: (payload: unknown) => void;
  enabled?: boolean;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  connectionState: ConnectionState;
  unsubscribe: () => void;
}

export function useWebSocketConnection(options: UseWebSocketOptions): UseWebSocketReturn {
  const { table, event = '*', filter, onData, enabled = true } = options;
  
  const subscriptionIdRef = useRef<string | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [isConnected, setIsConnected] = useState(false);

  const unsubscribe = useCallback(() => {
    if (subscriptionIdRef.current) {
      getWebSocketManager().unsubscribe(subscriptionIdRef.current);
      subscriptionIdRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      unsubscribe();
      return;
    }

    const manager = getWebSocketManager();
    
    // Set up state listener
    const removeStateListener = manager.onStateChange((state) => {
      setConnectionState(state);
      setIsConnected(state === 'connected');
    });

    // Subscribe
    subscriptionIdRef.current = manager.subscribe(table, event, onData, filter);
    
    // Check initial state
    const status = manager.getStatus();
    if (status.totalConnections > 0) {
      const connected = status.connections.some(c => c.state === 'connected');
      setIsConnected(connected);
      setConnectionState(connected ? 'connected' : 'connecting');
    }

    return () => {
      unsubscribe();
      removeStateListener();
    };
  }, [enabled, table, event, filter, onData, unsubscribe]);

  return {
    isConnected,
    connectionState,
    unsubscribe,
  };
}

/**
 * Hook for monitoring WebSocket connection status
 */
export function useWebSocketStatus() {
  const [status, setStatus] = useState(() => getWebSocketManager().getStatus());

  useEffect(() => {
    const manager = getWebSocketManager();
    
    const removeListener = manager.onStateChange(() => {
      setStatus(manager.getStatus());
    });

    // Poll status periodically
    const interval = setInterval(() => {
      setStatus(manager.getStatus());
    }, 5000);

    return () => {
      removeListener();
      clearInterval(interval);
    };
  }, []);

  return status;
}

export default useWebSocketConnection;
