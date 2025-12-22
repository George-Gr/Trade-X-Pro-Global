import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3 } from 'lucide-react';
import React from 'react';
import { AuthMetrics } from './types';

const SEVERITY_CONFIG = [
  {
    label: 'Critical',
    color: 'bg-red-500',
    key: 'critical',
  },
  {
    label: 'Warning',
    color: 'bg-orange-500',
    key: 'warning',
  },
  {
    label: 'Info',
    color: 'bg-blue-500',
    key: 'info',
  },
] as const;

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
        {SEVERITY_CONFIG.map((config) => {
          let value: number;
          switch (config.key) {
            case 'critical':
              value = metrics.criticalEvents;
              break;
            case 'warning':
              value = metrics.warningEvents;
              break;
            case 'info':
              value =
                metrics.totalEvents -
                metrics.criticalEvents -
                metrics.warningEvents;
              break;
          }
          return (
            <div key={config.label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{config.label}</span>
                <span className="font-medium">{value}</span>
              </div>
              <Progress
                value={
                  metrics.totalEvents > 0
                    ? (value / metrics.totalEvents) * 100
                    : 0
                }
                indicatorClassName={config.color}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
