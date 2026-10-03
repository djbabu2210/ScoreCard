import React from 'react';
import { ArrowLeftRight, MoreHorizontal, RotateCcw } from 'lucide-react';
import { ExtraType } from '../../types/cricket';

interface ScoringKeypadProps {
  onScoreRun: (runs: number, isBoundaryFour?: boolean, isBoundarySix?: boolean) => void;
  onQuickExtra: (type: ExtraType) => void;
  onOpenWicketModal: () => void;
  onOpenExtrasModal: () => void;
  onSwapEnds: () => void;
  onUndo: () => void;
  canUndo: boolean;
  disabled?: boolean;
}

export const ScoringKeypad: React.FC<ScoringKeypadProps> = ({
  onScoreRun,
  onQuickExtra,
  onOpenWicketModal,
  onOpenExtrasModal,
  onSwapEnds,
  onUndo,
  canUndo,
  disabled = false,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl select-none">
      {/* Grid of Scoring Buttons */}
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
        {/* Row 1: Singles / Regular Runs */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onScoreRun(0)}
          className="h-14 sm:h-16 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 font-bold text-lg sm:text-xl flex flex-col items-center justify-center transition shadow-xs"
        >
          <span>0</span>
          <span className="text-[10px] text-slate-400 font-normal">Dot</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onScoreRun(1)}
          className="h-14 sm:h-16 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white border border-slate-700 font-bold text-lg sm:text-xl flex flex-col items-center justify-center transition shadow-xs"
        >
          <span>1</span>
          <span className="text-[10px] text-slate-400 font-normal">Single</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onScoreRun(2)}
          className="h-14 sm:h-16 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white border border-slate-700 font-bold text-lg sm:text-xl flex flex-col items-center justify-center transition shadow-xs"
        >
          <span>2</span>
          <span className="text-[10px] text-slate-400 font-normal">Double</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onScoreRun(3)}
          className="h-14 sm:h-16 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white border border-slate-700 font-bold text-lg sm:text-xl flex flex-col items-center justify-center transition shadow-xs"
        >
          <span>3</span>
          <span className="text-[10px] text-slate-400 font-normal">Triple</span>
        </button>

        {/* Row 2: Boundaries (High visual prominence) */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onScoreRun(4, true, false)}
          className="h-16 sm:h-20 col-span-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-98 text-white font-black text-2xl sm:text-3xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition border border-emerald-400/40"
        >
          <span>4</span>
          <span className="text-xs font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full">
            FOUR
          </span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onScoreRun(6, false, true)}
          className="h-16 sm:h-20 col-span-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-98 text-white font-black text-2xl sm:text-3xl flex items-center justify-center gap-2 shadow-lg shadow-purple-950 transition border border-purple-400/40"
        >
          <span>6</span>
          <span className="text-xs font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full">
            SIX
          </span>
        </button>

        {/* Row 3: Standard Extras */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onQuickExtra('wide')}
          className="h-12 sm:h-14 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 text-amber-300 border border-amber-500/30 font-bold text-sm flex flex-col items-center justify-center transition"
        >
          <span>WD</span>
          <span className="text-[9px] text-amber-400/80 font-normal">Wide (+1)</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onQuickExtra('no_ball')}
          className="h-12 sm:h-14 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 text-amber-300 border border-amber-500/30 font-bold text-sm flex flex-col items-center justify-center transition"
        >
          <span>NB</span>
          <span className="text-[9px] text-amber-400/80 font-normal">No Ball (+1)</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onQuickExtra('bye')}
          className="h-12 sm:h-14 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-300 border border-slate-700 font-bold text-sm flex flex-col items-center justify-center transition"
        >
          <span>BYE</span>
          <span className="text-[9px] text-slate-400 font-normal">1 Bye</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onQuickExtra('leg_bye')}
          className="h-12 sm:h-14 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-300 border border-slate-700 font-bold text-sm flex flex-col items-center justify-center transition"
        >
          <span>LB</span>
          <span className="text-[9px] text-slate-400 font-normal">1 Leg Bye</span>
        </button>

        {/* Row 4: Big WICKET Button and Utility Actions */}
        <button
          type="button"
          disabled={disabled}
          onClick={onOpenWicketModal}
          className="h-14 sm:h-16 col-span-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-98 text-white font-black text-xl flex items-center justify-center gap-2 shadow-lg shadow-red-950 transition border border-red-500/40"
        >
          <span className="text-xl">☝️</span>
          <span>WICKET</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onOpenExtrasModal}
          className="h-14 sm:h-16 rounded-xl bg-slate-800 hover:bg-slate-750 active:scale-95 text-slate-200 border border-slate-700 font-bold text-xs flex flex-col items-center justify-center transition"
        >
          <MoreHorizontal className="w-5 h-5 text-amber-400 mb-0.5" />
          <span>More / Runs</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onSwapEnds}
          className="h-14 sm:h-16 rounded-xl bg-slate-800 hover:bg-slate-750 active:scale-95 text-slate-200 border border-slate-700 font-bold text-xs flex flex-col items-center justify-center transition"
        >
          <ArrowLeftRight className="w-4 h-4 text-emerald-400 mb-0.5" />
          <span>Swap Ends</span>
        </button>
      </div>

      {/* Bottom quick undo bar for immediate Scorer safety */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="text-[11px]">Tap any button to record delivery</span>
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="text-amber-400 hover:text-amber-300 disabled:opacity-30 disabled:hover:text-amber-400 font-semibold flex items-center gap-1.5 transition py-1 px-2 rounded-md hover:bg-slate-800"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Undo Last Ball</span>
        </button>
      </div>
    </div>
  );
};

