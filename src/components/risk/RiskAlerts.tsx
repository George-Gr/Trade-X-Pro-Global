import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseBrowserClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface RiskEvent {
  id: string;
  event_type: string;
  severity: string;
  description: string;
  details: unknown;
  resolved: boolean;
  created_at: string;
}

export const RiskAlerts = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<RiskEvent[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchEvents = async () => {
      const { data } = await supabase
        .from('risk_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) setEvents(data);
    };

    fetchEvents();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('risk-events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'risk_events',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setEvents((prev) => [payload.new as RiskEvent, ...prev].slice(0, 5));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Return null to let parent handle the empty state display
  if (events.length === 0) return null;

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <Alert
          key={event.id}
          variant={event.severity === 'critical' ? 'destructive' : 'default'}
          className="animate-in slide-in-from-top-4"
        >
          {event.severity === 'critical' && <AlertTriangle className="h-4 w-4" />}
          {event.severity === 'warning' && <AlertCircle className="h-4 w-4" />}
          {event.severity === 'info' && <Info className="h-4 w-4" />}
          <AlertTitle className="capitalize">
            {event.event_type.replace('_', ' ')}
          </AlertTitle>
          <AlertDescription>{event.description}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
};
