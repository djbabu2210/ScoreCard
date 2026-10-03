import React, { useState } from 'react';
import { Player } from '../../types/cricket';

interface NewBatterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  availableBatters: Player[];
  onSelectBatter: (batterId: string) => void;
}

export const NewBatterModal: React.FC<NewBatterModalProps> = ({
  isOpen,
  onClose,
  title,
  availableBatters,
  onSelectBatter,
}) => {
  const [selectedId, setSelectedId] = useState<string>('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedId) {
      alert('Please select a batsman.');
      return;
    }
    onSelectBatter(selectedId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg p-1">
            ✕
          </button>
        </div>

        <div className="py-4 space-y-2 max-h-64 overflow-y-auto">
          {availableBatters.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-400">
              No more batsmen available in squad.
            </div>
          ) : (
            availableBatters.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedId(p.id)}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  selectedId === p.id
                    ? 'border-emerald-500 bg-emerald-950/40 text-white ring-1 ring-emerald-500'
                    : 'border-slate-800 bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="font-semibold text-sm text-white">{p.name}</div>
                  <div className="text-xs text-slate-400 capitalize">{p.role}</div>
                </div>
                {p.battingStyle && (
                  <span className="text-[11px] bg-slate-700/60 px-2 py-0.5 rounded text-slate-300 uppercase">
                    {p.battingStyle}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-slate-800 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedId}
            className="flex-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

