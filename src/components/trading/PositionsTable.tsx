import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePositionClose } from '@/hooks/usePositionClose';
import { useRealtimePositions } from '@/hooks/useRealtimePositions';
import type { Position } from '@/types/position';
import { AlertCircle, TrendingDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PositionRow } from './PositionRow';

export const PositionsTable: React.FC<{ userId: string | null }> = ({
  userId,
}) => {
  const { positions, isLoading } = useRealtimePositions(userId || null, {
    autoSubscribe: true,
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { closePosition } = usePositionClose();

  const rows = useMemo(() => positions || [], [positions]);

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => ({ ...prev, [id]: checked }));
  };

  const bulkClose = async () => {
    const ids = Object.entries(selectedIds)
      .filter(([_, v]) => v)
      .map(([k]) => k);
    if (ids.length === 0) return;

    setShowConfirmDialog(true);
  };

  const confirmBulkClose = async () => {
    const ids = Object.entries(selectedIds)
      .filter(([_, v]) => v)
      .map(([k]) => k);
    if (ids.length === 0) return;

    setShowConfirmDialog(false);

    // naive bulk close using usePositionClose - call one by one
    for (const id of ids) {
      await closePosition({ position_id: id });
    }

    // clear selection
    setSelectedIds({});
  };

  const selectedCount = Object.values(selectedIds).filter(Boolean).length;

  return (
    <div className="positions-table space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Open Positions</h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {isLoading
              ? 'Loading...'
              : `${rows.length} position${rows.length !== 1 ? 's' : ''}`}
          </span>
          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <Button
                onClick={bulkClose}
                variant="destructive"
                size="sm"
                className="transition-all duration-200"
              >
                Close Selected
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && rows.length === 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-7 gap-4 font-semibold text-sm mb-4 px-4">
            <div />
            <div>Symbol</div>
            <div>Side</div>
            <div>Qty</div>
            <div>Entry</div>
            <div>Current</div>
            <div>P&L</div>
          </div>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && rows.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 bg-muted/30 rounded-lg border border-muted-foreground/10">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h4 className="text-lg font-semibold text-foreground mb-2">
            No Open Positions
          </h4>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            You don't have any open positions yet. Start trading to open your
            first position.
          </p>
        </div>
      )}

      {/* Positions Table */}
      {rows.length > 0 && (
        <div
          role="table"
          className="w-full border border-muted-foreground/10 rounded-lg overflow-hidden"
        >
          <div
            role="rowgroup"
            className="bg-muted/50 border-b border-muted-foreground/10"
          >
            <div
              role="row"
              className="grid grid-cols-7 gap-4 font-semibold text-sm px-4 py-3"
            >
              <div />
              <div>Symbol</div>
              <div>Side</div>
              <div>Qty</div>
              <div>Entry</div>
              <div>Current</div>
              <div>P&L</div>
            </div>
          </div>

          <div role="rowgroup">
            {rows.map((p: Position) => (
              <PositionRow
                key={p.id}
                position={p}
                onView={() => setSelected(p.id)}
                selectable
                selected={!!selectedIds[p.id]}
                onSelect={toggleSelect}
              />
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>
            Close {selectedCount} Position{selectedCount !== 1 ? 's' : ''}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action will close {selectedCount} selected position
            {selectedCount !== 1 ? 's' : ''}. This cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkClose}
              className="bg-destructive hover:bg-destructive/90"
            >
              Close Positions
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PositionsTable;
