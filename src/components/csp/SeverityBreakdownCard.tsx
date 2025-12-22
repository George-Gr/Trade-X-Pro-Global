import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3 } from 'lucide-react';
import React from 'react';

interface SeverityBreakdownCardProps {
  metrics: {
    totalViolations: number;
    criticalViolations: number;
    highViolations: number;
    mediumViolations: number;
    lowViolations: number;
  };
}

export const SeverityBreakdownCard: React.FC<SeverityBreakdownCardProps> = ({
  metrics,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Violation Severity</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          {
            label: 'Critical',
            value: metrics.criticalViolations,
            color: 'bg-red-500',
          },
          {
            label: 'High',
            value: metrics.highViolations,
            color: 'bg-orange-500',
          },
          {
            label: 'Medium',
            value: metrics.mediumViolations,
            color: 'bg-yellow-500',
          },
          {
            label: 'Low',
            value: metrics.lowViolations,
            color: 'bg-green-500',
          },
        ].map((severity) => (
          <div key={severity.label} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{severity.label}</span>
              <span className="font-medium">{severity.value}</span>
            </div>
            <Progress
              value={
                metrics.totalViolations > 0
                  ? (severity.value / metrics.totalViolations) * 100
                  : 0
              }
              className={severity.color}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
