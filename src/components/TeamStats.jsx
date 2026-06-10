import { ALL_TEAMS } from '../data/teams';
import { formatPoints } from '../utils/points';

export default function TeamStats({ state }) {
  if (!state || !state.players || !state.teams) return null;
  const playerMap = Object.fromEntries(state.players.map((p) => [p.id, p.name]));

  const rows = ALL_TEAMS.map((team) => ({
    team,
    ...state.teams[team],
    ownerName: state.teams[team]?.owner ? playerMap[state.teams[team].owner] : '—',
  })).sort((a, b) => b.points - a.points);

  return (
    <section className="section">
      <header className="section__header">
        <h2>Team Stats</h2>
        <p className="section__subtitle">All 48 teams ranked by sweepstake points</p>
      </header>

      <div className="table-wrap">
        <table className="data-table data-table--compact">
          <thead>
            <tr>
              <th>Team</th>
              <th>Owner</th>
              <th>MP</th>
              <th>GF</th>
              <th>GA</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.team} className={i % 2 === 0 ? 'row-alt' : ''}>
                <td>
                  <span className="fixture-team">{row.team}</span>
                </td>
                <td>{row.ownerName}</td>
                <td>{row.matchesPlayed}</td>
                <td>{row.goalsFor}</td>
                <td>{row.goalsAgainst}</td>
                <td className="points-cell">{formatPoints(row.points)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
