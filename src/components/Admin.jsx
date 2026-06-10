import { useEffect, useState } from 'react';
import { GROUP_FIXTURES } from '../data/fixtures';
import { GROUPS } from '../data/groups';
import { ADMIN_PIN, ALL_TEAMS, ROUNDS, fromFixtureName } from '../data/teams';
import { findMatchResult, fixtureId } from '../utils/matches';

const EMPTY_KNOCKOUT = {
  teamA: '',
  teamB: '',
  scoreA: '',
  scoreB: '',
  penalties: false,
  penaltyWinner: '',
  round: 'Round of 16',
  advanceBonusA: true,
  advanceBonusB: true,
};

function MatchScoringOptions({
  teamA,
  teamB,
  teamALabel,
  teamBLabel,
  scoreA,
  scoreB,
  round,
  penalties,
  penaltyWinner,
  advanceBonusA,
  advanceBonusB,
  onPenaltiesChange,
  onPenaltyWinnerChange,
  onAdvanceBonusAChange,
  onAdvanceBonusBChange,
  penaltyWinnerName = 'penaltyWinner',
}) {
  const isDraw =
    scoreA !== '' && scoreB !== '' && Number(scoreA) === Number(scoreB);
  const isKnockout = round && round !== 'Group Stage';

  return (
    <div className="match-scoring-options">
      <p className="admin-match-hint">
        Enter full-time score only (after extra time). Penalty shootout goals are not entered and do not count.
      </p>

      {isDraw && (
        <>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={penalties}
              onChange={(e) => onPenaltiesChange(e.target.checked)}
            />
            Decided on penalties (+2 draw pts each, +1 bonus for shootout winner)
          </label>

          {penalties && (
            <fieldset className="penalty-fieldset">
              <legend>Penalty shootout winner (+1 bonus)</legend>
              <label className="radio-label">
                <input
                  type="radio"
                  name={penaltyWinnerName}
                  value={teamA}
                  checked={penaltyWinner === teamA}
                  onChange={() => onPenaltyWinnerChange(teamA)}
                  disabled={!teamA}
                />
                {teamALabel || teamA || 'Team A'}
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name={penaltyWinnerName}
                  value={teamB}
                  checked={penaltyWinner === teamB}
                  onChange={() => onPenaltyWinnerChange(teamB)}
                  disabled={!teamB}
                />
                {teamBLabel || teamB || 'Team B'}
              </label>
            </fieldset>
          )}
        </>
      )}

      {isKnockout && (
        <fieldset className="advance-fieldset">
          <legend>Advance bonus (+1 for reaching this round, once per team per round)</legend>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={advanceBonusA}
              onChange={(e) => onAdvanceBonusAChange(e.target.checked)}
              disabled={!teamA}
            />
            {teamALabel || teamA || 'Team A'} reached {round}
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={advanceBonusB}
              onChange={(e) => onAdvanceBonusBChange(e.target.checked)}
              disabled={!teamB}
            />
            {teamBLabel || teamB || 'Team B'} reached {round}
          </label>
        </fieldset>
      )}
    </div>
  );
}

function TeamLine({ name }) {
  return <span className="fixture-team">{name}</span>;
}

function FixtureResultRow({ fixture, existing, dispatch }) {
  const teamA = fromFixtureName(fixture.team1);
  const teamB = fromFixtureName(fixture.team2);
  const [scoreA, setScoreA] = useState(existing?.scoreA ?? '');
  const [scoreB, setScoreB] = useState(existing?.scoreB ?? '');
  const [penalties, setPenalties] = useState(Boolean(existing?.penalties));
  const [penaltyWinner, setPenaltyWinner] = useState(existing?.penaltyWinner ?? '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setScoreA(existing?.scoreA ?? '');
    setScoreB(existing?.scoreB ?? '');
    setPenalties(Boolean(existing?.penalties));
    setPenaltyWinner(existing?.penaltyWinner ?? '');
  }, [existing?.id, existing?.scoreA, existing?.scoreB, existing?.penalties, existing?.penaltyWinner]);

  const handleSave = (e) => {
    e.preventDefault();
    setError('');

    if (scoreA === '' || scoreB === '') {
      setError('Enter both scores');
      return;
    }

    const isDraw = Number(scoreA) === Number(scoreB);
    if (penalties && !isDraw) {
      setError('Penalties only apply when the full-time score is a draw');
      return;
    }
    if (penalties && !penaltyWinner) {
      setError('Select penalty shootout winner');
      return;
    }

    const payload = {
      teamA,
      teamB,
      scoreA,
      scoreB,
      penalties: isDraw && penalties,
      penaltyWinner: isDraw && penalties ? penaltyWinner : null,
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
  const isDraw = scoreA !== '' && scoreB !== '' && Number(scoreA) === Number(scoreB);

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
      {isDraw && (
        <div className="admin-fixture-row__extras">
          <MatchScoringOptions
            teamA={teamA}
            teamB={teamB}
            teamALabel={fixture.team1}
            teamBLabel={fixture.team2}
            scoreA={scoreA}
            scoreB={scoreB}
            round="Group Stage"
            penalties={penalties}
            penaltyWinner={penaltyWinner}
            advanceBonusA={false}
            advanceBonusB={false}
            onPenaltiesChange={setPenalties}
            onPenaltyWinnerChange={setPenaltyWinner}
            onAdvanceBonusAChange={() => {}}
            onAdvanceBonusBChange={() => {}}
            penaltyWinnerName={`penalty-${fixtureId(fixture)}`}
          />
        </div>
      )}
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
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState(false);

  if (!state?.matches) return null;

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect PIN');
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    setError('');

    if (!resetPassword) {
      setError('Enter reset password');
      return;
    }

    if (!resetConfirm) {
      setError('Check the confirmation box');
      return;
    }

    // You can change this password - it's separate from the admin PIN
    const RESET_PASSWORD = 'reset123';
    if (resetPassword !== RESET_PASSWORD) {
      setError('Incorrect reset password');
      return;
    }

    if (window.confirm('⚠️ This will delete ALL data: draw, matches, points, everything. This cannot be undone. Continue?')) {
      dispatch({ type: 'RESET_ALL' });
      setResetPassword('');
      setResetConfirm(false);
      setError('');
      alert('✅ All data has been reset');
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
    const isKnockoutDraw = Number(knockout.scoreA) === Number(knockout.scoreB);
    if (knockout.penalties && !isKnockoutDraw) {
      setError('Penalties only apply when the full-time score is a draw');
      return;
    }
    if (knockout.penalties && !knockout.penaltyWinner) {
      setError('Select penalty shootout winner');
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
      advanceBonusA: knockout.advanceBonusA,
      advanceBonusB: knockout.advanceBonusB,
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

  const formatAdvanceNote = (match) => {
    if (match.round === 'Group Stage') return '';
    const notes = [];
    if (match.advanceBonusA !== false || (match.advanceBonusA === undefined && match.isFirstInRound !== false)) {
      notes.push(`${match.teamA} +1 adv`);
    }
    if (match.advanceBonusB !== false || (match.advanceBonusB === undefined && match.isFirstInRound !== false)) {
      notes.push(`${match.teamB} +1 adv`);
    }
    return notes.length ? ` · ${notes.join(', ')}` : '';
  };

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
                    {t}
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
                    {t}
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

          <MatchScoringOptions
            teamA={knockout.teamA}
            teamB={knockout.teamB}
            scoreA={knockout.scoreA}
            scoreB={knockout.scoreB}
            round={knockout.round}
            penalties={knockout.penalties}
            penaltyWinner={knockout.penaltyWinner}
            advanceBonusA={knockout.advanceBonusA}
            advanceBonusB={knockout.advanceBonusB}
            onPenaltiesChange={(value) => handleKnockoutChange('penalties', value)}
            onPenaltyWinnerChange={(value) => handleKnockoutChange('penaltyWinner', value)}
            onAdvanceBonusAChange={(value) => handleKnockoutChange('advanceBonusA', value)}
            onAdvanceBonusBChange={(value) => handleKnockoutChange('advanceBonusB', value)}
          />

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
                  {m.teamA} {m.scoreA}–{m.scoreB} {m.teamB}
                  {m.penalties && ` (p: ${m.penaltyWinner})`} · {m.round}
                  {formatAdvanceNote(m)}
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

      <div className="reset-section admin-reset-section">
        <h3>⚠️ Danger Zone</h3>
        <p className="section__subtitle">Reset all data (draw, matches, scores, points)</p>
        <form className="reset-form" onSubmit={handleReset}>
          <label>
            Reset Password
            <input
              type="password"
              placeholder="Enter reset password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              className="input"
              autoComplete="off"
            />
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={resetConfirm}
              onChange={(e) => setResetConfirm(e.target.checked)}
            />
            I understand this will delete all data permanently
          </label>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" className="btn btn--danger btn--full">
            Reset Everything
          </button>
        </form>
      </div>
    </section>
  );
}
