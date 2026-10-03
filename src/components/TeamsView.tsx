import React, { useState } from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
import { Player, PlayerRole, Team } from '../types/cricket';

interface TeamsViewProps {
  teams: Team[];
  onSaveTeams: (teams: Team[]) => void;
  onOpenNewMatchWithTeam?: (teamId: string) => void;
}

export const TeamsView: React.FC<TeamsViewProps> = ({ teams, onSaveTeams }) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(teams[0]?.id || null);

  // Modal to add team
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamShort, setNewTeamShort] = useState('');
  const [newTeamColor, setNewTeamColor] = useState('#059669');

  // Form to add player to selected team
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState<PlayerRole>('batsman');
  const [newPlayerBatStyle, setNewPlayerBatStyle] = useState<'right' | 'left'>('right');
  const [newPlayerBowlStyle, setNewPlayerBowlStyle] = useState<string>('right-arm fast');

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const shortCode = newTeamShort.trim() || newTeamName.substring(0, 3).toUpperCase();
    const newTeam: Team = {
      id: `team_${Date.now()}`,
      name: newTeamName.trim(),
      shortName: shortCode,
      color: newTeamColor,
      players: [],
    };

    const updated = [...teams, newTeam];
    onSaveTeams(updated);
    setSelectedTeamId(newTeam.id);
    setIsAddTeamOpen(false);
    setNewTeamName('');
    setNewTeamShort('');
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim() || !selectedTeam) return;

    const newPlayer: Player = {
      id: `p_${Date.now()}`,
      name: newPlayerName.trim(),
      role: newPlayerRole,
      battingStyle: newPlayerBatStyle,
      bowlingStyle: newPlayerBowlStyle as any,
    };

    const updatedTeams = teams.map((t) => {
      if (t.id === selectedTeam.id) {
        return {
          ...t,
          players: [...t.players, newPlayer],
        };
      }
      return t;
    });

    onSaveTeams(updatedTeams);
    setNewPlayerName('');
  };

  const handleDeletePlayer = (playerId: string) => {
    if (!selectedTeam) return;
    const updatedTeams = teams.map((t) => {
      if (t.id === selectedTeam.id) {
        return {
          ...t,
          players: t.players.filter((p) => p.id !== playerId),
        };
      }
      return t;
    });
    onSaveTeams(updatedTeams);
  };

  const colorPresets = ['#059669', '#2563eb', '#dc2626', '#d97706', '#7c3aed', '#0891b2', '#db2777', '#4b5563'];

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-white">Teams & Squads</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your cricket teams, add players, batting and bowling styles
          </p>
        </div>

        <button
          onClick={() => setIsAddTeamOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create Team</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Teams List Column */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Registered Teams ({teams.length})
          </div>
          {teams.map((t) => {
            const isSelected = selectedTeam && selectedTeam.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTeamId(t.id)}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-slate-900 ring-1 ring-emerald-500/50 shadow-md'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-md"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.shortName}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{t.name}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{t.players.length} Players</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Team Squad Column */}
        {selectedTeam && (
          <div className="md:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              {/* Team Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-lg"
                    style={{ backgroundColor: selectedTeam.color }}
                  >
                    {selectedTeam.shortName}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{selectedTeam.name}</h3>
                    <div className="text-xs text-slate-400">
                      Roster: {selectedTeam.players.length} players
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Player Form */}
              <form onSubmit={handleAddPlayer} className="py-4 border-b border-slate-800 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  + Add New Player to {selectedTeam.shortName}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Player Name"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                    required
                  />

                  <select
                    value={newPlayerRole}
                    onChange={(e) => setNewPlayerRole(e.target.value as PlayerRole)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs capitalize"
                  >
                    <option value="batsman">Batsman</option>
                    <option value="bowler">Bowler</option>
                    <option value="allrounder">All-Rounder</option>
                    <option value="wicketkeeper">Wicketkeeper</option>
                  </select>

                  <select
                    value={newPlayerBatStyle}
                    onChange={(e) => setNewPlayerBatStyle(e.target.value as any)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    <option value="right">Right-hand bat</option>
                    <option value="left">Left-hand bat</option>
                  </select>

                  <select
                    value={newPlayerBowlStyle}
                    onChange={(e) => setNewPlayerBowlStyle(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    <option value="right-arm fast">Right-arm fast</option>
                    <option value="right-arm spin">Right-arm spin</option>
                    <option value="left-arm fast">Left-arm fast</option>
                    <option value="left-arm spin">Left-arm spin</option>
                    <option value="none">None / Wicketkeeper</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Player</span>
                  </button>
                </div>
              </form>

              {/* Players Squad List */}
              <div className="pt-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Current Squad ({selectedTeam.players.length})
                </div>

                {selectedTeam.players.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No players in this squad yet. Add players above!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedTeam.players.map((p, idx) => (
                      <div
                        key={p.id}
                        className="bg-slate-850 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-slate-500 font-mono w-4">{idx + 1}.</span>
                          <div>
                            <div className="font-bold text-white truncate">{p.name}</div>
                            <div className="text-[11px] text-slate-400 capitalize">
                              {p.role} {p.bowlingStyle ? `• ${p.bowlingStyle}` : ''}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeletePlayer(p.id)}
                          className="p-1 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                          title="Remove player"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal to Create New Team */}
      {isAddTeamOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Create New Team</h3>
              <button
                onClick={() => setIsAddTeamOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pune Panthers"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Short Code (2-4 chars)
                </label>
                <input
                  type="text"
                  placeholder="e.g. PP"
                  maxLength={4}
                  value={newTeamShort}
                  onChange={(e) => setNewTeamShort(e.target.value.toUpperCase())}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Team Color
                </label>
                <div className="flex items-center gap-2">
                  {colorPresets.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewTeamColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        newTeamColor === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTeamOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

