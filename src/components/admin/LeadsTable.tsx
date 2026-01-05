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
import {
  getExperienceLabel,
  getFinancialLabel,
  getStatusColor,
} from '@/lib/leadUtils';
import { cn } from '@/lib/utils';
import { DollarSign, Eye, Loader2, Search } from 'lucide-react';
import type { FC } from 'react';

interface Lead {
  id: string;
  user_id: string;
  lead_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  trading_experience: string;
  occupation: string;
  financial_capability: string;
  reason_for_joining: string;
  trading_goals: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface LeadsTableProps {
  leads: Lead[];
  filteredLeads: Lead[];
  isLoading: boolean;
  searchTerm: string;
  statusFilter: string;
  onSearchTermChange: (term: string) => void;
  onStatusFilterChange: (status: string) => void;
  onOpenDetails: (lead: Lead) => void;
  onOpenFundDialog: (userId: string) => void;
}

/**
 * LeadsTable component displays a filterable table of leads with search and status filtering.
 * Supports viewing lead details and funding user accounts through action buttons.
 *
 * @param props - Component props
 * @param props.leads - Complete array of all leads
 * @param props.filteredLeads - Filtered array of leads based on search/status
 * @param props.isLoading - Loading state indicator
 * @param props.searchTerm - Current search term
 * @param props.statusFilter - Current status filter value
 * @param props.onSearchTermChange - Callback for search term changes
 * @param props.onStatusFilterChange - Callback for status filter changes
 * @param props.onOpenDetails - Callback to open lead details
 * @param props.onOpenFundDialog - Callback to open fund dialog for a user
 */
const LeadsTable: FC<LeadsTableProps> = ({
  leads,
  filteredLeads,
  isLoading,
  searchTerm,
  statusFilter,
  onSearchTermChange,
  onStatusFilterChange,
  onOpenDetails,
  onOpenFundDialog,
}) => {
  return (
    <Card>
      <div className="p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by lead number, name or email..."
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4">
          <span className="text-sm text-muted-foreground">
            Showing {filteredLeads.length} of {leads.length} leads
          </span>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead #</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm font-medium text-primary">
                        {lead.lead_number}
                      </TableCell>
                      <TableCell className="font-medium">
                        {lead.first_name} {lead.last_name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {lead.email}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getExperienceLabel(lead.trading_experience)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getFinancialLabel(lead.financial_capability)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          <span
                            className={cn(
                              'inline-block w-2 h-2 rounded-full mr-2',
                              getStatusColor(lead.status)
                            )}
                          />
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onOpenDetails(lead)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onOpenFundDialog(lead.user_id)}
                            className="flex items-center gap-1"
                          >
                            <DollarSign className="h-3 w-3" />
                            Fund
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredLeads.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No leads found matching your criteria.
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default LeadsTable;
