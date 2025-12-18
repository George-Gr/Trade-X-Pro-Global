import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseBrowserClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  Shield,
  TrendingDown,
  DollarSign,
  Users,
  Eye,
  Loader2,
  Search,
  Filter,
  Clock,
  Flag,
  Zap,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import type { Json } from "@/integrations/supabase/types";

interface RiskEvent {
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

interface Position {
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
      const [riskEventsResponse, positionsResponse, marginCallsResponse] =
        await Promise.all([
          supabase
            .from("risk_events")
            .select(
              `
            *,
            profiles:user_id (
              full_name,
              email
            )
          `,
            )
            .order("created_at", { ascending: false }),
          supabase
            .from("positions")
            .select(
              `
            *,
            profiles:user_id (
              full_name,
              email
            )
          `,
            )
            .order("created_at", { ascending: false }),
          supabase
            .from("margin_call_events")
            .select(
              `
            *,
            profiles:user_id (
              full_name,
              email
            )
          `,
            )
            .eq("status", "pending")
            .order("triggered_at", { ascending: false }),
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
    if (!resolutionDialog.eventId || !resolutionDialog.resolution.trim())
      return;

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
      severityFilter === "all" || event.severity === severityFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (event.resolved ? "resolved" : "active") === statusFilter;
    const matchesType = typeFilter === "all" || event.event_type === typeFilter;

    return matchesSearch && matchesSeverity && matchesStatus && matchesType;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-500";
      case "resolved":
        return "bg-green-500";
      case "monitored":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRiskTypeIcon = (type: string) => {
    switch (type) {
      case "margin_call":
        return <AlertTriangle className="h-4 w-4" />;
      case "liquidation_risk":
        return <TrendingDown className="h-4 w-4" />;
      case "suspicious_activity":
        return <Flag className="h-4 w-4" />;
      case "system_error":
        return <Zap className="h-4 w-4" />;
      case "compliance_violation":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const calculateRiskMetrics = () => {
    const totalEvents = riskEvents.length;
    const criticalEvents = riskEvents.filter(
      (e) => e.severity === "critical",
    ).length;
    const activeEvents = riskEvents.filter((e) => !e.resolved).length;
    const highRiskPositions = positions.filter((p) => {
      const marginLevel = (p.current_price / p.entry_price) * 100;
      return marginLevel < 50; // High risk threshold
    }).length;

    return { totalEvents, criticalEvents, activeEvents, highRiskPositions };
  };

  const metrics = calculateRiskMetrics();

  return (
    <div className="space-y-6">
      {/* Risk Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Risk Events</p>
              <p className="text-2xl font-bold">{metrics.totalEvents}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-red-500/10 rounded-lg flex items-center justify-center">
              <Zap className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Critical Events</p>
              <p className="text-2xl font-bold text-red-500">
                {metrics.criticalEvents}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Risks</p>
              <p className="text-2xl font-bold text-yellow-500">
                {metrics.activeEvents}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-red-500/10 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                High Risk Positions
              </p>
              <p className="text-2xl font-bold text-red-500">
                {metrics.highRiskPositions}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Margin Calls */}
      {marginCalls.length > 0 && (
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
                onClick={fetchData}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
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
                    <TableHead className="text-right">
                      Required Margin
                    </TableHead>
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
                        <Badge
                          variant={
                            call.margin_level < 30 ? "destructive" : "outline"
                          }
                        >
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
                            logger.addBreadcrumb(
                              "risk_action",
                              `Viewing margin call for user ${call.user_id}`,
                            );
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
      )}

      {/* Risk Events */}
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
                <option value="compliance_violation">
                  Compliance Violation
                </option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
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
                            {event.event_type.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {event.profiles.full_name || event.profiles.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            <span
                              className={`inline-block w-2 h-2 rounded-full mr-2 ${getSeverityColor(event.severity)}`}
                            />
                            {event.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            <span
                              className={`inline-block w-2 h-2 rounded-full mr-2 ${event.resolved ? "bg-green-500" : "bg-red-500"}`}
                            />
                            {event.resolved ? "Resolved" : "Active"}
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
                                    resolution: "",
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

      {/* Event Detail Dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedEvent && getRiskTypeIcon(selectedEvent.event_type)}
              Risk Event Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about the selected risk event.
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>User</Label>
                  <p className="text-sm font-medium">
                    {selectedEvent.profiles.full_name ||
                      selectedEvent.profiles.email}
                  </p>
                </div>
                <div>
                  <Label>Event Type</Label>
                  <p className="text-sm font-medium capitalize">
                    {selectedEvent.event_type.replace(/_/g, " ")}
                  </p>
                </div>
              </div>

              <div>
                <Label>Severity</Label>
                <Badge variant="outline">
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-2 ${getSeverityColor(selectedEvent.severity)}`}
                  />
                  {selectedEvent.severity}
                </Badge>
              </div>

              <div>
                <Label>Description</Label>
                <p className="text-sm">{selectedEvent.description}</p>
              </div>

              <div>
                <Label>Metadata</Label>
                <pre className="text-sm bg-muted p-3 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(selectedEvent.details, null, 2)}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Created</Label>
                  <p className="text-sm">
                    {new Date(selectedEvent.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant="outline">
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2 ${selectedEvent.resolved ? "bg-green-500" : "bg-red-500"}`}
                    />
                    {selectedEvent.resolved ? "Resolved" : "Active"}
                  </Badge>
                </div>
              </div>

              {selectedEvent.resolved_at && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Resolved At</Label>
                    <p className="text-sm">
                      {new Date(selectedEvent.resolved_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label>Resolved By</Label>
                    <p className="text-sm">
                      {selectedEvent.resolved_by || "Unknown"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resolution Dialog */}
      <Dialog
        open={resolutionDialog.open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setResolutionDialog({ open: false, eventId: null, resolution: "" });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Risk Event</DialogTitle>
            <DialogDescription>
              Mark this risk event as resolved and provide details about the
              resolution.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resolution">Resolution Details</Label>
              <Textarea
                id="resolution"
                placeholder="Describe how this risk event was resolved..."
                value={resolutionDialog.resolution}
                onChange={(e) =>
                  setResolutionDialog((prev) => ({
                    ...prev,
                    resolution: e.target.value,
                  }))
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setResolutionDialog({
                  open: false,
                  eventId: null,
                  resolution: "",
                })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolveEvent}
              disabled={!resolutionDialog.resolution.trim()}
            >
              Mark as Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RiskPanel;
