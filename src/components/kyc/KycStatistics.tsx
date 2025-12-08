import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KycStatisticsProps {
    pending: number;
    approved: number;
    rejected: number;
    manualReview: number;
}

export const KycStatistics: React.FC<KycStatisticsProps> = ({
    pending,
    approved,
    rejected,
    manualReview,
}) => {
    return (
        <div className="grid grid-cols-4 gap-4">
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{pending}</div>
                    <p className="text-xs text-muted-foreground mt-2">Awaiting decision</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-medium">Approved</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-profit">{approved}</div>
                    <p className="text-xs text-muted-foreground mt-2">Verified users</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-destructive">{rejected}</div>
                    <p className="text-xs text-muted-foreground mt-2">Resubmit allowed</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-medium">Manual Review</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-amber-500">{manualReview}</div>
                    <p className="text-xs text-muted-foreground mt-2">Escalated</p>
                </CardContent>
            </Card>
        </div>
    );
};
