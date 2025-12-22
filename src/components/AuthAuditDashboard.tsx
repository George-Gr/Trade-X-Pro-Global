/**
 * Authentication Audit Dashboard
 *
 * This component provides a real-time dashboard for monitoring authentication events,
 * security incidents, and user activity patterns. It integrates with the auth audit logger
 * to provide comprehensive security monitoring for the trading platform.
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { AuditEvent, AuditEventType } from '@/lib/authAuditLogger';
import {
  Activity,
  AlertTriangle,
  Clock,
  Eye,
  LogIn,
  LogOut,
  MapPin,
  RefreshCw,
  Shield,
  Users,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { DashboardHeader } from './auth-audit/DashboardHeader';
import { EventTimeline } from './auth-audit/EventTimeline';
import { EventTypeDistribution } from './auth-audit/EventTypeDistribution';
import { MetricsCards } from './auth-audit/MetricsCards';
import { SeverityDistribution } from './auth-audit/SeverityDistribution';
import { AuthMetrics } from './auth-audit/types';

interface AuthAuditDashboardProps {
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

export const AuthAuditDashboard: React.FC<AuthAuditDashboardProps> = ({
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
}) => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(24); // hours
  const [selectedEventType, setSelectedEventType] = useState<string>('all');

  // Fetch audit events from Supabase `admin_audit_log` table
  const fetchAuditEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        // handle error appropriately
        throw error;
      }
      const accessToken = session?.access_token;

      const headers: Record<string, string> = {};
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

      const res = await fetch(`/api/admin/audit-logs?limit=200`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      const payload = await res.json();
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || 'Failed to fetch audit logs');
      }

      setEvents(payload.events || []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  // Initialize fetch + realtime subscription on mount and optional polling when `autoRefresh` is enabled
  React.useEffect(() => {
    // Initial load
    fetchAuditEvents();

    // Polling when autoRefresh is enabled
    let pollId: number | undefined;
    if (autoRefresh) {
      pollId = window.setInterval(() => {
        fetchAuditEvents();
      }, refreshInterval);
    }

    return () => {
      if (pollId) clearInterval(pollId);
    };
  }, [autoRefresh, refreshInterval]);

  // Filter events based on time range and type (use state `events`)
  const filteredEvents = useMemo(() => {
    const cutoffTime = Date.now() - timeRange * 60 * 60 * 1000;

    return events.filter((event) => {
      const eventTime = new Date(event.timestamp).getTime();
      const timeFilter = eventTime > cutoffTime;
      const typeFilter =
        selectedEventType === 'all' || event.eventType === selectedEventType;

      return timeFilter && typeFilter;
    });
  }, [events, timeRange, selectedEventType]);

  // Calculate metrics
  const metrics = useMemo((): AuthMetrics => {
    const totalEvents = filteredEvents.length;
    const criticalEvents = filteredEvents.filter(
      (e) => e.severity === 'critical'
    ).length;
    const warningEvents = filteredEvents.filter(
      (e) => e.severity === 'warning'
    ).length;
    const loginAttempts = filteredEvents.filter(
      (e) =>
        e.eventType === 'AUTH_LOGIN_SUCCESS' ||
        e.eventType === 'AUTH_LOGIN_FAILED'
    ).length;
    const successfulLogins = filteredEvents.filter(
      (e) => e.eventType === 'AUTH_LOGIN_SUCCESS'
    ).length;
    const failedLogins = filteredEvents.filter(
      (e) => e.eventType === 'AUTH_LOGIN_FAILED'
    ).length;

    // Mock active sessions and unique users
    const uniqueUsers = new Set(filteredEvents.map((e) => e.userId)).size;
    const activeSessions = Math.floor(uniqueUsers * 1.5); // Mock calculation

    const riskLevel = calculateRiskLevel(filteredEvents);

    return {
      totalEvents,
      criticalEvents,
      warningEvents,
      loginAttempts,
      successfulLogins,
      failedLogins,
      activeSessions,
      uniqueUsers,
      riskLevel,
    };
  }, [filteredEvents]);

  // Calculate risk level
  function calculateRiskLevel(
    events: AuditEvent[]
  ): 'low' | 'medium' | 'high' | 'critical' {
    const critical = events.filter((e) => e.severity === 'critical').length;
    const warning = events.filter((e) => e.severity === 'warning').length;
    const suspicious = events.filter(
      (e) => e.eventType === 'AUTH_SUSPICIOUS_ACTIVITY'
    ).length;
    const geoAnomalies = events.filter(
      (e) => e.eventType === 'AUTH_GEOLOCATION_ANOMALY'
    ).length;
    const failedLogins = events.filter(
      (e) => e.eventType === 'AUTH_LOGIN_FAILED'
    ).length;

    if (critical > 0 || suspicious > 0 || geoAnomalies > 0) return 'critical';
    if (warning > 5 || failedLogins > 10) return 'high';
    if (warning > 0 || failedLogins > 5) return 'medium';
    return 'low';
  }

  // Get risk level color
  const getRiskColor = (level: string): string => {
    switch (level) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get risk level icon
  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5" />;
      case 'medium':
        return <Eye className="h-5 w-5" />;
      case 'low':
        return <Shield className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  // Get event type icon
  const getEventTypeIcon = (eventType: AuditEventType) => {
    switch (eventType) {
      case 'AUTH_LOGIN_SUCCESS':
        return <LogIn className="h-4 w-4" />;
      case 'AUTH_LOGIN_FAILED':
        return <LogOut className="h-4 w-4" />;
      case 'AUTH_LOGOUT':
        return <LogOut className="h-4 w-4" />;
      case 'AUTH_SUSPICIOUS_ACTIVITY':
        return <AlertTriangle className="h-4 w-4" />;
      case 'AUTH_SESSION_TIMEOUT':
        return <Clock className="h-4 w-4" />;
      case 'AUTH_MULTIPLE_SESSIONS':
        return <Users className="h-4 w-4" />;
      case 'AUTH_GEOLOCATION_ANOMALY':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-orange-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading authentication audit data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        timeRange={timeRange}
        selectedEventType={selectedEventType}
        setTimeRange={setTimeRange}
        setSelectedEventType={setSelectedEventType}
        fetchAuditEvents={fetchAuditEvents}
        metrics={metrics}
        getRiskColor={getRiskColor}
        getRiskIcon={getRiskIcon}
      />

      <MetricsCards metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SeverityDistribution metrics={metrics} />
        <EventTypeDistribution
          filteredEvents={filteredEvents}
          getEventTypeIcon={getEventTypeIcon}
        />
      </div>

      <EventTimeline
        filteredEvents={filteredEvents}
        getEventTypeIcon={getEventTypeIcon}
        getSeverityColor={getSeverityColor}
      />
    </div>
  );
};

export default AuthAuditDashboard;
