import React, { useState } from 'react';
import { Position } from './PositionsGrid';

export const PositionCloseDialog: React.FC<{ position: Position; onClose: () => void; onConfirm: (quantity?: number) => Promise<void> }> = ({ position, onClose, onConfirm }) => {
  const [quantity, setQuantity] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await onConfirm(quantity);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded p-4 w-full max-w-md">
        <h4 className="text-lg font-semibold">Close Position: {position.symbol}</h4>
        <p className="text-sm text-muted-foreground">Quantity (leave blank to close full position)</p>
        <input
          value={quantity ?? ''}
          onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : undefined)}
          type="number"
          className="border rounded w-full p-4 my-2"
          placeholder={`${position.quantity}`}
        />
        <div className="flex justify-end gap-4">
          <button className="btn" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? 'Closing...' : 'Confirm Close'}</button>
        </div>
      </div>
    </div>
  );
};

export default PositionCloseDialog;
