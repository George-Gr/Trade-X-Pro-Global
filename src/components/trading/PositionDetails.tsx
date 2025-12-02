import React from 'react';
import type { Position } from '@/types/position';
import type { PositionPnLDetails } from '@/lib/trading/pnlCalculation';

export interface PositionDetailsProps {
    position: Position;
    pnlData: PositionPnLDetails | { unrealizedPnL: number; unrealizedPnLPercentage: number };
}

export const PositionDetails: React.FC<PositionDetailsProps> = ({ position, pnlData }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
            <span className="text-muted-foreground text-xs">Entry Price</span>
            <div className="font-mono font-semibold">${position.entry_price.toFixed(5)}</div>
        </div>
        <div>
            <span className="text-muted-foreground text-xs">Current Price</span>
            <div className="font-mono font-semibold">${position.current_price.toFixed(5)}</div>
        </div>
        <div>
            <span className="text-muted-foreground text-xs">Margin Used</span>
            <div className="font-mono font-semibold">${position.margin_used?.toFixed(2) || '0.00'}</div>
        </div>
        {position.stop_loss && (
            <div>
                <span className="text-muted-foreground text-xs">Stop Loss</span>
                <div className="font-mono font-semibold text-sell">${position.stop_loss.toFixed(5)}</div>
            </div>
        )}
        {position.take_profit && (
            <div>
                <span className="text-muted-foreground text-xs">Take Profit</span>
                <div className="font-mono font-semibold text-buy">${position.take_profit.toFixed(5)}</div>
            </div>
        )}
    </div>
);
