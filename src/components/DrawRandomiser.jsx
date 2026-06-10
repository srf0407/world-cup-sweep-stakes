import { useState } from 'react';
import { DEFAULT_PLAYER_NAMES, TIERS, getTierForTeam } from '../data/teams';

const POT_LABELS = {
  1: 'Pot 1 — Top Seeds',
  2: 'Pot 2',
  3: 'Pot 3',
  4: 'Pot 4',
  5: 'Pot 5',
  6: 'Pot 6',
};

export default function DrawRandomiser({ state, dispatch }) {
  if (!state || !state.players) return null;
  const [showReveal, setShowReveal] = useState(false);
  const progress = state.drawProgress;
  const hasDraw = (state.players[0]?.teams?.length ?? 0) > 0;

  const handleDrawClick = () => {
    dispatch({ type: 'ASSIGN_NEXT_TEAM', playerIndex: progress.nextPlayerIndex });
    setShowReveal(true);
    setTimeout(() => setShowReveal(false), 1500);
  };

  const handleSelectPlayer = (playerIndex) => {
    dispatch({ type: 'SET_DRAW_PLAYER', playerIndex });
  };

  const playerHasTierTeam = (player, tier) =>
    (player.teams ?? []).some((team) => getTierForTeam(team) === tier);

  if (state.drawLocked && hasDraw) {
    return (
      <section className="section">
        <header className="section__header">
          <h2>Draw Complete 🔒</h2>
          <p className="section__subtitle">Team assignments are locked</p>
        </header>

        <div className="draw-results">
          {state.players.map((player) => (
            <div key={player.id} className="draw-player-result">
              <h3>{player.name}</h3>
              <ul>
                {(player.teams ?? []).map((team) => (
                  <li key={team}>
                    {team}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!progress) {
    return (
      <section className="section">
        <header className="section__header">
          <h2>Team Draw</h2>
          <p className="section__subtitle">
            Go pot by pot — click to assign one team at a time
          </p>
        </header>

        <div className="draw-players-preview">
          <h3>Players</h3>
          <div className="rules-players__grid">
            {DEFAULT_PLAYER_NAMES.map((name) => (
              <span key={name} className="rules-players__chip">{name}</span>
            ))}
          </div>
        </div>

        <button
          className="btn btn--primary btn--large draw-btn"
          onClick={() => dispatch({ type: 'START_DRAW' })}
        >
          Start Draw — Pot 1
        </button>
      </section>
    );
  }

  const drawComplete = progress.complete || state.players.every((p) => (p.teams?.length ?? 0) === 6);
  const selectedPlayerIndex = progress.nextPlayerIndex;
  const currentPlayer = drawComplete ? null : state.players[selectedPlayerIndex];
  const activeTier = progress.activeTier;
  const remainingInPot = progress.pools[activeTier]?.length ?? 0;
  const assignmentsThisPot = 8 - remainingInPot;
  const canSelectPlayer = (player) => !drawComplete && !playerHasTierTeam(player, activeTier);

  const renderPlayerBoard = () => (
    <div className="draw-progress-board draw-progress-board--sticky">
      <h4>Live assignments</h4>
      <div className="draw-results">
        {state.players.map((player, index) => {
          const isSelected = index === selectedPlayerIndex && !drawComplete;
          const isSelectable = canSelectPlayer(player);
          const hasPotTeam = playerHasTierTeam(player, activeTier);
          const teams = player.teams ?? [];

          return (
            <div
              key={player.id}
              role={isSelectable ? 'button' : undefined}
              tabIndex={isSelectable ? 0 : undefined}
              className={[
                'draw-player-result',
                isSelected ? 'draw-player-result--active' : '',
                isSelectable ? 'draw-player-result--selectable' : '',
                hasPotTeam && !drawComplete ? 'draw-player-result--done-pot' : '',
              ].filter(Boolean).join(' ')}
              onClick={isSelectable ? () => handleSelectPlayer(index) : undefined}
              onKeyDown={
                isSelectable
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectPlayer(index);
                      }
                    }
                  : undefined
              }
            >
              <div className="draw-player-result__header">
                <h3>{player.name}</h3>
                <span className="draw-player-result__count">{teams.length}/6</span>
              </div>
              <ul className="draw-player-result__teams">
                {teams.length > 0 ? (
                  teams.map((team) => (
                    <li
                      key={team}
                      className={
                        getTierForTeam(team) === activeTier && !drawComplete
                          ? 'draw-player-result__team--current-pot'
                          : ''
                      }
                    >
                      <span className="draw-player-result__tier">T{getTierForTeam(team)}</span>
                      {team}
                    </li>
                  ))
                ) : (
                  <li className="muted">No teams yet</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <section className="section">
      <header className="section__header">
        <h2>{POT_LABELS[activeTier] || `Pot ${activeTier}`}</h2>
        <p className="section__subtitle">
          Assignment {assignmentsThisPot + 1} of 8 in this pot
          {!drawComplete && currentPlayer && ` · Selected: ${currentPlayer.name}`}
        </p>
      </header>

      {renderPlayerBoard()}

      {progress.lastReveal && (
        <div className={`draw-reveal-banner ${showReveal ? 'draw-reveal-banner--pulse' : ''}`}>
          <span className="draw-reveal-banner__player">{progress.lastReveal.playerName}</span>
          <span className="draw-reveal-banner__arrow">→</span>
          <span className="draw-reveal-banner__team">
            {progress.lastReveal.team}
          </span>
        </div>
      )}

      {!drawComplete && currentPlayer && (
        <div className="draw-turn">
          <p className="draw-turn__label">Drawing for</p>
          <h3 className="draw-turn__name">{currentPlayer.name}</h3>
          <p className="draw-turn__pot">
            {remainingInPot} team{remainingInPot !== 1 ? 's' : ''} left in {POT_LABELS[activeTier]}
          </p>
          <button
            className="btn btn--primary btn--large draw-btn"
            onClick={handleDrawClick}
          >
            Draw Team for {currentPlayer.name}
          </button>
        </div>
      )}

      {!drawComplete && (
        <p className="draw-select-hint">Tap a player below to choose who draws next</p>
      )}

      <div className="draw-pot-teams">
        <h4>Teams in this pot</h4>
        <div className="draw-pot-teams__grid">
          {TIERS[activeTier].map((team) => {
            const drawn = !progress.pools[activeTier]?.includes(team);
            const owner = drawn
              ? state.players.find((p) => (p.teams ?? []).includes(team))
              : null;
            return (
              <span
                key={team}
                className={`draw-pot-team ${drawn ? 'draw-pot-team--drawn' : ''}`}
              >
                {team}
                {owner && <span className="draw-pot-team__owner">→ {owner.name}</span>}
              </span>
            );
          })}
        </div>
      </div>

      <div className="draw-actions">
        {drawComplete && (
          <button className="btn btn--gold btn--large" onClick={() => dispatch({ type: 'LOCK_DRAW' })}>
            🔒 Lock Draw
          </button>
        )}
        {!drawComplete && (
          <button className="btn btn--danger" onClick={() => dispatch({ type: 'RESET_DRAW' })}>
            Reset Draw
          </button>
        )}
      </div>
    </section>
  );
}
