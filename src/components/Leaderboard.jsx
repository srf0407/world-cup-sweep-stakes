import { useEffect, useRef } from 'react';
import { PRIZES } from '../data/teams';
import { getPlayerTotal, formatPoints } from '../utils/points';
import TeamBadge from './TeamBadge';

export default function Leaderboard({ state, dispatch }) {
  if (!state || !state.players || !state.teams) return null;
  const prevRanks = useRef({});

  const ranked = [...state.players]
    .map((player) => ({
      ...player,
      total: getPlayerTotal(state.teams, player.teams),
    }))
    .sort((a, b) => b.total - a.total);

  useEffect(() => {
    if (state.lastUpdatedPlayerIds.length > 0) {
      const timer = setTimeout(() => dispatch({ type: 'CLEAR_HIGHLIGHT' }), 2000);
      return () => clearTimeout(timer);
    }
  }, [state.lastUpdatedPlayerIds, dispatch]);

  ranked.forEach((p, i) => {
    prevRanks.current[p.id] = i + 1;
  });

  return (
    <section className="section">
      <header className="section__header">
        <h2>Leaderboard</h2>
        <p className="section__subtitle">R4,000 prize pool · 8 players × R500</p>
      </header>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Teams</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((player, index) => {
              const rank = index + 1;
              const isGold = rank === 1;
              const isSilver = rank === 2;
              const highlighted = state.lastUpdatedPlayerIds.includes(player.id);

              return (
                <tr
                  key={player.id}
                  className={[
                    isGold ? 'row-gold' : '',
                    isSilver ? 'row-silver' : '',
                    highlighted ? 'row-highlight' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <td className="rank-cell">
                    {rank === 1 && '🥇'}
                    {rank === 2 && '🥈'}
                    {rank > 2 && rank}
                  </td>
                  <td>
                    <strong>{player.name}</strong>
                    {isGold && <span className="prize-tag">R{PRIZES.first.toLocaleString()}</span>}
                    {isSilver && <span className="prize-tag prize-tag--silver">R{PRIZES.second.toLocaleString()}</span>}
                  </td>
                  <td>
                    <div className="team-badge-row">
                      {player.teams.length > 0 ? (
                        player.teams.map((team) => (
                          <TeamBadge key={team} team={team} compact />
                        ))
                      ) : (
                        <span className="muted">Draw pending</span>
                      )}
                    </div>
                  </td>
                  <td className="points-cell">{formatPoints(player.total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
