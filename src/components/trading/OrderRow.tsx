import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge, calculateFillPercentage, type OrderStatus } from './OrderStatusBadge';
import { Copy, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

interface OrderRowProps {
  order: Order;
  onModify?: () => void;
  onCancel?: () => void;
  onViewDetails?: () => void;
}

/**
 * OrderRow Component
 * 
 * Individual row in orders table displaying order details.
 * Shows symbol, type, side, quantity, price, status, and action buttons.
 * 
 * @param order - Order data to display
 * @param onModify - Callback when modify button clicked
 * @param onCancel - Callback when cancel button clicked
 * @param onViewDetails - Callback when view details clicked
 */
export const OrderRow = memo(({
  order,
  onModify,
  onCancel,
  onViewDetails,
}: OrderRowProps) => {
  const fillPercentage = calculateFillPercentage(
    order.filled_quantity,
    order.quantity
  );

  const canModify = ['open', 'partially_filled'].includes(order.status);
  const canCancel = ['pending', 'open', 'partially_filled'].includes(order.status);

  const sideColor = order.side === 'buy' ? 'text-blue-600' : 'text-orange-600';
  const typeLabel = order.type
    .replace('_', '-')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id);
  };

  return (
    <div className="border-b border-border last:border-b-0 hover:bg-muted transition-colors">
      <div className="px-4 py-4">
        {/* Main row */}
        <div className="flex items-center justify-between gap-4">
          {/* Order ID and Symbol */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground truncate">
                  {order.symbol}
                </span>
                <span className="text-xs text-muted-foreground truncate" title={order.id}>
                  {order.id.substring(0, 8)}...
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-11 w-11"
                onClick={copyOrderId}
                title="Copy order ID"
              >
                <Copy className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Order Type */}
          <div className="flex-1 min-w-0">
            <span className="text-sm text-muted-foreground">{typeLabel}</span>
          </div>

          {/* Side */}
          <div className="flex-1 min-w-0">
            <span className={`text-sm font-medium ${sideColor}`}>
              {order.side.toUpperCase()}
            </span>
          </div>

          {/* Quantity / Fill */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col">
              <span className="text-sm text-foreground">
                {order.filled_quantity} / {order.quantity}
              </span>
              {fillPercentage > 0 && fillPercentage < 100 && (
                <div className="w-12 h-1 bg-border rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500"
                    style={{ width: `${fillPercentage}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Price / Levels */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col">
              {order.price && (
                <span className="text-sm text-foreground">
                  {order.average_fill_price
                    ? `Filled @ ${order.average_fill_price.toFixed(4)}`
                    : order.type === 'market'
                      ? `Market`
                      : `${order.price.toFixed(4)}`}
                </span>
              )}
              {order.limit_price && (
                <span className="text-xs text-muted-foreground">
                  Limit: {order.limit_price.toFixed(4)}
                </span>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex-1 min-w-0">
            <OrderStatusBadge
              status={order.status}
              fillPercentage={fillPercentage}
              timestamp={order.updated_at}
            />
          </div>

          {/* Commission & Slippage */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col text-sm">
              {order.commission !== undefined && (
                <span className="text-muted-foreground">
                  Comm: ${order.commission.toFixed(2)}
                </span>
              )}
              {order.slippage !== undefined && (
                <span className="text-muted-foreground">
                  Slip: {order.slippage.toFixed(2)}%
                </span>
              )}
            </div>
          </div>

          {/* Realized P&L */}
          {order.realized_pnl !== undefined && (
            <div className="flex-1 min-w-0">
              <span
                className={`text-sm font-medium ${
                  order.realized_pnl > 0 ? 'text-buy' : 'text-sell'
                }`}
              >
                {order.realized_pnl > 0 ? '+' : ''}
                ${order.realized_pnl.toFixed(2)}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center gap-4">
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewDetails}
                className="text-xs"
              >
                Details
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-11 w-11" aria-label="More options">
                  <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canModify && onModify && (
                  <DropdownMenuItem onClick={onModify}>
                    <Edit className="w-4 h-4 mr-2" />
                    Modify
                  </DropdownMenuItem>
                )}
                {canCancel && onCancel && (
                  <DropdownMenuItem onClick={onCancel} className="text-sell">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancel Order
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Timestamp */}
        <div className="mt-2 text-xs text-muted-foreground">
          Created: {new Date(order.created_at).toLocaleString()} • Updated:{' '}
          {new Date(order.updated_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to optimize re-renders
  // Only re-render if the order data actually changed or callbacks changed
  const orderChanged = prevProps.order.id !== nextProps.order.id ||
    prevProps.order.status !== nextProps.order.status ||
    prevProps.order.filled_quantity !== nextProps.order.filled_quantity ||
    prevProps.order.quantity !== nextProps.order.quantity ||
    prevProps.order.average_fill_price !== nextProps.order.average_fill_price ||
    prevProps.order.price !== nextProps.order.price ||
    prevProps.order.limit_price !== nextProps.order.limit_price ||
    prevProps.order.commission !== nextProps.order.commission ||
    prevProps.order.slippage !== nextProps.order.slippage ||
    prevProps.order.realized_pnl !== nextProps.order.realized_pnl;
  
  const callbacksChanged = prevProps.onModify !== nextProps.onModify ||
    prevProps.onCancel !== nextProps.onCancel ||
    prevProps.onViewDetails !== nextProps.onViewDetails;
  
  return !orderChanged && !callbacksChanged;
});
