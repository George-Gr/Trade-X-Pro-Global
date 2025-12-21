import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useRiskEvents } from '@/hooks/useRiskEvents';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

export const RiskAlerts = () => {
  const { user } = useAuth();
  const { events } = useRiskEvents(user?.id);

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
          {event.severity === 'critical' && (
            <AlertTriangle className="h-4 w-4" />
          )}
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
