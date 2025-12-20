import { Card } from '@/components/ui/card';
import { AlertTriangle, Clock, TrendingDown, Zap } from 'lucide-react';

interface RiskMetrics {
  totalEvents: number;
  criticalEvents: number;
  activeEvents: number;
  highRiskPositions: number;
}

interface RiskMetricsCardsProps {
  metrics: RiskMetrics;
}

export function RiskMetricsCards({ metrics }: RiskMetricsCardsProps) {
  return (
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
            <p className="text-xs text-muted-foreground">High Risk Positions</p>
            <p className="text-2xl font-bold text-red-500">
              {metrics.highRiskPositions}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
