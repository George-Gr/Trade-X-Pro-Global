/**
 * Hook: useSubscription
 *
 * Simplified wrapper for Supabase real-time subscriptions
 */

import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseBrowserClient";
import { getSubscriptionManager } from "@/lib/subscriptionManager";

interface UseSubscriptionOptions {
  table: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: string;
  onData: (payload: unknown) => void;
  enabled?: boolean;
  channelId?: string;
}

export function useSubscription(options: UseSubscriptionOptions) {
  const {
    table,
    event = "*",
    filter,
    onData,
    enabled = true,
    channelId,
  } = options;
  const subscriptionIdRef = useRef<string>("");

  const unsubscribe = useCallback(() => {
    if (subscriptionIdRef.current) {
      getSubscriptionManager().unsubscribe(subscriptionIdRef.current);
      subscriptionIdRef.current = "";
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      unsubscribe();
      return;
    }

    const id = channelId || `${table}-${event}-${Date.now()}`;
    subscriptionIdRef.current = id;

    const manager = getSubscriptionManager();
    if (manager.has(id)) return;

    const channel = supabase
      .channel(id)
      .on(
        "postgres_changes" as never,
        {
          event,
          schema: "public",
          table,
          ...(filter ? { filter } : {}),
        } as never,
        onData as never,
      )
      .subscribe();

    manager.register(id, channel, table);

    return () => unsubscribe();
  }, [enabled, table, event, filter, onData, channelId, unsubscribe]);

  return { unsubscribe };
}

export default useSubscription;
