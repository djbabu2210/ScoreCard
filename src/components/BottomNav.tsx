import React from 'react';
import { Home, Play, Trophy, Users } from 'lucide-react';

interface BottomNavProps {
  currentView: 'dashboard' | 'tournaments' | 'teams' | 'tournament_detail' | 'scoring';
  onNavigate: (view: 'dashboard' | 'tournaments' | 'teams' | 'scoring') => void;
  hasActiveMatch: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  hasActiveMatch,
}) => {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1 select-none">
      <div className="flex items-center justify-around">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center text-[10px] font-bold transition ${
            currentView === 'dashboard' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Matches</span>
        </button>

        <button
          onClick={() => onNavigate('tournaments')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center text-[10px] font-bold transition ${
            currentView === 'tournaments' || currentView === 'tournament_detail'
              ? 'text-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-5 h-5 mb-0.5" />
          <span>Tournaments</span>
        </button>

        <button
          onClick={() => onNavigate('teams')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center text-[10px] font-bold transition ${
            currentView === 'teams' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Teams</span>
        </button>

        {hasActiveMatch && (
          <button
            onClick={() => onNavigate('scoring')}
            className={`flex-1 py-1.5 flex flex-col items-center justify-center text-[10px] font-bold transition ${
              currentView === 'scoring' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Play className="w-5 h-5 mb-0.5 fill-current" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-live" />
            </div>
            <span>Scoring</span>
          </button>
        )}
      </div>
    </div>
  );
};

