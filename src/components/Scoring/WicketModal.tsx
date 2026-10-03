import React, { useState } from 'react';
import { DismissalType, ExtraType, Player } from '../../types/cricket';

interface WicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  striker: Player;
  nonStriker: Player;
  bowler: Player;
  bowlingTeamPlayers: Player[];
  availableBatters: Player[];
  onConfirmWicket: (params: {
    dismissalType: DismissalType;
    outPlayerId: string;
    fielderId?: string;
    runsCompleted: number;
    extraType?: ExtraType;
    nextBatterId: string;
  }) => void;
}

export const WicketModal: React.FC<WicketModalProps> = ({
  isOpen,
  onClose,
  striker,
  nonStriker,
  bowler,
  bowlingTeamPlayers,
  availableBatters,
  onConfirmWicket,
}) => {
  const [dismissalType, setDismissalType] = useState<DismissalType>('caught');
  const [outPlayerId, setOutPlayerId] = useState<string>(striker.id);
  const [fielderId, setFielderId] = useState<string>('');
  const [runsCompleted, setRunsCompleted] = useState<number>(0);
  const [extraType, setExtraType] = useState<ExtraType | undefined>(undefined);
  const [nextBatterId, setNextBatterId] = useState<string>(availableBatters[0]?.id || '');

  if (!isOpen) return null;

  const requiresFielder = ['caught', 'run_out', 'stumped'].includes(dismissalType);
  const isRunOut = dismissalType === 'run_out';

  const handleConfirm = () => {
    if (availableBatters.length > 0 && !nextBatterId) {
      alert('Please select the incoming batsman.');
      return;
    }
    onConfirmWicket({
      dismissalType,
      outPlayerId,
      fielderId: requiresFielder && fielderId ? fielderId : undefined,
      runsCompleted: isRunOut ? runsCompleted : 0,
      extraType: isRunOut ? extraType : undefined,
      nextBatterId,
    });
  };

  const dismissalOptions: { type: DismissalType; label: string; desc: string }[] = [
    { type: 'bowled', label: 'Bowled', desc: 'Bails dislodged by ball' },
    { type: 'caught', label: 'Caught', desc: 'Caught by fielder/keeper' },
    { type: 'caught_and_bowled', label: 'Caught & Bowled', desc: 'Caught by bowler' },
    { type: 'lbw', label: 'LBW', desc: 'Leg before wicket' },
    { type: 'run_out', label: 'Run Out', desc: 'Striker or Non-striker' },
    { type: 'stumped', label: 'Stumped', desc: 'By wicketkeeper' },
    { type: 'hit_wicket', label: 'Hit Wicket', desc: 'Batter broke own wicket' },
    { type: 'retired_hurt', label: 'Retired Hurt', desc: 'Retired due to injury' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xs px-5 py-4 border-b border-slate-800 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
            <h3 className="text-lg font-bold text-white">Fall of Wicket</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl p-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Dismissal Method Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Dismissal Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {dismissalOptions.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => {
                    setDismissalType(opt.type);
                    if (opt.type !== 'run_out') {
                      setOutPlayerId(striker.id);
                    }
                  }}
                  className={`p-2.5 rounded-xl text-left border text-sm font-medium transition-all ${
                    dismissalType === opt.type
                      ? 'border-red-500 bg-red-500/15 text-red-200 shadow-sm'
                      : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold text-white">{opt.label}</div>
                  <div className="text-[11px] text-slate-400">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Out Batsman (Especially crucial if Run Out) */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Batsman Out
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOutPlayerId(striker.id)}
                className={`p-3 rounded-xl border text-sm text-left transition-all ${
                  outPlayerId === striker.id
                    ? 'border-red-500 bg-red-950/40 text-white font-semibold ring-1 ring-red-500'
                    : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="text-xs text-red-400 font-bold uppercase">Striker *</div>
                <div className="truncate font-semibold text-white">{striker.name}</div>
              </button>
              <button
                type="button"
                onClick={() => setOutPlayerId(nonStriker.id)}
                className={`p-3 rounded-xl border text-sm text-left transition-all ${
                  outPlayerId === nonStriker.id
                    ? 'border-red-500 bg-red-950/40 text-white font-semibold ring-1 ring-red-500'
                    : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="text-xs text-slate-400 uppercase">Non-Striker</div>
                <div className="truncate font-semibold text-white">{nonStriker.name}</div>
              </button>
            </div>
          </div>

          {/* Fielder / Catcher Selection */}
          {requiresFielder && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                {dismissalType === 'caught'
                  ? 'Caught By (Fielder)'
                  : dismissalType === 'stumped'
                  ? 'Stumped By (Wicketkeeper)'
                  : 'Fielder (Throw / Direct Hit)'}
              </label>
              <select
                value={fielderId}
                onChange={(e) => setFielderId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Fielder / Keeper</option>
                {bowlingTeamPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.id === bowler.id ? '(Bowler)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Run Out Specifics: Runs completed before run out */}
          {isRunOut && (
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Runs Completed Before Run Out
                </label>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRunsCompleted(r)}
                      className={`flex-1 py-1.5 rounded-lg text-sm font-semibold border ${
                        runsCompleted === r
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Delivery Type (if Wide / No Ball)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setExtraType(undefined)}
                    className={`flex-1 py-1 text-xs rounded-lg border font-medium ${
                      !extraType ? 'bg-slate-700 text-white border-slate-600' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    Legal Ball
                  </button>
                  <button
                    type="button"
                    onClick={() => setExtraType('wide')}
                    className={`flex-1 py-1 text-xs rounded-lg border font-medium ${
                      extraType === 'wide' ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    Wide
                  </button>
                  <button
                    type="button"
                    onClick={() => setExtraType('no_ball')}
                    className={`flex-1 py-1 text-xs rounded-lg border font-medium ${
                      extraType === 'no_ball' ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    No Ball
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Incoming Batsman Selection */}
          {availableBatters.length > 0 ? (
            <div>
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">
                Next Batsman In *
              </label>
              <select
                value={nextBatterId}
                onChange={(e) => setNextBatterId(e.target.value)}
                className="w-full bg-slate-800 border border-emerald-500/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select next batter</option>
                {availableBatters.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.role})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-xl text-xs text-red-300">
              Innings Complete! All available batsmen have batted or are out.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-xs p-4 border-t border-slate-800 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition shadow-lg shadow-red-900/40"
          >
            Confirm Out
          </button>
        </div>
      </div>
    </div>
  );
};

