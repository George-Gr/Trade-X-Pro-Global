import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import type { Json } from '@/integrations/supabase/types';
import { RiskMetrics } from './RiskMetrics';
import { MarginCallsTable } from './MarginCallsTable';
import { RiskEventsTable } from './RiskEventsTable';
import { FilterControls } from './FilterControls';
import { EventDetailDialog } from './EventDetailDialog';
import { ResolutionDialog } from './ResolutionDialog';
import { AlertTriangle, TrendingDown, Flag, Zap, AlertCircle, Shield } from 'lucide-react';

export interface RiskEvent {
  id: string;
  user_id: string;
  event_type: string;
  severity: string;
  description: string;
  details: Json | null;
  created_at: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string | null;
  profiles: {
    full_name: string | null;
    email: string;
  };
}

export interface Position {
  id: string;
  user_id: string;
  symbol: string;
  quantity: number;
  entry_price: number;
  current_price: number;
  leverage: number;
  margin_used: number;
  opened_at: string;
  closed_at?: string;
  profiles: {
    full_name: string | null;
    email: string;
  };
}

export interface MarginCall {
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
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

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
    resolution: "",
  });

  const fetchData = useCallback(async () => {
    if (!isAdmin) return;

    try {
      setIsLoading(true);

      // Fetch risk events
      const [riskEventsResponse, positionsResponse, marginCallsResponse] = await Promise.all([
        supabase
          .from("risk_events")
          .select(`
            *,
            profiles:user_id (
              full_name,
              email
            )
          `)
          .order("created_at", { ascending: false }),
        supabase
          .from("positions")
          .select(`
            *,
            profiles:user_id (
              full_name,
              email
            )
          `)
          .order("created_at", { ascending: false }),
        supabase
          .from("margin_call_events")
          .select(`
            *,
            profiles:user_id (
              full_name,
              email
            )
          `)
          .eq("status", "pending")
          .order("triggered_at", { ascending: false })
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
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const handleResolveEvent = async () => {
    if (!resolutionDialog.eventId || !resolutionDialog.resolution.trim()) return;

    try {
      const { error } = await supabase
        .from("risk_events")
        .update({
          resolved: true,
          details: {
            resolution: resolutionDialog.resolution,
            resolved_at: new Date().toISOString(),
            resolved_by: user?.id,
          },
        })
        .eq("id", resolutionDialog.eventId);

      if (error) throw error;

      toast({
        title: "Risk Event Resolved",
        description: "The risk event has been marked as resolved",
      });

      setResolutionDialog({ open: false, eventId: null, resolution: "" });
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleViewEvent = (event: RiskEvent) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };

  const filteredEvents = riskEvents.filter(event => {
    const matchesSearch = event.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.profiles.full_name && event.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      event.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === "all" || event.severity === severityFilter;
    const matchesStatus = statusFilter === "all" || (event.resolved ? "resolved" : "active") === statusFilter;
    const matchesType = typeFilter === "all" || event.event_type === typeFilter;

    return matchesSearch && matchesSeverity && matchesStatus && matchesType;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-500';
      case 'resolved': return 'bg-green-500';
      case 'monitored': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskTypeIcon = (type: string) => {
    switch (type) {
      case 'margin_call': return <AlertTriangle className="h-4 w-4" />;
      case 'liquidation_risk': return <TrendingDown className="h-4 w-4" />;
      case 'suspicious_activity': return <Flag className="h-4 w-4" />;
      case 'system_error': return <Zap className="h-4 w-4" />;
      case 'compliance_violation': return <AlertCircle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const calculateRiskMetrics = () => {
    const totalEvents = riskEvents.length;
    const criticalEvents = riskEvents.filter(e => e.severity === 'critical').length;
    const activeEvents = riskEvents.filter(e => !e.resolved).length;
    const highRiskPositions = positions.filter(p => {
      const marginLevel = (p.current_price / p.entry_price) * 100;
      return marginLevel < 50; // High risk threshold
    }).length;

    return { totalEvents, criticalEvents, activeEvents, highRiskPositions };
  };

  const metrics = calculateRiskMetrics();

  return (
    <div className="space-y-6">
      {/* Risk Metrics */}
      <RiskMetrics
        totalEvents={metrics.totalEvents}
        criticalEvents={metrics.criticalEvents}
        activeEvents={metrics.activeEvents}
        highRiskPositions={metrics.highRiskPositions}
      />

      {/* Active Margin Calls */}
      <MarginCallsTable
        marginCalls={marginCalls}
        isLoading={isLoading}
        onRefresh={fetchData}
      />

      {/* Filter Controls */}
      <FilterControls
        searchTerm={searchTerm}
        severityFilter={severityFilter}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        isLoading={isLoading}
        onSearchChange={setSearchTerm}
        onSeverityChange={setSeverityFilter}
        onStatusChange={setStatusFilter}
        onTypeChange={setTypeFilter}
        onRefresh={fetchData}
      />

      {/* Risk Events Table */}
      <RiskEventsTable
        events={filteredEvents}
        isLoading={isLoading}
        onRefresh={fetchData}
        onViewEvent={handleViewEvent}
        onResolveEvent={(event) => setResolutionDialog({
          open: true,
          eventId: event.id,
          resolution: ""
        })}
      />

      {/* Event Detail Dialog */}
      <EventDetailDialog
        open={eventDialogOpen}
        onOpenChange={setEventDialogOpen}
        event={selectedEvent}
      />

      {/* Resolution Dialog */}
      <ResolutionDialog
        open={resolutionDialog.open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setResolutionDialog({ open: false, eventId: null, resolution: "" });
          }
        }}
        resolution={resolutionDialog.resolution}
        onResolutionChange={(value) => setResolutionDialog(prev => ({ ...prev, resolution: value }))}
        onResolve={handleResolveEvent}
        disabled={!resolutionDialog.resolution.trim()}
      />
    </div>
  );
};

export default RiskPanel;
