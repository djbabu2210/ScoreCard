import React, { useState } from 'react';
import { Match, Player } from '../../types/cricket';

interface MatchEndInningsModalProps {
  isOpen: boolean;
  match: Match;
  chasingTeamPlayers: Player[];
  defendingTeamPlayers: Player[];
  onStartSecondInnings: (params: {
    strikerId: string;
    nonStrikerId: string;
    openingBowlerId: string;
  }) => void;
}

export const MatchEndInningsModal: React.FC<MatchEndInningsModalProps> = ({
  isOpen,
  match,
  chasingTeamPlayers,
  defendingTeamPlayers,
  onStartSecondInnings,
}) => {
  const firstInnings = match.innings[0];
  const target = (match.target || firstInnings.totalRuns + 1);

  const [strikerId, setStrikerId] = useState<string>(chasingTeamPlayers[0]?.id || '');
  const [nonStrikerId, setNonStrikerId] = useState<string>(chasingTeamPlayers[1]?.id || '');
  const [openingBowlerId, setOpeningBowlerId] = useState<string>(defendingTeamPlayers[defendingTeamPlayers.length - 1]?.id || defendingTeamPlayers[0]?.id || '');

  if (!isOpen) return null;

  const handleStart = () => {
    if (!strikerId || !nonStrikerId || !openingBowlerId) {
      alert('Please select Striker, Non-Striker, and Opening Bowler.');
      return;
    }
    if (strikerId === nonStrikerId) {
      alert('Striker and Non-Striker must be two different players.');
      return;
    }
    onStartSecondInnings({
      strikerId,
      nonStrikerId,
      openingBowlerId,
    });
  };

  const firstBattingTeam = firstInnings.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
  const chasingTeam = firstInnings.battingTeamId === match.teamA.id ? match.teamB : match.teamA;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-center pb-4 border-b border-slate-800">
          <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            Innings Break
          </span>
          <h2 className="text-2xl font-black text-white">1st Innings Concluded</h2>
          <p className="text-slate-400 text-sm mt-1">
            {firstBattingTeam.name} scored{' '}
            <span className="text-white font-bold">{firstInnings.totalRuns}/{firstInnings.totalWickets}</span> in{' '}
            {firstInnings.maxOvers} overs.
          </p>

          <div className="mt-4 p-4 bg-emerald-950/40 border border-emerald-600/40 rounded-xl">
            <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Target for {chasingTeam.name}</div>
            <div className="text-3xl font-black text-white mt-1">
              {target} <span className="text-sm font-normal text-emerald-300">runs</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Required Run Rate: {((target) / firstInnings.maxOvers).toFixed(2)} rpo
            </div>
          </div>
        </div>

        <div className="py-5 space-y-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Setup 2nd Innings Openers ({chasingTeam.name})
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Opening Striker *</label>
            <select
              value={strikerId}
              onChange={(e) => setStrikerId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm"
            >
              {chasingTeamPlayers.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === nonStrikerId}>
                  {p.name} ({p.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Opening Non-Striker *</label>
            <select
              value={nonStrikerId}
              onChange={(e) => setNonStrikerId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm"
            >
              {chasingTeamPlayers.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === strikerId}>
                  {p.name} ({p.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Opening Bowler ({firstBattingTeam.name}) *
            </label>
            <select
              value={openingBowlerId}
              onChange={(e) => setOpeningBowlerId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm"
            >
              {defendingTeamPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.role} {p.bowlingStyle ? `• ${p.bowlingStyle}` : ''})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-lg shadow-emerald-950 transition"
          >
            Start 2nd Innings ⚡
          </button>
        </div>
      </div>
    </div>
  );
};

