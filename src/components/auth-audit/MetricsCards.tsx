import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertTriangle, LogIn, Users } from 'lucide-react';
import React from 'react';
import { AuthMetrics } from './types';

interface MetricsCardsProps {
  metrics: AuthMetrics;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalEvents}</div>
          <p className="text-xs text-muted-foreground">Authentication events</p>
        </CardContent>
      </Card>

      {/* Critical Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-600">
            Critical Events
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {metrics.criticalEvents}
          </div>
          <p className="text-xs text-muted-foreground">
            Require immediate attention
          </p>
        </CardContent>
      </Card>

      {/* Login Success Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Login Success Rate
          </CardTitle>
          <LogIn className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.loginAttempts > 0
              ? Math.round(
                  (metrics.successfulLogins / metrics.loginAttempts) * 100
                )
              : 0}
            %
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.successfulLogins} successful / {metrics.loginAttempts}{' '}
            attempts
          </p>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeSessions}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.uniqueUsers} unique users
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
