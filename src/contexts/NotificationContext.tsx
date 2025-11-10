import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface NotificationContextType {
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

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
          const notification = payload.new as any;
          
          // Show toast notification
          toast({
            title: notification.title,
            description: notification.message,
            duration: 5000,
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
          const notification = payload.new as any;
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
          const order = payload.new as any;
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
          const position = payload.new as any;
          const oldPosition = payload.old as any;

          // Notify on position close
          if (oldPosition.status === "open" && position.status === "closed") {
            await supabase.functions.invoke("send-notification", {
              body: {
                user_id: user.id,
                type: "position_update",
                title: "Position Closed",
                message: `Your ${position.side} position for ${position.symbol} has been closed with a ${position.realized_pnl >= 0 ? 'profit' : 'loss'} of ${Math.abs(position.realized_pnl).toFixed(2)}`,
                data: {
                  position_id: position.id,
                  symbol: position.symbol,
                  side: position.side,
                  realized_pnl: position.realized_pnl,
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
          const doc = payload.new as any;
          const oldDoc = payload.old as any;

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
          const event = payload.new as any;
          
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
      supabase.removeChannel(channel);
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(positionsChannel);
      supabase.removeChannel(kycChannel);
      supabase.removeChannel(riskChannel);
    };
  }, [user, toast]);

  const markAsRead = async (id: string) => {
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id)
      .eq("user_id", user.id);
  };

  const markAllAsRead = async () => {
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}