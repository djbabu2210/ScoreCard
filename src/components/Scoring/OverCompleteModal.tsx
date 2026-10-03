import React, { useState } from 'react';
import { BowlerStats, Player } from '../../types/cricket';

interface OverCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  overNumber: number;
  lastBowler: Player;
  bowlingTeamPlayers: Player[];
  bowlerStats: Record<string, BowlerStats>;
  maxOversPerBowler: number;
  onSelectBowler: (bowlerId: string) => void;
}

export const OverCompleteModal: React.FC<OverCompleteModalProps> = ({
  isOpen,
  onClose,
  overNumber,
  lastBowler,
  bowlingTeamPlayers,
  bowlerStats,
  maxOversPerBowler,
  onSelectBowler,
}) => {
  const [selectedBowlerId, setSelectedBowlerId] = useState<string>('');
  const [allowConsecutiveOver, setAllowConsecutiveOver] = useState<boolean>(false);

  if (!isOpen) return null;

  const eligibleBowlers = bowlingTeamPlayers.filter((p) => {
    if (!allowConsecutiveOver && p.id === lastBowler.id) return false;
    const stats = bowlerStats[p.id];
    if (stats && maxOversPerBowler > 0) {
      const legalBalls = stats.legalBalls;
      if (legalBalls >= maxOversPerBowler * 6) return false;
    }
    return true;
  });

  const handleConfirm = () => {
    if (!selectedBowlerId) {
      alert('Please select a bowler for the next over.');
      return;
    }
    onSelectBowler(selectedBowlerId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Over {overNumber} Completed
            </div>
            <h3 className="text-lg font-bold text-white">Select Next Bowler</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg p-1"
          >
            ✕
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div className="text-xs text-slate-400 bg-slate-800/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
            <span>Last Over bowled by:</span>
            <span className="font-semibold text-slate-200">{lastBowler.name}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Available Bowlers ({eligibleBowlers.length})
            </label>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {eligibleBowlers.map((p) => {
                const stats = bowlerStats[p.id];
                const overs = stats ? stats.oversFormatted : '0.0';
                const wickets = stats ? stats.wickets : 0;
                const runs = stats ? stats.runsConceded : 0;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedBowlerId(p.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      selectedBowlerId === p.id
                        ? 'border-emerald-500 bg-emerald-950/40 text-white ring-1 ring-emerald-500'
                        : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm text-white">{p.name}</div>
                      <div className="text-xs text-slate-400">
                        {p.role} {p.bowlingStyle ? `• ${p.bowlingStyle}` : ''}
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="font-mono text-emerald-400 font-bold">
                        {wickets}/{runs}
                      </div>
                      <div className="text-slate-400 font-mono">{overs} ov</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="allowConsecutive"
              checked={allowConsecutiveOver}
              onChange={(e) => setAllowConsecutiveOver(e.target.checked)}
              className="rounded-sm border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-800"
            />
            <label htmlFor="allowConsecutive" className="text-xs text-slate-400 cursor-pointer">
              Allow same bowler (Gully / Practice cricket rule)
            </label>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedBowlerId}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold transition shadow-lg shadow-emerald-950"
          >
            Start Next Over
          </button>
        </div>
      </div>
    </div>
  );
};

