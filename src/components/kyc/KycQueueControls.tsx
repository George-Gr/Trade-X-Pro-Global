import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

export type FilterStatus = 'all' | 'pending' | 'submitted' | 'approved' | 'rejected' | 'manual_review';

interface KycQueueControlsProps {
    searchTerm: string;
    filterStatus: FilterStatus;
    stats: {
        pending: number;
        approved: number;
        rejected: number;
        manual_review: number;
    };
    loadingRequests: boolean;
    totalRequests: number;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: FilterStatus) => void;
    onRefresh: () => void;
}

export const KycQueueControls: React.FC<KycQueueControlsProps> = ({
    searchTerm,
    filterStatus,
    stats,
    loadingRequests,
    totalRequests,
    onSearchChange,
    onStatusChange,
    onRefresh,
}) => {
    return (
        <div className="space-y-4">
            {/* Search */}
            <Input
                placeholder="Search by email, name, or request ID..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
            />

            {/* Status Filter Tabs */}
            <Tabs value={filterStatus} onValueChange={(v) => onStatusChange(v as FilterStatus)}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">All ({totalRequests})</TabsTrigger>
                    <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                    <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
                    <TabsTrigger value="manual_review">Manual ({stats.manual_review})</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Refresh Button */}
            <Button onClick={onRefresh} disabled={loadingRequests} variant="outline" className="w-full">
                {loadingRequests ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Refreshing...
                    </>
                ) : (
                    'Refresh Queue'
                )}
            </Button>
        </div>
    );
};
