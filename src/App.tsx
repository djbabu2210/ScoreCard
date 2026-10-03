import { useMemo, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { MatchSetupModal } from './components/MatchSetupModal';
import { Navbar } from './components/Navbar';
import { ScoringConsole } from './components/Scoring/ScoringConsole';
import { TeamsView } from './components/TeamsView';
import { TournamentDetail } from './components/TournamentDetail';
import { TournamentsView } from './components/TournamentsView';
import { Match, Team, Tournament } from './types/cricket';
import {
  loadActiveMatchId,
  loadMatches,
  loadTeams,
  loadTournaments,
  resetAllData,
  saveActiveMatchId,
  saveMatches,
  saveTeams,
  saveTournaments,
} from './utils/storage';

export function App() {
  const [tournaments, setTournaments] = useState<Tournament[]>(() => loadTournaments());
  const [teams, setTeams] = useState<Team[]>(() => loadTeams());
  const [matches, setMatches] = useState<Record<string, Match>>(() => loadMatches());
  const [activeMatchId, setActiveMatchId] = useState<string | null>(() => loadActiveMatchId());

  // Views: 'dashboard' | 'tournaments' | 'tournament_detail' | 'teams' | 'scoring'
  const [currentView, setCurrentView] = useState<'dashboard' | 'tournaments' | 'tournament_detail' | 'teams' | 'scoring'>('dashboard');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);

  // Match Setup Modal
  const [isMatchSetupOpen, setIsMatchSetupOpen] = useState(false);
  const [setupDefaultTournamentId, setSetupDefaultTournamentId] = useState<string | undefined>(undefined);

  // Sync tournaments to storage
  const handleSaveTournaments = (updated: Tournament[]) => {
    setTournaments(updated);
    saveTournaments(updated);
  };

  // Sync teams to storage
  const handleSaveTeams = (updated: Team[]) => {
    setTeams(updated);
    saveTeams(updated);
  };

  // Sync matches to storage
  const handleSaveMatches = (updated: Record<string, Match>) => {
    setMatches(updated);
    saveMatches(updated);
  };

  // Update a single match
  const handleUpdateMatch = (updatedMatch: Match) => {
    const updated = {
      ...matches,
      [updatedMatch.id]: updatedMatch,
    };
    handleSaveMatches(updated);
  };

  // Start new match
  const handleStartMatch = (newMatch: Match) => {
    const updated = {
      ...matches,
      [newMatch.id]: newMatch,
    };
    handleSaveMatches(updated);

    // If part of a tournament, register matchId in the tournament
    if (newMatch.tournamentId) {
      const updatedTournaments = tournaments.map((t) => {
        if (t.id === newMatch.tournamentId && !t.matchIds.includes(newMatch.id)) {
          return {
            ...t,
            matchIds: [...t.matchIds, newMatch.id],
          };
        }
        return t;
      });
      handleSaveTournaments(updatedTournaments);
    }

    setActiveMatchId(newMatch.id);
    saveActiveMatchId(newMatch.id);
    setIsMatchSetupOpen(false);
    setCurrentView('scoring');
  };

  // Open existing match
  const handleOpenMatch = (matchId: string) => {
    setActiveMatchId(matchId);
    saveActiveMatchId(matchId);
    setCurrentView('scoring');
  };

  // Reset to demo data
  const handleResetData = () => {
    if (window.confirm('Reset all scorecard data to default demo tournament and teams?')) {
      const reset = resetAllData();
      setTournaments(reset.tournaments);
      setTeams(reset.teams);
      setMatches(reset.matches);
      setActiveMatchId(reset.activeMatchId);
      setCurrentView('dashboard');
    }
  };

  // Open match setup from tournament
  const handleScheduleInTournament = (tourId: string) => {
    setSetupDefaultTournamentId(tourId);
    setIsMatchSetupOpen(true);
  };

  // All combined players from all teams
  const allPlayers = useMemo(() => {
    const list: typeof teams[0]['players'] = [];
    teams.forEach((t) => {
      t.players.forEach((p) => {
        if (!list.some((existing) => existing.id === p.id)) {
          list.push(p);
        }
      });
    });
    return list;
  }, [teams]);

  // Selected tournament object
  const selectedTournament = tournaments.find((t) => t.id === selectedTournamentId) || tournaments[0];
  const activeMatch = activeMatchId ? matches[activeMatchId] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      {currentView !== 'scoring' && (
        <Navbar
          currentView={currentView}
          onNavigate={(view) => {
            if (view === 'tournaments') {
              setSelectedTournamentId(null);
            }
            setCurrentView(view);
          }}
          onStartNewMatch={() => {
            setSetupDefaultTournamentId(undefined);
            setIsMatchSetupOpen(true);
          }}
          activeMatchCount={Object.values(matches).filter((m) => m.status === 'live').length}
        />
      )}

      {/* Main Body */}
      <main className="flex-1">
        {currentView === 'dashboard' && (
          <Dashboard
            tournaments={tournaments}
            teams={teams}
            matches={matches}
            onStartNewMatch={() => {
              setSetupDefaultTournamentId(undefined);
              setIsMatchSetupOpen(true);
            }}
            onOpenMatch={handleOpenMatch}
            onOpenTournaments={() => setCurrentView('tournaments')}
            onOpenTeams={() => setCurrentView('teams')}
            onResetData={handleResetData}
          />
        )}

        {currentView === 'tournaments' && (
          <TournamentsView
            tournaments={tournaments}
            teams={teams}
            onSelectTournament={(id) => {
              setSelectedTournamentId(id);
              setCurrentView('tournament_detail');
            }}
            onSaveTournaments={handleSaveTournaments}
          />
        )}

        {currentView === 'tournament_detail' && selectedTournament && (
          <TournamentDetail
            tournament={selectedTournament}
            allMatches={matches}
            allTeams={teams}
            onBack={() => setCurrentView('tournaments')}
            onOpenMatch={handleOpenMatch}
            onScheduleMatch={handleScheduleInTournament}
          />
        )}

        {currentView === 'teams' && (
          <TeamsView teams={teams} onSaveTeams={handleSaveTeams} />
        )}

        {currentView === 'scoring' && activeMatch && (
          <ScoringConsole
            match={activeMatch}
            allPlayers={allPlayers}
            onUpdateMatch={handleUpdateMatch}
            onBack={() => setCurrentView('dashboard')}
          />
        )}
      </main>

      {/* Bottom Nav on Mobile */}
      {currentView !== 'scoring' && (
        <BottomNav
          currentView={currentView}
          onNavigate={(view) => {
            if (view === 'scoring' && activeMatch) {
              setCurrentView('scoring');
            } else if (view !== 'scoring') {
              setCurrentView(view);
            }
          }}
          hasActiveMatch={Boolean(activeMatch)}
        />
      )}

      {/* Match Setup Wizard Modal */}
      {isMatchSetupOpen && (
        <MatchSetupModal
          isOpen={isMatchSetupOpen}
          onClose={() => setIsMatchSetupOpen(false)}
          tournaments={tournaments}
          teams={teams}
          defaultTournamentId={setupDefaultTournamentId}
          onStartMatch={handleStartMatch}
        />
      )}
    </div>
  );
}

export default App;

