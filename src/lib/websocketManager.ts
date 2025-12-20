/**
 * WebSocket Connection Manager
 *
 * Provides connection pooling, exponential backoff retry,
 * health checks, and automatic reconnection for Supabase realtime
 */

import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { logger } from './logger';

// Connection states
type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

// Backoff configuration
interface BackoffConfig {
  initialDelayMs: number;
  maxDelayMs: number;
  multiplier: number;
  jitterFactor: number;
}

// Connection pool entry
interface PooledConnection {
  id: string;
  channel: RealtimeChannel;
  state: ConnectionState;
  subscriptionCount: number;
  createdAt: Date;
  lastActivity: Date;
  retryCount: number;
  tables: Set<string>;
}

// Subscription entry
interface Subscription {
  id: string;
  connectionId: string;
  table: string;
  event: string;
  filter?: string;
  callback: (payload: unknown) => void;
}

// Manager options
interface WebSocketManagerOptions {
  maxConnectionsPerUser: number;
  maxSubscriptionsPerConnection: number;
  healthCheckIntervalMs: number;
  connectionTimeoutMs: number;
  backoff: BackoffConfig;
}

const DEFAULT_OPTIONS: WebSocketManagerOptions = {
  maxConnectionsPerUser: 5,
  maxSubscriptionsPerConnection: 10,
  healthCheckIntervalMs: 30000, // 30 seconds
  connectionTimeoutMs: 10000, // 10 seconds
  backoff: {
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    multiplier: 2,
    jitterFactor: 0.3,
  },
};

class WebSocketManager {
  private connections = new Map<string, PooledConnection>();
  private subscriptions = new Map<string, Subscription>();
  private options: WebSocketManagerOptions;
  private healthCheckInterval: number | null = null;
  private pendingReconnectTimeouts = new Map<
    string,
    ReturnType<typeof setTimeout>
  >();
  private connectionStateListeners = new Set<
    (state: ConnectionState, connectionId: string) => void
  >();

  constructor(options: Partial<WebSocketManagerOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.startHealthCheck();
  }

  /**
   * Calculate exponential backoff delay with jitter
   */
  private calculateBackoffDelay(retryCount: number): number {
    const { initialDelayMs, maxDelayMs, multiplier, jitterFactor } =
      this.options.backoff;

    // Exponential delay
    const exponentialDelay = initialDelayMs * Math.pow(multiplier, retryCount);
    const cappedDelay = Math.min(exponentialDelay, maxDelayMs);

    // Add jitter to prevent thundering herd
    const jitter = cappedDelay * jitterFactor * (Math.random() - 0.5) * 2;

    return Math.round(cappedDelay + jitter);
  }

  /**
   * Get or create a connection for subscriptions
   */
  private getOrCreateConnection(preferredTable?: string): PooledConnection {
    // Find existing connection with capacity
    for (const connection of this.connections.values()) {
      if (
        connection.state === 'connected' &&
        connection.subscriptionCount <
          this.options.maxSubscriptionsPerConnection
      ) {
        // Prefer connections already subscribed to the same table
        if (preferredTable && connection.tables.has(preferredTable)) {
          return connection;
        }
      }
    }

    // Find any connection with capacity
    for (const connection of this.connections.values()) {
      if (
        connection.state === 'connected' &&
        connection.subscriptionCount <
          this.options.maxSubscriptionsPerConnection
      ) {
        return connection;
      }
    }

    // Check if we can create a new connection
    if (this.connections.size >= this.options.maxConnectionsPerUser) {
      // Find least used connection
      let leastUsed: PooledConnection | null = null;
      for (const connection of this.connections.values()) {
        if (
          !leastUsed ||
          connection.subscriptionCount < leastUsed.subscriptionCount
        ) {
          leastUsed = connection;
        }
      }
      if (leastUsed) {
        return leastUsed;
      }
      throw new Error('Connection pool exhausted');
    }

    // Create new connection
    return this.createConnection();
  }

  /**
   * Create a new pooled connection
   */
  private createConnection(): PooledConnection {
    const connectionId = `ws-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const channel = supabase.channel(connectionId, {
      config: {
        broadcast: { self: false },
        presence: { key: connectionId },
      },
    });

    const connection: PooledConnection = {
      id: connectionId,
      channel,
      state: 'connecting',
      subscriptionCount: 0,
      createdAt: new Date(),
      lastActivity: new Date(),
      retryCount: 0,
      tables: new Set(),
    };

    this.connections.set(connectionId, connection);
    this.notifyStateChange('connecting', connectionId);

    // Subscribe to connection
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        connection.state = 'connected';
        connection.retryCount = 0;
        connection.lastActivity = new Date();
        this.notifyStateChange('connected', connectionId);
        logger.info('WebSocket connection established', {
          metadata: {
            connectionId,
            subscriptionCount: connection.subscriptionCount,
          },
        });
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        connection.state = 'error';
        this.notifyStateChange('error', connectionId);
        this.scheduleReconnect(connectionId);
      } else if (status === 'CLOSED') {
        connection.state = 'disconnected';
        this.notifyStateChange('disconnected', connectionId);
      }
    });

    logger.info('WebSocket connection created', { metadata: { connectionId } });
    return connection;
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Clear any existing timeout for this connection
    const existingTimeout = this.pendingReconnectTimeouts.get(connectionId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.pendingReconnectTimeouts.delete(connectionId);
    }

    const delay = this.calculateBackoffDelay(connection.retryCount);
    connection.retryCount++;
    connection.state = 'reconnecting';
    this.notifyStateChange('reconnecting', connectionId);

    logger.info('Scheduling WebSocket reconnection', {
      metadata: {
        connectionId,
        retryCount: connection.retryCount,
        delayMs: delay,
      },
    });

    const timeoutId = setTimeout(async () => {
      this.pendingReconnectTimeouts.delete(connectionId);
      await this.reconnect(connectionId);
    }, delay);

    this.pendingReconnectTimeouts.set(connectionId, timeoutId);
  }

  /**
   * Reconnect a connection
   */
  private async reconnect(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    logger.info('Attempting WebSocket reconnection', {
      metadata: { connectionId, attempt: connection.retryCount },
    });

    try {
      // Unsubscribe from old channel
      await connection.channel.unsubscribe();
      supabase.removeChannel(connection.channel);

      // Create new channel with same ID
      const newChannel = supabase.channel(connectionId, {
        config: {
          broadcast: { self: false },
          presence: { key: connectionId },
        },
      });

      connection.channel = newChannel;
      connection.state = 'connecting';
      this.notifyStateChange('connecting', connectionId);

      // Re-subscribe all subscriptions
      const subscriptionsToRestore = Array.from(
        this.subscriptions.values()
      ).filter((sub) => sub.connectionId === connectionId);

      for (const sub of subscriptionsToRestore) {
        newChannel.on(
          'postgres_changes' as never,
          {
            event: sub.event,
            schema: 'public',
            table: sub.table,
            ...(sub.filter ? { filter: sub.filter } : {}),
          } as never,
          sub.callback as never
        );
      }

      newChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          connection.state = 'connected';
          connection.retryCount = 0;
          connection.lastActivity = new Date();
          this.notifyStateChange('connected', connectionId);
          // Clear stored timeout on successful reconnect
          this.pendingReconnectTimeouts.delete(connectionId);
          logger.info('WebSocket reconnection successful', {
            metadata: {
              connectionId,
              restoredSubscriptions: subscriptionsToRestore.length,
            },
          });
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          connection.state = 'error';
          this.notifyStateChange('error', connectionId);
          this.scheduleReconnect(connectionId);
        }
      });
    } catch (error) {
      logger.error('WebSocket reconnection failed', error, {
        metadata: { connectionId },
      });
      this.scheduleReconnect(connectionId);
    }
  }

  /**
   * Subscribe to database changes
   */
  subscribe(
    table: string,
    event: '*' | 'INSERT' | 'UPDATE' | 'DELETE',
    callback: (payload: unknown) => void,
    filter?: string
  ): string {
    const connection = this.getOrCreateConnection(table);
    const subscriptionId = `sub-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    // Add subscription to channel
    connection.channel.on(
      'postgres_changes' as never,
      {
        event,
        schema: 'public',
        table,
        ...(filter ? { filter } : {}),
      } as never,
      callback as never
    );

    // Track subscription
    const subscription: Subscription = {
      id: subscriptionId,
      connectionId: connection.id,
      table,
      event,
      filter,
      callback,
    };

    this.subscriptions.set(subscriptionId, subscription);
    connection.subscriptionCount++;
    connection.tables.add(table);
    connection.lastActivity = new Date();

    logger.info('Subscription created', {
      metadata: { subscriptionId, connectionId: connection.id, table, event },
    });

    return subscriptionId;
  }

  /**
   * Unsubscribe from database changes
   */
  unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return false;

    const connection = this.connections.get(subscription.connectionId);
    if (connection) {
      connection.subscriptionCount--;
      connection.lastActivity = new Date();

      // Remove table from tracking if no more subscriptions
      const hasOtherSubs = Array.from(this.subscriptions.values()).some(
        (sub) =>
          sub.connectionId === connection.id &&
          sub.table === subscription.table &&
          sub.id !== subscriptionId
      );

      if (!hasOtherSubs) {
        connection.tables.delete(subscription.table);
      }

      // Clean up empty connections
      if (connection.subscriptionCount === 0) {
        this.closeConnection(connection.id);
      }
    }

    this.subscriptions.delete(subscriptionId);
    logger.info('Subscription removed', { metadata: { subscriptionId } });
    return true;
  }

  /**
   * Close a connection
   */
  private async closeConnection(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    try {
      await connection.channel.unsubscribe();
      supabase.removeChannel(connection.channel);
    } catch (error) {
      logger.warn('Error closing connection', {
        metadata: { connectionId, error },
      });
    }

    this.connections.delete(connectionId);
    this.notifyStateChange('disconnected', connectionId);
    logger.info('Connection closed', { metadata: { connectionId } });
  }

  /**
   * Start health check interval
   */
  private startHealthCheck(): void {
    this.healthCheckInterval = window.setInterval(() => {
      this.performHealthCheck();
    }, this.options.healthCheckIntervalMs);
  }

  /**
   * Perform health check on all connections
   */
  private performHealthCheck(): void {
    const now = Date.now();

    for (const [connectionId, connection] of this.connections.entries()) {
      // Check for stale connections
      const idleTime = now - connection.lastActivity.getTime();
      if (
        idleTime > this.options.healthCheckIntervalMs * 3 &&
        connection.subscriptionCount === 0
      ) {
        logger.info('Closing idle connection', {
          metadata: { connectionId, idleTime },
        });
        this.closeConnection(connectionId);
        continue;
      }

      // Check for stuck connections
      if (connection.state === 'connecting') {
        const connectingTime = now - connection.createdAt.getTime();
        if (connectingTime > this.options.connectionTimeoutMs) {
          logger.warn('Connection timeout, scheduling reconnect', {
            metadata: { connectionId },
          });
          this.scheduleReconnect(connectionId);
        }
      }
    }
  }

  /**
   * Add state change listener
   */
  onStateChange(
    listener: (state: ConnectionState, connectionId: string) => void
  ): () => void {
    this.connectionStateListeners.add(listener);
    return () => this.connectionStateListeners.delete(listener);
  }

  /**
   * Notify all state change listeners
   */
  private notifyStateChange(
    state: ConnectionState,
    connectionId: string
  ): void {
    for (const listener of this.connectionStateListeners) {
      try {
        listener(state, connectionId);
      } catch (error) {
        logger.error('State change listener error', error);
      }
    }
  }

  /**
   * Get connection status
   */
  getStatus(): {
    totalConnections: number;
    totalSubscriptions: number;
    connections: Array<{
      id: string;
      state: ConnectionState;
      subscriptionCount: number;
      tables: string[];
      retryCount: number;
    }>;
  } {
    return {
      totalConnections: this.connections.size,
      totalSubscriptions: this.subscriptions.size,
      connections: Array.from(this.connections.values()).map((c) => ({
        id: c.id,
        state: c.state,
        subscriptionCount: c.subscriptionCount,
        tables: Array.from(c.tables),
        retryCount: c.retryCount,
      })),
    };
  }

  /**
   * Close all connections and clean up
   */
  async destroy(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Clear all pending reconnection timeouts
    for (const [_connectionId, timeoutId] of this.pendingReconnectTimeouts) {
      clearTimeout(timeoutId);
    }
    this.pendingReconnectTimeouts.clear();

    for (const connectionId of this.connections.keys()) {
      await this.closeConnection(connectionId);
    }

    this.subscriptions.clear();
    this.connectionStateListeners.clear();
    logger.info('WebSocket manager destroyed');
  }
}

// Singleton instance
let managerInstance: WebSocketManager | null = null;

/**
 * Get the singleton WebSocketManager instance.
 * Creates a new instance if one doesn't exist.
 * @returns {WebSocketManager} The WebSocketManager singleton instance
 */
export function getWebSocketManager(): WebSocketManager {
  if (!managerInstance) {
    managerInstance = new WebSocketManager();
  }
  return managerInstance;
}

/**
 * Destroy the WebSocketManager singleton instance.
 * Clears all connections, subscriptions, and pending timeouts.
 * @returns {Promise<void>} Promise that resolves after destroying the manager, or immediately if none exists
 */
export function destroyWebSocketManager(): Promise<void> {
  if (managerInstance) {
    const promise = managerInstance.destroy();
    managerInstance = null;
    return promise;
  }
  return Promise.resolve();
}

export { WebSocketManager };
export type { ConnectionState, PooledConnection, WebSocketManagerOptions };
