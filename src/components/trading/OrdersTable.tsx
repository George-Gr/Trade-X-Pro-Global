import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrderRow, type Order } from './OrderRow';
import useOrdersTable from '@/hooks/useOrdersTable';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, AlertCircle } from 'lucide-react';

type SortKey = 'created_at' | 'symbol' | 'quantity' | 'status' | 'realized_pnl';
type SortOrder = 'asc' | 'desc';

interface OrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
  error?: Error | null;
  onModify?: (order: Order) => void;
  onCancel?: (order: Order) => void;
  onViewDetails?: (order: Order) => void;
}

/**
 * OrdersTable Component
 * 
 * Displays all orders (open, pending, filled, cancelled) with real-time status updates.
 * Includes sorting, filtering, and action buttons for order management.
 * 
 * Features:
 * - Real-time order status updates
 * - Sorting by symbol, quantity, status, date, P&L
 * - Filtering by status and symbol
 * - Order details, modification, and cancellation
 * - Responsive design for mobile and desktop
 * - Commission and slippage display
 * - Realized P&L calculation
 */
export const OrdersTable = ({
  orders,
  isLoading = false,
  error = null,
  onModify,
  onCancel,
  onViewDetails,
}: OrdersTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [symbolSearch, setSymbolSearch] = useState('');

  const ordersHook = useOrdersTable();
  const sourceOrders = orders && orders.length > 0 ? orders : ordersHook.orders;

  // Filter orders
  const filteredOrders = useMemo(() => {
    return sourceOrders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesSymbol = order.symbol
        .toLowerCase()
        .includes(symbolSearch.toLowerCase());
      return matchesStatus && matchesSymbol;
    });
  }, [sourceOrders, statusFilter, symbolSearch]);

  // Sort orders
  const sortedOrders = useMemo(() => {
    const sorted = [...filteredOrders].sort((a, b) => {
      let aValue: string | number | undefined = a[sortKey];
      let bValue: string | number | undefined = b[sortKey];

      // Handle different data types
      if (sortKey === 'created_at') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredOrders, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const uniqueStatuses = Array.from(new Set(sourceOrders.map((o) => o.status)));

  // Statistics
  const stats = useMemo(() => {
    const filled = sourceOrders.filter((o) => o.status === 'filled').length;
    const open = sourceOrders.filter((o) => ['open', 'partially_filled'].includes(o.status))
      .length;
    const cancelled = sourceOrders.filter((o) => o.status === 'cancelled').length;
    const totalPnL = sourceOrders
      .filter((o) => o.realized_pnl !== undefined)
      .reduce((sum, o) => sum + (o.realized_pnl || 0), 0);

    return { filled, open, cancelled, totalPnL };
  }, [sourceOrders]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Recent orders and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>Error loading orders: {error.message}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Orders</CardTitle>
            <CardDescription>Recent orders and their status</CardDescription>
          </div>
          <div className="flex gap-2 text-sm">
            <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 rounded text-blue-700">
              Open: <strong>{stats.open}</strong>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-green-50 rounded text-green-700">
              Filled: <strong>{stats.filled}</strong>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-gray-50 rounded text-gray-700">
              Cancelled: <strong>{stats.cancelled}</strong>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by symbol..."
            value={symbolSearch}
            onChange={(e) => setSymbolSearch(e.target.value)}
            className="flex-1"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {uniqueStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table Header */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700">
          <div className="col-span-2">
            <button
              onClick={() => handleSort('symbol')}
              className="hover:text-gray-900 flex items-center gap-1"
            >
              Order
              {sortKey === 'symbol' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
            </button>
          </div>
          <div className="col-span-1">Type</div>
          <div className="col-span-1">Side</div>
          <div className="col-span-1">
            <button
              onClick={() => handleSort('quantity')}
              className="hover:text-gray-900 flex items-center gap-1"
            >
              Quantity
              {sortKey === 'quantity' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
            </button>
          </div>
          <div className="col-span-1">Price</div>
          <div className="col-span-1">
            <button
              onClick={() => handleSort('status')}
              className="hover:text-gray-900 flex items-center gap-1"
            >
              Status
              {sortKey === 'status' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
            </button>
          </div>
          <div className="col-span-1">Commission</div>
          <div className="col-span-1">
            <button
              onClick={() => handleSort('realized_pnl')}
              className="hover:text-gray-900 flex items-center gap-1"
            >
              P&L {sortKey === 'realized_pnl' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
            </button>
          </div>
          <div className="col-span-2">Actions</div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading orders...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && sortedOrders.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">
              {orders.length === 0
                ? 'No orders yet. Start trading to see orders here.'
                : 'No orders match your filters.'}
            </p>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && sortedOrders.length > 0 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {sortedOrders
              .filter((order): order is Order => 'status' in order && typeof order.status === 'string')
              .map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onModify={() => onModify?.(order)}
                  onCancel={() => onCancel?.(order)}
                  onViewDetails={() => onViewDetails?.(order)}
                />
              ))}
          </div>
        )}

        {/* Summary */}
        {!isLoading && sortedOrders.length > 0 && (
          <div className="pt-4 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Orders: </span>
              <strong className="text-gray-900">{filteredOrders.length}</strong>
            </div>
            <div>
              <span className="text-gray-600">Open Orders: </span>
              <strong className="text-blue-600">
                {filteredOrders.filter((o) => ['open', 'partially_filled'].includes(o.status))
                  .length}
              </strong>
            </div>
            <div>
              <span className="text-gray-600">Filled Orders: </span>
              <strong className="text-green-600">
                {filteredOrders.filter((o) => o.status === 'filled').length}
              </strong>
            </div>
            {stats.totalPnL !== 0 && (
              <div>
                <span className="text-gray-600">Total P&L: </span>
                <strong
                  className={stats.totalPnL > 0 ? 'text-green-600' : 'text-red-600'}
                >
                  {stats.totalPnL > 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}
                </strong>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
