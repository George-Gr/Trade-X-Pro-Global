import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ResolutionDialogProps {
  resolutionDialog: {
    open: boolean;
    eventId: string | null;
    resolution: string;
  };
  setResolutionDialog: (dialog: {
    open: boolean;
    eventId: string | null;
    resolution: string;
  }) => void;
  handleResolveEvent: () => void;
}

export function ResolutionDialog({
  resolutionDialog,
  setResolutionDialog,
  handleResolveEvent,
}: ResolutionDialogProps) {
  return (
    <Dialog
      open={resolutionDialog.open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setResolutionDialog({ open: false, eventId: null, resolution: '' });
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve Risk Event</DialogTitle>
          <DialogDescription>
            Mark this risk event as resolved and provide details about the
            resolution.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resolution">Resolution Details</Label>
            <Textarea
              id="resolution"
              placeholder="Describe how this risk event was resolved..."
              value={resolutionDialog.resolution}
              onChange={(e) =>
                setResolutionDialog({
                  ...resolutionDialog,
                  resolution: e.target.value,
                })
              }
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() =>
              setResolutionDialog({
                open: false,
                eventId: null,
                resolution: '',
              })
            }
          >
            Cancel
          </Button>
          <Button
            onClick={handleResolveEvent}
            disabled={!resolutionDialog.resolution.trim()}
          >
            Mark as Resolved
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
