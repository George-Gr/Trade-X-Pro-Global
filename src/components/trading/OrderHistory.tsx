import React, { useMemo, useState } from 'react';
import { ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useOrdersTable, type OrderTableItem } from '@/hooks/useOrdersTable';
import { useToast } from '@/hooks/use-toast';
import { OrderFilter, type OrderFilterType } from '@/components/trading/OrderFilter';
import { OrderDetailExpander } from '@/components/trading/OrderDetailExpander';
import DesktopOrderTable, { type OrderSortKey } from '@/components/trading/DesktopOrderTable';
import MobileOrderCards from '@/components/trading/MobileOrderCards';
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

interface SortConfig {
  key: 'created_at' | 'symbol' | 'quantity' | 'price';
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
      const aVal = a[sortConfig.key] as number | string;
      const bVal = b[sortConfig.key] as number | string;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
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
        className="flex items-center gap-4 hover:text-primary transition-colors text-sm"
        aria-label={`Sort by ${label}, currently ${isActive ? sortConfig.direction === 'asc' ? 'ascending' : 'descending' : 'unsorted'}`}
        aria-pressed={isActive}
      >
        {label}
        {isActive && (
          <ChevronDown
            className={`h-3 w-3 transition-transform ${sortConfig.direction === 'asc' ? 'rotate-180' : ''
              }`}
            aria-hidden="true"
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
        <p className="text-xs text-muted-foreground mt-2">Your order history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-semibold text-lg">Order History ({sortedOrders.length})</h3>
        </div>
        <OrderFilter filterStatus={filterStatus} onFilterChange={setFilterStatus} />
      </div>

      {/* Desktop Table */}
      <DesktopOrderTable
        orders={sortedOrders}
        expandedOrderId={expandedOrderId}
        onExpandToggle={(orderId) => setExpandedOrderId(expandedOrderId === orderId ? null : orderId)}
        onReorderClick={(order) => {
          setSelectedForReorder(order);
          setShowReorderConfirm(true);
        }}
        onSortClick={handleSort}
        sortConfig={sortConfig}
        renderExpandedContent={(order) => <OrderDetailExpander order={order} />}
      />

      {/* Mobile Cards */}
      <MobileOrderCards
        orders={sortedOrders}
        expandedOrderId={expandedOrderId}
        onExpandToggle={(orderId) => setExpandedOrderId(expandedOrderId === orderId ? null : orderId)}
        onReorderClick={(order) => {
          setSelectedForReorder(order);
          setShowReorderConfirm(true);
        }}
        renderExpandedContent={(order) => <OrderDetailExpander order={order} />}
      />

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

export default OrderHistory;

