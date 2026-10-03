import React, { useState } from 'react';
import { DismissalType, ExtraType, Match, Player } from '../../types/cricket';
import { processScoreBall, undoLastBall } from '../../utils/cricketEngine';
import { BallCommentary } from './BallCommentary';
import { ExtrasModal } from './ExtrasModal';
import { FullScorecard } from './FullScorecard';
import { LivePitchCard } from './LivePitchCard';
import { MatchEndInningsModal } from './MatchEndInningsModal';
import { MatchInfoTab } from './MatchInfoTab';
import { MatchResultModal } from './MatchResultModal';
import { NewBatterModal } from './NewBatterModal';
import { OverCompleteModal } from './OverCompleteModal';
import { ScoreboardHeader } from './ScoreboardHeader';
import { ScoringKeypad } from './ScoringKeypad';
import { ThisOverStrip } from './ThisOverStrip';
import { WicketModal } from './WicketModal';

interface ScoringConsoleProps {
  match: Match;
  allPlayers: Player[];
  onUpdateMatch: (updated: Match) => void;
  onBack: () => void;
}

export const ScoringConsole: React.FC<ScoringConsoleProps> = ({
  match,
  allPlayers,
  onUpdateMatch,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'scoring' | 'scorecard' | 'commentary' | 'info'>('scoring');

  // Modals state
  const [isWicketModalOpen, setIsWicketModalOpen] = useState(false);
  const [isExtrasModalOpen, setIsExtrasModalOpen] = useState(false);
  const [isOverCompleteModalOpen, setIsOverCompleteModalOpen] = useState(false);
  const [isMatchResultModalOpen, setIsMatchResultModalOpen] = useState(match.status === 'completed');
  const [isManualBatterModalOpen, setIsManualBatterModalOpen] = useState(false);
  const [manualBatterTarget, setManualBatterTarget] = useState<'striker' | 'nonStriker'>('striker');
  const [isManualBowlerModalOpen, setIsManualBowlerModalOpen] = useState(false);

  // Current innings and teams
  const currentInnIdx = match.currentInningsIndex;
  const currentInn = match.innings[currentInnIdx];
  const isTeamABatting = currentInn.battingTeamId === match.teamA.id;

  const battingTeam = isTeamABatting ? match.teamA : match.teamB;
  const bowlingTeam = isTeamABatting ? match.teamB : match.teamA;

  const teamAPlayers = allPlayers.filter((p) => match.teamA.playingXI.includes(p.id));
  const teamBPlayers = allPlayers.filter((p) => match.teamB.playingXI.includes(p.id));

  const battingPlayers = isTeamABatting ? teamAPlayers : teamBPlayers;
  const bowlingPlayers = isTeamABatting ? teamBPlayers : teamAPlayers;

  const striker = battingPlayers.find((p) => p.id === currentInn.currentStrikerId) || battingPlayers[0];
  const nonStriker =
    battingPlayers.find((p) => p.id === currentInn.currentNonStrikerId) || battingPlayers[1] || battingPlayers[0];
  const bowler = bowlingPlayers.find((p) => p.id === currentInn.currentBowlerId) || bowlingPlayers[0];

  // Eligible next batters (those who haven't batted yet and are not current striker/non-striker)
  const availableBatters = battingPlayers.filter((p) => {
    const stat = currentInn.batters[p.id];
    if (stat && stat.isOut) return false;
    if (p.id === currentInn.currentStrikerId || p.id === currentInn.currentNonStrikerId) return false;
    return true;
  });

  // Handle regular run score
  const handleScoreRun = (runs: number, isBoundaryFour = false, isBoundarySix = false) => {
    if (match.status !== 'live') return;

    const { updatedMatch, overFinished, inningsFinished, matchFinished } = processScoreBall(
      match,
      {
        runsBat: runs,
        runsExtra: 0,
        isBoundaryFour,
        isBoundarySix,
        isWicket: false,
      },
      battingPlayers,
      bowlingPlayers
    );

    onUpdateMatch(updatedMatch);

    if (matchFinished) {
      setIsMatchResultModalOpen(true);
    } else if (overFinished) {
      setIsOverCompleteModalOpen(true);
    }
  };

  // Handle quick extra (Wide, No Ball, Bye, Leg Bye)
  const handleQuickExtra = (type: ExtraType) => {
    if (match.status !== 'live') return;

    const isLegal = type !== 'wide' && type !== 'no_ball';
    const { updatedMatch, overFinished, matchFinished } = processScoreBall(
      match,
      {
        runsBat: 0,
        runsExtra: 1,
        extraType: type,
        isWicket: false,
      },
      battingPlayers,
      bowlingPlayers
    );

    onUpdateMatch(updatedMatch);

    if (matchFinished) {
      setIsMatchResultModalOpen(true);
    } else if (isLegal && overFinished) {
      setIsOverCompleteModalOpen(true);
    }
  };

  // Handle custom extras from modal
  const handleConfirmExtra = (params: {
    extraType: ExtraType;
    runsBat: number;
    runsExtra: number;
    isBoundaryFour?: boolean;
    isBoundarySix?: boolean;
  }) => {
    setIsExtrasModalOpen(false);
    const isLegal = params.extraType !== 'wide' && params.extraType !== 'no_ball';

    const { updatedMatch, overFinished, matchFinished } = processScoreBall(
      match,
      {
        runsBat: params.runsBat,
        runsExtra: params.runsExtra,
        extraType: params.extraType,
        isBoundaryFour: params.isBoundaryFour,
        isBoundarySix: params.isBoundarySix,
        isWicket: false,
      },
      battingPlayers,
      bowlingPlayers
    );

    onUpdateMatch(updatedMatch);

    if (matchFinished) {
      setIsMatchResultModalOpen(true);
    } else if (isLegal && overFinished) {
      setIsOverCompleteModalOpen(true);
    }
  };

  // Handle wicket confirmation
  const handleConfirmWicket = (params: {
    dismissalType: DismissalType;
    outPlayerId: string;
    fielderId?: string;
    runsCompleted: number;
    extraType?: ExtraType;
    nextBatterId: string;
  }) => {
    setIsWicketModalOpen(false);

    const dismissal = {
      type: params.dismissalType,
      outPlayerId: params.outPlayerId,
      bowlerId: bowler.id,
      fielderId: params.fielderId,
      description: `${params.dismissalType} out`,
    };

    const { updatedMatch, overFinished, matchFinished } = processScoreBall(
      match,
      {
        runsBat: params.runsCompleted,
        runsExtra: params.extraType === 'wide' || params.extraType === 'no_ball' ? 1 : 0,
        extraType: params.extraType,
        isWicket: true,
        dismissal,
        nextStrikerId: params.nextBatterId,
      },
      battingPlayers,
      bowlingPlayers
    );

    onUpdateMatch(updatedMatch);

    if (matchFinished) {
      setIsMatchResultModalOpen(true);
    } else if (overFinished) {
      setIsOverCompleteModalOpen(true);
    }
  };

  // Handle Over complete next bowler select
  const handleSelectOverBowler = (bowlerId: string) => {
    setIsOverCompleteModalOpen(false);
    const updatedInnings = [...match.innings] as [typeof currentInn, typeof currentInn];
    updatedInnings[currentInnIdx] = {
      ...currentInn,
      currentBowlerId: bowlerId,
    };
    onUpdateMatch({
      ...match,
      innings: updatedInnings,
      updatedAt: Date.now(),
    });
  };

  // Handle Undo
  const handleUndo = () => {
    const reverted = undoLastBall(match, battingPlayers, bowlingPlayers);
    onUpdateMatch(reverted);
  };

  // Handle Strike Swap
  const handleSwapEnds = () => {
    const updatedInnings = [...match.innings] as [typeof currentInn, typeof currentInn];
    const prevStriker = currentInn.currentStrikerId;
    const prevNonStriker = currentInn.currentNonStrikerId;

    updatedInnings[currentInnIdx] = {
      ...currentInn,
      currentStrikerId: prevNonStriker,
      currentNonStrikerId: prevStriker,
    };
    onUpdateMatch({
      ...match,
      innings: updatedInnings,
      updatedAt: Date.now(),
    });
  };

  // Handle manual batter change
  const handleSelectManualBatter = (batterId: string) => {
    setIsManualBatterModalOpen(false);
    const updatedInnings = [...match.innings] as [typeof currentInn, typeof currentInn];
    if (manualBatterTarget === 'striker') {
      updatedInnings[currentInnIdx] = {
        ...currentInn,
        currentStrikerId: batterId,
      };
    } else {
      updatedInnings[currentInnIdx] = {
        ...currentInn,
        currentNonStrikerId: batterId,
      };
    }
    onUpdateMatch({
      ...match,
      innings: updatedInnings,
      updatedAt: Date.now(),
    });
  };

  // Handle manual bowler change
  const handleSelectManualBowler = (bowlerId: string) => {
    setIsManualBowlerModalOpen(false);
    const updatedInnings = [...match.innings] as [typeof currentInn, typeof currentInn];
    updatedInnings[currentInnIdx] = {
      ...currentInn,
      currentBowlerId: bowlerId,
    };
    onUpdateMatch({
      ...match,
      innings: updatedInnings,
      updatedAt: Date.now(),
    });
  };

  // Handle Start 2nd Innings
  const handleStartSecondInnings = (params: {
    strikerId: string;
    nonStrikerId: string;
    openingBowlerId: string;
  }) => {
    const updatedInnings = [...match.innings] as [typeof currentInn, typeof currentInn];
    updatedInnings[1] = {
      ...updatedInnings[1],
      currentStrikerId: params.strikerId,
      currentNonStrikerId: params.nonStrikerId,
      currentBowlerId: params.openingBowlerId,
    };

    onUpdateMatch({
      ...match,
      status: 'live',
      currentInningsIndex: 1,
      innings: updatedInnings,
      updatedAt: Date.now(),
    });
  };

  // Handle Early Innings End
  const handleEndInningsPrompt = () => {
    const confirmEnd = window.confirm(
      currentInnIdx === 0
        ? 'End 1st Innings and set target for 2nd Innings?'
        : 'Conclude match now?'
    );
    if (!confirmEnd) return;

    if (currentInnIdx === 0) {
      onUpdateMatch({
        ...match,
        status: 'break',
        target: currentInn.totalRuns + 1,
        innings: [
          { ...currentInn, isCompleted: true },
          match.innings[1],
        ],
        updatedAt: Date.now(),
      });
    } else {
      const { updatedMatch } = processScoreBall(
        match,
        { runsBat: 0, runsExtra: 0, isWicket: false },
        battingPlayers,
        bowlingPlayers
      );
      onUpdateMatch({
        ...updatedMatch,
        status: 'completed',
      });
      setIsMatchResultModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Sticky Top Scoreboard Header */}
      <ScoreboardHeader
        match={match}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBack={onBack}
        onUndo={handleUndo}
        canUndo={currentInn.history.length > 0}
        onEndInningsPrompt={handleEndInningsPrompt}
      />

      {/* Main Tab Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-4 pb-20">
        {activeTab === 'scoring' && (
          <div className="space-y-3">
            {/* Live Batter & Bowler Pitch Card */}
            <LivePitchCard
              innings={currentInn}
              battingPlayers={battingPlayers}
              bowlingPlayers={bowlingPlayers}
              onSwapStriker={handleSwapEnds}
              onChangeBowler={() => setIsManualBowlerModalOpen(true)}
              onChangeStriker={() => {
                setManualBatterTarget('striker');
                setIsManualBatterModalOpen(true);
              }}
              onChangeNonStriker={() => {
                setManualBatterTarget('nonStriker');
                setIsManualBatterModalOpen(true);
              }}
            />

            {/* This Over Strip */}
            <ThisOverStrip
              history={currentInn.history}
              legalBalls={currentInn.legalBalls}
            />

            {/* CricHeroes Tactile Keypad */}
            <ScoringKeypad
              disabled={match.status !== 'live'}
              onScoreRun={handleScoreRun}
              onQuickExtra={handleQuickExtra}
              onOpenWicketModal={() => setIsWicketModalOpen(true)}
              onOpenExtrasModal={() => setIsExtrasModalOpen(true)}
              onSwapEnds={handleSwapEnds}
              onUndo={handleUndo}
              canUndo={currentInn.history.length > 0}
            />
          </div>
        )}

        {activeTab === 'scorecard' && (
          <FullScorecard
            match={match}
            teamAPlayers={teamAPlayers}
            teamBPlayers={teamBPlayers}
          />
        )}

        {activeTab === 'commentary' && (
          <BallCommentary
            history={currentInn.history}
            battingPlayers={battingPlayers}
            bowlingPlayers={bowlingPlayers}
          />
        )}

        {activeTab === 'info' && (
          <MatchInfoTab
            match={match}
            teamAPlayers={teamAPlayers}
            teamBPlayers={teamBPlayers}
          />
        )}
      </div>

      {/* Fall of Wicket Modal */}
      {isWicketModalOpen && (
        <WicketModal
          isOpen={isWicketModalOpen}
          onClose={() => setIsWicketModalOpen(false)}
          striker={striker}
          nonStriker={nonStriker}
          bowler={bowler}
          bowlingTeamPlayers={bowlingPlayers}
          availableBatters={availableBatters}
          onConfirmWicket={handleConfirmWicket}
        />
      )}

      {/* Extras Modal */}
      {isExtrasModalOpen && (
        <ExtrasModal
          isOpen={isExtrasModalOpen}
          onClose={() => setIsExtrasModalOpen(false)}
          onConfirmExtra={handleConfirmExtra}
        />
      )}

      {/* Over Complete Modal */}
      {isOverCompleteModalOpen && (
        <OverCompleteModal
          isOpen={isOverCompleteModalOpen}
          onClose={() => setIsOverCompleteModalOpen(false)}
          overNumber={Math.floor(currentInn.legalBalls / 6)}
          lastBowler={bowler}
          bowlingTeamPlayers={bowlingPlayers}
          bowlerStats={currentInn.bowlers}
          maxOversPerBowler={match.oversPerBowler}
          onSelectBowler={handleSelectOverBowler}
        />
      )}

      {/* Innings Break Modal */}
      {match.status === 'break' && (
        <MatchEndInningsModal
          isOpen={match.status === 'break'}
          match={match}
          chasingTeamPlayers={bowlingPlayers}
          defendingTeamPlayers={battingPlayers}
          onStartSecondInnings={handleStartSecondInnings}
        />
      )}

      {/* Match Result Celebration Modal */}
      {isMatchResultModalOpen && match.result && (
        <MatchResultModal
          isOpen={isMatchResultModalOpen}
          match={match}
          onViewScorecard={() => {
            setIsMatchResultModalOpen(false);
            setActiveTab('scorecard');
          }}
          onClose={() => setIsMatchResultModalOpen(false)}
        />
      )}

      {/* Manual Change Batter Modal */}
      {isManualBatterModalOpen && (
        <NewBatterModal
          isOpen={isManualBatterModalOpen}
          onClose={() => setIsManualBatterModalOpen(false)}
          title={`Select ${manualBatterTarget === 'striker' ? 'Striker' : 'Non-Striker'}`}
          availableBatters={battingPlayers.filter(
            (p) =>
              p.id !== (manualBatterTarget === 'striker' ? currentInn.currentNonStrikerId : currentInn.currentStrikerId)
          )}
          onSelectBatter={handleSelectManualBatter}
        />
      )}

      {/* Manual Change Bowler Modal */}
      {isManualBowlerModalOpen && (
        <OverCompleteModal
          isOpen={isManualBowlerModalOpen}
          onClose={() => setIsManualBowlerModalOpen(false)}
          overNumber={Math.floor(currentInn.legalBalls / 6) + 1}
          lastBowler={bowler}
          bowlingTeamPlayers={bowlingPlayers}
          bowlerStats={currentInn.bowlers}
          maxOversPerBowler={match.oversPerBowler}
          onSelectBowler={handleSelectManualBowler}
        />
      )}
    </div>
  );
};


