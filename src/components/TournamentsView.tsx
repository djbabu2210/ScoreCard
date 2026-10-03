import React, { useState } from 'react';
import { Plus, Trophy, Users } from 'lucide-react';
import { Team, Tournament } from '../types/cricket';

interface TournamentsViewProps {
  tournaments: Tournament[];
  teams: Team[];
  onSelectTournament: (tournamentId: string) => void;
  onSaveTournaments: (tournaments: Tournament[]) => void;
}

export const TournamentsView: React.FC<TournamentsViewProps> = ({
  tournaments,
  teams,
  onSelectTournament,
  onSaveTournaments,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [ground, setGround] = useState('');
  const [overs, setOvers] = useState(10);
  const [ballType, setBallType] = useState<'leather' | 'tennis'>('leather');
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);

  const handleOpenCreate = () => {
    setSelectedTeamIds(teams.map((t) => t.id));
    setIsCreateOpen(true);
  };

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newTour: Tournament = {
      id: `tour_${Date.now()}`,
      name: name.trim(),
      city: city.trim() || 'Local City',
      ground: ground.trim() || 'Ground #1',
      overs,
      ballType,
      bannerColor: '#059669',
      teamIds: selectedTeamIds,
      matchIds: [],
      createdAt: Date.now(),
      status: 'ongoing',
    };

    onSaveTournaments([...tournaments, newTour]);
    setIsCreateOpen(false);
    setName('');
    setCity('');
    setGround('');
    onSelectTournament(newTour.id);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-white">Tournaments & Leagues</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize tournaments, track points table, and schedule matches
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create Tournament</span>
        </button>
      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tournaments.map((t) => (
          <div
            key={t.id}
            onClick={() => onSelectTournament(t.id)}
            className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 shadow-lg cursor-pointer transition hover:scale-[1.01] group relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base group-hover:text-emerald-400 transition">
                    {t.name}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {t.city} • {t.ground}
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {t.status}
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                {t.teamIds.length} Teams
              </span>
              <span className="font-mono text-slate-300">
                {t.overs} Overs • {t.ballType}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal to Create Tournament */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Create New Tournament</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTournament} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Tournament / League Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Corporate Super League 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Ground / Stadium
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gymkhana Grounds"
                    value={ground}
                    onChange={(e) => setGround(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Match Overs
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={overs}
                    onChange={(e) => setOvers(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Ball Type
                  </label>
                  <select
                    value={ballType}
                    onChange={(e) => setBallType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                  >
                    <option value="leather">Leather</option>
                    <option value="tennis">Tennis</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Select Participating Teams ({selectedTeamIds.length} selected)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto p-2 bg-slate-850 rounded-xl border border-slate-800">
                  {teams.map((t) => {
                    const isChecked = selectedTeamIds.includes(t.id);
                    return (
                      <label
                        key={t.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs border ${
                          isChecked
                            ? 'bg-emerald-950/40 border-emerald-600/60 text-white font-medium'
                            : 'bg-slate-800/40 border-slate-800 text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTeamIds([...selectedTeamIds, t.id]);
                            } else {
                              setSelectedTeamIds(selectedTeamIds.filter((id) => id !== t.id));
                            }
                          }}
                          className="rounded-sm text-emerald-600 focus:ring-emerald-500 bg-slate-800"
                        />
                        <span className="truncate">{t.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                >
                  Create Tournament
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

