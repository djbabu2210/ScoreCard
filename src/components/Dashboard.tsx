import React from 'react';
import { ArrowRight, Play, Plus, RefreshCw, Trophy, Users } from 'lucide-react';
import { Match, Team, Tournament } from '../types/cricket';
import { formatOvers } from '../utils/cricketEngine';

interface DashboardProps {
  tournaments: Tournament[];
  teams: Team[];
  matches: Record<string, Match>;
  onStartNewMatch: () => void;
  onOpenMatch: (matchId: string) => void;
  onOpenTournaments: () => void;
  onOpenTeams: () => void;
  onResetData: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  tournaments,
  teams,
  matches,
  onStartNewMatch,
  onOpenMatch,
  onOpenTournaments,
  onOpenTeams,
  onResetData,
}) => {
  const matchesList = Object.values(matches).sort((a, b) => b.updatedAt - a.updatedAt);
  const liveMatch = matchesList.find((m) => m.status === 'live' || m.status === 'break');

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 border border-emerald-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Professional Cricket Scorer
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Lightweight, Fast & Accurate Cricket Scoring
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
            Record every ball, wide, no-ball, wicket, and boundary with touch-optimized mobile keypad and live scorecard.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={onStartNewMatch}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm flex items-center gap-2 shadow-xl shadow-emerald-950 transition active:scale-98"
            >
              <Plus className="w-5 h-5" />
              <span>Start New Match</span>
            </button>

            {liveMatch && (
              <button
                onClick={() => onOpenMatch(liveMatch.id)}
                className="px-5 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 font-bold text-sm flex items-center gap-2 transition"
              >
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span>Resume Live Scoring</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Match Card (If there's an ongoing match) */}
      {liveMatch && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-live"></span>
              <span>Currently In Progress</span>
            </div>
            <span className="text-xs text-slate-400">{liveMatch.venue}</span>
          </div>

          {(() => {
            const currentInn = liveMatch.innings[liveMatch.currentInningsIndex];
            const battingTeam =
              currentInn.battingTeamId === liveMatch.teamA.id ? liveMatch.teamA : liveMatch.teamB;
            const bowlingTeam =
              currentInn.battingTeamId === liveMatch.teamA.id ? liveMatch.teamB : liveMatch.teamA;

            return (
              <div
                onClick={() => onOpenMatch(liveMatch.id)}
                className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-xl cursor-pointer hover:border-emerald-400 transition group"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="font-bold text-slate-300 text-xs truncate">{liveMatch.title}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                    Live
                  </span>
                </div>

                <div className="py-4 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-md"
                      style={{ backgroundColor: battingTeam.color }}
                    >
                      {battingTeam.shortName}
                    </div>
                    <div>
                      <div className="font-black text-xl text-white">
                        {battingTeam.name}{' '}
                        <span className="text-emerald-400">
                          {currentInn.totalRuns}/{currentInn.totalWickets}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {formatOvers(currentInn.legalBalls)} / {currentInn.maxOvers} overs • vs{' '}
                        {bowlingTeam.shortName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition">
                      <span>Open Console</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Quick Overview Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div
          onClick={onOpenTournaments}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 cursor-pointer transition text-center sm:text-left"
        >
          <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-400 text-xs font-semibold">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Tournaments</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {tournaments.length}
          </div>
        </div>

        <div
          onClick={onOpenTeams}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 cursor-pointer transition text-center sm:text-left"
        >
          <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-400 text-xs font-semibold">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Teams</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {teams.length}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-400 text-xs font-semibold">
            <Play className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Total Matches</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {matchesList.length}
          </div>
        </div>
      </div>

      {/* Recent Matches Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-white">All Matches</h3>
          <span className="text-xs text-slate-400">{matchesList.length} matches</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {matchesList.map((m) => {
            const inn1 = m.innings[0];
            const inn2 = m.innings[1];
            const isLive = m.status === 'live' || m.status === 'break';

            return (
              <div
                key={m.id}
                onClick={() => onOpenMatch(m.id)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 cursor-pointer transition hover:scale-[1.008] space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <span className="truncate max-w-[200px] font-medium text-slate-300">{m.title}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isLive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isLive ? 'Live' : 'Completed'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: m.teamA.color }} />
                      <span className="font-bold text-white text-sm">{m.teamA.name}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-200">
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
                    <span className="font-mono text-xs font-bold text-slate-200">
                      {inn1.battingTeamId === m.teamB.id
                        ? `${inn1.totalRuns}/${inn1.totalWickets} (${formatOvers(inn1.legalBalls)})`
                        : `${inn2.totalRuns}/${inn2.totalWickets} (${formatOvers(inn2.legalBalls)})`}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-emerald-400 font-medium truncate max-w-[250px]">
                    {m.result ? m.result.summary : isLive ? 'Live in progress' : 'Scheduled'}
                  </span>
                  <span className="text-slate-500">{m.overs} Ov</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info & Sample Data Reset */}
      <div className="pt-6 border-t border-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div>Cricket ScoreCard • Fast & Mobile Friendly</div>
        <button
          onClick={onResetData}
          className="text-slate-500 hover:text-amber-400 flex items-center gap-1 transition"
          title="Reset to default demo data"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </div>
  );
};

