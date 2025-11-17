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

import React from 'react';
import { AlertCircle, TrendingDown, TrendingUp, DollarSign, X } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import type { LiquidationExecutionResult } from '@/lib/trading/liquidationEngine';

interface LiquidationAlertProps {
  result: LiquidationExecutionResult;
  onDismiss?: () => void;
  onDeposit?: () => void;
  onViewHistory?: () => void;
  onContactSupport?: () => void;
}

export const LiquidationAlert: React.FC<LiquidationAlertProps> = ({
  result,
  onDismiss,
  onDeposit,
  onViewHistory,
  onContactSupport,
}) => {
  return (
    <Alert className="border-red-300 bg-red-50 mb-4">
      <div className="flex items-start justify-between w-full gap-4">
        <div className="flex items-start gap-3 flex-1">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <AlertTitle className="text-red-900 text-lg mb-2">
              Account Liquidation Executed
            </AlertTitle>
            <AlertDescription className="text-red-800 space-y-3">
              <p>
                {result.totalPositionsClosed} position{result.totalPositionsClosed !== 1 ? 's' : ''} have been
                automatically liquidated due to margin call. Your account margin has been restored.
              </p>

              {/* Liquidation Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                <div className="bg-white p-2 rounded border border-red-200">
                  <div className="text-xs text-gray-600">Positions Closed</div>
                  <div className="text-lg font-bold text-red-900">{result.totalPositionsClosed}</div>
                </div>
                <div className="bg-white p-2 rounded border border-red-200">
                  <div className="text-xs text-gray-600">Realized Loss</div>
                  <div className={cn('text-lg font-bold', result.totalLossRealized < 0 ? 'text-red-700' : 'text-green-700')}>
                    ${Math.abs(result.totalLossRealized).toFixed(2)}
                  </div>
                </div>
                <div className="bg-white p-2 rounded border border-red-200">
                  <div className="text-xs text-gray-600">Slippage Cost</div>
                  <div className="text-lg font-bold text-orange-700">${result.totalSlippageApplied.toFixed(2)}</div>
                </div>
                <div className="bg-white p-2 rounded border border-red-200">
                  <div className="text-xs text-gray-600">Margin Restored</div>
                  <div className={cn('text-lg font-bold', result.finalMarginLevel > result.initialMarginLevel ? 'text-green-700' : 'text-red-700')}>
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
                      className="text-red-800 underline p-0 h-auto font-semibold"
                    >
                      View {result.closedPositions.length} liquidated position{result.closedPositions.length !== 1 ? 's' : ''}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Liquidated Positions</DialogTitle>
                      <DialogDescription>
                        Detailed breakdown of positions that were closed during liquidation
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {result.closedPositions.map((pos, idx) => (
                        <div
                          key={idx}
                          className="p-3 border border-gray-200 rounded-lg bg-gray-50"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-semibold text-gray-900">{pos.symbol}</div>
                              <div className="text-sm text-gray-600 capitalize">
                                {pos.side} {pos.quantity} unit{pos.quantity !== 1 ? 's' : ''}
                              </div>
                            </div>
                            <div
                              className={cn(
                                'text-lg font-bold',
                                pos.realizedPnL < 0 ? 'text-red-600' : 'text-green-600'
                              )}
                            >
                              {pos.realizedPnL < 0 ? '-' : '+'}${Math.abs(pos.realizedPnL).toFixed(2)}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div>
                              <div className="font-medium">Entry Price</div>
                              <div>${pos.entryPrice.toFixed(4)}</div>
                            </div>
                            <div>
                              <div className="font-medium">Liquidation Price</div>
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
                <div className="bg-orange-50 border border-orange-200 p-2 rounded text-sm text-orange-900">
                  <strong>{result.totalPositionsFailed} position{result.totalPositionsFailed !== 1 ? 's' : ''}</strong> failed
                  to close due to technical issues. These positions may still be open. Contact support.
                </div>
              )}
            </AlertDescription>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-red-600 hover:text-red-900 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-red-200 flex-wrap">
        <Button
          onClick={onDeposit}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <DollarSign className="w-4 h-4 mr-1" />
          Deposit Funds
        </Button>
        <Button
          onClick={onViewHistory}
          variant="outline"
          size="sm"
          className="border-red-300 text-red-900 hover:bg-red-100"
        >
          View History
        </Button>
        <Button
          onClick={onContactSupport}
          variant="outline"
          size="sm"
          className="border-red-300 text-red-900 hover:bg-red-100"
        >
          Contact Support
        </Button>
      </div>
    </Alert>
  );
};

export default LiquidationAlert;
