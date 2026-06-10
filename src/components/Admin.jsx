import { useEffect, useState } from 'react';
import { GROUP_FIXTURES } from '../data/fixtures';
import { GROUPS } from '../data/groups';
import { ADMIN_PIN, ALL_TEAMS, ROUNDS, fromFixtureName, getFlag } from '../data/teams';
import { findMatchResult, fixtureId } from '../utils/matches';

const EMPTY_KNOCKOUT = {
  teamA: '',
  teamB: '',
  scoreA: '',
  scoreB: '',
  penalties: false,
  penaltyWinner: '',
  round: 'Round of 16',
  isFirstInRound: true,
};

function TeamLine({ name }) {
  const sweepName = fromFixtureName(name);
  return (
    <span className="fixture-team">
      <span className="fixture-team__flag">{getFlag(sweepName)}</span>
      <span>{name}</span>
    </span>
  );
}

function FixtureResultRow({ fixture, existing, dispatch }) {
  const teamA = fromFixtureName(fixture.team1);
  const teamB = fromFixtureName(fixture.team2);
  const [scoreA, setScoreA] = useState(existing?.scoreA ?? '');
  const [scoreB, setScoreB] = useState(existing?.scoreB ?? '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setScoreA(existing?.scoreA ?? '');
    setScoreB(existing?.scoreB ?? '');
  }, [existing?.id, existing?.scoreA, existing?.scoreB]);

  const handleSave = (e) => {
    e.preventDefault();
    setError('');

    if (scoreA === '' || scoreB === '') {
      setError('Enter both scores');
      return;
    }

    const payload = {
      teamA,
      teamB,
      scoreA,
      scoreB,
      penalties: false,
      penaltyWinner: null,
      round: 'Group Stage',
      fixtureId: fixtureId(fixture),
    };

    if (existing) {
      dispatch({ type: 'UPDATE_MATCH', matchId: existing.id, ...payload });
    } else {
      dispatch({ type: 'ADD_MATCH', ...payload });
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const played = Boolean(existing);

  return (
    <form
      className={`fixture-row admin-fixture-row ${played ? 'fixture-row--played' : ''}`}
      onSubmit={handleSave}
    >
      <div className="fixture-row__meta">
        <span className="fixture-row__date">{fixture.date}</span>
        <span className="fixture-row__time">{fixture.time}</span>
        <span className="fixture-row__group">{fixture.group}</span>
      </div>
      <div className="admin-fixture-row__entry">
        <TeamLine name={fixture.team1} />
        <div className="admin-fixture-row__scores">
          <input
            type="number"
            min="0"
            value={scoreA}
            onChange={(e) => setScoreA(e.target.value)}
            className="input input--score"
            aria-label={`${fixture.team1} score`}
          />
          <span className="admin-fixture-row__dash">–</span>
          <input
            type="number"
            min="0"
            value={scoreB}
            onChange={(e) => setScoreB(e.target.value)}
            className="input input--score"
            aria-label={`${fixture.team2} score`}
          />
        </div>
        <TeamLine name={fixture.team2} />
        <button type="submit" className="btn btn--primary btn--small">
          {saved ? 'Saved' : played ? 'Update' : 'Save'}
        </button>
      </div>
      <div className="fixture-row__venue">{fixture.ground}</div>
      {error && <p className="error-msg admin-fixture-row__error">{error}</p>}
    </form>
  );
}

export default function Admin({ state, dispatch }) {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [activeGroup, setActiveGroup] = useState('All');
  const [knockout, setKnockout] = useState(EMPTY_KNOCKOUT);
  const [error, setError] = useState('');

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect PIN');
    }
  };

  const handleKnockoutChange = (field, value) => {
    setKnockout((prev) => ({ ...prev, [field]: value }));
  };

  const handleKnockoutSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!knockout.teamA || !knockout.teamB) {
      setError('Select both teams');
      return;
    }
    if (knockout.teamA === knockout.teamB) {
      setError('Teams must be different');
      return;
    }
    if (knockout.scoreA === '' || knockout.scoreB === '') {
      setError('Enter both scores');
      return;
    }
    if (knockout.penalties && !knockout.penaltyWinner) {
      setError('Select penalty winner');
      return;
    }

    dispatch({
      type: 'ADD_MATCH',
      teamA: knockout.teamA,
      teamB: knockout.teamB,
      scoreA: knockout.scoreA,
      scoreB: knockout.scoreB,
      penalties: knockout.penalties,
      penaltyWinner: knockout.penaltyWinner,
      round: knockout.round,
      isFirstInRound: knockout.isFirstInRound,
    });

    setKnockout(EMPTY_KNOCKOUT);
  };

  if (!authenticated) {
    return (
      <section className="section">
        <header className="section__header">
          <h2>Admin</h2>
          <p className="section__subtitle">Enter PIN to manage match results</p>
        </header>
        <form className="pin-form" onSubmit={handlePinSubmit}>
          <input
            type="password"
            inputMode="numeric"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="input"
            autoComplete="off"
          />
          <button type="submit" className="btn btn--primary">
            Unlock
          </button>
          {error && <p className="error-msg">{error}</p>}
        </form>
      </section>
    );
  }

  const filtered =
    activeGroup === 'All'
      ? GROUP_FIXTURES
      : GROUP_FIXTURES.filter((f) => f.group === activeGroup);

  const sorted = [...filtered].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });

  const isDraw = Number(knockout.scoreA) === Number(knockout.scoreB);

  return (
    <section className="section">
      <header className="section__header">
        <h2>Enter Results</h2>
        <p className="section__subtitle">
          Save fixture scores to update points and the leaderboard
        </p>
      </header>

      <div className="group-filter">
        <button
          type="button"
          className={`group-filter__btn ${activeGroup === 'All' ? 'group-filter__btn--active' : ''}`}
          onClick={() => setActiveGroup('All')}
        >
          All
        </button>
        {GROUPS.map((g) => (
          <button
            key={g.name}
            type="button"
            className={`group-filter__btn ${activeGroup === g.name ? 'group-filter__btn--active' : ''}`}
            onClick={() => setActiveGroup(g.name)}
          >
            {g.name.replace('Group ', '')}
          </button>
        ))}
      </div>

      <div className="fixtures-list admin-fixtures-list">
        {sorted.map((fixture) => {
          const existing = findMatchResult(state.matches, fixture.team1, fixture.team2);
          return (
            <FixtureResultRow
              key={fixtureId(fixture)}
              fixture={fixture}
              existing={existing}
              dispatch={dispatch}
            />
          );
        })}
      </div>

      <div className="knockout-section admin-knockout-section">
        <h3>Knockout Match</h3>
        <p className="section__subtitle">Add knockout results not listed in group fixtures</p>

        <form className="match-form" onSubmit={handleKnockoutSubmit}>
          <div className="form-row">
            <label>
              Team A
              <select
                value={knockout.teamA}
                onChange={(e) => handleKnockoutChange('teamA', e.target.value)}
                className="input"
              >
                <option value="">Select team…</option>
                {ALL_TEAMS.map((t) => (
                  <option key={t} value={t}>
                    {getFlag(t)} {t}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Team B
              <select
                value={knockout.teamB}
                onChange={(e) => handleKnockoutChange('teamB', e.target.value)}
                className="input"
              >
                <option value="">Select team…</option>
                {ALL_TEAMS.map((t) => (
                  <option key={t} value={t}>
                    {getFlag(t)} {t}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Score A
              <input
                type="number"
                min="0"
                value={knockout.scoreA}
                onChange={(e) => handleKnockoutChange('scoreA', e.target.value)}
                className="input"
              />
            </label>
            <label>
              Score B
              <input
                type="number"
                min="0"
                value={knockout.scoreB}
                onChange={(e) => handleKnockoutChange('scoreB', e.target.value)}
                className="input"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Round
              <select
                value={knockout.round}
                onChange={(e) => handleKnockoutChange('round', e.target.value)}
                className="input"
              >
                {ROUNDS.filter((r) => r !== 'Group Stage').map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={knockout.penalties}
              onChange={(e) => handleKnockoutChange('penalties', e.target.checked)}
            />
            Match decided on penalties (after a draw)
          </label>

          {knockout.penalties && isDraw && (
            <fieldset className="penalty-fieldset">
              <legend>Penalty winner (+1 bonus)</legend>
              <label className="radio-label">
                <input
                  type="radio"
                  name="penaltyWinner"
                  value={knockout.teamA}
                  checked={knockout.penaltyWinner === knockout.teamA}
                  onChange={() => handleKnockoutChange('penaltyWinner', knockout.teamA)}
                  disabled={!knockout.teamA}
                />
                {knockout.teamA ? `${getFlag(knockout.teamA)} ${knockout.teamA}` : 'Team A'}
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="penaltyWinner"
                  value={knockout.teamB}
                  checked={knockout.penaltyWinner === knockout.teamB}
                  onChange={() => handleKnockoutChange('penaltyWinner', knockout.teamB)}
                  disabled={!knockout.teamB}
                />
                {knockout.teamB ? `${getFlag(knockout.teamB)} ${knockout.teamB}` : 'Team B'}
              </label>
            </fieldset>
          )}

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={knockout.isFirstInRound}
              onChange={(e) => handleKnockoutChange('isFirstInRound', e.target.checked)}
            />
            First match in this round for teams (+1 advance point each, once per round)
          </label>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" className="btn btn--primary btn--full">
            Submit Knockout Result
          </button>
        </form>
      </div>

      {state.matches.length > 0 && (
        <div className="match-log">
          <h3>Match Log ({state.matches.length})</h3>
          <ul>
            {[...state.matches].reverse().map((m) => (
              <li key={m.id} className="match-log__item">
                <span>
                  {getFlag(m.teamA)} {m.teamA} {m.scoreA}–{m.scoreB} {m.teamB} {getFlag(m.teamB)}
                  {m.penalties && ' (p)'} · {m.round}
                </span>
                <button
                  type="button"
                  className="btn btn--danger btn--small"
                  onClick={() => dispatch({ type: 'DELETE_MATCH', matchId: m.id })}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
