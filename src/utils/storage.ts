import { Match, Team, Tournament } from '../types/cricket';
import { createDemoMatch, INITIAL_TEAMS, INITIAL_TOURNAMENT } from './sampleData';

const STORAGE_KEYS = {
  TOURNAMENTS: 'cricheroes_tournaments_v1',
  TEAMS: 'cricheroes_teams_v1',
  MATCHES: 'cricheroes_matches_v1',
  ACTIVE_MATCH_ID: 'cricheroes_active_match_id_v1',
};

export function loadTournaments(): Tournament[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
    if (!raw) {
      saveTournaments([INITIAL_TOURNAMENT]);
      return [INITIAL_TOURNAMENT];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load tournaments from localStorage', e);
    return [INITIAL_TOURNAMENT];
  }
}

export function saveTournaments(tournaments: Tournament[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
  } catch (e) {
    console.error('Failed to save tournaments', e);
  }
}

export function loadTeams(): Team[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEAMS);
    if (!raw) {
      saveTeams(INITIAL_TEAMS);
      return INITIAL_TEAMS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load teams from localStorage', e);
    return INITIAL_TEAMS;
  }
}

export function saveTeams(teams: Team[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  } catch (e) {
    console.error('Failed to save teams', e);
  }
}

export function loadMatches(): Record<string, Match> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MATCHES);
    if (!raw) {
      const demo = createDemoMatch();
      const map = { [demo.id]: demo };
      saveMatches(map);
      return map;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load matches from localStorage', e);
    const demo = createDemoMatch();
    return { [demo.id]: demo };
  }
}

export function saveMatches(matches: Record<string, Match>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  } catch (e) {
    console.error('Failed to save matches', e);
  }
}

export function loadActiveMatchId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_MATCH_ID) || 'match_demo_1';
  } catch {
    return 'match_demo_1';
  }
}

export function saveActiveMatchId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_MATCH_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_MATCH_ID);
    }
  } catch (e) {
    console.error('Failed to save active match id', e);
  }
}

export function resetAllData(): { tournaments: Tournament[]; teams: Team[]; matches: Record<string, Match>; activeMatchId: string } {
  const demoMatch = createDemoMatch();
  const demoMatches = { [demoMatch.id]: demoMatch };
  saveTournaments([INITIAL_TOURNAMENT]);
  saveTeams(INITIAL_TEAMS);
  saveMatches(demoMatches);
  saveActiveMatchId(demoMatch.id);
  return {
    tournaments: [INITIAL_TOURNAMENT],
    teams: INITIAL_TEAMS,
    matches: demoMatches,
    activeMatchId: demoMatch.id,
  };
}

