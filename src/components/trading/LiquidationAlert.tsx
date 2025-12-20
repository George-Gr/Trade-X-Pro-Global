/**
 * Component: LiquidationAlert
 *
 * Purpose: Display liquidation event summary and details
 * Task: TASK 1.2.5 - User Notifications & UI Components
 *
 * Features:
 * - Shows liquidation summary (positions closed, P&L, slippage)
 * - Displays margin recovery
 * - Shows closed positions breakdown
 * - Action buttons for deposit, support, view history
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { LiquidationExecutionResult } from '@/lib/trading/liquidationEngine';
import { cn } from '@/lib/utils';
import { AlertCircle, DollarSign, X } from 'lucide-react';
import type { FC } from 'react';

interface LiquidationAlertProps {
  result: LiquidationExecutionResult;
  onDismiss?: () => void;
  onDeposit?: () => void;
  onViewHistory?: () => void;
  onContactSupport?: () => void;
}

export const LiquidationAlert: FC<LiquidationAlertProps> = ({
  result,
  onDismiss,
  onDeposit,
  onViewHistory,
  onContactSupport,
}) => {
  return (
    <Alert className="border-sell/30 bg-background mb-4">
      <div className="flex items-start justify-between w-full gap-4">
        <div className="flex items-start gap-4 flex-1">
          <AlertCircle className="h-4 w-4 text-sell shrink-0 mt-2.5" />
          <div className="flex-1">
            <AlertTitle className="text-sell text-lg mb-2">
              Account Liquidation Executed
            </AlertTitle>
            <AlertDescription className="text-sell/90 space-y-4">
              <p>
                {result.totalPositionsClosed} position
                {result.totalPositionsClosed !== 1 ? 's' : ''} have been
                automatically liquidated due to margin call. Your account margin
                has been restored.
              </p>

              {/* Liquidation Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <div className="bg-background p-4 rounded border border-sell/30">
                  <div className="text-xs text-muted-foreground">
                    Positions Closed
                  </div>
                  <div className="text-lg font-bold text-sell">
                    {result.totalPositionsClosed}
                  </div>
                </div>
                <div className="bg-background p-4 rounded border border-sell/30">
                  <div className="text-xs text-muted-foreground">
                    Realized Loss
                  </div>
                  <div
                    className={cn(
                      'text-lg font-bold',
                      result.totalLossRealized < 0 ? 'text-sell' : 'text-buy'
                    )}
                  >
                    ${Math.abs(result.totalLossRealized).toFixed(2)}
                  </div>
                </div>
                <div className="bg-background p-4 rounded border border-sell/30">
                  <div className="text-xs text-muted-foreground">
                    Slippage Cost
                  </div>
                  <div className="text-lg font-bold text-orange-700">
                    ${result.totalSlippageApplied.toFixed(2)}
                  </div>
                </div>
                <div className="bg-background p-4 rounded border border-sell/30">
                  <div className="text-xs text-muted-foreground">
                    Margin Restored
                  </div>
                  <div
                    className={cn(
                      'text-lg font-bold',
                      result.finalMarginLevel > result.initialMarginLevel
                        ? 'text-buy'
                        : 'text-sell'
                    )}
                  >
                    {result.finalMarginLevel.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Closed Positions */}
              {result.closedPositions.length > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="link"
                      className="text-sell underline p-4 h-auto font-semibold"
                    >
                      View {result.closedPositions.length} liquidated position
                      {result.closedPositions.length !== 1 ? 's' : ''}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Liquidated Positions</DialogTitle>
                      <DialogDescription>
                        Detailed breakdown of positions that were closed during
                        liquidation
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {result.closedPositions.map((pos, idx) => (
                        <div
                          key={idx}
                          className="p-4 border border-border rounded-lg bg-muted"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-semibold text-foreground">
                                {pos.symbol}
                              </div>
                              <div className="text-sm text-muted-foreground capitalize">
                                {pos.side} {pos.quantity} unit
                                {pos.quantity !== 1 ? 's' : ''}
                              </div>
                            </div>
                            <div
                              className={cn(
                                'text-lg font-bold',
                                pos.realizedPnL < 0 ? 'text-sell' : 'text-buy'
                              )}
                            >
                              {pos.realizedPnL < 0 ? '-' : '+'}$
                              {Math.abs(pos.realizedPnL).toFixed(2)}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                            <div>
                              <div className="font-medium">Entry Price</div>
                              <div>${pos.entryPrice.toFixed(4)}</div>
                            </div>
                            <div>
                              <div className="font-medium">
                                Liquidation Price
                              </div>
                              <div>${pos.liquidationPrice.toFixed(4)}</div>
                            </div>
                            <div>
                              <div className="font-medium">Slippage</div>
                              <div>${pos.slippage.toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="font-medium">P&L %</div>
                              <div>{pos.pnlPercentage.toFixed(2)}%</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Failed Positions Warning */}
              {result.totalPositionsFailed > 0 && (
                <div className="bg-background border border-orange-200 p-4 rounded text-sm text-orange-900">
                  <strong>
                    {result.totalPositionsFailed} position
                    {result.totalPositionsFailed !== 1 ? 's' : ''}
                  </strong>{' '}
                  failed to close due to technical issues. These positions may
                  still be open. Contact support.
                </div>
              )}
            </AlertDescription>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="flex h-11 w-11 items-center justify-center shrink-0 rounded-md text-sell hover:text-sell/80 hover:bg-sell/5 transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-4 pt-4 border-t border-[hsl(var(--status-error-border))] flex-wrap">
        <Button
          onClick={onDeposit}
          size="sm"
          className="bg-[hsl(var(--status-info-foreground))] hover:bg-[hsl(var(--status-info-foreground)/0.9)] text-foreground"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Deposit Funds
        </Button>
        <Button
          onClick={onViewHistory}
          variant="outline"
          size="sm"
          className="border-[hsl(var(--status-error-border))] text-[hsl(var(--status-error-foreground))] hover:bg-[hsl(var(--status-error))]"
        >
          View History
        </Button>
        <Button
          onClick={onContactSupport}
          variant="outline"
          size="sm"
          className="border-[hsl(var(--status-error-border))] text-[hsl(var(--status-error-foreground))] hover:bg-[hsl(var(--status-error))]"
        >
          Contact Support
        </Button>
      </div>
    </Alert>
  );
};

export default LiquidationAlert;
