import React, { useState, memo } from 'react';
import { calculateUnrealizedPnL, getPositionColor } from '@/lib/trading/positionUtils';
import type { Position } from '@/types/position';
import { PositionCloseDialog } from './PositionCloseDialog';
import { usePositionClose } from '@/hooks/usePositionClose';

export const PositionRow = memo(({ position, onView, selectable = false, selected = false, onSelect }: { position: Position; onView?: () => void; selectable?: boolean; selected?: boolean; onSelect?: (id: string, checked: boolean) => void }) => {
  const pnl = calculateUnrealizedPnL(position);
  const color = getPositionColor(position);
  const [openClose, setOpenClose] = useState(false);

  const { closePosition, isClosing } = usePositionClose();

  const onCloseClicked = () => setOpenClose(true);

  return (
    <div role="row" className="grid grid-cols-6 gap-4 items-center py-4 border-b">
      {selectable ? (
        <div role="cell"><input aria-label={`select-${position.id}`} type="checkbox" checked={selected} onChange={(e) => onSelect && onSelect(position.id, e.target.checked)} /></div>
      ) : null}

      <div role="cell">{position.symbol}</div>
      <div role="cell">{position.side}</div>
      <div role="cell">{position.quantity}</div>
      <div role="cell">{position.entry_price.toFixed(4)}</div>
      <div role="cell">{position.current_price.toFixed(4)}</div>
      <div role="cell" className={`font-medium ${color === 'green' ? 'text-buy text-green-600' : color === 'red' ? 'text-sell text-red-600' : ''}`}>
        {pnl.toFixed(2)}
      </div>

      <div className="col-span-6 mt-2">
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
}, (prevProps, nextProps) => {
  // Custom comparison to optimize re-renders
  // Only re-render if position data changed or selection state changed
  const positionChanged = prevProps.position.id !== nextProps.position.id ||
    prevProps.position.symbol !== nextProps.position.symbol ||
    prevProps.position.side !== nextProps.position.side ||
    prevProps.position.quantity !== nextProps.position.quantity ||
    prevProps.position.entry_price !== nextProps.position.entry_price ||
    prevProps.position.current_price !== nextProps.position.current_price;
  
  const selectionChanged = prevProps.selected !== nextProps.selected ||
    prevProps.selectable !== nextProps.selectable;
  
  const callbacksChanged = prevProps.onView !== nextProps.onView ||
    prevProps.onSelect !== nextProps.onSelect;
  
  return !positionChanged && !selectionChanged && !callbacksChanged;
});

export default PositionRow;
