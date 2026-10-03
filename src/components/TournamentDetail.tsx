import React, { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Plus, Trophy } from 'lucide-react';
import { Match, PointsTableEntry, Team, Tournament } from '../types/cricket';
import { formatOvers } from '../utils/cricketEngine';

interface TournamentDetailProps {
  tournament: Tournament;
  allMatches: Record<string, Match>;
  allTeams: Team[];
  onBack: () => void;
  onOpenMatch: (matchId: string) => void;
  onScheduleMatch: (tournamentId: string) => void;
}

export const TournamentDetail: React.FC<TournamentDetailProps> = ({
  tournament,
  allMatches,
  allTeams,
  onBack,
  onOpenMatch,
  onScheduleMatch,
}) => {
  const [activeTab, setActiveTab] = useState<'matches' | 'points' | 'teams'>('matches');

  // Filter matches belonging to this tournament
  const matches = Object.values(allMatches).filter((m) => m.tournamentId === tournament.id);

  // Participating teams
  const participatingTeams = allTeams.filter((t) => tournament.teamIds.includes(t.id));

  // Compute Points Table dynamically
  const computePointsTable = (): PointsTableEntry[] => {
    const table: Record<string, PointsTableEntry> = {};

    participatingTeams.forEach((t) => {
      table[t.id] = {
        teamId: t.id,
        teamName: t.name,
        shortName: t.shortName,
        color: t.color,
        played: 0,
        won: 0,
        lost: 0,
        tied: 0,
        noResult: 0,
        points: 0,
        nrr: 0,
      };
    });

    matches.forEach((m) => {
      if (m.status !== 'completed' || !m.result) return;

      const teamAId = m.teamA.id;
      const teamBId = m.teamB.id;

      if (table[teamAId]) table[teamAId].played += 1;
      if (table[teamBId]) table[teamBId].played += 1;

      if (m.result.winnerTeamId) {
        const winnerId = m.result.winnerTeamId;
        const loserId = winnerId === teamAId ? teamBId : teamAId;

        if (table[winnerId]) {
          table[winnerId].won += 1;
          table[winnerId].points += 2;
        }
        if (table[loserId]) {
          table[loserId].lost += 1;
        }
      } else {
        // Tie
        if (table[teamAId]) {
          table[teamAId].tied += 1;
          table[teamAId].points += 1;
        }
        if (table[teamBId]) {
          table[teamBId].tied += 1;
          table[teamBId].points += 1;
        }
      }
    });

    return Object.values(table).sort((a, b) => b.points - a.points || b.won - a.won);
  };

  const pointsTable = computePointsTable();

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Back button & Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" />
            <span>Tournament</span>
          </div>
          <h2 className="text-2xl font-black text-white">{tournament.name}</h2>
        </div>
      </div>

      {/* Tournament Info Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-300">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {tournament.city} • {tournament.ground}
              </span>
              <span>•</span>
              <span>{tournament.overs} Overs Match</span>
              <span>•</span>
              <span className="capitalize">{tournament.ballType} ball</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {participatingTeams.length} Teams • {matches.length} Matches Scheduled
            </div>
          </div>
        </div>

        <button
          onClick={() => onScheduleMatch(tournament.id)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Match</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        {[
          { key: 'matches', label: `Matches (${matches.length})` },
          { key: 'points', label: 'Points Table' },
          { key: 'teams', label: `Teams (${participatingTeams.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === tab.key
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Matches / Fixtures Tab */}
      {activeTab === 'matches' && (
        <div className="space-y-3">
          {matches.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              <Calendar className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <div className="font-bold text-white text-base">No Matches in this Tournament Yet</div>
              <p className="text-xs text-slate-500 mt-1">
                Schedule a match between participating teams to start scoring!
              </p>
              <button
                onClick={() => onScheduleMatch(tournament.id)}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" /> Schedule Match
              </button>
            </div>
          ) : (
            matches.map((m) => {
              const inn1 = m.innings[0];
              const inn2 = m.innings[1];
              const isLive = m.status === 'live' || m.status === 'break';

              return (
                <div
                  key={m.id}
                  onClick={() => onOpenMatch(m.id)}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-md cursor-pointer transition hover:scale-[1.005]"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 text-xs">
                    <span className="font-semibold text-slate-400">{m.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isLive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isLive ? 'Live' : 'Completed'}
                    </span>
                  </div>

                  <div className="py-3 grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: m.teamA.color }} />
                        <span className="font-bold text-white text-sm">{m.teamA.name}</span>
                      </div>
                      <span className="font-mono text-sm font-bold text-slate-300">
                        {inn1.battingTeamId === m.teamA.id
                          ? `${inn1.totalRuns}/${inn1.totalWickets} (${formatOvers(inn1.legalBalls)})`
                          : `${inn2.totalRuns}/${inn2.totalWickets} (${formatOvers(inn2.legalBalls)})`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: m.teamB.color }} />
                        <span className="font-bold text-white text-sm">{m.teamB.name}</span>
                      </div>
                      <span className="font-mono text-sm font-bold text-slate-300">
                        {inn1.battingTeamId === m.teamB.id
                          ? `${inn1.totalRuns}/${inn1.totalWickets} (${formatOvers(inn1.legalBalls)})`
                          : `${inn2.totalRuns}/${inn2.totalWickets} (${formatOvers(inn2.legalBalls)})`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-emerald-400 font-medium">
                      {m.result ? m.result.summary : isLive ? 'Match in progress...' : 'Ready to start'}
                    </span>
                    <span className="text-slate-500">{m.venue}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Points Table Tab */}
      {activeTab === 'points' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm font-mono">
              <thead className="bg-slate-850 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-sans font-bold"># Team</th>
                  <th className="py-3 px-3 text-center">P</th>
                  <th className="py-3 px-3 text-center">W</th>
                  <th className="py-3 px-3 text-center">L</th>
                  <th className="py-3 px-3 text-center">T</th>
                  <th className="py-3 px-4 text-center font-sans font-black text-emerald-400">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pointsTable.map((entry, idx) => (
                  <tr key={entry.teamId} className="hover:bg-slate-850/40">
                    <td className="py-3 px-4 font-sans font-medium text-white flex items-center gap-2">
                      <span className="w-4 text-slate-500 font-mono text-xs">{idx + 1}</span>
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span>{entry.teamName}</span>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-300">{entry.played}</td>
                    <td className="py-3 px-3 text-center text-emerald-400 font-bold">{entry.won}</td>
                    <td className="py-3 px-3 text-center text-red-400">{entry.lost}</td>
                    <td className="py-3 px-3 text-center text-slate-400">{entry.tied}</td>
                    <td className="py-3 px-4 text-center font-black text-emerald-400 text-sm font-mono">
                      {entry.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {participatingTeams.map((team) => (
            <div
              key={team.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs"
                  style={{ backgroundColor: team.color }}
                >
                  {team.shortName}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{team.name}</div>
                  <div className="text-xs text-slate-400">{team.players.length} Players</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

