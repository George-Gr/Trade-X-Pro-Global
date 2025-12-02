import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Shield, Loader2 } from 'lucide-react';
import { AlertTriangle, TrendingDown, Flag, Zap, AlertCircle } from 'lucide-react';
import type { RiskEvent } from './RiskPanel';

interface RiskEventsTableProps {
    events: RiskEvent[];
    isLoading: boolean;
    onRefresh: () => void;
    onViewEvent: (event: RiskEvent) => void;
    onResolveEvent: (event: RiskEvent) => void;
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

export const RiskEventsTable: React.FC<RiskEventsTableProps> = ({
    events,
    isLoading,
    onRefresh,
    onViewEvent,
    onResolveEvent,
}) => {
    return (
        <Card>
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Risk Events</h3>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        className="flex items-center gap-2"
                    >
                        <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        <div className="mb-4">
                            <span className="text-sm text-muted-foreground">
                                Showing {events.length} risk events
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Severity</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {events.map((event) => (
                                        <TableRow key={event.id} className="hover:bg-muted/50">
                                            <TableCell>
                                                <Badge variant="outline" className="flex items-center gap-1 capitalize">
                                                    {getRiskTypeIcon(event.event_type)}
                                                    {event.event_type.replace(/_/g, " ")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {event.profiles.full_name || event.profiles.email}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getSeverityColor(event.severity)}`} />
                                                    {event.severity}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${event.resolved ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    {event.resolved ? 'Resolved' : 'Active'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate" title={event.description}>
                                                {event.description}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {new Date(event.created_at).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => onViewEvent(event)}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                        View
                                                    </Button>
                                                    {!event.resolved && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => onResolveEvent(event)}
                                                            className="flex items-center gap-1"
                                                        >
                                                            <Shield className="h-3 w-3" />
                                                            Resolve
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {events.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No risk events found.
                            </div>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
};