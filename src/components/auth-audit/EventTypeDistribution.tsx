import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuditEvent, AuditEventType } from '@/lib/authAuditLogger';
import { PieChart } from 'lucide-react';
import React, { useMemo } from 'react';

interface EventTypeDistributionProps {
  filteredEvents: AuditEvent[];
  getEventTypeIcon: (eventType: AuditEventType) => React.ReactNode;
}

export const EventTypeDistribution: React.FC<EventTypeDistributionProps> = ({
  filteredEvents,
  getEventTypeIcon,
}) => {
  const eventTypeCounts = useMemo(() => {
    const counts = filteredEvents.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts);
  }, [filteredEvents]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PieChart className="h-5 w-5" />
          <span>Event Types</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {eventTypeCounts.map(([eventType, count]) => (
            <div
              key={eventType}
              className="flex items-center justify-between p-2 bg-[hsl(var(--muted))] rounded"
            >
              <div className="flex items-center space-x-2">
                {getEventTypeIcon(eventType as AuditEventType)}
                <span className="text-sm font-medium">
                  {eventType.replace('AUTH_', '').replace('_', ' ')}
                </span>
              </div>
              <Badge variant="outline">{count}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
