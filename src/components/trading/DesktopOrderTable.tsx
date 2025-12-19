/**
 * Desktop Order Table Component
 *
 * Renders order history as a desktop table with:
 * - Sortable headers
 * - Expandable rows for details
 * - Status badges
 * - Reorder buttons
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { OrderTableItem } from '@/hooks/useOrdersTable';
import { ChevronDown } from 'lucide-react';
import { Fragment, type FC } from 'react';

interface DesktopOrderTableProps {
  orders: OrderTableItem[];
  expandedOrderId: string | null;
  onExpandToggle: (orderId: string) => void;
  onReorderClick: (order: OrderTableItem) => void;
  onSortClick: (key: OrderSortKey) => void;
  sortConfig: { key: OrderSortKey; direction: 'asc' | 'desc' };
  renderExpandedContent: (order: OrderTableItem) => React.ReactNode;
}

export type OrderSortKey = 'created_at' | 'symbol' | 'quantity' | 'price';

const DesktopOrderTable: FC<DesktopOrderTableProps> = ({
  orders,
  expandedOrderId,
  onExpandToggle,
  onReorderClick,
  onSortClick,
  sortConfig,
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

  const SortHeader = ({
    label,
    sortKey,
  }: {
    label: string;
    sortKey: OrderSortKey;
  }) => {
    const isActive = sortConfig.key === sortKey;
    return (
      <button
        onClick={() => onSortClick(sortKey)}
        className="flex items-center gap-2 hover:text-primary transition-colors text-sm"
        aria-label={`Sort by ${label}`}
        aria-pressed={isActive}
      >
        {label}
        {isActive && (
          <ChevronDown
            className={`h-3 w-3 transition-transform ${
              sortConfig.direction === 'asc' ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        )}
      </button>
    );
  };

  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-4 px-4 font-semibold">
              <SortHeader label="Date" sortKey="created_at" />
            </th>
            <th className="text-left py-4 px-4 font-semibold">
              <SortHeader label="Symbol" sortKey="symbol" />
            </th>
            <th className="text-center py-4 px-4 font-semibold">Type</th>
            <th className="text-left py-4 px-4 font-semibold">Side</th>
            <th className="text-right py-4 px-4 font-semibold">
              <SortHeader label="Qty" sortKey="quantity" />
            </th>
            <th className="text-right py-4 px-4 font-semibold">
              <SortHeader label="Price" sortKey="price" />
            </th>
            <th className="text-center py-4 px-4 font-semibold">Status</th>
            <th className="text-right py-4 px-4 font-semibold">Comm.</th>
            <th className="text-center py-4 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;

            return (
              <Fragment key={order.id}>
                <tr
                  className="border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onExpandToggle(order.id)}
                >
                  <td className="py-4 px-4 text-xs">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="py-4 px-4 font-medium">{order.symbol}</td>
                  <td className="py-4 px-4 text-center">
                    <Badge variant="outline" className="text-xs">
                      {order.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <Badge
                      variant={order.side === 'buy' ? 'default' : 'secondary'}
                      className={
                        order.side === 'buy'
                          ? 'bg-buy text-foreground'
                          : 'bg-sell text-foreground'
                      }
                    >
                      {order.side.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-right font-mono">
                    {order.quantity.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-right font-mono">
                    {order.limit_price || order.price
                      ? `$${(order.limit_price || order.price || 0).toFixed(5)}`
                      : '-'}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Badge data-status={order.status} className="text-xs">
                      {getStatusLabel(order.status)}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-right font-mono">
                    ${(order.commission || 0).toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {order.status === 'cancelled' ||
                    order.status === 'rejected' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReorderClick(order);
                        }}
                      >
                        Reorder
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="border-b border-border/50 bg-muted/20">
                    <td colSpan={9} className="py-4 px-4">
                      {renderExpandedContent(order)}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DesktopOrderTable;
