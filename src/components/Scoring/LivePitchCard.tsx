import React from 'react';
import { ArrowLeftRight, UserCheck } from 'lucide-react';
import { InningsState, Player } from '../../types/cricket';

interface LivePitchCardProps {
  innings: InningsState;
  battingPlayers: Player[];
  bowlingPlayers: Player[];
  onSwapStriker: () => void;
  onChangeBowler: () => void;
  onChangeStriker: () => void;
  onChangeNonStriker: () => void;
}

export const LivePitchCard: React.FC<LivePitchCardProps> = ({
  innings,
  battingPlayers,
  bowlingPlayers,
  onSwapStriker,
  onChangeBowler,
  onChangeStriker,
  onChangeNonStriker,
}) => {
  const striker = battingPlayers.find((p) => p.id === innings.currentStrikerId);
  const nonStriker = battingPlayers.find((p) => p.id === innings.currentNonStrikerId);
  const bowler = bowlingPlayers.find((p) => p.id === innings.currentBowlerId);

  const strikerStats = striker ? innings.batters[striker.id] : undefined;
  const nonStrikerStats = nonStriker ? innings.batters[nonStriker.id] : undefined;
  const bowlerStats = bowler ? innings.bowlers[bowler.id] : undefined;

  // Calculate partnership since last wicket
  let partnershipRuns = 0;
  let partnershipBalls = 0;
  const lastWicketIndex = [...innings.history].reverse().findIndex((b) => b.isWicket);
  const currentPartnershipBalls =
    lastWicketIndex === -1 ? innings.history : innings.history.slice(innings.history.length - lastWicketIndex);

  currentPartnershipBalls.forEach((b) => {
    partnershipRuns += b.runsBat + b.runsExtra;
    if (b.isLegal) partnershipBalls += 1;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
      {/* Batters Section */}
      <div>
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Batting</span>
          <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 font-mono">
            <span className="w-8 text-right">R</span>
            <span className="w-8 text-right">B</span>
            <span className="w-6 text-right">4s</span>
            <span className="w-6 text-right">6s</span>
            <span className="w-12 text-right">SR</span>
          </div>
        </div>

        {/* Striker Row */}
        <div className="flex items-center justify-between py-2 border-b border-slate-800/40 bg-emerald-950/20 px-2 rounded-xl">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-emerald-400 font-black text-sm">🏏</span>
            <button
              onClick={onChangeStriker}
              className="text-left font-bold text-white text-sm truncate hover:text-emerald-300 transition"
              title="Click to change striker"
            >
              {striker ? striker.name : 'Select Striker'} *
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono font-semibold">
            <span className="w-8 text-right font-black text-white text-sm">
              {strikerStats ? strikerStats.runs : 0}
            </span>
            <span className="w-8 text-right text-slate-400">
              {strikerStats ? strikerStats.balls : 0}
            </span>
            <span className="w-6 text-right text-slate-400">
              {strikerStats ? strikerStats.fours : 0}
            </span>
            <span className="w-6 text-right text-slate-400">
              {strikerStats ? strikerStats.sixes : 0}
            </span>
            <span className="w-12 text-right text-emerald-400">
              {strikerStats ? strikerStats.strikeRate.toFixed(1) : '0.0'}
            </span>
          </div>
        </div>

        {/* Non-Striker Row */}
        <div className="flex items-center justify-between py-2 px-2 rounded-xl">
          <div className="flex items-center gap-2 overflow-hidden pl-4">
            <button
              onClick={onChangeNonStriker}
              className="text-left font-medium text-slate-300 text-sm truncate hover:text-white transition"
              title="Click to change non-striker"
            >
              {nonStriker ? nonStriker.name : 'Select Non-Striker'}
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono font-medium">
            <span className="w-8 text-right font-bold text-slate-200">
              {nonStrikerStats ? nonStrikerStats.runs : 0}
            </span>
            <span className="w-8 text-right text-slate-400">
              {nonStrikerStats ? nonStrikerStats.balls : 0}
            </span>
            <span className="w-6 text-right text-slate-400">
              {nonStrikerStats ? nonStrikerStats.fours : 0}
            </span>
            <span className="w-6 text-right text-slate-400">
              {nonStrikerStats ? nonStrikerStats.sixes : 0}
            </span>
            <span className="w-12 text-right text-slate-300">
              {nonStrikerStats ? nonStrikerStats.strikeRate.toFixed(1) : '0.0'}
            </span>
          </div>
        </div>

        {/* Partnership & Quick Swap */}
        <div className="flex items-center justify-between pt-1.5 text-xs text-slate-400 border-t border-slate-800/40">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Partnership:</span>
            <span className="font-bold text-slate-200 font-mono">
              {partnershipRuns} <span className="text-slate-400 font-normal">({partnershipBalls}b)</span>
            </span>
          </div>

          <button
            onClick={onSwapStriker}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/80 text-emerald-400 hover:bg-slate-700 text-[11px] font-semibold transition"
            title="Swap strike"
          >
            <ArrowLeftRight className="w-3 h-3" />
            <span>Swap Strike</span>
          </button>
        </div>
      </div>

      {/* Bowler Section */}
      <div className="pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Bowling</span>
          <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 font-mono">
            <span className="w-8 text-right">O</span>
            <span className="w-6 text-right">M</span>
            <span className="w-8 text-right">R</span>
            <span className="w-6 text-right">W</span>
            <span className="w-12 text-right">ECON</span>
          </div>
        </div>

        <div className="flex items-center justify-between py-2 px-2 bg-slate-800/40 rounded-xl">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-amber-400 text-xs">🎯</span>
            <div>
              <div className="font-bold text-white text-sm truncate">
                {bowler ? bowler.name : 'Select Bowler'}
              </div>
              <button
                onClick={onChangeBowler}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                <UserCheck className="w-3 h-3" /> Change Bowler
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono font-medium">
            <span className="w-8 text-right font-bold text-slate-200">
              {bowlerStats ? bowlerStats.oversFormatted : '0.0'}
            </span>
            <span className="w-6 text-right text-slate-400">
              {bowlerStats ? bowlerStats.maidens : 0}
            </span>
            <span className="w-8 text-right font-bold text-slate-200">
              {bowlerStats ? bowlerStats.runsConceded : 0}
            </span>
            <span className="w-6 text-right font-black text-red-400">
              {bowlerStats ? bowlerStats.wickets : 0}
            </span>
            <span className="w-12 text-right text-slate-300">
              {bowlerStats ? bowlerStats.economyRate.toFixed(2) : '0.00'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

