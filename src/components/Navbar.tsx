import React from 'react';
import { Plus, Trophy, Users } from 'lucide-react';

interface NavbarProps {
  currentView: 'dashboard' | 'tournaments' | 'teams' | 'tournament_detail' | 'scoring';
  onNavigate: (view: 'dashboard' | 'tournaments' | 'teams') => void;
  onStartNewMatch: () => void;
  activeMatchCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onStartNewMatch,
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 select-none">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-xl shadow-lg shadow-emerald-950/60 group-hover:scale-105 transition-transform">
            🏏
          </div>
          <div>
            <div className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
              <span>CricScore</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-sm border border-emerald-500/30">
                PRO
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium -mt-0.5">
              Live Cricket Scorecard
            </div>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden sm:flex items-center gap-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              currentView === 'dashboard'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Matches
          </button>
          <button
            onClick={() => onNavigate('tournaments')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              currentView === 'tournaments' || currentView === 'tournament_detail'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tournaments</span>
          </button>
          <button
            onClick={() => onNavigate('teams')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              currentView === 'teams'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Teams</span>
          </button>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onStartNewMatch}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Match</span>
            <span className="sm:hidden">Match</span>
          </button>
        </div>
      </div>
    </header>
  );
};

