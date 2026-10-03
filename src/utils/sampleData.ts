import { Match, Player, Team, Tournament } from '../types/cricket';
import { createInitialInnings, processScoreBall } from './cricketEngine';

export const INITIAL_PLAYERS: Player[] = [
  // Mumbai Blasters
  { id: 'p_mb_1', name: 'Rohit Sharma (C)', role: 'batsman', battingStyle: 'right' },
  { id: 'p_mb_2', name: 'Ishan Kishan (WK)', role: 'wicketkeeper', battingStyle: 'left' },
  { id: 'p_mb_3', name: 'Suryakumar Yadav', role: 'batsman', battingStyle: 'right' },
  { id: 'p_mb_4', name: 'Tilak Varma', role: 'batsman', battingStyle: 'left' },
  { id: 'p_mb_5', name: 'Hardik Pandya', role: 'allrounder', battingStyle: 'right', bowlingStyle: 'right-arm fast' },
  { id: 'p_mb_6', name: 'Tim David', role: 'batsman', battingStyle: 'right' },
  { id: 'p_mb_7', name: 'Jasprit Bumrah', role: 'bowler', battingStyle: 'right', bowlingStyle: 'right-arm fast' },
  { id: 'p_mb_8', name: 'Piyush Chawla', role: 'bowler', battingStyle: 'left', bowlingStyle: 'right-arm spin' },

  // Bangalore Royals
  { id: 'p_br_1', name: 'Virat Kohli (C)', role: 'batsman', battingStyle: 'right' },
  { id: 'p_br_2', name: 'Faf du Plessis', role: 'batsman', battingStyle: 'right' },
  { id: 'p_br_3', name: 'Glenn Maxwell', role: 'allrounder', battingStyle: 'right', bowlingStyle: 'right-arm spin' },
  { id: 'p_br_4', name: 'Rajat Patidar', role: 'batsman', battingStyle: 'right' },
  { id: 'p_br_5', name: 'Dinesh Karthik (WK)', role: 'wicketkeeper', battingStyle: 'right' },
  { id: 'p_br_6', name: 'Mohammed Siraj', role: 'bowler', battingStyle: 'right', bowlingStyle: 'right-arm fast' },
  { id: 'p_br_7', name: 'Yash Dayal', role: 'bowler', battingStyle: 'left', bowlingStyle: 'left-arm fast' },
  { id: 'p_br_8', name: 'Karn Sharma', role: 'bowler', battingStyle: 'left', bowlingStyle: 'right-arm spin' },

  // Chennai Super Warriors
  { id: 'p_cw_1', name: 'Ruturaj Gaikwad (C)', role: 'batsman', battingStyle: 'right' },
  { id: 'p_cw_2', name: 'Devon Conway', role: 'batsman', battingStyle: 'left' },
  { id: 'p_cw_3', name: 'Shivam Dube', role: 'allrounder', battingStyle: 'left', bowlingStyle: 'right-arm fast' },
  { id: 'p_cw_4', name: 'Ravindra Jadeja', role: 'allrounder', battingStyle: 'left', bowlingStyle: 'left-arm spin' },
  { id: 'p_cw_5', name: 'MS Dhoni (WK)', role: 'wicketkeeper', battingStyle: 'right' },
  { id: 'p_cw_6', name: 'Deepak Chahar', role: 'bowler', battingStyle: 'right', bowlingStyle: 'right-arm fast' },
  { id: 'p_cw_7', name: 'Matheesha Pathirana', role: 'bowler', battingStyle: 'right', bowlingStyle: 'right-arm fast' },

  // Delhi Challengers
  { id: 'p_dc_1', name: 'Rishabh Pant (C & WK)', role: 'wicketkeeper', battingStyle: 'left' },
  { id: 'p_dc_2', name: 'David Warner', role: 'batsman', battingStyle: 'left' },
  { id: 'p_dc_3', name: 'Prithvi Shaw', role: 'batsman', battingStyle: 'right' },
  { id: 'p_dc_4', name: 'Axar Patel', role: 'allrounder', battingStyle: 'left', bowlingStyle: 'left-arm spin' },
  { id: 'p_dc_5', name: 'Kuldeep Yadav', role: 'bowler', battingStyle: 'left', bowlingStyle: 'left-arm spin' },
  { id: 'p_dc_6', name: 'Khaleel Ahmed', role: 'bowler', battingStyle: 'right', bowlingStyle: 'left-arm fast' },
  { id: 'p_dc_7', name: 'Anrich Nortje', role: 'bowler', battingStyle: 'right', bowlingStyle: 'right-arm fast' },
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team_mb',
    name: 'Mumbai Blasters',
    shortName: 'MB',
    color: '#1d4ed8', // Royal Blue
    players: INITIAL_PLAYERS.filter((p) => p.id.startsWith('p_mb_')),
  },
  {
    id: 'team_br',
    name: 'Bangalore Royals',
    shortName: 'BR',
    color: '#b91c1c', // Crimson Red
    players: INITIAL_PLAYERS.filter((p) => p.id.startsWith('p_br_')),
  },
  {
    id: 'team_cw',
    name: 'Chennai Super Warriors',
    shortName: 'CSW',
    color: '#eab308', // Yellow
    players: INITIAL_PLAYERS.filter((p) => p.id.startsWith('p_cw_')),
  },
  {
    id: 'team_dc',
    name: 'Delhi Challengers',
    shortName: 'DC',
    color: '#0284c7', // Sky Blue
    players: INITIAL_PLAYERS.filter((p) => p.id.startsWith('p_dc_')),
  },
];

export const INITIAL_TOURNAMENT: Tournament = {
  id: 'tour_premier_2026',
  name: 'Champions Premier League 2026',
  city: 'Mumbai',
  ground: 'Wankhede Cricket Ground',
  overs: 10,
  ballType: 'leather',
  bannerColor: '#047857',
  teamIds: ['team_mb', 'team_br', 'team_cw', 'team_dc'],
  matchIds: ['match_demo_1'],
  createdAt: Date.now() - 86400000 * 2,
  status: 'ongoing',
};

export function createDemoMatch(): Match {
  const teamMB = INITIAL_TEAMS[0];
  const teamBR = INITIAL_TEAMS[1];

  const mbXI = teamMB.players.slice(0, 6).map((p) => p.id);
  const brXI = teamBR.players.slice(0, 6).map((p) => p.id);

  const inn1 = createInitialInnings(
    1,
    teamMB.id,
    teamBR.id,
    10,
    teamMB.players[0].id, // Rohit
    teamMB.players[1].id, // Ishan
    teamBR.players[5].id, // Siraj
    teamMB.players.slice(0, 6),
    teamBR.players.slice(0, 6)
  );

  const inn2 = createInitialInnings(
    2,
    teamBR.id,
    teamMB.id,
    10,
    teamBR.players[0].id,
    teamBR.players[1].id,
    teamMB.players[6].id,
    teamBR.players.slice(0, 6),
    teamMB.players.slice(0, 6)
  );

  let match: Match = {
    id: 'match_demo_1',
    tournamentId: 'tour_premier_2026',
    title: 'Match 1 - Mumbai Blasters vs Bangalore Royals',
    venue: 'Wankhede Stadium, Pitch #2',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    overs: 10,
    oversPerBowler: 2,
    ballType: 'leather',
    teamA: {
      id: teamMB.id,
      name: teamMB.name,
      shortName: teamMB.shortName,
      color: teamMB.color,
      playingXI: mbXI,
    },
    teamB: {
      id: teamBR.id,
      name: teamBR.name,
      shortName: teamBR.shortName,
      color: teamBR.color,
      playingXI: brXI,
    },
    toss: {
      wonByTeamId: teamMB.id,
      electedTo: 'bat',
    },
    status: 'live',
    currentInningsIndex: 0,
    innings: [inn1, inn2],
    updatedAt: Date.now(),
  };

  const battingSquad = teamMB.players.slice(0, 6);
  const bowlingSquad = teamBR.players.slice(0, 6);

  // Pre-score a couple of exciting balls so the dashboard & console are alive immediately
  const initialBalls = [
    { runsBat: 0, runsExtra: 0, isWicket: false },
    { runsBat: 4, runsExtra: 0, isBoundaryFour: true, isWicket: false },
    { runsBat: 1, runsExtra: 0, isWicket: false },
    { runsBat: 0, runsExtra: 0, isWicket: false },
    { runsBat: 2, runsExtra: 0, isWicket: false },
    { runsBat: 1, runsExtra: 0, isWicket: false, nextBowlerId: teamBR.players[6].id }, // Yash Dayal
    { runsBat: 4, runsExtra: 0, isBoundaryFour: true, isWicket: false },
    { runsBat: 0, runsExtra: 0, isWicket: false },
  ];

  initialBalls.forEach((b) => {
    const res = processScoreBall(match, b, battingSquad, bowlingSquad);
    match = res.updatedMatch;
  });

  return match;
}



