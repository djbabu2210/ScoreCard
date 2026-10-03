import React, { useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { Match, Player } from '../../types/cricket';
import { formatOvers } from '../../utils/cricketEngine';

interface FullScorecardProps {
  match: Match;
  teamAPlayers: Player[];
  teamBPlayers: Player[];
}

export const FullScorecard: React.FC<FullScorecardProps> = ({
  match,
  teamAPlayers,
  teamBPlayers,
}) => {
  const [activeInningsTab, setActiveInningsTab] = useState<0 | 1>(match.currentInningsIndex);

  const selectedInn = match.innings[activeInningsTab];
  const isTeamABatting = selectedInn.battingTeamId === match.teamA.id;
  const battingTeam = isTeamABatting ? match.teamA : match.teamB;
  const bowlingTeam = isTeamABatting ? match.teamB : match.teamA;
  const battingPlayers = isTeamABatting ? teamAPlayers : teamBPlayers;
  const bowlingPlayers = isTeamABatting ? teamBPlayers : teamAPlayers;

  // Filter players who actually batted or are in the lineup
  const battersList = Object.values(selectedInn.batters).sort(
    (a, b) => a.battingOrder - b.battingOrder
  );

  const didNotBat = battingPlayers.filter((p) => {
    const stat = selectedInn.batters[p.id];
    return !stat || (!stat.isOut && stat.balls === 0 && p.id !== selectedInn.currentStrikerId && p.id !== selectedInn.currentNonStrikerId);
  });

  const bowlersList = Object.values(selectedInn.bowlers).filter((b) => b.legalBalls > 0 || b.wides > 0 || b.noBalls > 0);

  const handlePrint = () => {
    window.print();
  };

  const getDismissalDescription = (b: typeof battersList[0]) => {
    if (!b.isOut) {
      if (b.playerId === selectedInn.currentStrikerId || b.playerId === selectedInn.currentNonStrikerId) {
        return <span className="text-emerald-400 font-semibold">not out *</span>;
      }
      return <span className="text-slate-500">yet to bat</span>;
    }

    const d = b.dismissal;
    if (!d) return 'out';

    const bowlerName = bowlingPlayers.find((p) => p.id === d.bowlerId)?.name;
    const fielderName = bowlingPlayers.find((p) => p.id === d.fielderId)?.name;

    switch (d.type) {
      case 'bowled':
        return `b ${bowlerName || 'bowler'}`;
      case 'caught':
        return `c ${fielderName || 'fielder'} b ${bowlerName || 'bowler'}`;
      case 'caught_and_bowled':
        return `c & b ${bowlerName || 'bowler'}`;
      case 'lbw':
        return `lbw b ${bowlerName || 'bowler'}`;
      case 'run_out':
        return `run out (${fielderName || 'direct hit'})`;
      case 'stumped':
        return `st ${fielderName || 'keeper'} b ${bowlerName || 'bowler'}`;
      case 'hit_wicket':
        return `hit wicket b ${bowlerName || 'bowler'}`;
      case 'retired_hurt':
        return 'retired hurt';
      default:
        return 'out';
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-10 print:bg-white print:text-black">
      {/* Innings Selector Tabs & Print Action */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveInningsTab(0)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition ${
              activeInningsTab === 0
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            1st Inn: {match.innings[0].battingTeamId === match.teamA.id ? match.teamA.shortName : match.teamB.shortName}{' '}
            ({match.innings[0].totalRuns}/{match.innings[0].totalWickets})
          </button>

          <button
            onClick={() => setActiveInningsTab(1)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition ${
              activeInningsTab === 1
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            2nd Inn: {match.innings[1].battingTeamId === match.teamA.id ? match.teamA.shortName : match.teamB.shortName}{' '}
            ({match.innings[1].totalRuns}/{match.innings[1].totalWickets})
          </button>
        </div>

        <button
          onClick={handlePrint}
          className="print:hidden px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / PDF</span>
        </button>
      </div>

      {/* Match Result Banner if completed */}
      {match.result && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-2xl text-center">
          <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Result</div>
          <div className="text-xl font-black text-white mt-0.5">{match.result.summary}</div>
          {match.result.playerOfTheMatch && (
            <div className="text-xs text-amber-300 mt-1">
              Player of the Match: <span className="font-bold">{match.result.playerOfTheMatch.playerName}</span> ({match.result.playerOfTheMatch.reason})
            </div>
          )}
        </div>
      )}

      {/* Batting Scorecard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: battingTeam.color }}></span>
            <h3 className="font-black text-sm text-white uppercase tracking-wider">
              {battingTeam.name} Batting
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-300">
            {selectedInn.totalRuns}/{selectedInn.totalWickets} ({formatOvers(selectedInn.legalBalls)} ov)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-850 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4 font-bold">Batter</th>
                <th className="py-2.5 px-2 font-normal hidden sm:table-cell">Dismissal</th>
                <th className="py-2.5 px-3 text-right font-bold">R</th>
                <th className="py-2.5 px-3 text-right font-bold">B</th>
                <th className="py-2.5 px-2 text-right">4s</th>
                <th className="py-2.5 px-2 text-right">6s</th>
                <th className="py-2.5 px-4 text-right">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {battersList.map((b) => (
                <tr key={b.playerId} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-4 font-sans font-medium text-white">
                    <div className="flex items-center gap-1.5">
                      <span>{b.name}</span>
                      {!b.isOut &&
                        (b.playerId === selectedInn.currentStrikerId ||
                          b.playerId === selectedInn.currentNonStrikerId) && (
                          <span className="text-emerald-400 font-bold">*</span>
                        )}
                    </div>
                    {/* Mobile dismissal subline */}
                    <div className="text-[11px] text-slate-400 font-normal sm:hidden mt-0.5">
                      {getDismissalDescription(b)}
                    </div>
                  </td>
                  <td className="py-2.5 px-2 font-sans text-xs text-slate-400 hidden sm:table-cell">
                    {getDismissalDescription(b)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-white text-sm">
                    {b.runs}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400">{b.balls}</td>
                  <td className="py-2.5 px-2 text-right text-slate-400">{b.fours}</td>
                  <td className="py-2.5 px-2 text-right text-slate-400">{b.sixes}</td>
                  <td className="py-2.5 px-4 text-right text-emerald-400 font-semibold">
                    {b.strikeRate.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Extras Row */}
        <div className="px-4 py-2.5 bg-slate-850/60 border-t border-slate-800 flex justify-between items-center text-xs">
          <div className="text-slate-400 font-sans">
            <span className="font-bold text-slate-300">Extras: </span>
            <span>
              (b {selectedInn.extras.byes}, lb {selectedInn.extras.legByes}, w {selectedInn.extras.wides}, nb{' '}
              {selectedInn.extras.noBalls}, p {selectedInn.extras.penalty})
            </span>
          </div>
          <div className="font-mono font-bold text-white text-sm">
            {selectedInn.extras.total}
          </div>
        </div>

        {/* Total Row */}
        <div className="px-4 py-3 bg-slate-800/90 border-t border-slate-700/80 flex justify-between items-center text-sm font-black text-white">
          <span>Total</span>
          <div className="font-mono text-base">
            {selectedInn.totalRuns}/{selectedInn.totalWickets}{' '}
            <span className="text-xs font-normal text-slate-400">
              ({formatOvers(selectedInn.legalBalls)} Ov, RR: {selectedInn.legalBalls > 0 ? (selectedInn.totalRuns / (selectedInn.legalBalls / 6)).toFixed(2) : '0.00'})
            </span>
          </div>
        </div>

        {/* Did not bat */}
        {didNotBat.length > 0 && (
          <div className="px-4 py-2.5 border-t border-slate-800 text-xs text-slate-400">
            <span className="font-bold text-slate-300">Yet to bat: </span>
            {didNotBat.map((p, idx) => (
              <span key={p.id}>
                {p.name}
                {idx < didNotBat.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Fall of Wickets */}
      {selectedInn.fallOfWickets.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Fall of Wickets
          </h4>
          <div className="flex flex-wrap gap-2 text-xs">
            {selectedInn.fallOfWickets.map((fow) => (
              <span
                key={fow.wicketNumber}
                className="bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg text-slate-200"
              >
                <span className="font-bold text-red-400">
                  {fow.score}-{fow.wicketNumber}
                </span>{' '}
                <span className="text-slate-300 font-sans font-medium">({fow.outPlayerName})</span>,{' '}
                <span className="text-slate-400 font-mono">{fow.over} ov</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bowling Scorecard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: bowlingTeam.color }}></span>
            <h3 className="font-black text-sm text-white uppercase tracking-wider">
              {bowlingTeam.name} Bowling
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-850 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800 font-mono">
              <tr>
                <th className="py-2.5 px-4 font-sans font-bold">Bowler</th>
                <th className="py-2.5 px-3 text-right">O</th>
                <th className="py-2.5 px-2 text-right">M</th>
                <th className="py-2.5 px-3 text-right">R</th>
                <th className="py-2.5 px-3 text-right font-bold text-red-400">W</th>
                <th className="py-2.5 px-3 text-right">ECON</th>
                <th className="py-2.5 px-2 text-right">0s</th>
                <th className="py-2.5 px-2 text-right">WD</th>
                <th className="py-2.5 px-2 text-right">NB</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {bowlersList.map((bw) => (
                <tr key={bw.playerId} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-4 font-sans font-medium text-white">{bw.name}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{bw.oversFormatted}</td>
                  <td className="py-2.5 px-2 text-right text-slate-400">{bw.maidens}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300 font-bold">{bw.runsConceded}</td>
                  <td className="py-2.5 px-3 text-right font-black text-red-400 text-sm">
                    {bw.wickets}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    {bw.economyRate.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-slate-400">{bw.dots}</td>
                  <td className="py-2.5 px-2 text-right text-slate-400">{bw.wides}</td>
                  <td className="py-2.5 px-2 text-right text-slate-400">{bw.noBalls}</td>
                </tr>
              ))}
              {bowlersList.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-4 text-center text-slate-500 font-sans">
                    No bowling data available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

