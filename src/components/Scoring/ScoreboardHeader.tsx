import React from 'react';
import { ArrowLeft, RotateCcw, Share2, SquareCheck } from 'lucide-react';
import { Match } from '../../types/cricket';
import { calcRequiredRunRate, calcRunRate, formatOvers } from '../../utils/cricketEngine';

interface ScoreboardHeaderProps {
  match: Match;
  activeTab: 'scoring' | 'scorecard' | 'commentary' | 'info';
  onTabChange: (tab: 'scoring' | 'scorecard' | 'commentary' | 'info') => void;
  onBack: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onEndInningsPrompt: () => void;
}

export const ScoreboardHeader: React.FC<ScoreboardHeaderProps> = ({
  match,
  activeTab,
  onTabChange,
  onBack,
  onUndo,
  canUndo,
  onEndInningsPrompt,
}) => {
  const currentInn = match.innings[match.currentInningsIndex];
  const battingTeam = currentInn.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
  const bowlingTeam = currentInn.battingTeamId === match.teamA.id ? match.teamB : match.teamA;

  const crr = calcRunRate(currentInn.totalRuns, currentInn.legalBalls);
  const oversFormatted = formatOvers(currentInn.legalBalls);

  const isSecondInn = match.currentInningsIndex === 1;
  const target = match.target;
  const runsNeeded = target ? Math.max(0, target - currentInn.totalRuns) : 0;
  const ballsRemaining = Math.max(0, currentInn.maxOvers * 6 - currentInn.legalBalls);
  const rrr = target ? calcRequiredRunRate(runsNeeded, ballsRemaining) : 0;
  const projectedScore = Math.round(crr * currentInn.maxOvers);

  const handleShare = () => {
    const text = `${match.title} | ${battingTeam.shortName} ${currentInn.totalRuns}/${currentInn.totalWickets} (${oversFormatted}/${currentInn.maxOvers} ov)`;
    if (navigator.share) {
      navigator.share({ title: match.title, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Match summary copied to clipboard!');
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800 sticky top-0 z-20">
      {/* Top action row */}
      <div className="max-w-4xl mx-auto px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  match.status === 'live'
                    ? 'bg-emerald-500 animate-live'
                    : match.status === 'break'
                    ? 'bg-amber-500'
                    : 'bg-slate-400'
                }`}
              />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {match.status === 'live'
                  ? `${currentInn.inningsNumber === 1 ? '1st' : '2nd'} Innings Live`
                  : match.status === 'break'
                  ? 'Innings Break'
                  : 'Match Completed'}
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-300 truncate max-w-[200px] sm:max-w-md">
              {match.title}
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-amber-400 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 flex items-center gap-1 text-xs font-semibold transition"
            title="Undo last delivery"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          {match.status === 'live' && (
            <button
              onClick={onEndInningsPrompt}
              className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center gap-1 text-xs font-medium transition"
              title="End Innings early"
            >
              <SquareCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">End Inn</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Share Score"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Score Centerpiece */}
      <div className="max-w-4xl mx-auto px-4 py-2">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-800/90 shadow-inner">
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: battingTeam.color }}
                />
                <span className="text-sm font-black text-slate-200 uppercase tracking-wide">
                  {battingTeam.name}
                </span>
                <span className="text-xs text-slate-400">vs {bowlingTeam.shortName}</span>
              </div>

              {/* Big Score Numbers */}
              <div className="flex items-baseline gap-2.5 mt-1">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {currentInn.totalRuns}
                  <span className="text-red-400 font-bold">/{currentInn.totalWickets}</span>
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-400 font-mono">
                  ({oversFormatted} / {currentInn.maxOvers} ov)
                </span>
              </div>
            </div>

            {/* Run Rate & Target Stats */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-3 text-xs">
                <div>
                  <span className="text-slate-400">CRR: </span>
                  <span className="font-bold text-white font-mono">{crr.toFixed(2)}</span>
                </div>
                {isSecondInn && target ? (
                  <div>
                    <span className="text-amber-400">RRR: </span>
                    <span className="font-bold text-amber-300 font-mono">{rrr.toFixed(2)}</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-slate-400">Proj: </span>
                    <span className="font-bold text-slate-200 font-mono">{projectedScore}</span>
                  </div>
                )}
              </div>

              {isSecondInn && target && (
                <div className="text-xs font-semibold text-emerald-400 mt-1">
                  Need <span className="font-black text-white">{runsNeeded}</span> runs from{' '}
                  <span className="font-black text-white">{ballsRemaining}</span> balls
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="max-w-4xl mx-auto px-4 flex border-t border-slate-800/80">
        {[
          { key: 'scoring', label: 'Keypad' },
          { key: 'scorecard', label: 'Scorecard' },
          { key: 'commentary', label: 'Commentary' },
          { key: 'info', label: 'Match Info' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key as any)}
            className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 text-center uppercase tracking-wider ${
              activeTab === tab.key
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

