import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Position } from '@/types/position';

export interface SortConfig {
  key: keyof Position | 'pnl' | 'margin_level';
  direction: 'asc' | 'desc';
}

type FilterType = 'all' | 'long' | 'short' | 'profit' | 'loss';

interface PositionsHeaderProps {
  positionCount: number;
  filterType: FilterType;
  onFilterChange: (filter: FilterType) => void;
  sortConfig: SortConfig;
  onSort: (key: SortConfig['key']) => void;
}

export const SortHeader: React.FC<{
  label: string;
  sortKey: SortConfig['key'];
  isActive: boolean;
  direction: 'asc' | 'desc';
  onSort: (key: SortConfig['key']) => void;
}> = ({ label, sortKey, isActive, direction, onSort }) => (
  <button
    onClick={() => onSort(sortKey)}
    className="flex items-center gap-2 hover:text-primary transition-colors font-semibold"
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

export const PositionsHeader: React.FC<PositionsHeaderProps> = ({
  positionCount,
  filterType,
  onFilterChange,
  sortConfig,
  onSort,
}) => {
  return (
    <div className="space-y-4">
      {/* Title and Count */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-semibold text-lg">Open Positions ({positionCount})</h3>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {(['all', 'long', 'short', 'profit', 'loss'] as FilterType[]).map((filter) => (
            <Button
              key={filter}
              size="sm"
              variant={filterType === filter ? 'default' : 'outline'}
              onClick={() => onFilterChange(filter)}
              aria-label={`Filter positions by ${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
              aria-pressed={filterType === filter}
            >
              {filter === 'long'
                ? 'Buy'
                : filter === 'short'
                  ? 'Sell'
                  : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Desktop Table Headers with Sort Indicators */}
      <div className="hidden md:grid grid-cols-8 gap-4 px-4 py-3 bg-muted/30 rounded-lg border border-border/50">
        <div className="text-left">
          <SortHeader
            label="Symbol"
            sortKey="symbol"
            isActive={sortConfig.key === 'symbol'}
            direction={sortConfig.direction}
            onSort={onSort}
          />
        </div>
        <div className="text-left">
          <SortHeader
            label="Side"
            sortKey="side"
            isActive={sortConfig.key === 'side'}
            direction={sortConfig.direction}
            onSort={onSort}
          />
        </div>
        <div className="text-right">
          <SortHeader
            label="Qty"
            sortKey="quantity"
            isActive={sortConfig.key === 'quantity'}
            direction={sortConfig.direction}
            onSort={onSort}
          />
        </div>
        <div className="text-right">
          <SortHeader
            label="Entry"
            sortKey="entry_price"
            isActive={sortConfig.key === 'entry_price'}
            direction={sortConfig.direction}
            onSort={onSort}
          />
        </div>
        <div className="text-right">
          <SortHeader
            label="Current"
            sortKey="current_price"
            isActive={sortConfig.key === 'current_price'}
            direction={sortConfig.direction}
            onSort={onSort}
          />
        </div>
        <div className="text-right">
          <SortHeader
            label="P&L"
            sortKey="pnl"
            isActive={sortConfig.key === 'pnl'}
            direction={sortConfig.direction}
            onSort={onSort}
          />
        </div>
        <div className="text-right">
          <SortHeader
            label="Margin"
            sortKey="margin_level"
            isActive={sortConfig.key === 'margin_level'}
            direction={sortConfig.direction}
            onSort={onSort}
          />
        </div>
        <div className="text-center font-semibold">Actions</div>
      </div>
    </div>
  );
};
