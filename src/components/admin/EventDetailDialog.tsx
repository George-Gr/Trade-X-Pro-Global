import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Eye, AlertTriangle, Shield, TrendingDown, DollarSign, Users, Clock, Flag, Zap, AlertCircle } from 'lucide-react';
import type { RiskEvent } from './RiskPanel';

interface EventDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event: RiskEvent | null;
}

const getRiskTypeIcon = (type: string) => {
    switch (type) {
        case 'margin_call': return <AlertTriangle className="h-4 w-4" />;
        case 'liquidation_risk': return <TrendingDown className="h-4 w-4" />;
        case 'suspicious_activity': return <Flag className="h-4 w-4" />;
        case 'system_error': return <Zap className="h-4 w-4" />;
        case 'compliance_violation': return <AlertCircle className="h-4 w-4" />;
        default: return <Shield className="h-4 w-4" />;
    }
};

const getSeverityColor = (severity: string) => {
    switch (severity) {
        case 'critical': return 'bg-red-500';
        case 'high': return 'bg-orange-500';
        case 'medium': return 'bg-yellow-500';
        case 'low': return 'bg-green-500';
        default: return 'bg-gray-500';
    }
};

export const EventDetailDialog: React.FC<EventDetailDialogProps> = ({
    open,
    onOpenChange,
    event,
}) => {
    if (!event) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        {getRiskTypeIcon(event.event_type)}
                        Risk Event Details
                    </DialogTitle>
                    <DialogDescription>
                        Detailed information about the selected risk event.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>User</Label>
                            <p className="text-sm font-medium">{event.profiles.full_name || event.profiles.email}</p>
                        </div>
                        <div>
                            <Label>Event Type</Label>
                            <p className="text-sm font-medium capitalize">{event.event_type.replace(/_/g, " ")}</p>
                        </div>
                    </div>

                    <div>
                        <Label>Severity</Label>
                        <Badge variant="outline">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getSeverityColor(event.severity)}`} />
                            {event.severity}
                        </Badge>
                    </div>

                    <div>
                        <Label>Description</Label>
                        <p className="text-sm">{event.description}</p>
                    </div>

                    <div>
                        <Label>Metadata</Label>
                        <pre className="text-sm bg-muted p-3 rounded text-xs overflow-auto max-h-32">
                            {JSON.stringify(event.details, null, 2)}
                        </pre>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Created</Label>
                            <p className="text-sm">{new Date(event.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                            <Label>Status</Label>
                            <Badge variant="outline">
                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${event.resolved ? 'bg-green-500' : 'bg-red-500'}`} />
                                {event.resolved ? 'Resolved' : 'Active'}
                            </Badge>
                        </div>
                    </div>

                    {event.resolved_at && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Resolved At</Label>
                                <p className="text-sm">{new Date(event.resolved_at).toLocaleString()}</p>
                            </div>
                            <div>
                                <Label>Resolved By</Label>
                                <p className="text-sm">{event.resolved_by || 'Unknown'}</p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};