import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Eye, RefreshCw } from 'lucide-react';
import type { MarginCall } from './RiskPanel';

interface MarginCallsTableProps {
    marginCalls: MarginCall[];
    isLoading: boolean;
    onRefresh: () => void;
}

export const MarginCallsTable: React.FC<MarginCallsTableProps> = ({
    marginCalls,
    isLoading,
    onRefresh,
}) => {
    if (marginCalls.length === 0) return null;

    return (
        <Card>
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Active Margin Calls ({marginCalls.length})
                    </h3>
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

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead className="text-right">Margin Level</TableHead>
                                <TableHead className="text-right">Current Equity</TableHead>
                                <TableHead className="text-right">Required Margin</TableHead>
                                <TableHead>Call Time</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {marginCalls.map((call) => (
                                <TableRow key={call.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">
                                        {call.profiles.full_name || call.profiles.email}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        <Badge variant={call.margin_level < 30 ? "destructive" : "outline"}>
                                            {call.margin_level.toFixed(2)}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                        ${call.account_equity.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                        ${call.margin_used.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {new Date(call.triggered_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                // Navigate to user's account management
                                                console.log('Viewing margin call for user', call.user_id);
                                            }}
                                            className="flex items-center gap-1"
                                        >
                                            <Eye className="h-3 w-3" />
                                            Review
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </Card>
    );
};