import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuditEvent, AuditEventType } from '@/lib/authAuditLogger';
import { Clock, LineChart } from 'lucide-react';
import React from 'react';

interface EventTimelineProps {
  filteredEvents: AuditEvent[];
  getEventTypeIcon: (eventType: AuditEventType) => React.ReactNode;
  getSeverityColor: (severity: string) => string;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({
  filteredEvents,
  getEventTypeIcon,
  getSeverityColor,
}) => {
  const extractEventMetadata = (
    metadata: unknown
  ): { message: string; detailsString: string | null } => {
    const meta = metadata as Record<string, unknown>;
    const message =
      typeof meta.message === 'string'
        ? meta.message
        : meta.message
        ? String(meta.message)
        : '';
    const details = meta.details;
    const detailsString = details
      ? JSON.stringify(details as Record<string, unknown>)
      : null;
    return { message, detailsString };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <LineChart className="h-5 w-5" />
          <span>Recent Authentication Events</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredEvents.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredEvents.slice(0, 20).map((event, index) => {
              const { message, detailsString } = extractEventMetadata(
                event.metadata
              );

              return (
                <div
                  key={`${event.timestamp}-${index}`}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {getEventTypeIcon(event.eventType)}
                      <Badge
                        variant={
                          event.severity === 'critical'
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        {event.eventType
                          .replace('AUTH_', '')
                          .replaceAll('_', ' ')}
                      </Badge>
                      <Badge variant="outline">{event.severity}</Badge>
                      {event.userId && (
                        <span className="text-sm font-medium text-gray-600">
                          User: {event.userId}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{message}</div>
                    <div className="text-xs text-gray-500">
                      {event.ipAddress} •{' '}
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                    {detailsString && (
                      <div className="text-xs text-gray-500 mt-1">
                        Details: {detailsString}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${getSeverityColor(
                        event.severity
                      )}`}
                    ></div>
                    {event.sessionId && (
                      <Badge variant="outline" className="text-xs">
                        Session: {event.sessionId}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p>No authentication events detected in the selected time range</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
