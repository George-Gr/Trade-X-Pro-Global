import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3 } from 'lucide-react';
import React from 'react';
import { AuthMetrics } from './types';

interface SeverityDistributionProps {
  metrics: AuthMetrics;
}

export const SeverityDistribution: React.FC<SeverityDistributionProps> = ({
  metrics,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Event Severity</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          {
            label: 'Critical',
            value: metrics.criticalEvents,
            color: 'bg-red-500',
          },
          {
            label: 'Warning',
            value: metrics.warningEvents,
            color: 'bg-orange-500',
          },
          {
            label: 'Info',
            value:
              metrics.totalEvents -
              metrics.criticalEvents -
              metrics.warningEvents,
            color: 'bg-blue-500',
          },
        ].map((severity) => (
          <div key={severity.label} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{severity.label}</span>
              <span className="font-medium">{severity.value}</span>
            </div>
            <Progress
              value={(severity.value / metrics.totalEvents) * 100}
              indicatorClassName={severity.color}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
