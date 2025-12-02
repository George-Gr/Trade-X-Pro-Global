import React from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Eye, CheckCircle, X, ChevronDown, AlertCircle } from 'lucide-react';
import type { KycRequest, UserProfile, KycDocument } from './KycAdminDashboard';

interface KycReviewDialogProps {
    request: (KycRequest & { userProfile?: UserProfile; kycDocuments?: KycDocument[] }) | null;
    actionLoading: string | null;
    adminNotes: string;
    rejectionReason: string;
    onAdminNotesChange: (value: string) => void;
    onRejectionReasonChange: (value: string) => void;
    onApprove: (id: string, notes: string) => void;
    onReject: (id: string, reason: string) => void;
    onRequestMoreInfo: (id: string, notes: string) => void;
    onPreviewDocument: (url: string) => void;
}

export const KycReviewDialog: React.FC<KycReviewDialogProps> = ({
    request,
    actionLoading,
    adminNotes,
    rejectionReason,
    onAdminNotesChange,
    onRejectionReasonChange,
    onApprove,
    onReject,
    onRequestMoreInfo,
    onPreviewDocument,
}) => {
    if (!request) return null;

    return (
        <DialogContent className="w-[calc(100%-2rem)] max-w-[90vw] md:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>KYC Review: {request.userProfile?.full_name}</DialogTitle>
                <DialogDescription>{request.userProfile?.email}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
                {/* Documents */}
                <div className="space-y-4">
                    <h4 className="font-semibold">Documents ({request.kycDocuments?.length || 0})</h4>
                    {request.kycDocuments && request.kycDocuments.length > 0 ? (
                        <div className="space-y-2">
                            {request.kycDocuments.map((doc: KycDocument) => (
                                <div key={doc.id} className="border rounded-lg p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium capitalize">{doc.type.replace(/_/g, ' ')}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge variant="outline">{doc.status}</Badge>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onPreviewDocument(doc.url)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No documents uploaded</p>
                    )}
                </div>

                {/* Decision Form */}
                <div className="space-y-4 border-t pt-4">
                    <h4 className="font-semibold">Admin Decision</h4>

                    {request.status === 'rejected' && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                This request has been rejected.{' '}
                                {request.notes && `Reason: ${request.notes}`}
                            </AlertDescription>
                        </Alert>
                    )}

                    {request.status === 'approved' && (
                        <Alert className="border-profit/20 bg-profit/5">
                            <CheckCircle className="h-4 w-4 text-profit" />
                            <AlertDescription>This request has been approved.</AlertDescription>
                        </Alert>
                    )}

                    {!['approved', 'rejected'].includes(request.status) && (
                        <>
                            <Textarea
                                placeholder="Admin notes (optional)"
                                value={adminNotes}
                                onChange={(e) => onAdminNotesChange(e.target.value)}
                                className="min-h-20"
                            />

                            {request.status === 'rejected' && (
                                <Textarea
                                    placeholder="Rejection reason (required)"
                                    value={rejectionReason}
                                    onChange={(e) => onRejectionReasonChange(e.target.value)}
                                    className="min-h-20"
                                />
                            )}

                            <div className="flex gap-4">
                                <Button
                                    className="flex-1 bg-profit hover:bg-profit/90"
                                    onClick={() => onApprove(request.id, adminNotes)}
                                    disabled={actionLoading === request.id}
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                </Button>
                                <Button
                                    className="flex-1"
                                    variant="destructive"
                                    onClick={() => onReject(request.id, rejectionReason || 'Document verification failed')}
                                    disabled={actionLoading === request.id}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Reject
                                </Button>
                                <Button
                                    className="flex-1"
                                    variant="outline"
                                    onClick={() => onRequestMoreInfo(request.id, adminNotes)}
                                    disabled={actionLoading === request.id}
                                >
                                    <ChevronDown className="h-4 w-4 mr-2" />
                                    Request More Info
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DialogContent>
    );
};