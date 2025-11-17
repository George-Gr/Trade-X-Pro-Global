import React, { useState } from 'react';
import type { Position } from '@/types/position';
import type { Json } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';

export const PositionDetailDialog: React.FC<{ position: Position; onClose: () => void }> = ({ position, onClose }) => {
  const [sl, setSl] = useState<number | undefined>((position as Record<string, unknown>).stop_loss as number);
  const [tp, setTp] = useState<number | undefined>((position as Record<string, unknown>).take_profit as number);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('modify-position', {
        body: {
          position_id: position.id,
          stop_loss: sl,
          take_profit: tp,
        },
      });

      if (response.error) {
        throw response.error;
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to update position');
      }
    } catch (error) {
      console.error('Failed to update position:', error);
      alert(error instanceof Error ? error.message : 'Failed to update position');
    } finally {
      setSaving(false);
      onClose();
    }
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded p-4 w-full max-w-md">
        <h4 className="text-lg font-semibold">Position Details: {position.symbol}</h4>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>Entry: {position.entry_price}</div>
          <div>Current: {position.current_price}</div>
          <div>Quantity: {position.quantity}</div>
          <div>Side: {position.side}</div>
        </div>

        <div className="mt-4">
          <label className="block text-sm">Stop Loss</label>
          <input type="number" value={sl ?? ''} onChange={(e) => setSl(e.target.value ? Number(e.target.value) : undefined)} className="w-full p-4 border rounded" />
        </div>
        <div className="mt-2">
          <label className="block text-sm">Take Profit</label>
          <input type="number" value={tp ?? ''} onChange={(e) => setTp(e.target.value ? Number(e.target.value) : undefined)} className="w-full p-4 border rounded" />
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button className="btn" onClick={onClose} disabled={saving}>Close</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save SL/TP'}</button>
        </div>
      </div>
    </div>
  );
};

export default PositionDetailDialog;
