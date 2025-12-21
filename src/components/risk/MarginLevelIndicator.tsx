import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

// Define the expected shape of the realtime payload
interface ProfileUpdatePayload {
  equity: number;
  margin_used: number;
}

// Type guard to validate the payload shape
const isValidProfilePayload = (
  payload: unknown
): payload is ProfileUpdatePayload => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const obj = payload as Record<string, unknown>;
  const equity = obj.equity;
  const marginUsed = obj.margin_used;

  return (
    typeof equity === 'number' &&
    typeof marginUsed === 'number' &&
    !isNaN(equity) &&
    !isNaN(marginUsed) &&
    isFinite(equity) &&
    isFinite(marginUsed)
  );
};

export const MarginLevelIndicator = () => {
  const { user } = useAuth();
  const [marginLevel, setMarginLevel] = useState<number>(0);
  const [marginCallLevel, setMarginCallLevel] = useState<number>(50);
  const [stopOutLevel, setStopOutLevel] = useState<number>(20);
  const [hasData, setHasData] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('equity, margin_used')
        .eq('id', user.id)
        .single();

      // Get risk settings
      const { data: settings } = await supabase
        .from('risk_settings')
        .select('margin_call_level, stop_out_level')
        .eq('user_id', user.id)
        .single();

      if (profile && profile.margin_used > 0) {
        const level = (profile.equity / profile.margin_used) * 100;
        setMarginLevel(level);
        setHasData(true);
      }

      if (settings) {
        setMarginCallLevel(settings.margin_call_level);
        setStopOutLevel(settings.stop_out_level);
      }
    };

    fetchData();

    // Subscribe to profile changes
    const channel = supabase
      .channel('margin-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload: { new: unknown }) => {
          // Type-safe payload validation
          if (isValidProfilePayload(payload.new)) {
            const { equity, margin_used } = payload.new;
            if (margin_used > 0) {
              setMarginLevel((equity / margin_used) * 100);
              setHasData(true);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getColor = () => {
    if (marginLevel < stopOutLevel) return 'hsl(var(--destructive))';
    if (marginLevel < marginCallLevel) return 'hsl(var(--warning))';
    return 'hsl(var(--primary))';
  };

  const getStatus = () => {
    if (marginLevel < stopOutLevel) return 'Critical - Stop Out Risk';
    if (marginLevel < marginCallLevel) return 'Warning - Margin Call';
    return 'Healthy';
  };

  // Return null to let parent handle the empty state display
  if (marginLevel === 0 || !hasData) return null;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{getStatus()}</span>
        <span className="font-bold text-primary">
          {marginLevel.toFixed(1)}%
        </span>
      </div>
      <Progress
        value={Math.min(marginLevel, 200)}
        className="h-2"
        style={
          {
            '--progress-background': getColor(),
          } as React.CSSProperties
        }
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Stop Out: {stopOutLevel}%</span>
        <span>Margin Call: {marginCallLevel}%</span>
      </div>
    </div>
  );
};
