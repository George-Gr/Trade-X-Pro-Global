import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CSPViolationReport } from '@/lib/cspViolationMonitor';
import { Clock, LineChart } from 'lucide-react';
import React from 'react';

interface RecentViolationsCardProps {
  violations: CSPViolationReport['violations'];
}

export const RecentViolationsCard: React.FC<RecentViolationsCardProps> = ({
  violations,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <LineChart className="h-5 w-5" />
          <span>Recent Violations</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {violations.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {violations.slice(0, 20).map((violation) => (
              <div
                key={violation.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        violation.severity === 'critical'
                          ? 'destructive'
                          : 'default'
                      }
                    >
                      {violation.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{violation.category}</Badge>
                    <span className="text-sm font-medium">
                      {violation.violatedDirective}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Blocked: {violation.blockedUri}
                  </div>
                  <div className="text-xs text-gray-500">
                    {violation.clientIP} •{' '}
                    {new Date(violation.timestamp).toLocaleString()}
                  </div>
                </div>
                {violation.scriptSample && (
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded max-w-xs">
                    {violation.scriptSample.substring(0, 100)}...
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p>No violations detected in the selected time range</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
