import { DEFAULT_PLAYER_NAMES, PRIZES, TIERS } from '../data/teams';

const POINTS_RULES = [
  { event: 'Match win', points: '+4' },
  { event: 'Draw', points: '+2' },
  { event: 'Draw decided on penalties', points: '+2 each at full time, +1 bonus for shootout winner (shootout goals not counted)' },
  { event: 'Goal scored', points: '+0.5 per goal' },
  { event: 'Goal conceded', points: '−0.5 per goal' },
  { event: 'Advance to next round', points: '+1 (once per round per team)' },
  { event: 'Win by 4+ goals', points: '+1 bonus' },
  { event: 'Lose by 4+ goals', points: 'Goals conceded for that match = 0 (no −0.5 penalty)' },
];

export default function Rules() {
  return (
    <section className="section rules">
      <header className="section__header">
        <h2>Competition Rules</h2>
        <p className="section__subtitle">World Cup 2026 · 8-player sweepstake</p>
      </header>

      <article className="rules-block">
        <h3>Players &amp; Prize Pool</h3>
        <ul className="rules-list">
          <li><strong>8 players</strong> at <strong>R500 each</strong> = <strong>R4,000</strong> total prize pool</li>
          <li>1st place: <strong className="rules-gold">R{PRIZES.first.toLocaleString()}</strong></li>
          <li>2nd place: <strong className="rules-silver">R{PRIZES.second.toLocaleString()}</strong></li>
        </ul>
        <div className="rules-players">
          <h4>The Players</h4>
          <div className="rules-players__grid">
            {DEFAULT_PLAYER_NAMES.map((name) => (
              <span key={name} className="rules-players__chip">{name}</span>
            ))}
          </div>
        </div>
      </article>

      <article className="rules-block">
        <h3>Team Allocation</h3>
        <p>Each player receives <strong>6 teams</strong> — one randomly drawn from each tier. Every tier has exactly 8 teams, so each team goes to one player only.</p>
        <div className="rules-tiers">
          {Object.entries(TIERS).map(([tier, teams]) => (
            <div key={tier} className="rules-tier">
              <h4>Tier {tier}</h4>
              <p>{teams.join(', ')}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="rules-block">
        <h3>Points System</h3>
        <div className="table-wrap">
          <table className="data-table data-table--compact">
            <thead>
              <tr>
                <th>Event</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {POINTS_RULES.map((rule, i) => (
                <tr key={rule.event} className={i % 2 === 0 ? 'row-alt' : ''}>
                  <td>{rule.event}</td>
                  <td className="rules-points-val">{rule.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="rules-note">
          A player&apos;s total score is the sum of points earned by all 6 of their teams across every match in the tournament.
        </p>
      </article>

      <article className="rules-block">
        <h3>How It Works</h3>
        <ol className="rules-steps">
          <li>Run the <strong>Draw</strong> to randomly assign teams to each player, then lock it.</li>
          <li>As World Cup matches are played, results are entered via the <strong>Admin</strong> tab.</li>
          <li>Points are calculated automatically and the <strong>Leaderboard</strong> updates in real time.</li>
          <li>Check <strong>Fixtures</strong> for the full group stage schedule.</li>
          <li>Knockout matches (Round of 32 onward) are added via the <strong>Admin</strong> tab as teams progress.</li>
        </ol>
      </article>
    </section>
  );
}
