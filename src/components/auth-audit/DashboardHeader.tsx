import { Badge } from '@/components/ui/badge';
import { RefreshCw, Shield } from 'lucide-react';
import React from 'react';
import { AuthMetrics } from './types';

interface DashboardHeaderProps {
  timeRange: number;
  selectedEventType: string;
  setTimeRange: (value: number) => void;
  setSelectedEventType: (value: string) => void;
  fetchAuditEvents: () => void;
  metrics: AuthMetrics;
  getRiskColor: (level: string) => string;
  getRiskIcon: (level: string) => React.ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  timeRange,
  selectedEventType,
  setTimeRange,
  setSelectedEventType,
  fetchAuditEvents,
  metrics,
  getRiskColor,
  getRiskIcon,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold flex items-center space-x-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <span>Authentication Audit</span>
        </h1>
        <Badge
          variant="outline"
          className={`flex items-center space-x-1 ${getRiskColor(
            metrics.riskLevel
          )}`}
        >
          {getRiskIcon(metrics.riskLevel)}
          <span>Risk Level: {metrics.riskLevel.toUpperCase()}</span>
        </Badge>
      </div>

      <div className="flex items-center space-x-2">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={1}>Last 1 hour</option>
          <option value={6}>Last 6 hours</option>
          <option value={24}>Last 24 hours</option>
          <option value={168}>Last 7 days</option>
          <option value={720}>Last 30 days</option>
        </select>
        <select
          value={selectedEventType}
          onChange={(e) => setSelectedEventType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Events</option>
          <option value="AUTH_LOGIN_SUCCESS">Successful Logins</option>
          <option value="AUTH_LOGIN_FAILED">Failed Logins</option>
          <option value="AUTH_SUSPICIOUS_ACTIVITY">Suspicious Activity</option>
          <option value="AUTH_SESSION_TIMEOUT">Session Timeouts</option>
          <option value="AUTH_MULTIPLE_SESSIONS">Multiple Sessions</option>
        </select>
        <button
          onClick={fetchAuditEvents}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
};
