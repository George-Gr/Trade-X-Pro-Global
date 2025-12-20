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

import type { Database } from '@/integrations/supabase/types';
type MarginCallEventWithProfiles =
  Database['public']['Tables']['margin_call_events']['Row'] & {
    profiles?: {
      email: string;
      full_name: string | null;
      equity: number;
      margin_used: number;
    };
  };

const AdminRiskDashboard = () => {
  const queryClient = useQueryClient();

  const { data: marginCalls } = useQuery({
    queryKey: ['admin-margin-calls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('margin_call_events')
        .select(`*, profiles(email, full_name, equity, margin_used)`)
        .in('status', ['pending', 'notified', 'escalated'])
        .order('triggered_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000,
  });

  const criticalCount =
    marginCalls?.filter(
      (mc) =>
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
