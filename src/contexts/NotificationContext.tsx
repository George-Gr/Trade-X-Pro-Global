import React, { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

import { NotificationContext } from "./notificationContextHelpers";

export function NotificationProvider({ children }: { children?: React.ReactNode } = {}) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Memoize markAsRead to prevent recreating on every render
  const markAsRead = useCallback(async (id: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to mark notification as read", { id, userId: user.id, error });
      // Optionally, surface user feedback here (e.g., toast({ ... }))
      return;
    }
  }, [user]);

  // Memoize markAllAsRead to prevent recreating on every render
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    setUnreadCount(0);
  }, [user]);

  // Main effect - subscribe to notifications
  useEffect(() => {
    if (!user) return;

    // Fetch initial unread count
    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);

      setUnreadCount(count || 0);
    };

    fetchUnreadCount();

    // Types for Supabase payloads we consume. Keep these minimal and optional
    // so they cover the fields we access without being overly strict.
    type SupabaseNotification = {
      id?: string;
      title?: string;
      message?: string;
      read?: boolean;
      created_at?: string;
    };

    type SupabaseOrder = {
      id?: string;
      status?: string;
      side?: string;
      quantity?: number | string;
      symbol?: string;
      fill_price?: number | string;
    };

    type SupabasePosition = {
      id?: string;
      status?: string;
      side?: string;
      symbol?: string;
      realized_pnl?: number;
    };

    type SupabaseKycDoc = {
      id?: string;
      status?: string;
      document_type?: string;
      rejection_reason?: string;
    };

    type SupabaseRiskEvent = {
      id?: string;
      event_type?: string;
      description?: string;
      severity?: string;
      details?: unknown;
    };

    // Subscribe to new notifications
    const channel = supabase
      .channel("notifications-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as SupabaseNotification;

          // Show toast notification (uses default duration based on variant)
          toast({
            title: notification.title,
            description: notification.message,
          });

          setUnreadCount((prev) => prev + 1);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as SupabaseNotification;
          if (notification.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    // Listen to orders being filled
    const ordersChannel = supabase
      .channel("orders-notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const order = payload.new as SupabaseOrder;
          if (order.status === "filled") {
            await supabase.functions.invoke("send-notification", {
              body: {
                user_id: user.id,
                type: "order_filled",
                title: "Order Filled",
                message: `Your ${order.side} order for ${order.quantity} ${order.symbol} has been filled at ${order.fill_price}`,
                data: {
                  order_id: order.id,
                  symbol: order.symbol,
                  side: order.side,
                  quantity: order.quantity,
                  fill_price: order.fill_price,
                },
              },
            });
          }
        }
      )
      .subscribe();

    // Listen to position updates
    const positionsChannel = supabase
      .channel("positions-notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "positions",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const position = payload.new as SupabasePosition;
          const oldPosition = payload.old as SupabasePosition;

          // Notify on position close
          if (oldPosition.status === "open" && position.status === "closed") {
            await supabase.functions.invoke("send-notification", {
              body: {
                user_id: user.id,
                type: "position_update",
                title: "Position Closed",
                message: `Your ${position.side} position for ${position.symbol} has been closed with a ${(position.realized_pnl || 0) >= 0 ? 'profit' : 'loss'} of ${Math.abs(position.realized_pnl || 0).toFixed(2)}`,
                data: {
                  position_id: position.id,
                  symbol: position.symbol,
                  side: position.side,
                  realized_pnl: position.realized_pnl || 0,
                },
              },
            });
          }
        }
      )
      .subscribe();

    // Listen to KYC status changes
    const kycChannel = supabase
      .channel("kyc-notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "kyc_documents",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const doc = payload.new as SupabaseKycDoc;
          const oldDoc = payload.old as SupabaseKycDoc;

          if (oldDoc.status !== doc.status) {
            await supabase.functions.invoke("send-notification", {
              body: {
                user_id: user.id,
                type: "kyc_update",
                title: "KYC Status Update",
                message: `Your ${doc.document_type} document status has been updated to: ${doc.status}`,
                data: {
                  document_id: doc.id,
                  document_type: doc.document_type,
                  status: doc.status,
                  rejection_reason: doc.rejection_reason,
                },
              },
            });
          }
        }
      )
      .subscribe();

    // Listen to risk events
    const riskChannel = supabase
      .channel("risk-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "risk_events",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const event = payload.new as SupabaseRiskEvent;

          await supabase.functions.invoke("send-notification", {
            body: {
              user_id: user.id,
              type: "risk_event",
              title: `Risk Alert: ${event.event_type}`,
              message: event.description,
              data: {
                event_id: event.id,
                event_type: event.event_type,
                severity: event.severity,
                details: event.details,
              },
            },
          });
        }
      )
      .subscribe();

    return () => {
      // Properly unsubscribe from all channels before removing them
      // This prevents WebSocket connection leaks and memory accumulation
      channel.unsubscribe();
      ordersChannel.unsubscribe();
      positionsChannel.unsubscribe();
      kycChannel.unsubscribe();
      riskChannel.unsubscribe();

      // Then remove channel references from Supabase client
      supabase.removeChannel(channel);
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(positionsChannel);
      supabase.removeChannel(kycChannel);
      supabase.removeChannel(riskChannel);
    };
  }, [user, toast]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({ unreadCount, markAsRead, markAllAsRead }),
    [unreadCount, markAsRead, markAllAsRead]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// The `useNotifications` hook is exported from `notificationContextHelpers.tsx`.

// Re-export for backwards compatibility so imports from
// `@/contexts/NotificationContext` continue to work.
// NOTE: `useNotifications` is exported from `notificationContextHelpers.tsx`.
// We intentionally do NOT re-export it here to keep this file exporting only
// the React provider component (avoids react-refresh warnings).
