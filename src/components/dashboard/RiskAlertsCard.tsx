import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

interface AlertItem {
  id: string;
  level: 'info' | 'warning' | 'critical';
  title: string;
  details?: string;
}

interface RiskAlertsCardProps {
  loading?: boolean;
  alerts?: AlertItem[];
}

const LevelBadge: React.FC<{ level: AlertItem['level'] }> = ({ level }) => {
  const map = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
  } as const;
  return (
    <span
      className={cn('px-2 py-1 rounded-full text-xs font-medium', map[level])}
    >
      {level}
    </span>
  );
};

export const RiskAlertsCard: React.FC<RiskAlertsCardProps> = ({
  loading = false,
  alerts = [],
}) => {
  if (loading) {
    return (
      <Card elevation="1" className="min-h-[160px]">
        <CardContent>
          <div className="flex items-start justify-between">
            <div className="w-3/4">
              <Skeleton variant="heading" />
              <SkeletonText lines={2} className="mt-2" />
            </div>
            <div className="w-1/4">
              <Skeleton variant="avatar" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Card elevation="1" className="min-h-[160px]">
        <CardHeader>
          <CardTitle>Risk Alerts</CardTitle>
          <CardDescription>
            Important margin and risk notifications will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No active risk alerts"
            description="When your account approaches critical thresholds (low margin, liquidation risk), alerts will appear here with recommended actions."
            variant="default"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation="1" className="min-h-[160px]">
      <CardHeader>
        <CardTitle>Risk Alerts</CardTitle>
        <CardDescription>Critical account notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {alerts.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <LevelBadge level={a.level} />
                  <div className="font-medium">{a.title}</div>
                </div>
                {a.details && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    {a.details}
                  </div>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {a.level === 'critical' ? 'Immediate' : 'Monitor'}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Only the most recent alerts are shown. View history for past alerts.
        </div>
      </CardFooter>
    </Card>
  );
};

export default RiskAlertsCard;
