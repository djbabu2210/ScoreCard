import React, { useState } from 'react';
import { ExtraType } from '../../types/cricket';

interface ExtrasModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: ExtraType;
  onConfirmExtra: (params: {
    extraType: ExtraType;
    runsBat: number;
    runsExtra: number;
    isBoundaryFour?: boolean;
    isBoundarySix?: boolean;
    comment?: string;
  }) => void;
}

export const ExtrasModal: React.FC<ExtrasModalProps> = ({
  isOpen,
  onClose,
  initialType = 'wide',
  onConfirmExtra,
}) => {
  const [selectedType, setSelectedType] = useState<ExtraType>(initialType);
  const [additionalRuns, setAdditionalRuns] = useState<number>(0);
  const [isBoundaryFour, setIsBoundaryFour] = useState<boolean>(false);
  const [isBoundarySix, setIsBoundarySix] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    let runsBat = 0;
    let runsExtra = 0;

    if (selectedType === 'wide') {
      // Wide automatically gives 1 run + additional runs (e.g. overthrows or wide boundary)
      runsExtra = 1 + additionalRuns;
      runsBat = 0; // runs on wide are never batsman runs
    } else if (selectedType === 'no_ball') {
      // No ball gives 1 extra run + any bat runs or boundary
      runsExtra = 1;
      runsBat = additionalRuns;
    } else if (selectedType === 'bye' || selectedType === 'leg_bye') {
      // Byes / Leg byes are purely extras
      runsExtra = additionalRuns === 0 ? 1 : additionalRuns;
      runsBat = 0;
    } else if (selectedType === 'penalty') {
      runsExtra = additionalRuns === 0 ? 5 : additionalRuns;
      runsBat = 0;
    }

    onConfirmExtra({
      extraType: selectedType,
      runsBat,
      runsExtra,
      isBoundaryFour,
      isBoundarySix,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Extras & Custom Delivery
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg p-1"
          >
            ✕
          </button>
        </div>

        <div className="py-4 space-y-4">
          {/* Extra Types */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Extra Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { type: 'wide', label: 'Wide (Wd)' },
                  { type: 'no_ball', label: 'No Ball (Nb)' },
                  { type: 'bye', label: 'Bye (B)' },
                  { type: 'leg_bye', label: 'Leg Bye (LB)' },
                  { type: 'penalty', label: 'Penalty (5)' },
                ] as const
              ).map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    setSelectedType(item.type);
                    setAdditionalRuns(0);
                    setIsBoundaryFour(false);
                    setIsBoundarySix(false);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    selectedType === item.type
                      ? 'bg-amber-600/20 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Runs */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {selectedType === 'wide'
                ? 'Additional Runs on Wide (byes / overthrows / boundary)'
                : selectedType === 'no_ball'
                ? 'Runs Scored off Bat on No Ball'
                : 'Runs Completed'}
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {[0, 1, 2, 3, 4, 6].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setAdditionalRuns(r);
                    setIsBoundaryFour(r === 4);
                    setIsBoundarySix(r === 6);
                  }}
                  className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                    additionalRuns === r
                      ? 'bg-emerald-600 border-emerald-400 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs text-slate-300 flex justify-between items-center">
            <span>Total runs added to team:</span>
            <span className="text-base font-bold text-emerald-400">
              {selectedType === 'wide'
                ? 1 + additionalRuns
                : selectedType === 'no_ball'
                ? 1 + additionalRuns
                : selectedType === 'penalty'
                ? additionalRuns === 0 ? 5 : additionalRuns
                : additionalRuns === 0 ? 1 : additionalRuns}{' '}
              run(s)
            </span>
          </div>
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
            className="flex-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md"
          >
            Add Extra
          </button>
        </div>
      </div>
    </div>
  );
};

