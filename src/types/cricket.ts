export type PlayerRole = 'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper';

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  jerseyNumber?: number;
  battingStyle?: 'right' | 'left';
  bowlingStyle?: 'right-arm fast' | 'right-arm spin' | 'left-arm fast' | 'left-arm spin' | 'spin' | 'pace';
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string;
  players: Player[];
}

export type DismissalType =
  | 'bowled'
  | 'caught'
  | 'caught_and_bowled'
  | 'lbw'
  | 'run_out'
  | 'stumped'
  | 'hit_wicket'
  | 'retired_hurt'
  | 'timed_out'
  | 'obstructing_field';

export type ExtraType = 'wide' | 'no_ball' | 'bye' | 'leg_bye' | 'penalty';

export interface Dismissal {
  type: DismissalType;
  outPlayerId: string;
  bowlerId?: string;
  fielderId?: string;
  description: string;
}

export interface BallEvent {
  id: string;
  ballSeq: number; // sequential counter in the innings
  overIndex: number; // 0 for 1st over, 1 for 2nd over, etc.
  ballInOver: number; // 1 to 6 (or 0 if illegal ball before any legal balls)
  isLegal: boolean;
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
  runsBat: number;
  runsExtra: number;
  extraType?: ExtraType;
  isBoundaryFour?: boolean;
  isBoundarySix?: boolean;
  isWicket: boolean;
  dismissal?: Dismissal;
  runsScoredTotal: number;
  comment?: string;
  timestamp: number;
}

export interface BatterStats {
  playerId: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  dismissal?: Dismissal;
  battingOrder: number;
}

export interface BowlerStats {
  playerId: string;
  name: string;
  legalBalls: number;
  oversFormatted: string; // e.g. "3.4"
  maidens: number;
  runsConceded: number;
  wickets: number;
  economyRate: number;
  dots: number;
  wides: number;
  noBalls: number;
}

export interface FallOfWicket {
  wicketNumber: number;
  score: number;
  over: string;
  outPlayerName: string;
  outPlayerId: string;
}

export interface InningsExtras {
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
  penalty: number;
  total: number;
}

export interface InningsState {
  inningsNumber: 1 | 2;
  battingTeamId: string;
  bowlingTeamId: string;
  totalRuns: number;
  totalWickets: number;
  legalBalls: number;
  maxOvers: number;
  currentStrikerId: string;
  currentNonStrikerId: string;
  currentBowlerId: string;
  lastBowlerId?: string;
  batters: Record<string, BatterStats>;
  bowlers: Record<string, BowlerStats>;
  extras: InningsExtras;
  fallOfWickets: FallOfWicket[];
  history: BallEvent[];
  isCompleted: boolean;
}

export type MatchStatus = 'setup' | 'live' | 'break' | 'completed';

export interface MatchResult {
  winnerTeamId?: string; // empty if tie
  winnerName?: string;
  margin: string; // e.g. "by 18 runs" or "by 6 wickets"
  summary: string;
  playerOfTheMatch?: {
    playerId: string;
    playerName: string;
    teamName: string;
    reason: string;
  };
}

export interface Match {
  id: string;
  tournamentId?: string;
  title: string;
  venue: string;
  date: string;
  overs: number;
  oversPerBowler: number;
  ballType: 'tennis' | 'leather';
  teamA: {
    id: string;
    name: string;
    shortName: string;
    color: string;
    playingXI: string[]; // player IDs
  };
  teamB: {
    id: string;
    name: string;
    shortName: string;
    color: string;
    playingXI: string[]; // player IDs
  };
  toss: {
    wonByTeamId: string;
    electedTo: 'bat' | 'bowl';
  };
  status: MatchStatus;
  currentInningsIndex: 0 | 1;
  innings: [InningsState, InningsState];
  target?: number;
  result?: MatchResult;
  updatedAt: number;
}

export interface Tournament {
  id: string;
  name: string;
  city: string;
  ground: string;
  overs: number;
  ballType: 'tennis' | 'leather';
  bannerColor: string;
  teamIds: string[];
  matchIds: string[];
  createdAt: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface PointsTableEntry {
  teamId: string;
  teamName: string;
  shortName: string;
  color: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  nrr: number;
}

