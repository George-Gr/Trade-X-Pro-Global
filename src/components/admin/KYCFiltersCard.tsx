import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw } from 'lucide-react';

interface KYCFiltersCardProps {
    searchTerm: string;
    statusFilter: string;
    documentTypeFilter: string;
    isLoading: boolean;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onDocumentTypeChange: (value: string) => void;
    onRefresh: () => void;
}

export const KYCFiltersCard: React.FC<KYCFiltersCardProps> = ({
    searchTerm,
    statusFilter,
    documentTypeFilter,
    isLoading,
    onSearchChange,
    onStatusChange,
    onDocumentTypeChange,
    onRefresh,
}) => {
    return (
        <Card>
            <div className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search documents..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => onStatusChange(e.target.value)}
                            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <select
                            value={documentTypeFilter}
                            onChange={(e) => onDocumentTypeChange(e.target.value)}
                            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                        >
                            <option value="all">All Types</option>
                            <option value="identity_card">Identity Card</option>
                            <option value="passport">Passport</option>
                            <option value="utility_bill">Utility Bill</option>
                            <option value="driver_license">Driver's License</option>
                        </select>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefresh}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};
