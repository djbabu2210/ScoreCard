import React from 'react';
import { BallEvent, Player } from '../../types/cricket';

interface BallCommentaryProps {
  history: BallEvent[];
  battingPlayers: Player[];
  bowlingPlayers: Player[];
}

export const BallCommentary: React.FC<BallCommentaryProps> = ({
  history,
  battingPlayers,
  bowlingPlayers,
}) => {
  if (history.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <div className="text-3xl mb-2">🎙️</div>
        <div className="font-bold text-white text-base">No Commentary Yet</div>
        <div className="text-xs text-slate-500 mt-1">
          Ball-by-ball updates and commentary will appear here once scoring begins.
        </div>
      </div>
    );
  }

  // Group balls by over
  const ballsReversed = [...history].reverse();

  const getPlayerName = (id: string, list: Player[]) => {
    return list.find((p) => p.id === id)?.name || 'Player';
  };

  const getCommentaryText = (ball: BallEvent) => {
    const bowler = getPlayerName(ball.bowlerId, bowlingPlayers);
    const striker = getPlayerName(ball.strikerId, battingPlayers);

    if (ball.comment) return ball.comment;

    if (ball.isWicket && ball.dismissal) {
      const outName = getPlayerName(ball.dismissal.outPlayerId, battingPlayers);
      const fielderName = ball.dismissal.fielderId
        ? getPlayerName(ball.dismissal.fielderId, bowlingPlayers)
        : '';

      switch (ball.dismissal.type) {
        case 'bowled':
          return `OUT! ${bowler} cleans up ${outName}! Timber! Straight through the defense!`;
        case 'caught':
          return `OUT! In the air and taken! ${outName} caught by ${fielderName || 'fielder'} off ${bowler}!`;
        case 'caught_and_bowled':
          return `OUT! Sharp reflex catch! ${bowler} takes a stunning return catch off ${outName}!`;
        case 'lbw':
          return `OUT! Given LBW! Loud appeal from ${bowler} and the umpire raises the finger! ${outName} departs!`;
        case 'run_out':
          return `OUT! RUN OUT! Confusion in the middle and ${outName} is caught short of the crease!`;
        case 'stumped':
          return `OUT! STUMPED! ${outName} dragged forward and beaten by the turn, keeper does the rest!`;
        case 'hit_wicket':
          return `OUT! HIT WICKET! ${outName} knocks over their own bails!`;
        case 'retired_hurt':
          return `${outName} retired hurt and walks off the field.`;
        default:
          return `OUT! ${outName} is dismissed!`;
      }
    }

    if (ball.isBoundarySix) {
      return `SIX! High, handsome and all the way into the stands! ${striker} unleashes a towering blow off ${bowler}!`;
    }

    if (ball.isBoundaryFour) {
      return `FOUR! Glorious shot by ${striker}! Punched crisply through the gap off ${bowler} for a boundary!`;
    }

    if (ball.extraType === 'wide') {
      return `Wide ball down the leg side by ${bowler}, bonus extra conceded.`;
    }

    if (ball.extraType === 'no_ball') {
      return `No ball called against ${bowler}! Overstepping the front crease. Free hit upcoming!`;
    }

    if (ball.extraType === 'bye') {
      return `${ball.runsExtra} Bye(s) taken as the delivery sneaks past the batsman and keeper.`;
    }

    if (ball.extraType === 'leg_bye') {
      return `${ball.runsExtra} Leg Bye(s) deflected off the pads into the outfield.`;
    }

    if (ball.runsBat === 0) {
      return `Dot ball. Good length delivery from ${bowler} to ${striker}, defended solidly.`;
    }

    if (ball.runsBat === 1) {
      return `1 run. ${bowler} to ${striker}, nudged into the gap for a single.`;
    }

    if (ball.runsBat === 2) {
      return `2 runs. Nice running between the wickets by ${striker}, turning for the second easily.`;
    }

    if (ball.runsBat === 3) {
      return `3 runs. Deep into the pocket, well saved inside the boundary rope.`;
    }

    return `${ball.runsBat} run(s) scored.`;
  };

  const getBadge = (ball: BallEvent) => {
    if (ball.isWicket) {
      return <span className="w-8 h-8 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0 border border-red-400">W</span>;
    }
    if (ball.isBoundarySix) {
      return <span className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 border border-purple-400">6</span>;
    }
    if (ball.isBoundaryFour) {
      return <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 border border-emerald-400">4</span>;
    }
    if (ball.extraType === 'wide' || ball.extraType === 'no_ball') {
      return (
        <span className="min-w-8 h-8 px-1 rounded-full bg-amber-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 border border-amber-400">
          {ball.extraType === 'wide' ? `${ball.runsExtra}Wd` : 'Nb'}
        </span>
      );
    }
    if (ball.runsScoredTotal === 0) {
      return <span className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold flex items-center justify-center shrink-0 border border-slate-700">0</span>;
    }
    return (
      <span className="w-8 h-8 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-slate-600">
        {ball.runsScoredTotal}
      </span>
    );
  };

  return (
    <div className="space-y-2 max-w-4xl mx-auto pb-8">
      {ballsReversed.map((b) => (
        <div
          key={b.id}
          className="bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3 flex items-start gap-3 transition"
        >
          {getBadge(b)}
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="font-bold text-slate-300">
                Over {b.overIndex}.{b.ballInOver}
              </span>
              <span className="text-[11px] text-slate-500">
                {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 font-sans leading-relaxed">
              {getCommentaryText(b)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

