import { useCallback, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { cn } from '@/lib/utils';

/**
 * Column definition for virtualized table
 */
export interface VirtualTableColumn<T> {
  /** Unique key for the column */
  key: string;
  /** Header text */
  header: string;
  /** Width of column (px or flex value) */
  width: number;
  /** Render function for cell content */
  render: (item: T, index: number) => React.ReactNode;
  /** Optional CSS class for cell */
  className?: string;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
}

interface VirtualizedTableProps<T> {
  /** Array of data items to display */
  data: T[];
  /** Column definitions */
  columns: VirtualTableColumn<T>[];
  /** Height of each row in pixels */
  rowHeight?: number;
  /** Total height of the table container */
  height?: number;
  /** Unique key extractor function */
  getRowKey: (item: T, index: number) => string;
  /** Optional row click handler */
  onRowClick?: (item: T, index: number) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** CSS class for container */
  className?: string;
}

/**
 * Virtualized table component for large datasets
 * 
 * @description
 * Uses react-window for efficient rendering of large tables with:
 * - Only renders visible rows (windowing)
 * - Smooth scrolling performance
 * - Configurable row height and table height
 * - Support for custom cell rendering
 * 
 * @example
 * ```tsx
 * const columns: VirtualTableColumn<Trade>[] = [
 *   { key: 'symbol', header: 'Symbol', width: 100, render: (t) => t.symbol },
 *   { key: 'pnl', header: 'P&L', width: 120, render: (t) => formatCurrency(t.pnl) },
 * ];
 * 
 * <VirtualizedTable
 *   data={trades}
 *   columns={columns}
 *   getRowKey={(t) => t.id}
 *   height={400}
 * />
 * ```
 */
export function VirtualizedTable<T>({
  data,
  columns,
  rowHeight = 48,
  height = 400,
  getRowKey,
  onRowClick,
  isLoading = false,
  emptyMessage = 'No data available',
  className,
}: VirtualizedTableProps<T>) {
  // Calculate total width for scrolling
  const totalWidth = useMemo(
    () => columns.reduce((sum, col) => sum + col.width, 0),
    [columns]
  );

  // Row renderer for react-window
  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const item = data[index];
      const rowKey = getRowKey(item, index);

      return (
        <div
          key={rowKey}
          style={style}
          className={cn(
            'flex items-center border-b border-border hover:bg-muted/50 transition-colors',
            onRowClick && 'cursor-pointer',
            index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
          )}
          onClick={() => onRowClick?.(item, index)}
          role="row"
          aria-rowindex={index + 2} // +2 for header row
        >
          {columns.map((column) => (
            <div
              key={column.key}
              className={cn(
                'px-3 py-2 truncate',
                column.className,
                column.align === 'right' && 'text-right',
                column.align === 'center' && 'text-center'
              )}
              style={{ width: column.width, minWidth: column.width }}
              role="cell"
            >
              {column.render(item, index)}
            </div>
          ))}
        </div>
      );
    },
    [data, columns, getRowKey, onRowClick]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('rounded-lg border border-border overflow-hidden', className)}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={cn('rounded-lg border border-border overflow-hidden', className)}>
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p className="text-lg">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('rounded-lg border border-border overflow-hidden', className)}
      role="table"
      aria-rowcount={data.length + 1}
    >
      {/* Header */}
      <div
        className="flex items-center bg-muted/50 border-b border-border font-medium text-sm"
        style={{ minWidth: totalWidth }}
        role="row"
        aria-rowindex={1}
      >
        {columns.map((column) => (
          <div
            key={column.key}
            className={cn(
              'px-3 py-3 truncate text-muted-foreground',
              column.align === 'right' && 'text-right',
              column.align === 'center' && 'text-center'
            )}
            style={{ width: column.width, minWidth: column.width }}
            role="columnheader"
          >
            {column.header}
          </div>
        ))}
      </div>

      {/* Virtualized rows */}
      <div style={{ overflowX: 'auto' }}>
        <List
          height={height}
          itemCount={data.length}
          itemSize={rowHeight}
          width="100%"
          overscanCount={5}
        >
          {Row}
        </List>
      </div>
    </div>
  );
}

export default VirtualizedTable;
