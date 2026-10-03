import React from 'react';
import { Calendar, MapPin, Shield, Trophy } from 'lucide-react';
import { Match, Player } from '../../types/cricket';

interface MatchInfoTabProps {
  match: Match;
  teamAPlayers: Player[];
  teamBPlayers: Player[];
}

export const MatchInfoTab: React.FC<MatchInfoTabProps> = ({
  match,
  teamAPlayers,
  teamBPlayers,
}) => {
  const tossWinner = match.toss.wonByTeamId === match.teamA.id ? match.teamA : match.teamB;

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-8">
      {/* Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Match Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs text-slate-400">Match Format</div>
              <div className="font-bold text-white">
                {match.overs} Overs per side • {match.ballType} ball
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs text-slate-400">Venue</div>
              <div className="font-bold text-white">{match.venue || 'Local Cricket Ground'}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <Calendar className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <div className="text-xs text-slate-400">Date</div>
              <div className="font-bold text-white">{match.date}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <Shield className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <div className="text-xs text-slate-400">Toss</div>
              <div className="font-bold text-white">
                {tossWinner.name} won toss & elected to {match.toss.electedTo}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Playing XIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Team A Squad */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-3">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: match.teamA.color }} />
            <h4 className="font-bold text-white text-sm">{match.teamA.name} Lineup</h4>
          </div>
          <div className="space-y-1.5">
            {teamAPlayers.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-850/60 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono w-4">{idx + 1}.</span>
                  <span className="font-medium text-white">{p.name}</span>
                </div>
                <span className="text-slate-400 capitalize">{p.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team B Squad */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-3">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: match.teamB.color }} />
            <h4 className="font-bold text-white text-sm">{match.teamB.name} Lineup</h4>
          </div>
          <div className="space-y-1.5">
            {teamBPlayers.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-850/60 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono w-4">{idx + 1}.</span>
                  <span className="font-medium text-white">{p.name}</span>
                </div>
                <span className="text-slate-400 capitalize">{p.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

