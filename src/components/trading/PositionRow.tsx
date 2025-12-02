import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, X, Loader2 } from 'lucide-react';
import type { Position } from '@/types/position';
import type { PositionPnLDetails } from '@/lib/trading/pnlCalculation';

export interface PositionRowProps {
  position: Position;
  pnlData: PositionPnLDetails | { unrealizedPnL: number; unrealizedPnLPercentage: number };
  isExpanded: boolean;
  pnlColor: string;
  isClosing: boolean;
  onExpand: () => void;
  onEdit: () => void;
  onClose: () => void;
}

export const PositionRow: React.FC<PositionRowProps> = ({
  position,
  pnlData,
  isExpanded,
  pnlColor,
  isClosing,
  onExpand,
  onEdit,
  onClose,
}) => (
  <>
    <tr
      className="border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={onExpand}
    >
      <td className="py-4 px-4 font-semibold">{position.symbol}</td>
      <td className="py-4 px-4">
        <Badge
          variant={position.side === 'long' ? 'default' : 'secondary'}
          className={position.side === 'long' ? 'bg-buy text-foreground' : 'bg-sell text-foreground'}
        >
          {position.side.toUpperCase()}
        </Badge>
      </td>
      <td className="py-4 px-4 text-right font-mono text-sm">{position.quantity.toFixed(2)}</td>
      <td className="py-4 px-4 text-right font-mono text-sm">${position.entry_price.toFixed(5)}</td>
      <td className="py-4 px-4 text-right font-mono text-sm">${position.current_price.toFixed(5)}</td>
      <td className="py-4 px-4 text-right">
        <div className="font-mono font-bold text-base" style={{ color: pnlColor }}>
          ${(pnlData?.unrealizedPnL || 0).toFixed(2)}
        </div>
        <div className="text-xs font-semibold" style={{ color: pnlColor }}>
          {(pnlData?.unrealizedPnLPercentage || 0).toFixed(2)}%
        </div>
      </td>
      <td className="py-4 px-4 text-right font-mono text-sm">${position.margin_used?.toFixed(2) || '0.00'}</td>
      <td className="py-4 px-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="h-8 w-8 p-0 hover:bg-muted"
            aria-label={`Edit stop loss and take profit for ${position.symbol} position`}
            title="Edit Stop Loss & Take Profit"
          >
            <Edit2 className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={isClosing}
            aria-label={`Close ${position.symbol} position`}
            title="Close Position"
          >
            {isClosing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <X className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </td>
    </tr>
    {isExpanded && (
      <tr className="border-b border-border/50 bg-muted/20">
        <td colSpan={8} className="py-4 px-4">
          {/* PositionDetails will be rendered here by parent */}
        </td>
      </tr>
    )}
  </>
);

export default PositionRow;
