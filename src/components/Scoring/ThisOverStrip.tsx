import React from 'react';
import { BallEvent } from '../../types/cricket';

interface ThisOverStripProps {
  history: BallEvent[];
  legalBalls: number;
}

export const ThisOverStrip: React.FC<ThisOverStripProps> = ({ history, legalBalls }) => {
  // Find balls belonging to the current over
  const currentOverIndex = Math.floor(legalBalls / 6);
  // Get all balls whose overIndex matches currentOverIndex
  const currentOverBalls = history.filter((b) => b.overIndex === currentOverIndex);

  let thisOverRuns = 0;
  let thisOverWickets = 0;

  currentOverBalls.forEach((b) => {
    thisOverRuns += b.runsBat + b.runsExtra;
    if (b.isWicket) thisOverWickets += 1;
  });

  const getBadgeStyle = (b: BallEvent) => {
    if (b.isWicket) {
      return 'bg-red-600 text-white border-red-500 font-black';
    }
    if (b.isBoundarySix) {
      return 'bg-purple-600 text-white border-purple-400 font-black shadow-purple-900/50';
    }
    if (b.isBoundaryFour) {
      return 'bg-emerald-600 text-white border-emerald-400 font-black shadow-emerald-900/50';
    }
    if (b.extraType === 'wide' || b.extraType === 'no_ball') {
      return 'bg-amber-600 text-white border-amber-400 font-bold';
    }
    if (b.runsScoredTotal === 0) {
      return 'bg-slate-800 text-slate-400 border-slate-700 font-normal';
    }
    return 'bg-slate-700 text-slate-200 border-slate-600 font-semibold';
  };

  const getBallText = (b: BallEvent) => {
    if (b.isWicket) {
      if (b.runsBat > 0 || b.runsExtra > 0) {
        return `W+${b.runsBat + b.runsExtra}`;
      }
      return 'W';
    }
    if (b.extraType === 'wide') {
      return b.runsExtra > 1 ? `${b.runsExtra}Wd` : 'Wd';
    }
    if (b.extraType === 'no_ball') {
      return b.runsBat > 0 ? `Nb+${b.runsBat}` : 'Nb';
    }
    if (b.extraType === 'bye') {
      return `${b.runsExtra}B`;
    }
    if (b.extraType === 'leg_bye') {
      return `${b.runsExtra}LB`;
    }
    return `${b.runsBat}`;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">This Over:</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {currentOverBalls.length === 0 ? (
            <span className="text-xs text-slate-500 italic">First ball of over...</span>
          ) : (
            currentOverBalls.map((b) => (
              <span
                key={b.id}
                className={`min-w-7 h-7 px-1.5 rounded-full flex items-center justify-center text-xs border shadow-xs transition-transform hover:scale-105 ${getBadgeStyle(
                  b
                )}`}
              >
                {getBallText(b)}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="text-right pl-3 border-l border-slate-800 text-xs font-mono">
        <span className="font-bold text-white text-sm">{thisOverRuns}</span>{' '}
        <span className="text-slate-400">runs</span>
        {thisOverWickets > 0 && (
          <span className="text-red-400 font-bold ml-1.5">({thisOverWickets}w)</span>
        )}
      </div>
    </div>
  );
};

