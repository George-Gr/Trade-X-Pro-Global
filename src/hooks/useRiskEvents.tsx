import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseBrowserClient';
import { useAuth } from '@/hooks/useAuth';

export interface RiskEvent {
  id: string;
  event_type: string;
  severity: string;
  description: string;
  details?: unknown;
  resolved: boolean;
  created_at: string;
}

export const useRiskEvents = (limit = 5) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<RiskEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('risk_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to fetch risk events:', error);
        if (mounted) setEvents([]);
      } else {
        if (mounted) setEvents((data as RiskEvent[]) || []);
      }
      if (mounted) setLoading(false);
    };

    fetchEvents();

    const channel = supabase
      .channel(`risk-events:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'risk_events',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setEvents((prev) =>
            [payload.new as RiskEvent, ...prev].slice(0, limit)
          );
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        // ignore
      }
    };
  }, [user, limit]);

  return { events, loading };
};

export default useRiskEvents;
