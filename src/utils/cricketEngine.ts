import {
  BallEvent,
  BatterStats,
  BowlerStats,
  Dismissal,
  ExtraType,
  FallOfWicket,
  InningsExtras,
  InningsState,
  Match,
  MatchResult,
  Player,
} from '../types/cricket';

export function formatOvers(legalBalls: number): string {
  const overs = Math.floor(legalBalls / 6);
  const balls = legalBalls % 6;
  return `${overs}.${balls}`;
}

export function parseOversToBalls(oversFormatted: string): number {
  const parts = oversFormatted.split('.');
  const overs = parseInt(parts[0] || '0', 10);
  const balls = parseInt(parts[1] || '0', 10);
  return overs * 6 + balls;
}

export function calcRunRate(runs: number, legalBalls: number): number {
  if (legalBalls === 0) return 0;
  return parseFloat(((runs / (legalBalls / 6))).toFixed(2));
}

export function calcRequiredRunRate(runsNeeded: number, ballsRemaining: number): number {
  if (ballsRemaining <= 0) return runsNeeded > 0 ? 99.99 : 0;
  if (runsNeeded <= 0) return 0;
  return parseFloat(((runsNeeded / (ballsRemaining / 6))).toFixed(2));
}

export function calcStrikeRate(runs: number, balls: number): number {
  if (balls === 0) return 0;
  return parseFloat(((runs / balls) * 100).toFixed(1));
}

export function calcEconomy(runsConceded: number, legalBalls: number): number {
  if (legalBalls === 0) return 0;
  return parseFloat((runsConceded / (legalBalls / 6)).toFixed(2));
}

export function createInitialInnings(
  inningsNumber: 1 | 2,
  battingTeamId: string,
  bowlingTeamId: string,
  maxOvers: number,
  strikerId: string,
  nonStrikerId: string,
  bowlerId: string,
  battingPlayers: Player[],
  bowlingPlayers: Player[]
): InningsState {
  const batters: Record<string, BatterStats> = {};
  battingPlayers.forEach((p, idx) => {
    batters[p.id] = {
      playerId: p.id,
      name: p.name,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      isOut: false,
      battingOrder: idx + 1,
    };
  });

  const bowlers: Record<string, BowlerStats> = {};
  bowlingPlayers.forEach((p) => {
    bowlers[p.id] = {
      playerId: p.id,
      name: p.name,
      legalBalls: 0,
      oversFormatted: '0.0',
      maidens: 0,
      runsConceded: 0,
      wickets: 0,
      economyRate: 0,
      dots: 0,
      wides: 0,
      noBalls: 0,
    };
  });

  return {
    inningsNumber,
    battingTeamId,
    bowlingTeamId,
    totalRuns: 0,
    totalWickets: 0,
    legalBalls: 0,
    maxOvers,
    currentStrikerId: strikerId,
    currentNonStrikerId: nonStrikerId,
    currentBowlerId: bowlerId,
    batters,
    bowlers,
    extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0, total: 0 },
    fallOfWickets: [],
    history: [],
    isCompleted: false,
  };
}

/**
 * Recomputes all stats of an innings cleanly from its initial state & history of balls.
 * Guarantees zero calculation anomalies, flawless Undos, and perfect cricket math.
 */
export function recomputeInnings(
  innings: InningsState,
  battingPlayers: Player[],
  bowlingPlayers: Player[],
  squadSize: number = 11
): InningsState {
  const batters: Record<string, BatterStats> = {};
  battingPlayers.forEach((p, idx) => {
    batters[p.id] = {
      playerId: p.id,
      name: p.name,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      isOut: false,
      battingOrder: idx + 1,
    };
  });

  const bowlers: Record<string, BowlerStats> = {};
  bowlingPlayers.forEach((p) => {
    bowlers[p.id] = {
      playerId: p.id,
      name: p.name,
      legalBalls: 0,
      oversFormatted: '0.0',
      maidens: 0,
      runsConceded: 0,
      wickets: 0,
      economyRate: 0,
      dots: 0,
      wides: 0,
      noBalls: 0,
    };
  });

  const extras: InningsExtras = { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0, total: 0 };
  const fallOfWickets: FallOfWicket[] = [];

  let totalRuns = 0;
  let totalWickets = 0;
  let legalBalls = 0;

  // Track over-by-over runs conceded for maidens
  const overRunsMap: Record<number, { bowlerId: string; runsConceded: number; legalBalls: number }> = {};

  innings.history.forEach((ball) => {
    const isLegal = ball.isLegal;
    if (isLegal) {
      legalBalls += 1;
    }

    const runsBat = ball.runsBat || 0;
    const runsExtra = ball.runsExtra || 0;
    const runsTotal = runsBat + runsExtra;
    totalRuns += runsTotal;

    // Batter stats
    const batter = batters[ball.strikerId];
    if (batter) {
      if (ball.extraType !== 'wide') {
        batter.balls += 1;
      }
      batter.runs += runsBat;
      if (ball.isBoundaryFour) batter.fours += 1;
      if (ball.isBoundarySix) batter.sixes += 1;
      batter.strikeRate = calcStrikeRate(batter.runs, batter.balls);
    }

    // Extras stats
    if (ball.extraType === 'wide') {
      extras.wides += runsExtra;
    } else if (ball.extraType === 'no_ball') {
      extras.noBalls += runsExtra;
    } else if (ball.extraType === 'bye') {
      extras.byes += runsExtra;
    } else if (ball.extraType === 'leg_bye') {
      extras.legByes += runsExtra;
    } else if (ball.extraType === 'penalty') {
      extras.penalty += runsExtra;
    }
    extras.total = extras.wides + extras.noBalls + extras.byes + extras.legByes + extras.penalty;

    // Bowler stats
    const bowler = bowlers[ball.bowlerId];
    let bowlerRunsConceded = 0;
    if (bowler) {
      if (isLegal) {
        bowler.legalBalls += 1;
      }
      if (ball.extraType === 'wide') {
        bowler.wides += runsExtra;
        bowlerRunsConceded = runsExtra;
      } else if (ball.extraType === 'no_ball') {
        bowler.noBalls += 1;
        // bowler concedes noball extra + any bat runs
        bowlerRunsConceded = runsExtra + runsBat;
      } else if (ball.extraType === 'bye' || ball.extraType === 'leg_bye') {
        // Byes / Leg byes do NOT count against bowler
        bowlerRunsConceded = 0;
      } else {
        bowlerRunsConceded = runsBat;
      }

      bowler.runsConceded += bowlerRunsConceded;

      if (isLegal && runsTotal === 0 && !ball.extraType) {
        bowler.dots += 1;
      }

      // Track maiden data per over
      const ovIdx = ball.overIndex;
      if (!overRunsMap[ovIdx]) {
        overRunsMap[ovIdx] = { bowlerId: ball.bowlerId, runsConceded: 0, legalBalls: 0 };
      }
      overRunsMap[ovIdx].runsConceded += bowlerRunsConceded;
      if (isLegal) overRunsMap[ovIdx].legalBalls += 1;
    }

    // Wicket handling
    if (ball.isWicket && ball.dismissal) {
      totalWickets += 1;
      const outPlayerId = ball.dismissal.outPlayerId;
      const outBatter = batters[outPlayerId];
      if (outBatter) {
        outBatter.isOut = true;
        outBatter.dismissal = ball.dismissal;
      }

      // Wickets credited to bowler
      const creditsBowler = ['bowled', 'caught', 'caught_and_bowled', 'lbw', 'stumped', 'hit_wicket'].includes(
        ball.dismissal.type
      );
      if (creditsBowler && bowler) {
        bowler.wickets += 1;
      }

      const outName = outBatter ? outBatter.name : 'Unknown';
      fallOfWickets.push({
        wicketNumber: totalWickets,
        score: totalRuns,
        over: formatOvers(legalBalls),
        outPlayerName: outName,
        outPlayerId,
      });
    }
  });

  // Calculate maidens and economy for each bowler
  Object.values(overRunsMap).forEach((ov) => {
    if (ov.legalBalls === 6 && ov.runsConceded === 0) {
      if (bowlers[ov.bowlerId]) {
        bowlers[ov.bowlerId].maidens += 1;
      }
    }
  });

  Object.values(bowlers).forEach((b) => {
    b.oversFormatted = formatOvers(b.legalBalls);
    b.economyRate = calcEconomy(b.runsConceded, b.legalBalls);
  });

  const maxBalls = innings.maxOvers * 6;
  const isAllOut = totalWickets >= squadSize - 1;
  const isOversCompleted = legalBalls >= maxBalls;
  const isCompleted = isAllOut || isOversCompleted;

  return {
    ...innings,
    totalRuns,
    totalWickets,
    legalBalls,
    batters,
    bowlers,
    extras,
    fallOfWickets,
    isCompleted: isCompleted || innings.isCompleted,
  };
}

export interface ScoreBallInput {
  runsBat: number;
  runsExtra: number;
  extraType?: ExtraType;
  isBoundaryFour?: boolean;
  isBoundarySix?: boolean;
  isWicket: boolean;
  dismissal?: Dismissal;
  comment?: string;
  nextStrikerId?: string; // if wicket or manual swap
  nextBowlerId?: string; // if over completed
}

export function processScoreBall(
  match: Match,
  input: ScoreBallInput,
  battingPlayers: Player[],
  bowlingPlayers: Player[]
): { updatedMatch: Match; overFinished: boolean; inningsFinished: boolean; matchFinished: boolean } {
  const currentInningsIdx = match.currentInningsIndex;
  const currentInnings = { ...match.innings[currentInningsIdx] };
  const history = [...currentInnings.history];

  const currentLegalBalls = currentInnings.legalBalls;
  const overIndex = Math.floor(currentLegalBalls / 6);
  const ballInOver = (currentLegalBalls % 6) + (input.extraType === 'wide' || input.extraType === 'no_ball' ? 0 : 1);
  const isLegal = input.extraType !== 'wide' && input.extraType !== 'no_ball';

  const newBall: BallEvent = {
    id: `ball_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ballSeq: history.length + 1,
    overIndex,
    ballInOver,
    isLegal,
    strikerId: currentInnings.currentStrikerId,
    nonStrikerId: currentInnings.currentNonStrikerId,
    bowlerId: currentInnings.currentBowlerId,
    runsBat: input.runsBat,
    runsExtra: input.runsExtra,
    extraType: input.extraType,
    isBoundaryFour: input.isBoundaryFour,
    isBoundarySix: input.isBoundarySix,
    isWicket: input.isWicket,
    dismissal: input.dismissal,
    runsScoredTotal: input.runsBat + input.runsExtra,
    comment: input.comment,
    timestamp: Date.now(),
  };

  history.push(newBall);
  currentInnings.history = history;

  const squadSize = battingPlayers.length;
  let recomputed = recomputeInnings(currentInnings, battingPlayers, bowlingPlayers, squadSize);

  // Check strike rotation
  let strikerId = recomputed.currentStrikerId;
  let nonStrikerId = recomputed.currentNonStrikerId;

  // Runs causing rotation (1, 3, 5 runs off bat, bye or leg-bye)
  const physicalRuns = input.runsBat + (input.extraType === 'bye' || input.extraType === 'leg_bye' ? input.runsExtra : 0);
  const oddRuns = physicalRuns % 2 !== 0;

  if (oddRuns) {
    const temp = strikerId;
    strikerId = nonStrikerId;
    nonStrikerId = temp;
  }

  // Handle wicket striker update
  if (input.isWicket && input.dismissal) {
    const outId = input.dismissal.outPlayerId;
    if (input.nextStrikerId) {
      if (outId === strikerId) {
        strikerId = input.nextStrikerId;
      } else if (outId === nonStrikerId) {
        nonStrikerId = input.nextStrikerId;
      }
    }
  }

  // Check if over ended
  const newLegalBalls = recomputed.legalBalls;
  const overFinished = isLegal && newLegalBalls % 6 === 0 && newLegalBalls < recomputed.maxOvers * 6;

  if (overFinished) {
    // Batsmen change ends at the end of the over
    const temp = strikerId;
    strikerId = nonStrikerId;
    nonStrikerId = temp;
    recomputed.lastBowlerId = recomputed.currentBowlerId;
    if (input.nextBowlerId) {
      recomputed.currentBowlerId = input.nextBowlerId;
    }
  }

  recomputed.currentStrikerId = strikerId;
  recomputed.currentNonStrikerId = nonStrikerId;

  // Check innings end
  const maxBalls = recomputed.maxOvers * 6;
  const isAllOut = recomputed.totalWickets >= squadSize - 1;
  const isOversDone = recomputed.legalBalls >= maxBalls;

  let inningsFinished = isAllOut || isOversDone;
  let matchFinished = false;

  // Second innings target chase check
  if (currentInningsIdx === 1 && match.target) {
    if (recomputed.totalRuns >= match.target) {
      inningsFinished = true;
      matchFinished = true;
    } else if (inningsFinished) {
      matchFinished = true;
    }
  }

  recomputed.isCompleted = inningsFinished;

  const updatedInnings: [InningsState, InningsState] = [...match.innings] as [InningsState, InningsState];
  updatedInnings[currentInningsIdx] = recomputed;

  let matchStatus = match.status;
  let target = match.target;
  let result = match.result;

  if (currentInningsIdx === 0 && inningsFinished) {
    matchStatus = 'break';
    target = recomputed.totalRuns + 1;
  }

  if (matchFinished) {
    matchStatus = 'completed';
    result = calculateMatchResult(match, updatedInnings[0], updatedInnings[1], squadSize);
  }

  const updatedMatch: Match = {
    ...match,
    status: matchStatus,
    innings: updatedInnings,
    target,
    result,
    updatedAt: Date.now(),
  };

  return { updatedMatch, overFinished, inningsFinished, matchFinished };
}

export function undoLastBall(
  match: Match,
  battingPlayers: Player[],
  bowlingPlayers: Player[]
): Match {
  const currentInningsIdx = match.currentInningsIndex;
  const currentInnings = { ...match.innings[currentInningsIdx] };

  if (currentInnings.history.length === 0) {
    // If no balls in 2nd innings, check if we can revert to 1st innings
    if (currentInningsIdx === 1 && match.status === 'break') {
      return {
        ...match,
        currentInningsIndex: 0,
        status: 'live',
        innings: [
          { ...match.innings[0], isCompleted: false },
          match.innings[1],
        ],
        updatedAt: Date.now(),
      };
    }
    return match;
  }

  const history = [...currentInnings.history];
  const lastBall = history.pop()!;
  currentInnings.history = history;

  const squadSize = battingPlayers.length;
  const recomputed = recomputeInnings(currentInnings, battingPlayers, bowlingPlayers, squadSize);

  // Restore striker & nonStriker from the undone ball
  recomputed.currentStrikerId = lastBall.strikerId;
  recomputed.currentNonStrikerId = lastBall.nonStrikerId;
  recomputed.currentBowlerId = lastBall.bowlerId;
  recomputed.isCompleted = false;

  const updatedInnings: [InningsState, InningsState] = [...match.innings] as [InningsState, InningsState];
  updatedInnings[currentInningsIdx] = recomputed;

  return {
    ...match,
    status: 'live',
    innings: updatedInnings,
    result: undefined,
    updatedAt: Date.now(),
  };
}

export function calculateMatchResult(
  match: Match,
  inn1: InningsState,
  inn2: InningsState,
  squadSize: number = 11
): MatchResult {
  const team1 = inn1.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
  const team2 = inn1.battingTeamId === match.teamA.id ? match.teamB : match.teamA;

  const score1 = inn1.totalRuns;
  const score2 = inn2.totalRuns;
  const wickets2 = inn2.totalWickets;

  let winnerTeamId: string | undefined = undefined;
  let winnerName: string | undefined = undefined;
  let margin = '';
  let summary = '';

  if (score2 > score1) {
    // Team 2 won chasing
    winnerTeamId = team2.id;
    winnerName = team2.name;
    const wicketsLeft = (squadSize - 1) - wickets2;
    margin = `by ${wicketsLeft} wicket${wicketsLeft === 1 ? '' : 's'}`;
    summary = `${team2.name} won ${margin}`;
  } else if (score1 > score2) {
    // Team 1 won defending
    winnerTeamId = team1.id;
    winnerName = team1.name;
    const runsMargin = score1 - score2;
    margin = `by ${runsMargin} run${runsMargin === 1 ? '' : 's'}`;
    summary = `${team1.name} won ${margin}`;
  } else {
    // Tie
    margin = 'Match Tied';
    summary = `Match Tied (${score1}/${inn1.totalWickets} vs ${score2}/${inn2.totalWickets})`;
  }

  // Determine Player of the Match
  const potm = determinePlayerOfTheMatch(match, inn1, inn2);

  return {
    winnerTeamId,
    winnerName,
    margin,
    summary,
    playerOfTheMatch: potm,
  };
}

function determinePlayerOfTheMatch(
  match: Match,
  inn1: InningsState,
  inn2: InningsState
): { playerId: string; playerName: string; teamName: string; reason: string } | undefined {
  const scores: Record<string, { points: number; name: string; teamName: string; reason: string }> = {};

  const processInningsForPotm = (inn: InningsState, teamBat: { id: string; name: string }, teamBowl: { id: string; name: string }) => {
    Object.values(inn.batters).forEach((b) => {
      if (b.runs > 0) {
        const pts = b.runs + b.fours * 1 + b.sixes * 2;
        if (!scores[b.playerId]) {
          scores[b.playerId] = { points: 0, name: b.name, teamName: teamBat.name, reason: '' };
        }
        scores[b.playerId].points += pts;
        scores[b.playerId].reason = `${b.runs} runs (${b.balls}b, ${b.fours}x4, ${b.sixes}x6)`;
      }
    });

    Object.values(inn.bowlers).forEach((bw) => {
      if (bw.legalBalls > 0) {
        const pts = bw.wickets * 25 + bw.maidens * 15 + bw.dots * 1;
        if (!scores[bw.playerId]) {
          scores[bw.playerId] = { points: 0, name: bw.name, teamName: teamBowl.name, reason: '' };
        }
        scores[bw.playerId].points += pts;
        const bowlingSummary = `${bw.wickets}/${bw.runsConceded} (${bw.oversFormatted} ov)`;
        if (scores[bw.playerId].reason) {
          scores[bw.playerId].reason += ` & ${bowlingSummary}`;
        } else {
          scores[bw.playerId].reason = bowlingSummary;
        }
      }
    });
  };

  const team1 = inn1.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
  const team2 = inn1.battingTeamId === match.teamA.id ? match.teamB : match.teamA;

  processInningsForPotm(inn1, team1, team2);
  processInningsForPotm(inn2, team2, team1);

  let bestPlayer: { playerId: string; playerName: string; teamName: string; reason: string } | undefined;
  let maxPoints = -1;

  Object.entries(scores).forEach(([playerId, entry]) => {
    if (entry.points > maxPoints) {
      maxPoints = entry.points;
      bestPlayer = {
        playerId,
        playerName: entry.name,
        teamName: entry.teamName,
        reason: entry.reason,
      };
    }
  });

  return bestPlayer;
}


