import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ResolutionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    resolution: string;
    onResolutionChange: (value: string) => void;
    onResolve: () => void;
    disabled: boolean;
}

export const ResolutionDialog: React.FC<ResolutionDialogProps> = ({
    open,
    onOpenChange,
    resolution,
    onResolutionChange,
    onResolve,
    disabled,
}) => (
    <Dialog
        open={open}
        onOpenChange={(isOpen) => {
            if (!isOpen) {
                onResolutionChange("");
            }
        }}
    >
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Resolve Risk Event</DialogTitle>
                <DialogDescription>
                    Mark this risk event as resolved and provide details about the resolution.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="resolution">Resolution Details</Label>
                    <Textarea
                        id="resolution"
                        placeholder="Describe how this risk event was resolved..."
                        value={resolution}
                        onChange={(e) => onResolutionChange(e.target.value)}
                        rows={4}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button
                    variant="outline"
                    onClick={() => onResolutionChange("")}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onResolve}
                    disabled={disabled}
                >
                    Mark as Resolved
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);