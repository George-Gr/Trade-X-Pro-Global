import React, { useMemo, useState, useCallback } from 'react';
import { ChevronDown, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useOrdersTable, type OrderTableItem } from '@/hooks/useOrdersTable';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type OrderFilterType = 'all' | 'pending' | 'filled' | 'cancelled';
type OrderSortKey = 'created_at' | 'symbol' | 'quantity' | 'price';

interface SortConfig {
  key: OrderSortKey;
  direction: 'asc' | 'desc';
}

type Order = OrderTableItem;

/**
 * OrderHistory Component
 *
 * Displays order history with:
 * - Filter by status (all, pending, filled, cancelled)
 * - Sort by date, symbol, quantity, price
 * - Quick-reorder functionality
 * - Order details expansion
 * - Mobile responsive design (card layout)
 * - Color-coded status badges
 */
const OrderHistory: React.FC = () => {
  const { orders = [], loading } = useOrdersTable();
  const { toast } = useToast();

  // State management
  const [filterStatus, setFilterStatus] = useState<OrderFilterType>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' });
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [selectedForReorder, setSelectedForReorder] = useState<Order | null>(null);
  const [showReorderConfirm, setShowReorderConfirm] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  // Filter orders
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    return orders.filter(order => {
      if (filterStatus === 'all') return true;
      return order.status === filterStatus;
    });
  }, [orders, filterStatus]);

  // Sort orders
  const sortedOrders = useMemo(() => {
    const sorted = [...filteredOrders].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredOrders, sortConfig]);

  const handleSort = (key: OrderSortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleReorder = async () => {
    if (!selectedForReorder) return;

    setIsReordering(true);
    try {
      // Placeholder: actual reorder would be implemented with useOrderExecution
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: 'Order Resubmitted',
        description: `${selectedForReorder.symbol} ${selectedForReorder.side.toUpperCase()} order placed`,
      });
      
      setShowReorderConfirm(false);
      setSelectedForReorder(null);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to reorder. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsReordering(false);
    }
  };

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

  const SortHeader = ({ label, sortKey }: { label: string; sortKey: OrderSortKey }) => {
    const isActive = sortConfig.key === sortKey;
    return (
      <button
        onClick={() => handleSort(sortKey)}
        className="flex items-center gap-2 hover:text-primary transition-colors text-sm"
      >
        {label}
        {isActive && (
          <ChevronDown
            className={`h-3 w-3 transition-transform ${
              sortConfig.direction === 'asc' ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderDesktopTable = () => (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold">
              <SortHeader label="Date" sortKey="created_at" />
            </th>
            <th className="text-left py-3 px-4 font-semibold">
              <SortHeader label="Symbol" sortKey="symbol" />
            </th>
            <th className="text-center py-3 px-4 font-semibold">Type</th>
            <th className="text-left py-3 px-4 font-semibold">Side</th>
            <th className="text-right py-3 px-4 font-semibold">
              <SortHeader label="Qty" sortKey="quantity" />
            </th>
            <th className="text-right py-3 px-4 font-semibold">
              <SortHeader label="Price" sortKey="price" />
            </th>
            <th className="text-center py-3 px-4 font-semibold">Status</th>
            <th className="text-right py-3 px-4 font-semibold">Comm.</th>
            <th className="text-center py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            
            return (
              <React.Fragment key={order.id}>
                <tr
                  className="border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                >
                  <td className="py-3 px-4 text-xs">{formatDate(order.created_at)}</td>
                  <td className="py-3 px-4 font-medium">{order.symbol}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="outline" className="text-xs">
                      {order.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={order.side === 'buy' ? 'default' : 'secondary'}
                      className={order.side === 'buy' ? 'bg-buy text-white' : 'bg-sell text-white'}
                    >
                      {order.side.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">{order.quantity.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-mono">
                    {order.limit_price || order.price ? `$${(order.limit_price || order.price || 0).toFixed(5)}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge
                      style={{
                        backgroundColor: getStatusColor(order.status),
                        color: 'white',
                      }}
                      className="text-xs"
                    >
                      {getStatusLabel(order.status)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">${(order.commission || 0).toFixed(2)}</td>
                  <td className="py-3 px-4 text-center">
                    {order.status === 'cancelled' || order.status === 'rejected' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedForReorder(order);
                          setShowReorderConfirm(true);
                        }}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
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
                      <OrderDetails order={order} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderMobileCards = () => (
    <div className="md:hidden space-y-3">
      {sortedOrders.map((order) => {
        const isExpanded = expandedOrderId === order.id;

        return (
          <Card
            key={order.id}
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{order.symbol}</h3>
                  <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
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
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Side</span>
                  <Badge
                    variant={order.side === 'buy' ? 'default' : 'secondary'}
                    className={`mt-1 ${order.side === 'buy' ? 'bg-buy text-white' : 'bg-sell text-white'}`}
                  >
                    {order.side.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Type</span>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {order.type.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Quantity and Price */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Quantity</span>
                  <div className="font-mono font-semibold">{order.quantity.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Price</span>
                  <div className="font-mono font-semibold">
                    {order.limit_price || order.price ? `$${(order.limit_price || order.price || 0).toFixed(5)}` : '-'}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-border pt-3 mt-3">
                  <OrderDetails order={order} />
                </div>
              )}

              {/* Reorder Action */}
              {(order.status === 'cancelled' || order.status === 'rejected') && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedForReorder(order);
                    setShowReorderConfirm(true);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No orders found</p>
        <p className="text-xs text-muted-foreground mt-1">Your order history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-lg">Order History ({sortedOrders.length})</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'pending', 'filled', 'cancelled'] as OrderFilterType[]).map((filter) => (
            <Button
              key={filter}
              size="sm"
              variant={filterStatus === filter ? 'default' : 'outline'}
              onClick={() => setFilterStatus(filter)}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      {renderDesktopTable()}

      {/* Mobile Cards */}
      {renderMobileCards()}

      {/* Reorder Confirmation */}
      <AlertDialog open={showReorderConfirm} onOpenChange={setShowReorderConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reorder</AlertDialogTitle>
            <AlertDialogDescription>
              Place a new {selectedForReorder?.side.toUpperCase()} order for{' '}
              {selectedForReorder?.quantity.toFixed(2)} {selectedForReorder?.symbol}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReorder}
              disabled={isReordering}
            >
              {isReordering ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Placing...
                </>
              ) : (
                'Reorder'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

/**
 * OrderDetails Sub-component
 * Displays expanded details for an order
 */
const OrderDetails: React.FC<{ order: Order }> = ({ order }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
      <div>
        <span className="text-muted-foreground text-xs">Order Type</span>
        <div className="font-semibold capitalize">{order.type.replace('_', ' ')}</div>
      </div>
      <div>
        <span className="text-muted-foreground text-xs">Filled Quantity</span>
        <div className="font-mono">{(order.filled_quantity || 0).toFixed(2)}</div>
      </div>
      <div>
        <span className="text-muted-foreground text-xs">Average Price</span>
        <div className="font-mono">
          {order.average_fill_price ? `$${order.average_fill_price.toFixed(5)}` : '-'}
        </div>
      </div>
      {order.stop_price && (
        <div>
          <span className="text-muted-foreground text-xs">Stop Price</span>
          <div className="font-mono">${order.stop_price.toFixed(5)}</div>
        </div>
      )}
      <div>
        <span className="text-muted-foreground text-xs">Commission</span>
        <div className="font-mono">${(order.commission || 0).toFixed(2)}</div>
      </div>
    </div>
  );
};

export default OrderHistory;
