import { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrderStatusBadge, calculateFillPercentage, type OrderStatus } from './OrderStatusBadge';
import { Copy, X } from 'lucide-react';

export interface Order {
  id: string;
  symbol: string;
  type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
  side: 'buy' | 'sell';
  quantity: number;
  filled_quantity: number;
  price?: number;
  limit_price?: number;
  stop_price?: number;
  status: OrderStatus;
  created_at: Date;
  updated_at: Date;
  average_fill_price?: number;
  commission?: number;
  slippage?: number;
  realized_pnl?: number;
}

interface OrderDetailDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onModify?: (order: Order) => void;
  onCancel?: (order: Order) => void;
}

/**
 * OrderDetailDialog Component
 *
 * Displays comprehensive order details in a modal dialog.
 * Shows all order information including fills, pricing, costs, and P&L.
 *
 * @param order - Order to display
 * @param isOpen - Whether dialog is open
 * @param onClose - Callback when dialog closes
 * @param onModify - Callback when modify button clicked
 * @param onCancel - Callback when cancel button clicked
 */
export const OrderDetailDialog = ({
  order,
  isOpen,
  onClose,
  onModify,
  onCancel,
}: OrderDetailDialogProps) => {
  const fillPercentage = order ? calculateFillPercentage(order.filled_quantity, order.quantity) : 0;
  const canModify = order ? ['open', 'partially_filled'].includes(order.status) : false;
  const canCancel = order ? ['pending', 'open', 'partially_filled'].includes(order.status) : false;

  const sideColor = order?.side === 'buy' ? 'bg-background border-blue-200' : 'bg-background border-orange-200';
  const sideTextColor = order?.side === 'buy' ? 'text-blue-700' : 'text-orange-700';

  const orderTypeLabel = order?.type
    .replace('_', '-')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || '';

  const copyOrderId = () => {
    if (order) navigator.clipboard.writeText(order.id);
  };

  const stats = useMemo(() => {
    if (!order) {
      return {
        totalCost: 0,
        commissionsAndSlippage: 0,
        netCost: 0,
        avgPrice: 0,
      };
    }
    const totalCost = order.filled_quantity * (order.average_fill_price || order.price || 0);
    const commissionsAndSlippage = (order.commission || 0) + (order.slippage || 0);
    const netCost = totalCost + commissionsAndSlippage;

    return {
      totalCost,
      commissionsAndSlippage,
      netCost,
      avgPrice: order.average_fill_price || order.price || 0,
    };
  }, [order]);

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start justify-between">
          <div className="flex-1">
            <DialogTitle className="text-xl">Order Details</DialogTitle>
            <DialogDescription>Complete order information and execution details</DialogDescription>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className={`p-4 rounded-lg border ${sideColor}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-2xl font-bold ${sideTextColor}`}>{order.symbol}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Order ID: {order.id}
                  <button
                    onClick={copyOrderId}
                    className="ml-2 inline-flex items-center gap-4 text-xs text-blue-600 hover:text-blue-800"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Status</div>
                <OrderStatusBadge status={order.status} fillPercentage={fillPercentage} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-xs text-muted-foreground">Side</span>
                <div className={`text-lg font-bold ${sideTextColor} uppercase`}>{order.side}</div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Type</span>
                <div className="text-lg font-bold text-gray-900">{orderTypeLabel}</div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Filled</span>
                <div className="text-lg font-bold text-gray-900">{fillPercentage}%</div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Total P&L</span>
                <div
                  className={`text-lg font-bold ${
                    order.realized_pnl && order.realized_pnl > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {order.realized_pnl !== undefined ? (
                    <>${order.realized_pnl.toFixed(2)}</>
                  ) : (
                    'N/A'
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-4">Order Quantities</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Quantity</span>
                    <span className="font-medium text-foreground">{order.quantity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Filled Quantity</span>
                    <span className="font-medium text-foreground">{order.filled_quantity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Remaining Quantity</span>
                    <span className="font-medium text-foreground">
                      {order.quantity - order.filled_quantity}
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2 mt-2">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-4">Price Levels</h4>
                <div className="space-y-4">
                  {order.type === 'market' && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Market Order</span>
                      <Badge variant="secondary">Market</Badge>
                    </div>
                  )}
                  {order.price && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Order Price</span>
                      <span className="font-medium text-foreground">{order.price.toFixed(4)}</span>
                    </div>
                  )}
                  {order.limit_price && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Limit Price</span>
                      <span className="font-medium text-foreground">{order.limit_price.toFixed(4)}</span>
                    </div>
                  )}
                  {order.stop_price && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Stop Price</span>
                      <span className="font-medium text-foreground">{order.stop_price.toFixed(4)}</span>
                    </div>
                  )}
                  {order.average_fill_price && (
                    <div className="flex justify-between items-center pt-4 border-t border-border">
                      <span className="text-muted-foreground font-medium">Average Fill Price</span>
                      <span className="font-bold text-foreground">{order.average_fill_price.toFixed(4)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-4">Execution Costs</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Cost</span>
                    <span className="font-medium text-foreground">${stats.totalCost.toFixed(2)}</span>
                  </div>
                  {order.commission !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Commission</span>
                      <span className="font-medium text-foreground">${order.commission.toFixed(2)}</span>
                    </div>
                  )}
                  {order.slippage !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Slippage</span>
                      <span className="font-medium text-foreground">{order.slippage.toFixed(2)}%</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t border-border">
                    <span className="text-muted-foreground font-medium">Net Cost</span>
                    <span className="font-bold text-foreground">${stats.netCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-4">Timestamps</h4>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium text-foreground">
                      {new Date(order.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-medium text-foreground">
                      {new Date(order.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {(canModify || canCancel) && (
            <div className="flex gap-4 justify-end pt-4 border-t border-border">
              {canModify && onModify && (
                <Button onClick={() => onModify(order)} variant="default">
                  Modify Order
                </Button>
              )}
              {canCancel && onCancel && (
                <Button onClick={() => onCancel(order)} variant="destructive">
                  Cancel Order
                </Button>
              )}
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
