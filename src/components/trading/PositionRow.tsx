import React, { useState } from 'react';
import { calculateUnrealizedPnL, getPositionColor } from './PositionsGrid';
import type { Position } from '@/types/position';
import { PositionCloseDialog } from './PositionCloseDialog';
import { usePositionClose } from '@/hooks/usePositionClose';

export const PositionRow: React.FC<{ position: Position; onView?: () => void; selectable?: boolean; selected?: boolean; onSelect?: (id: string, checked: boolean) => void }> = ({ position, onView, selectable = false, selected = false, onSelect }) => {
  const pnl = calculateUnrealizedPnL(position);
  const color = getPositionColor(position);
  const [openClose, setOpenClose] = useState(false);

  const { closePosition, isClosing } = usePositionClose();

  const onCloseClicked = () => setOpenClose(true);

  return (
    <div role="row" className="grid grid-cols-6 gap-2 items-center py-2 border-b">
      {selectable ? (
        <div role="cell"><input aria-label={`select-${position.id}`} type="checkbox" checked={selected} onChange={(e) => onSelect && onSelect(position.id, e.target.checked)} /></div>
      ) : null}

      <div role="cell">{position.symbol}</div>
      <div role="cell">{position.side}</div>
      <div role="cell">{position.quantity}</div>
      <div role="cell">{position.entry_price.toFixed(4)}</div>
      <div role="cell">{position.current_price.toFixed(4)}</div>
      <div role="cell" className={`font-medium ${color === 'green' ? 'text-green-600' : color === 'red' ? 'text-red-600' : ''}`}>
        {pnl.toFixed(2)}
      </div>

      <div className="col-span-6 mt-1">
        <button onClick={onCloseClicked} disabled={isClosing} className="btn btn-sm mr-2">Close</button>
        <button onClick={onView} className="btn btn-ghost btn-sm">Details</button>
      </div>

      {openClose && (
        <PositionCloseDialog
          position={position}
          onClose={() => setOpenClose(false)}
          onConfirm={async (qty) => {
            await closePosition({ position_id: position.id, quantity: qty });
            setOpenClose(false);
          }}
        />
      )}
    </div>
  );
};

export default PositionRow;
