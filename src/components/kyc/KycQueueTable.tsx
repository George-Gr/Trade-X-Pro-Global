import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, CheckCircle, X, Clock, AlertCircle } from 'lucide-react';
import type { KycRequest, UserProfile, KycDocument } from './KycAdminDashboard';

type EnrichedKycRequest = KycRequest & { userProfile?: UserProfile; kycDocuments?: KycDocument[] };

interface KycQueueTableProps {
    requests: EnrichedKycRequest[];
    isLoading: boolean;
    actionLoading: string | null;
    selectedRequest: EnrichedKycRequest | null;
    onRequestSelect: (request: EnrichedKycRequest) => void;
    onReview: (request: EnrichedKycRequest) => void;
    onApprove: (docId: string, notes?: string) => void;
    onReject: (docId: string, reason?: string) => void;
    onRequestMoreInfo: (docId: string, notes: string) => void;
    children?: React.ReactNode;
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'approved':
            return <Badge className="bg-profit">Approved</Badge>;
        case 'rejected':
            return <Badge variant="destructive">Rejected</Badge>;
        case 'manual_review':
        case 'escalated':
            return <Badge variant="outline">Manual Review</Badge>;
        case 'submitted':
            return <Badge className="bg-amber-500">Under Review</Badge>;
        default:
            return <Badge variant="secondary">Pending</Badge>;
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'approved':
            return <CheckCircle className="h-4 w-4 text-profit" />;
        case 'rejected':
            return <X className="h-4 w-4 text-destructive" />;
        case 'submitted':
            return <Clock className="h-4 w-4 text-amber-500" />;
        default:
            return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
};

export const KycQueueTable: React.FC<KycQueueTableProps> = ({
    requests,
    isLoading,
    actionLoading,
    selectedRequest,
    onRequestSelect,
    onReview,
    children,
}) => {
    if (requests.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <p>No KYC requests found</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {requests.map((req) => (
                        <TableRow key={req.id}>
                            <TableCell className="font-medium">{req.userProfile?.full_name || 'Unknown'}</TableCell>
                            <TableCell className="text-sm">{req.userProfile?.email}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(req.status)}
                                    {getStatusBadge(req.status)}
                                </div>
                            </TableCell>
                            <TableCell className="text-sm">
                                {req.submitted_at ? new Date(req.submitted_at).toLocaleDateString() : new Date(req.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-sm">{req.kycDocuments?.length || 0} docs</TableCell>
                            <TableCell>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                onRequestSelect(req);
                                                onReview(req);
                                            }}
                                            disabled={actionLoading === req.id}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            Review
                                        </Button>
                                    </DialogTrigger>
                                    {selectedRequest?.id === req.id && children}
                                </Dialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
