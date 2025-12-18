/**
 * Order Filter Component
 *
 * Filter buttons for order status:
 * - All
 * - Pending
 * - Filled
 * - Cancelled
 */

import React from "react";
import { Button } from "@/components/ui/button";

export type OrderFilterType = "all" | "pending" | "filled" | "cancelled";

interface OrderFilterProps {
  filterStatus: OrderFilterType;
  onFilterChange: (filter: OrderFilterType) => void;
}

export const OrderFilter: React.FC<OrderFilterProps> = ({
  filterStatus,
  onFilterChange,
}) => {
  const filters: OrderFilterType[] = ["all", "pending", "filled", "cancelled"];

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {filters.map((filter) => (
        <Button
          key={filter}
          size="sm"
          variant={filterStatus === filter ? "default" : "outline"}
          onClick={() => onFilterChange(filter)}
          aria-label={`Filter orders by ${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
          aria-pressed={filterStatus === filter}
        >
          {filter.charAt(0).toUpperCase() + filter.slice(1)}
        </Button>
      ))}
    </div>
  );
};

export default OrderFilter;
