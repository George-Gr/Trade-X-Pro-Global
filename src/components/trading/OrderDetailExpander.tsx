/**
 * Order Detail Expander Component
 *
 * Displays detailed information for an expanded order in OrderHistory
 * Shows entry/exit details, commission, and additional info
 */

import React from 'react';
import type { OrderTableItem } from '@/hooks/useOrdersTable';

interface OrderDetailExpanderProps {
  order: OrderTableItem;
}

export const OrderDetailExpander: React.FC<OrderDetailExpanderProps> = ({ order }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div>
        <span className="text-muted-foreground text-xs">Symbol</span>
        <div className="font-mono font-semibold">{order.symbol}</div>
      </div>
      <div>
        <span className="text-muted-foreground text-xs">Type</span>
        <div className="font-semibold">{order.type.toUpperCase()}</div>
      </div>
      <div>
        <span className="text-muted-foreground text-xs">Side</span>
        <div className="font-semibold">{order.side.toUpperCase()}</div>
      </div>
      <div>
        <span className="text-muted-foreground text-xs">Quantity</span>
        <div className="font-mono font-semibold">{order.quantity.toFixed(2)}</div>
      </div>
      <div>
        <span className="text-muted-foreground text-xs">Price</span>
        <div className="font-mono font-semibold">${(order.price || 0).toFixed(5)}</div>
      </div>
      <div>
        <span className="text-muted-foreground text-xs">Commission</span>
        <div className="font-mono font-semibold">${(order.commission || 0).toFixed(2)}</div>
      </div>
      {order.slippage !== undefined && (
        <div>
          <span className="text-muted-foreground text-xs">Slippage</span>
          <div className="font-mono font-semibold">${(order.slippage || 0).toFixed(4)}</div>
        </div>
      )}
    {order.realized_pnl !== undefined && (
      <div>
        <span className="text-muted-foreground text-xs">Realized P&L</span>
        <div
          className="font-mono font-semibold"
          style={{ color: (order.realized_pnl ?? 0) >= 0 ? '#10b981' : '#ef4444' }}
        >
          ${order.realized_pnl?.toFixed(2) ?? '0.00'}
        </div>
      </div>
    )}
    </div>
  );
};

export default OrderDetailExpander;
