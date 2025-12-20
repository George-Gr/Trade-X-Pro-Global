import { Card } from '@/components/ui/card';
import type { PositionPnLDetails } from '@/lib/trading/pnlCalculation';
import type { Position } from '@/types/position';
import type { FC } from 'react';
import { useMemo } from 'react';

interface PositionsMetricsProps {
  positions: Position[];
  positionPnLMap: Map<
    string,
    | PositionPnLDetails
    | { unrealizedPnL: number; unrealizedPnLPercentage: number }
  >;
  getPnLColor: (pnl: number) => string;
}

export const PositionsMetrics: FC<PositionsMetricsProps> = ({
  positions,
  positionPnLMap,
  getPnLColor,
}) => {
  // Calculate total P&L
  const totalPnL = useMemo(() => {
    let total = 0;
    positions.forEach((pos) => {
      const pnlData = positionPnLMap.get(pos.id);
      if (pnlData) {
        total += pnlData.unrealizedPnL || 0;
      }
    });
    return total;
  }, [positions, positionPnLMap]);

  // Calculate total margin used
  const totalMarginUsed = useMemo(() => {
    return positions.reduce((sum, pos) => sum + (pos.margin_used || 0), 0);
  }, [positions]);

  // Count long/short positions
  const longCount = positions.filter((p) => p.side === 'long').length;
  const shortCount = positions.filter((p) => p.side === 'short').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      {/* Total P&L */}
      <Card className="p-4 bg-muted/30 border-border/50">
        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          Total P&L
        </div>
        <div
          className="text-lg font-bold font-mono mt-2"
          style={{ color: getPnLColor(totalPnL) }}
        >
          ${totalPnL.toFixed(2)}
        </div>
      </Card>

      {/* Total Margin */}
      <Card className="p-4 bg-muted/30 border-border/50">
        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          Margin Used
        </div>
        <div className="text-lg font-bold font-mono mt-2 text-primary">
          ${totalMarginUsed.toFixed(2)}
        </div>
      </Card>

      {/* Long Positions */}
      <Card className="p-4 bg-muted/30 border-border/50">
        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          Buy Positions
        </div>
        <div className="text-lg font-bold mt-2 text-buy">{longCount}</div>
      </Card>

      {/* Short Positions */}
      <Card className="p-4 bg-muted/30 border-border/50">
        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          Sell Positions
        </div>
        <div className="text-lg font-bold mt-2 text-sell">{shortCount}</div>
      </Card>
    </div>
  );
};
