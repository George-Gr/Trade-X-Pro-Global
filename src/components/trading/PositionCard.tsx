import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, X, Loader2 } from 'lucide-react';
import type { Position } from '@/types/position';
import type { PositionPnLDetails } from '@/lib/trading/pnlCalculation';
import { PositionDetails } from './PositionDetails';

export interface PositionCardProps {
    position: Position;
    pnlData: PositionPnLDetails | { unrealizedPnL: number; unrealizedPnLPercentage: number };
    isExpanded: boolean;
    pnlColor: string;
    isClosing: boolean;
    onExpand: () => void;
    onEdit: () => void;
    onClose: () => void;
}

export const PositionCard: React.FC<PositionCardProps> = ({
    position,
    pnlData,
    isExpanded,
    pnlColor,
    isClosing,
    onExpand,
    onEdit,
    onClose,
}) => (
    <Card
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors border-border/50"
        onClick={onExpand}
    >
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                    <h3 className="font-bold text-lg">{position.symbol}</h3>
                    <Badge
                        variant={position.side === 'long' ? 'default' : 'secondary'}
                        className={`mt-2 ${position.side === 'long' ? 'bg-buy text-foreground' : 'bg-sell text-foreground'}`}
                    >
                        {position.side.toUpperCase()}
                    </Badge>
                </div>
                <div className="text-right">
                    <div className="text-sm font-mono text-muted-foreground">
                        Qty: {position.quantity.toFixed(2)}
                    </div>
                    <div className="font-mono font-bold text-lg mt-2" style={{ color: pnlColor }}>
                        ${(pnlData?.unrealizedPnL || 0).toFixed(2)}
                    </div>
                    <div className="text-sm font-semibold" style={{ color: pnlColor }}>
                        {(pnlData?.unrealizedPnLPercentage || 0).toFixed(2)}%
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm border-t border-border/50 pt-4">
                <div>
                    <span className="text-xs text-muted-foreground font-medium">Entry</span>
                    <div className="font-mono font-semibold mt-1">${position.entry_price.toFixed(5)}</div>
                </div>
                <div>
                    <span className="text-xs text-muted-foreground font-medium">Current</span>
                    <div className="font-mono font-semibold mt-1">${position.current_price.toFixed(5)}</div>
                </div>
            </div>
            {isExpanded && (
                <div className="border-t border-border/50 pt-4 mt-4">
                    <PositionDetails position={position} pnlData={pnlData} />
                </div>
            )}
            <div className="flex gap-3 pt-4 border-t border-border/50">
                <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                </Button>
                <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    disabled={isClosing}
                >
                    {isClosing ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Closing...
                        </>
                    ) : (
                        <>
                            <X className="h-4 w-4 mr-2" />
                            Close
                        </>
                    )}
                </Button>
            </div>
        </div>
    </Card>
);
