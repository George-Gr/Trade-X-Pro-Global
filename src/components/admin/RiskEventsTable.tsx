import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Loader2, RefreshCw, Search, Shield } from 'lucide-react';

interface RiskEvent {
  id: string;
  user_id: string;
  event_type: string;
  severity: string;
  description: string;
  details: Record<string, unknown> | null;
  created_at: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string | null;
  profiles: {
    full_name: string | null;
    email: string;
  };
}

interface RiskEventsTableProps {
  riskEvents: RiskEvent[];
  filteredEvents: RiskEvent[];
  searchTerm: string;
  severityFilter: string;
  statusFilter: string;
  typeFilter: string;
  isLoading: boolean;
  fetchData: () => void;
  handleViewEvent: (event: RiskEvent) => void;
  setResolutionDialog: (dialog: {
    open: boolean;
    eventId: string;
    resolution: string;
  }) => void;
  setSearchTerm: (term: string) => void;
  setSeverityFilter: (filter: string) => void;
  setStatusFilter: (filter: string) => void;
  setTypeFilter: (filter: string) => void;
  getRiskTypeIcon: (type: string) => React.ReactNode;
  getSeverityColor: (severity: string) => string;
}

export function RiskEventsTable({
  riskEvents,
  filteredEvents,
  searchTerm,
  severityFilter,
  statusFilter,
  typeFilter,
  isLoading,
  fetchData,
  handleViewEvent,
  setResolutionDialog,
  setSearchTerm,
  setSeverityFilter,
  setStatusFilter,
  setTypeFilter,
  getRiskTypeIcon,
  getSeverityColor,
}: RiskEventsTableProps) {
  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Risk Events</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
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
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
              <option value="monitored">Monitored</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
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
              onClick={fetchData}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <span className="text-sm text-muted-foreground">
                Showing {filteredEvents.length} of {riskEvents.length} risk
                events
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
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 capitalize"
                        >
                          {getRiskTypeIcon(event.event_type)}
                          {event.event_type.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {event.profiles.full_name || event.profiles.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <span
                            className={`inline-block w-2 h-2 rounded-full mr-2 ${getSeverityColor(
                              event.severity
                            )}`}
                          />
                          {event.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <span
                            className={`inline-block w-2 h-2 rounded-full mr-2 ${
                              event.resolved ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          />
                          {event.resolved ? 'Resolved' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="max-w-xs truncate"
                        title={event.description}
                      >
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
                            onClick={() => handleViewEvent(event)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          {!event.resolved && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setResolutionDialog({
                                  open: true,
                                  eventId: event.id,
                                  resolution: '',
                                })
                              }
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

            {filteredEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No risk events found matching your criteria.
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
