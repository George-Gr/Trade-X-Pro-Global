import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import {
  AlertCircle,
  AlertTriangle,
  Flag,
  Shield,
  TrendingDown,
  Zap,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { EventDetailDialog } from './EventDetailDialog';
import { MarginCallsTable } from './MarginCallsTable';
import { ResolutionDialog } from './ResolutionDialog';
import { RiskEventsTable } from './RiskEventsTable';
import { RiskMetricsCards } from './RiskMetricsCards';

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

interface Position {
  id: string;
  user_id: string;
  closed_at: string | null;
  current_price: number | null;
  entry_price: number;
  highest_price: number | null;
  lowest_price: number | null;
  margin_used: number;
  opened_at: string | null;
  quantity: number;
  realized_pnl: number | null;
  side: string;
  status: string | null;
  symbol: string;
  trailing_stop_distance: number | null;
  trailing_stop_enabled: boolean;
  trailing_stop_price: number | null;
  unrealized_pnl: number | null;
  profiles: {
    full_name: string | null;
    email: string;
  };
}

interface MarginCall {
  id: string;
  user_id: string;
  margin_level: number;
  account_equity: number;
  margin_used: number;
  triggered_at: string;
  status: string;
  profiles: {
    full_name: string | null;
    email: string;
  };
}

interface RiskPanelProps {
  refreshTrigger?: number;
}

const RiskPanel: React.FC<RiskPanelProps> = ({ refreshTrigger }) => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  // State
  const [riskEvents, setRiskEvents] = useState<RiskEvent[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [marginCalls, setMarginCalls] = useState<MarginCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Dialog states
  const [selectedEvent, setSelectedEvent] = useState<RiskEvent | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [resolutionDialog, setResolutionDialog] = useState<{
    open: boolean;
    eventId: string | null;
    resolution: string;
  }>({
    open: false,
    eventId: null,
    resolution: '',
  });

  const fetchData = useCallback(async () => {
    if (!isAdmin) return;

    try {
      setIsLoading(true);

      // Fetch risk events
      const [riskEventsResponse, positionsResponse, marginCallsResponse] =
        await Promise.all([
          supabase
            .from('risk_events')
            .select(
              `
            *,
            profiles:user_id (
              full_name,
              email
            )
          `
            )
            .order('created_at', { ascending: false }),
          supabase
            .from('positions')
            .select(
              `
            *,
            profiles:user_id (
              full_name,
              email
            )
          `
            )
            .order('created_at', { ascending: false }),
          supabase
            .from('margin_call_events')
            .select(
              `
            *,
            profiles:user_id (
              full_name,
              email
            )
          `
            )
            .eq('status', 'pending')
            .order('triggered_at', { ascending: false }),
        ]);

      if (riskEventsResponse.data && !riskEventsResponse.error) {
        setRiskEvents(riskEventsResponse.data as unknown as RiskEvent[]);
      }

      if (positionsResponse.data && !positionsResponse.error) {
        setPositions(positionsResponse.data as unknown as Position[]);
      }

      if (marginCallsResponse.data && !marginCallsResponse.error) {
        setMarginCalls(marginCallsResponse.data as unknown as MarginCall[]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const handleResolveEvent = async () => {
    if (!resolutionDialog.eventId || !resolutionDialog.resolution.trim())
      return;

    try {
      const { error } = await supabase
        .from('risk_events')
        .update({
          resolved: true,
          details: {
            resolution: resolutionDialog.resolution,
            resolved_at: new Date().toISOString(),
            resolved_by: user?.id,
          },
        })
        .eq('id', resolutionDialog.eventId);

      if (error) throw error;

      toast({
        title: 'Risk Event Resolved',
        description: 'The risk event has been marked as resolved',
      });

      setResolutionDialog({ open: false, eventId: null, resolution: '' });
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleViewEvent = (event: RiskEvent) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };

  const filteredEvents = riskEvents.filter((event) => {
    const matchesSearch =
      event.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.profiles.full_name &&
        event.profiles.full_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      event.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      severityFilter === 'all' || event.severity === severityFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (event.resolved ? 'resolved' : 'active') === statusFilter;
    const matchesType = typeFilter === 'all' || event.event_type === typeFilter;

    return matchesSearch && matchesSeverity && matchesStatus && matchesType;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRiskTypeIcon = (type: string) => {
    switch (type) {
      case 'margin_call':
        return <AlertTriangle className="h-4 w-4" />;
      case 'liquidation_risk':
        return <TrendingDown className="h-4 w-4" />;
      case 'suspicious_activity':
        return <Flag className="h-4 w-4" />;
      case 'system_error':
        return <Zap className="h-4 w-4" />;
      case 'compliance_violation':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const calculateRiskMetrics = () => {
    const totalEvents = riskEvents.length;
    const criticalEvents = riskEvents.filter(
      (e) => e.severity === 'critical'
    ).length;
    const activeEvents = riskEvents.filter((e) => !e.resolved).length;
    const highRiskPositions = positions.filter((p) => {
      if (!p.current_price) return false;
      const marginLevel = (p.current_price / p.entry_price) * 100;
      return marginLevel < 50; // High risk threshold
    }).length;

    return { totalEvents, criticalEvents, activeEvents, highRiskPositions };
  };

  const metrics = calculateRiskMetrics();

  return (
    <div className="space-y-6">
      {/* Risk Metrics */}
      <RiskMetricsCards metrics={metrics} />

      {/* Active Margin Calls */}
      {marginCalls.length > 0 && (
        <MarginCallsTable
          marginCalls={marginCalls}
          isLoading={isLoading}
          fetchData={fetchData}
          handleViewEvent={(call) => {
            // Navigate to user's account management
            logger.addBreadcrumb(
              'risk_action',
              `Viewing margin call for user ${call.user_id}`
            );
          }}
        />
      )}

      {/* Risk Events */}
      <RiskEventsTable
        riskEvents={riskEvents}
        filteredEvents={filteredEvents}
        searchTerm={searchTerm}
        severityFilter={severityFilter}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        isLoading={isLoading}
        fetchData={fetchData}
        handleViewEvent={handleViewEvent}
        setResolutionDialog={setResolutionDialog}
        setSearchTerm={setSearchTerm}
        setSeverityFilter={setSeverityFilter}
        setStatusFilter={setStatusFilter}
        setTypeFilter={setTypeFilter}
        getRiskTypeIcon={getRiskTypeIcon}
        getSeverityColor={getSeverityColor}
      />

      {/* Event Detail Dialog */}
      <EventDetailDialog
        selectedEvent={selectedEvent}
        eventDialogOpen={eventDialogOpen}
        setEventDialogOpen={setEventDialogOpen}
        getRiskTypeIcon={getRiskTypeIcon}
        getSeverityColor={getSeverityColor}
      />

      {/* Resolution Dialog */}
      <ResolutionDialog
        resolutionDialog={resolutionDialog}
        setResolutionDialog={setResolutionDialog}
        handleResolveEvent={handleResolveEvent}
      />
    </div>
  );
};

export default RiskPanel;
