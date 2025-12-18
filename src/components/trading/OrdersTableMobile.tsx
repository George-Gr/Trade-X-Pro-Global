import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, X, Copy } from "lucide-react";
import { OrderStatusBadge } from "./OrderStatusBadge";
import {
  calculateFillPercentage,
  type OrderStatus,
} from "@/lib/trading/orderUtils";
import type { Order } from "./OrderRow";

interface OrdersTableMobileProps {
  orders: Order[];
  onModify?: (order: Order) => void;
  onCancel?: (order: Order) => void;
  onViewDetails?: (order: Order) => void;
}

export const OrdersTableMobile: React.FC<OrdersTableMobileProps> = ({
  orders,
  onModify,
  onCancel,
  onViewDetails,
}) => {
  const canModify = (order: Order) =>
    ["open", "partially_filled"].includes(order.status);
  const canCancel = (order: Order) =>
    ["pending", "open", "partially_filled"].includes(order.status);

  const copyOrderId = (orderId: string) => {
    navigator.clipboard.writeText(orderId);
  };

  const getTypeLabel = (type: Order["type"]) =>
    type
      .replace("_", "-")
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const getSideBadgeColor = (side: "buy" | "sell") =>
    side === "buy" ? "bg-buy text-foreground" : "bg-sell text-foreground";

  return (
    <div className="lg:hidden space-y-3">
      {orders.map((order) => {
        const fillPercentage = calculateFillPercentage(
          order.filled_quantity,
          order.quantity,
        );

        return (
          <Card
            key={order.id}
            className="p-4 border-border/50 hover:bg-muted/50 transition-colors"
          >
            {/* Header: Symbol and Status */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <h4 className="font-bold text-lg">{order.symbol}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {order.id.substring(0, 12)}...
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 ml-1 inline-flex"
                    onClick={() => copyOrderId(order.id)}
                    title="Copy order ID"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </p>
              </div>
              <div className="text-right">
                <OrderStatusBadge status={order.status as OrderStatus} />
                {order.status === "partially_filled" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {fillPercentage.toFixed(1)}% filled
                  </p>
                )}
              </div>
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3 border-t border-border/50 pt-3">
              <div>
                <span className="text-xs text-muted-foreground font-medium">
                  Type
                </span>
                <p className="text-sm font-semibold">
                  {getTypeLabel(order.type)}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium">
                  Side
                </span>
                <Badge className={`mt-1 ${getSideBadgeColor(order.side)}`}>
                  {order.side.toUpperCase()}
                </Badge>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium">
                  Quantity
                </span>
                <p className="text-sm font-mono font-semibold">
                  {order.quantity.toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium">
                  Price
                </span>
                <p className="text-sm font-mono font-semibold">
                  ${(order.price || order.limit_price || 0).toFixed(5)}
                </p>
              </div>

              {/* Commission */}
              {order.commission && (
                <div>
                  <span className="text-xs text-muted-foreground font-medium">
                    Commission
                  </span>
                  <p className="text-sm font-mono">
                    ${order.commission.toFixed(2)}
                  </p>
                </div>
              )}

              {/* P&L */}
              {order.realized_pnl !== undefined && (
                <div>
                  <span className="text-xs text-muted-foreground font-medium">
                    P&L
                  </span>
                  <p
                    className="text-sm font-mono font-bold"
                    style={{
                      color:
                        order.realized_pnl > 0
                          ? "hsl(var(--buy))"
                          : "hsl(var(--sell))",
                    }}
                  >
                    {order.realized_pnl > 0 ? "+" : ""}$
                    {order.realized_pnl.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Fill Percentage for Partial Fills */}
              {order.status === "partially_filled" && (
                <div>
                  <span className="text-xs text-muted-foreground font-medium">
                    Filled
                  </span>
                  <p className="text-sm font-mono">
                    {order.filled_quantity.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-border/50">
              {canModify(order) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-9"
                  onClick={() => onModify?.(order)}
                  title="Edit this order"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {canCancel(order) && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1 h-9"
                  onClick={() => onCancel?.(order)}
                  title="Cancel this order"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="flex-1 h-9"
                onClick={() => onViewDetails?.(order)}
                title="View details"
              >
                Details
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
