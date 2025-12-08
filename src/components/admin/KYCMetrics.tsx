import * as React from 'react';
import { Card } from '@/components/ui/card';
import { FileCheck, Clock, CheckCircle, XCircle } from 'lucide-react';

interface KYCMetricsProps {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

export const KYCMetrics: React.FC<KYCMetricsProps> = ({
    total,
    pending,
    approved,
    rejected,
}) => {
    return (
        <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-4">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Total Submissions</p>
                        <p className="text-2xl font-bold">{total}</p>
                    </div>
                </div>
            </Card>

            <Card className="p-4">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Pending Review</p>
                        <p className="text-2xl font-bold text-yellow-500">{pending}</p>
                    </div>
                </div>
            </Card>

            <Card className="p-4">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Approved</p>
                        <p className="text-2xl font-bold text-green-500">{approved}</p>
                    </div>
                </div>
            </Card>

            <Card className="p-4">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                        <XCircle className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Rejected</p>
                        <p className="text-2xl font-bold text-red-500">{rejected}</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};
