import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface RiskEvent {
  id: string;
  user_id: string;
  event_type: string;
  severity: string;
  description: string;
  details: Record<string, unknown> | null;
  created_at: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string | null;
  profiles: {
    full_name: string | null;
    email: string;
  };
}

interface EventDetailDialogProps {
  selectedEvent: RiskEvent | null;
  eventDialogOpen: boolean;
  setEventDialogOpen: (open: boolean) => void;
  getRiskTypeIcon: (type: string) => React.ReactNode;
  getSeverityColor: (severity: string) => string;
}

export function EventDetailDialog({
  selectedEvent,
  eventDialogOpen,
  setEventDialogOpen,
  getRiskTypeIcon,
  getSeverityColor,
}: EventDetailDialogProps) {
  return (
    <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {selectedEvent && getRiskTypeIcon(selectedEvent.event_type)}
            Risk Event Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about the selected risk event.
          </DialogDescription>
        </DialogHeader>

        {selectedEvent && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>User</Label>
                <p className="text-sm font-medium">
                  {selectedEvent.profiles.full_name ||
                    selectedEvent.profiles.email}
                </p>
              </div>
              <div>
                <Label>Event Type</Label>
                <p className="text-sm font-medium capitalize">
                  {selectedEvent.event_type.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            <div>
              <Label>Severity</Label>
              <Badge variant="outline">
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-2 ${getSeverityColor(
                    selectedEvent.severity
                  )}`}
                />
                {selectedEvent.severity}
              </Badge>
            </div>

            <div>
              <Label>Description</Label>
              <p className="text-sm">{selectedEvent.description}</p>
            </div>

            <div>
              <Label>Metadata</Label>
              <pre className="text-sm bg-muted p-3 rounded overflow-auto max-h-32">
                {JSON.stringify(selectedEvent.details, null, 2)}
              </pre>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Created</Label>
                <p className="text-sm">
                  {new Date(selectedEvent.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <Label>Status</Label>
                <Badge variant="outline">
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      selectedEvent.resolved ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  {selectedEvent.resolved ? 'Resolved' : 'Active'}
                </Badge>
              </div>
            </div>

            {selectedEvent.resolved_at && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Resolved At</Label>
                  <p className="text-sm">
                    {new Date(selectedEvent.resolved_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>Resolved By</Label>
                  <p className="text-sm">
                    {selectedEvent.resolved_by || 'Unknown'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
