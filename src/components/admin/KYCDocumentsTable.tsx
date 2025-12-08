import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Eye, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import type { KYCDocument } from './KYCPanel';

interface KYCDocumentsTableProps {
    documents: KYCDocument[];
    isLoading: boolean;
    isApproving: string | null;
    isRejecting: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSortChange: (field: string) => void;
    onViewDocument: (filePath: string) => void;
    onApprove: (docId: string, userId: string) => void;
    onReject: (docId: string) => void;
}

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'approved':
            return 'default';
        case 'rejected':
            return 'destructive';
        case 'pending':
            return 'outline';
        default:
            return 'outline';
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'approved':
            return <CheckCircle className="h-3 w-3" />;
        case 'rejected':
            return <XCircle className="h-3 w-3" />;
        case 'pending':
            return <Clock className="h-3 w-3" />;
        default:
            return null;
    }
};

export const KYCDocumentsTable: React.FC<KYCDocumentsTableProps> = ({
    documents,
    isLoading,
    isApproving,
    isRejecting,
    sortBy,
    sortOrder,
    onSortChange,
    onViewDocument,
    onApprove,
    onReject,
}) => {
    const handleSort = (field: string) => {
        onSortChange(field);
    };

    return (
        <Card>
            <div className="p-6">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        <div className="mb-4">
                            <span className="text-sm text-muted-foreground">
                                Showing {documents.length} documents
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => handleSort('profiles.full_name')}
                                        >
                                            Name
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => handleSort('profiles.email')}
                                        >
                                            Email
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => handleSort('document_type')}
                                        >
                                            Document Type
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Reviewed At</TableHead>
                                        <TableHead>Country</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {documents.map((doc) => (
                                        <TableRow key={doc.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium">
                                                {doc.profiles.full_name || 'N/A'}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {doc.profiles.email}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {doc.document_type.replace(/_/g, ' ').toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(doc.status)}>
                                                    {getStatusIcon(doc.status)}
                                                    <span className="ml-1">
                                                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                                    </span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {doc.reviewed_at
                                                    ? new Date(doc.reviewed_at).toLocaleString()
                                                    : 'Pending'}
                                            </TableCell>
                                            <TableCell>{doc.profiles.country || 'N/A'}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => onViewDocument(doc.file_path)}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                        View
                                                    </Button>
                                                    {doc.status === 'pending' && (
                                                        <>
                                                            <LoadingButton
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => onReject(doc.id)}
                                                                isLoading={isRejecting}
                                                                loadingText="Rejecting..."
                                                                className="flex items-center gap-1"
                                                            >
                                                                <XCircle className="h-3 w-3" />
                                                                Reject
                                                            </LoadingButton>
                                                            <LoadingButton
                                                                size="sm"
                                                                onClick={() => onApprove(doc.id, doc.user_id)}
                                                                isLoading={isApproving === doc.id}
                                                                loadingText="Approving..."
                                                                className="flex items-center gap-1"
                                                            >
                                                                <CheckCircle className="h-3 w-3" />
                                                                Approve
                                                            </LoadingButton>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {documents.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No KYC documents found matching your criteria.
                            </div>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
};
