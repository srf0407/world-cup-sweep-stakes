import { getPlayerTotal } from '../utils/points';
import TeamBadge from './TeamBadge';

export default function PlayerCards({ state }) {
  const sorted = [...state.players].sort(
    (a, b) => getPlayerTotal(state.teams, b.teams) - getPlayerTotal(state.teams, a.teams)
  );

  return (
    <section className="section">
      <header className="section__header">
        <h2>Player Cards</h2>
        <p className="section__subtitle">Each player owns 6 teams — one per tier</p>
      </header>

      <div className="player-cards">
        {sorted.map((player) => {
          const total = getPlayerTotal(state.teams, player.teams);
          return (
            <article key={player.id} className="player-card">
              <header className="player-card__header">
                <h3>{player.name}</h3>
                <span className="player-card__total">{total.toFixed(1)} pts</span>
              </header>
              {player.teams.length > 0 ? (
                <ul className="player-card__teams">
                  {player.teams.map((team) => (
                    <li key={team}>
                      <TeamBadge
                        team={team}
                        points={state.teams[team]?.points || 0}
                        showTier
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Waiting for draw…</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}


