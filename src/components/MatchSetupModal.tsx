import React, { useState } from 'react';
import { Match, Team, Tournament } from '../types/cricket';
import { createInitialInnings } from '../utils/cricketEngine';

interface MatchSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournaments: Tournament[];
  teams: Team[];
  defaultTournamentId?: string;
  onStartMatch: (newMatch: Match) => void;
}

export const MatchSetupModal: React.FC<MatchSetupModalProps> = ({
  isOpen,
  onClose,
  tournaments,
  teams,
  defaultTournamentId,
  onStartMatch,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Basic Info
  const [tournamentId, setTournamentId] = useState<string>(defaultTournamentId || '');
  const [title, setTitle] = useState<string>('');
  const [venue, setVenue] = useState<string>('Wankhede Cricket Ground');
  const [overs, setOvers] = useState<number>(10);
  const [oversPerBowler, setOversPerBowler] = useState<number>(2);
  const [ballType, setBallType] = useState<'tennis' | 'leather'>('leather');
  const [teamAId, setTeamAId] = useState<string>(teams[0]?.id || '');
  const [teamBId, setTeamBId] = useState<string>(teams[1]?.id || '');

  // Step 2: Lineups
  const [teamAPlayingXI, setTeamAPlayingXI] = useState<string[]>([]);
  const [teamBPlayingXI, setTeamBPlayingXI] = useState<string[]>([]);

  // Step 3: Toss & Openers
  const [tossWonBy, setTossWonBy] = useState<string>(teamAId);
  const [electedTo, setElectedTo] = useState<'bat' | 'bowl'>('bat');
  const [strikerId, setStrikerId] = useState<string>('');
  const [nonStrikerId, setNonStrikerId] = useState<string>('');
  const [openingBowlerId, setOpeningBowlerId] = useState<string>('');

  if (!isOpen) return null;

  const teamA = teams.find((t) => t.id === teamAId) || teams[0];
  const teamB = teams.find((t) => t.id === teamBId) || teams[1];

  // Auto-init playing XI when moving to step 2 if empty
  const handleProceedToStep2 = () => {
    if (teamAId === teamBId) {
      alert('Team A and Team B must be different.');
      return;
    }
    if (overs <= 0) {
      alert('Overs must be at least 1.');
      return;
    }
    if (!title) {
      setTitle(`${teamA.name} vs ${teamB.name}`);
    }
    if (teamAPlayingXI.length === 0) {
      setTeamAPlayingXI(teamA.players.map((p) => p.id));
    }
    if (teamBPlayingXI.length === 0) {
      setTeamBPlayingXI(teamB.players.map((p) => p.id));
    }
    setTossWonBy(teamAId);
    setStep(2);
  };

  const handleProceedToStep3 = () => {
    if (teamAPlayingXI.length < 2 || teamBPlayingXI.length < 2) {
      alert('Both teams must have at least 2 players selected.');
      return;
    }

    // Determine who bats first
    const firstBattingTeamId =
      (tossWonBy === teamAId && electedTo === 'bat') || (tossWonBy === teamBId && electedTo === 'bowl')
        ? teamAId
        : teamBId;

    const battingTeam = firstBattingTeamId === teamAId ? teamA : teamB;
    const bowlingTeam = firstBattingTeamId === teamAId ? teamB : teamA;
    const battingXI = firstBattingTeamId === teamAId ? teamAPlayingXI : teamBPlayingXI;
    const bowlingXI = firstBattingTeamId === teamAId ? teamBPlayingXI : teamAPlayingXI;

    setStrikerId(battingXI[0] || '');
    setNonStrikerId(battingXI[1] || '');
    setOpeningBowlerId(bowlingXI[bowlingXI.length - 1] || bowlingXI[0] || '');

    setStep(3);
  };

  const handleStartGame = () => {
    if (!strikerId || !nonStrikerId || !openingBowlerId) {
      alert('Please select Striker, Non-Striker, and Opening Bowler.');
      return;
    }
    if (strikerId === nonStrikerId) {
      alert('Striker and Non-Striker must be different players.');
      return;
    }

    const firstBattingTeamId =
      (tossWonBy === teamAId && electedTo === 'bat') || (tossWonBy === teamBId && electedTo === 'bowl')
        ? teamAId
        : teamBId;

    const firstBowlingTeamId = firstBattingTeamId === teamAId ? teamBId : teamAId;

    const battingTeamPlayers = (firstBattingTeamId === teamAId ? teamA : teamB).players.filter((p) =>
      (firstBattingTeamId === teamAId ? teamAPlayingXI : teamBPlayingXI).includes(p.id)
    );

    const bowlingTeamPlayers = (firstBowlingTeamId === teamAId ? teamA : teamB).players.filter((p) =>
      (firstBowlingTeamId === teamAId ? teamAPlayingXI : teamBPlayingXI).includes(p.id)
    );

    const inn1 = createInitialInnings(
      1,
      firstBattingTeamId,
      firstBowlingTeamId,
      overs,
      strikerId,
      nonStrikerId,
      openingBowlerId,
      battingTeamPlayers,
      bowlingTeamPlayers
    );

    const inn2 = createInitialInnings(
      2,
      firstBowlingTeamId,
      firstBattingTeamId,
      overs,
      bowlingTeamPlayers[0]?.id || '',
      bowlingTeamPlayers[1]?.id || '',
      battingTeamPlayers[battingTeamPlayers.length - 1]?.id || battingTeamPlayers[0]?.id || '',
      bowlingTeamPlayers,
      battingTeamPlayers
    );

    const newMatch: Match = {
      id: `match_${Date.now()}`,
      tournamentId: tournamentId || undefined,
      title: title || `${teamA.name} vs ${teamB.name}`,
      venue: venue || 'Cricket Ground',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      overs,
      oversPerBowler: oversPerBowler || Math.ceil(overs / 5),
      ballType,
      teamA: {
        id: teamA.id,
        name: teamA.name,
        shortName: teamA.shortName,
        color: teamA.color,
        playingXI: teamAPlayingXI,
      },
      teamB: {
        id: teamB.id,
        name: teamB.name,
        shortName: teamB.shortName,
        color: teamB.color,
        playingXI: teamBPlayingXI,
      },
      toss: {
        wonByTeamId: tossWonBy,
        electedTo,
      },
      status: 'live',
      currentInningsIndex: 0,
      innings: [inn1, inn2],
      updatedAt: Date.now(),
    };

    onStartMatch(newMatch);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header with step pill indicators */}
        <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/90">
          <div>
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Step {step} of 3
            </div>
            <h3 className="text-lg font-black text-white">
              {step === 1 ? 'Match Setup' : step === 2 ? 'Select Playing Lineup' : 'Toss & Openers'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Step Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* STEP 1: Basic Match Info */}
          {step === 1 && (
            <div className="space-y-4">
              {tournaments.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Tournament (Optional)
                  </label>
                  <select
                    value={tournamentId}
                    onChange={(e) => setTournamentId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm"
                  >
                    <option value="">Direct Match (No Tournament)</option>
                    {tournaments.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.city})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Team A *</label>
                  <select
                    value={teamAId}
                    onChange={(e) => {
                      setTeamAId(e.target.value);
                      setTeamAPlayingXI([]);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id} disabled={t.id === teamBId}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Team B *</label>
                  <select
                    value={teamBId}
                    onChange={(e) => {
                      setTeamBId(e.target.value);
                      setTeamBPlayingXI([]);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id} disabled={t.id === teamAId}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Match Title</label>
                <input
                  type="text"
                  placeholder={`${teamA.name} vs ${teamB.name}`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Venue / Ground</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Overs *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={overs}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10) || 1;
                      setOvers(v);
                      setOversPerBowler(Math.ceil(v / 5));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Max Ov/Bowler</label>
                  <input
                    type="number"
                    min="1"
                    max={overs}
                    value={oversPerBowler}
                    onChange={(e) => setOversPerBowler(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Ball Type</label>
                  <select
                    value={ballType}
                    onChange={(e) => setBallType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm"
                  >
                    <option value="leather">Leather</option>
                    <option value="tennis">Tennis</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Lineups Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {teamA.name} ({teamAPlayingXI.length} selected)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setTeamAPlayingXI(
                        teamAPlayingXI.length === teamA.players.length ? [] : teamA.players.map((p) => p.id)
                      )
                    }
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    {teamAPlayingXI.length === teamA.players.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2 bg-slate-850/60 rounded-xl border border-slate-800">
                  {teamA.players.map((p) => {
                    const isChecked = teamAPlayingXI.includes(p.id);
                    return (
                      <label
                        key={p.id}
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
                              setTeamAPlayingXI([...teamAPlayingXI, p.id]);
                            } else {
                              setTeamAPlayingXI(teamAPlayingXI.filter((id) => id !== p.id));
                            }
                          }}
                          className="rounded-sm text-emerald-600 focus:ring-emerald-500 bg-slate-800"
                        />
                        <span className="truncate">{p.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {teamB.name} ({teamBPlayingXI.length} selected)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setTeamBPlayingXI(
                        teamBPlayingXI.length === teamB.players.length ? [] : teamB.players.map((p) => p.id)
                      )
                    }
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    {teamBPlayingXI.length === teamB.players.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2 bg-slate-850/60 rounded-xl border border-slate-800">
                  {teamB.players.map((p) => {
                    const isChecked = teamBPlayingXI.includes(p.id);
                    return (
                      <label
                        key={p.id}
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
                              setTeamBPlayingXI([...teamBPlayingXI, p.id]);
                            } else {
                              setTeamBPlayingXI(teamBPlayingXI.filter((id) => id !== p.id));
                            }
                          }}
                          className="rounded-sm text-emerald-600 focus:ring-emerald-500 bg-slate-800"
                        />
                        <span className="truncate">{p.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Toss & Openers */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Toss Selection */}
              <div className="bg-slate-850/80 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400">Toss Decision</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTossWonBy(teamAId)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                      tossWonBy === teamAId
                        ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    Won by {teamA.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTossWonBy(teamBId)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                      tossWonBy === teamBId
                        ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    Won by {teamB.name}
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setElectedTo('bat')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${
                      electedTo === 'bat'
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Elected to BAT
                  </button>
                  <button
                    type="button"
                    onClick={() => setElectedTo('bowl')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${
                      electedTo === 'bowl'
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Elected to BOWL
                  </button>
                </div>
              </div>

              {/* Openers selection */}
              {(() => {
                const firstBattingTeamId =
                  (tossWonBy === teamAId && electedTo === 'bat') || (tossWonBy === teamBId && electedTo === 'bowl')
                    ? teamAId
                    : teamBId;

                const battingTeam = firstBattingTeamId === teamAId ? teamA : teamB;
                const bowlingTeam = firstBattingTeamId === teamAId ? teamB : teamA;
                const battingXI = firstBattingTeamId === teamAId ? teamAPlayingXI : teamBPlayingXI;
                const bowlingXI = firstBattingTeamId === teamAId ? teamBPlayingXI : teamAPlayingXI;

                const battingPlayers = battingTeam.players.filter((p) => battingXI.includes(p.id));
                const bowlingPlayers = bowlingTeam.players.filter((p) => bowlingXI.includes(p.id));

                return (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Striker ({battingTeam.name}) *
                      </label>
                      <select
                        value={strikerId}
                        onChange={(e) => setStrikerId(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                      >
                        {battingPlayers.map((p) => (
                          <option key={p.id} value={p.id} disabled={p.id === nonStrikerId}>
                            {p.name} ({p.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Non-Striker ({battingTeam.name}) *
                      </label>
                      <select
                        value={nonStrikerId}
                        onChange={(e) => setNonStrikerId(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                      >
                        {battingPlayers.map((p) => (
                          <option key={p.id} value={p.id} disabled={p.id === strikerId}>
                            {p.name} ({p.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Opening Bowler ({bowlingTeam.name}) *
                      </label>
                      <select
                        value={openingBowlerId}
                        onChange={(e) => setOpeningBowlerId(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                      >
                        {bowlingPlayers.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.role} {p.bowlingStyle ? `• ${p.bowlingStyle}` : ''})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800 transition"
            >
              Back
            </button>
          )}

          {step === 1 && (
            <button
              type="button"
              onClick={handleProceedToStep2}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-lg shadow-emerald-950"
            >
              Next: Select Lineup →
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={handleProceedToStep3}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-lg shadow-emerald-950"
            >
              Next: Toss & Openers →
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={handleStartGame}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-base transition shadow-lg shadow-emerald-950"
            >
              🚀 Start Match & Scoring
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

