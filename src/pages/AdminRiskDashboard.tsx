import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, AlertCircle, AlertTriangle } from 'lucide-react';
import { z } from 'zod';

// Zod validation schemas
const profileSchema = z.object({
  email: z.string(),
  full_name: z.string().nullable(),
  equity: z.number(),
  margin_used: z.number(),
});

const marginCallEventSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  margin_level: z.number(),
  severity: z.enum([
    'WARNING',
    'MARGIN_CALL',
    'CRITICAL',
    'LIQUIDATION_TRIGGER',
  ]),
  status: z.enum(['pending', 'notified', 'escalated', 'resolved']),
  triggered_at: z.string(),
  profiles: profileSchema.nullable(),
});

const marginCallEventsSchema = z.array(marginCallEventSchema);

type MarginCallEventWithProfiles = z.infer<typeof marginCallEventSchema>;

/**
 * Admin Risk Dashboard component for monitoring and managing user risk
 *
 * @component
 * @description Provides real-time monitoring of margin calls and risk events for admin users.
 * Displays active margin calls with severity levels, user information, and risk metrics.
 * Includes automatic data refresh every 10 seconds and manual refresh capability.
 *
 * @returns {JSX.Element} The rendered admin risk dashboard with margin call management interface
 *
 * @requiresRole admin - This component is restricted to admin users only
 * @sideEffects - Makes real-time queries to Supabase for margin call data
 * @context Uses React Query for data fetching and caching
 */
const AdminRiskDashboard = () => {
  const queryClient = useQueryClient();

  const { data: marginCalls } = useQuery<MarginCallEventWithProfiles[]>({
    queryKey: ['admin-margin-calls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('margin_call_events')
        .select(`*, profiles(email, full_name, equity, margin_used)`)
        .in('status', ['pending', 'notified', 'escalated'])
        .order('triggered_at', { ascending: false });
      if (error) throw error;

      // Validate and parse the returned data using Zod
      const parsedData = marginCallEventsSchema.parse(data);
      return parsedData;
    },
    refetchInterval: 10000,
  });

  const criticalCount =
    marginCalls?.filter(
      (mc: MarginCallEventWithProfiles) =>
        mc.severity === 'CRITICAL' || mc.severity === 'LIQUIDATION_TRIGGER'
    ).length || 0;

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Risk Management Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor and manage user risk
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries()}
          >
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-2 pb-4">
              <CardTitle className="text-sm font-medium">
                Total Margin Calls
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {marginCalls?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-2 pb-4">
              <CardTitle className="text-sm font-medium">
                Critical Status
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {criticalCount}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Margin Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Margin Level</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marginCalls?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      No active margin calls
                    </TableCell>
                  </TableRow>
                ) : (
                  marginCalls?.map((call: MarginCallEventWithProfiles) => (
                    <TableRow key={call.id}>
                      <TableCell>
                        <div className="font-medium">
                          {call.profiles?.full_name || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {Number(call.margin_level).toFixed(2)}%
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            call.severity === 'CRITICAL'
                              ? 'destructive'
                              : 'outline'
                          }
                        >
                          {call.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>{call.status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
};

export default AdminRiskDashboard;
