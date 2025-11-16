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
      // Cast payload to any to avoid strict table typings in this context;
      // table columns `stop_loss`/`take_profit` exist in DB but may not be present
      // in generated TypeScript defs used by Supabase client here.
      await supabase.from('positions').update({ stop_loss: sl, take_profit: tp } as Record<string, Json | null>).eq('id', position.id);
    } finally {
      setSaving(false);
      onClose();
    }
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded p-4 w-full max-w-md">
        <h4 className="text-lg font-semibold">Position Details: {position.symbol}</h4>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>Entry: {position.entry_price}</div>
          <div>Current: {position.current_price}</div>
          <div>Quantity: {position.quantity}</div>
          <div>Side: {position.side}</div>
        </div>

        <div className="mt-4">
          <label className="block text-sm">Stop Loss</label>
          <input type="number" value={sl ?? ''} onChange={(e) => setSl(e.target.value ? Number(e.target.value) : undefined)} className="w-full p-2 border rounded" />
        </div>
        <div className="mt-2">
          <label className="block text-sm">Take Profit</label>
          <input type="number" value={tp ?? ''} onChange={(e) => setTp(e.target.value ? Number(e.target.value) : undefined)} className="w-full p-2 border rounded" />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button className="btn" onClick={onClose} disabled={saving}>Close</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save SL/TP'}</button>
        </div>
      </div>
    </div>
  );
};

export default PositionDetailDialog;
