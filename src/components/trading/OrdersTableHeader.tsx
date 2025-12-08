import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SortKey = 'created_at' | 'symbol' | 'quantity' | 'status' | 'realized_pnl';
type SortOrder = 'asc' | 'desc';

interface OrdersTableHeaderProps {
  symbolSearch: string;
  onSymbolSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortKey: SortKey;
  sortOrder: SortOrder;
  onSort: (key: SortKey) => void;
  uniqueStatuses: string[];
  stats: {
    filled: number;
    open: number;
    cancelled: number;
    totalPnL: number;
  };
}

const SortButton: React.FC<{
  label: string;
  sortKey: SortKey;
  isActive: boolean;
  direction: SortOrder;
  onSort: (key: SortKey) => void;
}> = ({ label, sortKey, isActive, direction, onSort }) => (
  <button
    onClick={() => onSort(sortKey)}
    className="flex items-center gap-2 hover:text-foreground transition-colors font-semibold text-muted-foreground"
    aria-label={`Sort by ${label}, currently ${isActive ? direction === 'asc' ? 'ascending' : 'descending' : 'unsorted'}`}
    aria-pressed={isActive}
  >
    {label}
    {isActive && (
      <ChevronDown
        className={`h-5 w-5 transition-transform ${direction === 'asc' ? 'rotate-180' : ''}`}
        aria-hidden="true"
      />
    )}
  </button>
);

export const OrdersTableHeader: React.FC<OrdersTableHeaderProps> = ({
  symbolSearch,
  onSymbolSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortKey,
  sortOrder,
  onSort,
  uniqueStatuses,
  stats,
}) => {
  return (
    <div className="space-y-4">
      {/* Title and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg">Orders</h3>
          <p className="text-sm text-muted-foreground">Manage and track your orders</p>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-3 sm:flex sm:gap-3 gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20">
            <span className="text-xs text-muted-foreground font-medium">Open:</span>
            <strong className="text-primary">{stats.open}</strong>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-buy/10 rounded-lg border border-buy/20">
            <span className="text-xs text-muted-foreground font-medium">Filled:</span>
            <strong className="text-buy">{stats.filled}</strong>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border/50">
            <span className="text-xs text-muted-foreground font-medium">Cancelled:</span>
            <strong className="text-muted-foreground">{stats.cancelled}</strong>
          </div>
        </div>
      </div>

      {/* Filter Controls - Styled as proper controls */}
      <div className="flex flex-col sm:flex-row gap-3 p-3 bg-muted/20 rounded-lg border border-border/50">
        <div className="flex-1">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Search Symbol
          </label>
          <Input
            placeholder="e.g., EURUSD, AAPL..."
            value={symbolSearch}
            onChange={(e) => onSymbolSearchChange(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="flex-1 sm:flex-initial sm:w-48">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Filter Status
          </label>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {uniqueStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop Table Headers with Sort Indicators */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-3 bg-muted/30 rounded-lg border border-border/50">
        <div className="col-span-2">
          <SortButton
            label="Symbol"
            sortKey="symbol"
            isActive={sortKey === 'symbol'}
            direction={sortOrder}
            onSort={onSort}
          />
        </div>
        <div className="col-span-1 text-muted-foreground font-semibold">Type</div>
        <div className="col-span-1 text-muted-foreground font-semibold">Side</div>
        <div className="col-span-1">
          <SortButton
            label="Qty"
            sortKey="quantity"
            isActive={sortKey === 'quantity'}
            direction={sortOrder}
            onSort={onSort}
          />
        </div>
        <div className="col-span-1 text-muted-foreground font-semibold">Price</div>
        <div className="col-span-1">
          <SortButton
            label="Status"
            sortKey="status"
            isActive={sortKey === 'status'}
            direction={sortOrder}
            onSort={onSort}
          />
        </div>
        <div className="col-span-1 text-muted-foreground font-semibold">Commission</div>
        <div className="col-span-1">
          <SortButton
            label="P&L"
            sortKey="realized_pnl"
            isActive={sortKey === 'realized_pnl'}
            direction={sortOrder}
            onSort={onSort}
          />
        </div>
        <div className="col-span-2 text-muted-foreground font-semibold">Actions</div>
      </div>
    </div>
  );
};
