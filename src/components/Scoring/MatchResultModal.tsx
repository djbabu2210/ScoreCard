import React, { useEffect } from 'react';
import { Award, Share2, Trophy } from 'lucide-react';
import { Match } from '../../types/cricket';
import { fireMatchWonConfetti } from '../../utils/confetti';

interface MatchResultModalProps {
  isOpen: boolean;
  match: Match;
  onViewScorecard: () => void;
  onClose: () => void;
}

export const MatchResultModal: React.FC<MatchResultModalProps> = ({
  isOpen,
  match,
  onViewScorecard,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      fireMatchWonConfetti();
    }
  }, [isOpen]);

  if (!isOpen || !match.result) return null;

  const res = match.result;
  const inn1 = match.innings[0];
  const inn2 = match.innings[1];

  const team1 = inn1.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
  const team2 = inn1.battingTeamId === match.teamA.id ? match.teamB : match.teamA;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${match.title} Result`,
        text: `${res.summary} | ${team1.shortName} ${inn1.totalRuns}/${inn1.totalWickets} vs ${team2.shortName} ${inn2.totalRuns}/${inn2.totalWickets}`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `${match.title}\n${res.summary}\n${team1.shortName}: ${inn1.totalRuns}/${inn1.totalWickets}\n${team2.shortName}: ${inn2.totalRuns}/${inn2.totalWickets}`
      );
      alert('Match result copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center pt-2 pb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mb-3 shadow-lg shadow-amber-500/20">
            <Trophy className="w-9 h-9" />
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-emerald-400">Match Concluded</div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 leading-tight">
            {res.summary}
          </h2>
        </div>

        {/* Both Innings summary cards */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
            <div className="text-xs font-bold text-slate-400 truncate">{team1.name}</div>
            <div className="text-xl font-black text-white mt-1">
              {inn1.totalRuns}/{inn1.totalWickets}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              {Math.floor(inn1.legalBalls / 6)}.{inn1.legalBalls % 6} / {inn1.maxOvers} ov
            </div>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
            <div className="text-xs font-bold text-slate-400 truncate">{team2.name}</div>
            <div className="text-xl font-black text-white mt-1">
              {inn2.totalRuns}/{inn2.totalWickets}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              {Math.floor(inn2.legalBalls / 6)}.{inn2.legalBalls % 6} / {inn2.maxOvers} ov
            </div>
          </div>
        </div>

        {/* Player of the match banner */}
        {res.playerOfTheMatch && (
          <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/30 to-slate-900 border border-amber-500/40 p-3.5 rounded-2xl my-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Player of the Match
              </div>
              <div className="font-bold text-white text-base">
                {res.playerOfTheMatch.playerName}
              </div>
              <div className="text-xs text-slate-300">
                {res.playerOfTheMatch.reason}
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={onViewScorecard}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950 transition"
          >
            View Full Scorecard 📋
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Share2 className="w-4 h-4" /> Share Result
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium text-xs transition"
            >
              Back to Console
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

