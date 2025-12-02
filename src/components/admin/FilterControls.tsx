import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';

interface FilterControlsProps {
    searchTerm: string;
    severityFilter: string;
    statusFilter: string;
    typeFilter: string;
    isLoading: boolean;
    onSearchChange: (value: string) => void;
    onSeverityChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onTypeChange: (value: string) => void;
    onRefresh: () => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
    searchTerm,
    severityFilter,
    statusFilter,
    typeFilter,
    isLoading,
    onSearchChange,
    onSeverityChange,
    onStatusChange,
    onTypeChange,
    onRefresh,
}) => (
    <div className="flex gap-2">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
            />
        </div>
        <select
            value={severityFilter}
            onChange={(e) => onSeverityChange(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
        >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
        </select>
        <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
        >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="monitored">Monitored</option>
        </select>
        <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
        >
            <option value="all">All Types</option>
            <option value="margin_call">Margin Call</option>
            <option value="liquidation_risk">Liquidation Risk</option>
            <option value="suspicious_activity">Suspicious Activity</option>
            <option value="system_error">System Error</option>
            <option value="compliance_violation">Compliance Violation</option>
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
);