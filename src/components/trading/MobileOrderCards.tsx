/**
 * Mobile Order Cards Component
 *
 * Renders order history as mobile cards with:
 * - Compact header with symbol and status
 * - Expandable details
 * - Reorder buttons
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { OrderTableItem } from '@/hooks/useOrdersTable';
import { RotateCcw } from 'lucide-react';
import type { FC } from 'react';

interface MobileOrderCardsProps {
  orders: OrderTableItem[];
  expandedOrderId: string | null;
  onExpandToggle: (orderId: string) => void;
  onReorderClick: (order: OrderTableItem) => void;
  renderExpandedContent: (order: OrderTableItem) => React.ReactNode;
}

const MobileOrderCards: FC<MobileOrderCardsProps> = ({
  orders,
  expandedOrderId,
  onExpandToggle,
  onReorderClick,
  renderExpandedContent,
}) => {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'filled':
        return '#00BFA5';
      case 'pending':
        return '#FDD835';
      case 'cancelled':
        return '#9E9E9E';
      case 'rejected':
        return '#E53935';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'filled':
        return 'Filled';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="md:hidden space-y-4">
      {orders.map((order) => {
        const isExpanded = expandedOrderId === order.id;

        return (
          <Card
            key={order.id}
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onExpandToggle(order.id)}
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{order.symbol}</h3>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <Badge
                  style={{
                    backgroundColor: getStatusColor(order.status),
                    color: 'white',
                  }}
                >
                  {getStatusLabel(order.status)}
                </Badge>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Side</span>
                  <Badge
                    variant={order.side === 'buy' ? 'default' : 'secondary'}
                    className={`mt-2 ${
                      order.side === 'buy'
                        ? 'bg-buy text-foreground'
                        : 'bg-sell text-foreground'
                    }`}
                  >
                    {order.side.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Type</span>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {order.type.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Quantity and Price */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">
                    Quantity
                  </span>
                  <div className="font-mono font-semibold">
                    {order.quantity.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Price</span>
                  <div className="font-mono font-semibold">
                    {order.limit_price || order.price
                      ? `$${(order.limit_price || order.price || 0).toFixed(5)}`
                      : '-'}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-border pt-4 mt-4">
                  {renderExpandedContent(order)}
                </div>
              )}

              {/* Reorder Action */}
              {(order.status === 'cancelled' ||
                order.status === 'rejected') && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReorderClick(order);
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reorder
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default MobileOrderCards;
