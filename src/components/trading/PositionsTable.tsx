import React, { useMemo, useState } from 'react';
import { PositionsGrid, Position, calculateUnrealizedPnL } from './PositionsGrid';
import { useRealtimePositions } from '@/hooks/useRealtimePositions';
import { PositionRow } from './PositionRow';

export const PositionsTable: React.FC<{ userId: string | null }> = ({ userId }) => {
  const { positions, isLoading } = useRealtimePositions(userId || null, { autoSubscribe: true });
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  const rows = useMemo(() => positions || [], [positions]);

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => ({ ...prev, [id]: checked }));
  };

  const bulkClose = async () => {
    const ids = Object.entries(selectedIds).filter(([_, v]) => v).map(([k]) => k);
    if (ids.length === 0) return;

    // naive bulk close using usePositionClose - call one by one
    const { closePosition } = await import('@/hooks/usePositionClose').then((m) => m.usePositionClose());

    for (const id of ids) {
       
      await closePosition({ position_id: id });
    }

    // clear selection
    setSelectedIds({});
  };

  return (
    <div className="positions-table">
      <div className="header flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">Open Positions</h3>
        <div className="flex items-center gap-4">
          <div>{isLoading ? 'Loading...' : `${rows.length} positions`}</div>
          <button onClick={bulkClose} className="btn btn-sm">Close Selected</button>
        </div>
      </div>

      <div role="table" className="w-full">
        <div role="rowgroup">
          <div role="row" className="grid grid-cols-7 gap-4 font-semibold text-sm mb-2">
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
            <PositionRow key={p.id} position={p} onView={() => setSelected(p.id)} selectable selected={!!selectedIds[p.id]} onSelect={toggleSelect} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PositionsTable;
