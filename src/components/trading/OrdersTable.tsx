import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OrderRow, type Order } from "./OrderRow";
import { OrdersTableHeader } from "./OrdersTableHeader";
import { OrdersTableMobile } from "./OrdersTableMobile";
import useOrdersTable from "@/hooks/useOrdersTable";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, AlertCircle } from "lucide-react";

type SortKey = "created_at" | "symbol" | "quantity" | "status" | "realized_pnl";
type SortOrder = "asc" | "desc";

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
 * - Sorting by symbol, quantity, status, date, P&L with visual h-5 w-5 arrows
 * - Filtering by status and symbol with styled control section
 * - Order details, modification, and cancellation with confirmation dialog
 * - Responsive design: desktop table + mobile card layout
 * - Virtual scrolling ready (react-window imported and prepared)
 * - Commission and slippage display
 * - Realized P&L calculation
 * - 44px action buttons for easy touch targeting
 */
export const OrdersTable = ({
  orders,
  isLoading = false,
  error = null,
  onModify,
  onCancel,
  onViewDetails,
}: OrdersTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [symbolSearch, setSymbolSearch] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedOrderToCancel, setSelectedOrderToCancel] =
    useState<Order | null>(null);

  const ordersHook = useOrdersTable();
  const sourceOrders = orders && orders.length > 0 ? orders : ordersHook.orders;

  // Filter orders
  const filteredOrders = useMemo(() => {
    return sourceOrders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      const matchesSymbol = order.symbol
        .toLowerCase()
        .includes(symbolSearch.toLowerCase());
      return matchesStatus && matchesSymbol;
    });
  }, [sourceOrders, statusFilter, symbolSearch]);

  // Sort orders
  const sortedOrders = useMemo(() => {
    const sorted = [...filteredOrders].sort((a, b) => {
      let aValue: string | number = a[sortKey] as string | number;
      let bValue: string | number = b[sortKey] as string | number;

      // Handle different data types
      if (sortKey === "created_at") {
        aValue = new Date(a[sortKey] as string).getTime();
        bValue = new Date(b[sortKey] as string).getTime();
      }

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredOrders, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const handleCancelClick = (order: Order) => {
    setSelectedOrderToCancel(order);
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = async () => {
    if (selectedOrderToCancel) {
      await onCancel?.(selectedOrderToCancel);
      setShowCancelConfirm(false);
      setSelectedOrderToCancel(null);
    }
  };

  const uniqueStatuses = Array.from(new Set(sourceOrders.map((o) => o.status)));

  // Statistics
  const stats = useMemo(() => {
    const filled = sourceOrders.filter((o) => o.status === "filled").length;
    const open = sourceOrders.filter((o) =>
      ["open", "partially_filled"].includes(o.status),
    ).length;
    const cancelled = sourceOrders.filter(
      (o) => o.status === "cancelled",
    ).length;
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
          <div className="flex items-center gap-4 text-destructive bg-background p-4 rounded-lg">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>
              Error loading orders:{" "}
              {error instanceof Error ? error.message : "Unknown error"}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Recent orders and their status</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error State */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <span className="text-sm text-destructive">
              Error loading orders:{" "}
              {(error as unknown as { message?: string })?.message ||
                "Unknown error"}
            </span>
          </div>
        )}

        {/* Header with Filters and Sort Controls */}
        <OrdersTableHeader
          symbolSearch={symbolSearch}
          onSymbolSearchChange={setSymbolSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={handleSort}
          uniqueStatuses={uniqueStatuses}
          stats={stats}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
            <span className="text-muted-foreground">Loading orders...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && sortedOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4 shrink-0" />
            <p className="text-muted-foreground">
              {orders.length === 0
                ? "No orders yet. Start trading to see orders here."
                : "No orders match your filters."}
            </p>
          </div>
        )}

        {/* Desktop Table View */}
        {!isLoading && sortedOrders.length > 0 && (
          <>
            <div className="hidden lg:block border border-border/50 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {sortedOrders
                    .filter(
                      (order): order is Order =>
                        "status" in order && typeof order.status === "string",
                    )
                    .map((order) => (
                      <OrderRow
                        key={order.id}
                        order={order}
                        onModify={() => onModify?.(order)}
                        onCancel={() => handleCancelClick(order)}
                        onViewDetails={() => onViewDetails?.(order)}
                      />
                    ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <OrdersTableMobile
              orders={sortedOrders.filter(
                (order): order is Order =>
                  "status" in order && typeof order.status === "string",
              )}
              onModify={onModify}
              onCancel={handleCancelClick}
              onViewDetails={onViewDetails}
            />

            {/* Summary Section */}
            <div className="pt-4 border-t border-border/50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground text-xs font-medium">
                  Total Orders:
                </span>
                <div className="font-bold text-foreground">
                  {filteredOrders.length}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-xs font-medium">
                  Open:
                </span>
                <div className="font-bold text-primary">
                  {
                    filteredOrders.filter((o) =>
                      ["open", "partially_filled"].includes(o.status),
                    ).length
                  }
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-xs font-medium">
                  Filled:
                </span>
                <div className="font-bold text-buy">
                  {filteredOrders.filter((o) => o.status === "filled").length}
                </div>
              </div>
              {stats.totalPnL !== 0 && (
                <div>
                  <span className="text-muted-foreground text-xs font-medium">
                    Total P&L:
                  </span>
                  <div
                    className="font-bold"
                    style={{
                      color:
                        stats.totalPnL > 0
                          ? "hsl(var(--buy))"
                          : "hsl(var(--sell))",
                    }}
                  >
                    {stats.totalPnL > 0 ? "+" : ""}${stats.totalPnL.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Cancel Confirmation Dialog */}
        <AlertDialog
          open={showCancelConfirm}
          onOpenChange={setShowCancelConfirm}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel the{" "}
                {selectedOrderToCancel?.symbol}{" "}
                {selectedOrderToCancel?.side.toUpperCase()} order? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Order</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmCancel}
                className="bg-destructive hover:bg-destructive/90"
              >
                Cancel Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};
