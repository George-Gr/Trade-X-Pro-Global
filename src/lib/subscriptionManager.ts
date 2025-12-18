/**
 * Subscription Manager
 *
 * Centralized management of Supabase real-time subscriptions
 * Prevents memory leaks and ensures proper cleanup
 */

import type { RealtimeChannel } from "@supabase/supabase-js";
import { logger } from "./logger";

interface SubscriptionConfig {
  id: string;
  channel: RealtimeChannel;
  table: string;
  createdAt: Date;
  lastActivity: Date;
}

interface SubscriptionManagerOptions {
  maxSubscriptionsPerUser?: number;
  maxIdleTime?: number; // ms before auto-cleanup
  debugMode?: boolean;
}

class SubscriptionManager {
  private subscriptions = new Map<string, SubscriptionConfig>();
  private options: Required<SubscriptionManagerOptions>;
  private cleanupInterval: number | null = null;

  constructor(options: SubscriptionManagerOptions = {}) {
    this.options = {
      maxSubscriptionsPerUser: 20,
      maxIdleTime: 5 * 60 * 1000, // 5 minutes
      debugMode: import.meta.env.DEV,
      ...options,
    };

    // Start cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Register a new subscription
   */
  register(id: string, channel: RealtimeChannel, table: string): void {
    // Check max subscriptions limit
    if (this.subscriptions.size >= this.options.maxSubscriptionsPerUser) {
      this.cleanupOldest();
    }

    // Check for existing subscription with same ID
    if (this.subscriptions.has(id)) {
      this.unsubscribe(id);
    }

    this.subscriptions.set(id, {
      id,
      channel,
      table,
      createdAt: new Date(),
      lastActivity: new Date(),
    });

    if (this.options.debugMode) {
      logger.info(`Subscription registered: ${id}`, {
        metadata: { table, totalActive: this.subscriptions.size },
      });
    }
  }

  /**
   * Unsubscribe and remove a subscription
   */
  unsubscribe(id: string): boolean {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return false;

    try {
      subscription.channel.unsubscribe();
    } catch (err) {
      logger.warn(`Failed to unsubscribe ${id}`, { metadata: { error: err } });
    }

    this.subscriptions.delete(id);

    if (this.options.debugMode) {
      logger.info(`Subscription removed: ${id}`, {
        metadata: { totalActive: this.subscriptions.size },
      });
    }

    return true;
  }

  /**
   * Update last activity timestamp
   */
  touch(id: string): void {
    const subscription = this.subscriptions.get(id);
    if (subscription) {
      subscription.lastActivity = new Date();
    }
  }

  /**
   * Get all active subscriptions
   */
  getActive(): SubscriptionConfig[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * Get subscription count
   */
  getCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Check if a subscription exists
   */
  has(id: string): boolean {
    return this.subscriptions.has(id);
  }

  /**
   * Unsubscribe all subscriptions
   */
  unsubscribeAll(): void {
    for (const id of this.subscriptions.keys()) {
      this.unsubscribe(id);
    }

    if (this.options.debugMode) {
      logger.info("All subscriptions removed");
    }
  }

  /**
   * Unsubscribe all subscriptions for a specific table
   */
  unsubscribeByTable(table: string): void {
    for (const [id, config] of this.subscriptions.entries()) {
      if (config.table === table) {
        this.unsubscribe(id);
      }
    }
  }

  /**
   * Unsubscribe all subscriptions matching a prefix
   */
  unsubscribeByPrefix(prefix: string): void {
    for (const id of this.subscriptions.keys()) {
      if (id.startsWith(prefix)) {
        this.unsubscribe(id);
      }
    }
  }

  /**
   * Cleanup idle subscriptions
   */
  private cleanupIdle(): void {
    const now = Date.now();

    for (const [id, config] of this.subscriptions.entries()) {
      const idleTime = now - config.lastActivity.getTime();
      if (idleTime > this.options.maxIdleTime) {
        this.unsubscribe(id);
        if (this.options.debugMode) {
          logger.info(`Cleaned up idle subscription: ${id}`, {
            metadata: { idleTime: Math.round(idleTime / 1000) + "s" },
          });
        }
      }
    }
  }

  /**
   * Cleanup oldest subscription when at limit
   */
  private cleanupOldest(): void {
    let oldest: SubscriptionConfig | null = null;

    for (const config of this.subscriptions.values()) {
      if (!oldest || config.createdAt < oldest.createdAt) {
        oldest = config;
      }
    }

    if (oldest) {
      this.unsubscribe(oldest.id);
      if (this.options.debugMode) {
        logger.info(`Cleaned up oldest subscription: ${oldest.id}`);
      }
    }
  }

  /**
   * Start periodic cleanup interval
   */
  private startCleanupInterval(): void {
    // Cleanup every minute
    this.cleanupInterval = window.setInterval(() => {
      this.cleanupIdle();
    }, 60000);
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.unsubscribeAll();
  }

  /**
   * Get status report for debugging
   */
  getStatus(): {
    activeCount: number;
    subscriptions: Array<{
      id: string;
      table: string;
      age: number;
      idleTime: number;
    }>;
  } {
    const now = Date.now();
    return {
      activeCount: this.subscriptions.size,
      subscriptions: Array.from(this.subscriptions.values()).map((s) => ({
        id: s.id,
        table: s.table,
        age: Math.round((now - s.createdAt.getTime()) / 1000),
        idleTime: Math.round((now - s.lastActivity.getTime()) / 1000),
      })),
    };
  }
}

// Singleton instance
let managerInstance: SubscriptionManager | null = null;

export function getSubscriptionManager(): SubscriptionManager {
  if (!managerInstance) {
    managerInstance = new SubscriptionManager();
  }
  return managerInstance;
}

export function destroySubscriptionManager(): void {
  if (managerInstance) {
    managerInstance.destroy();
    managerInstance = null;
  }
}

export { SubscriptionManager };
export type { SubscriptionConfig, SubscriptionManagerOptions };
