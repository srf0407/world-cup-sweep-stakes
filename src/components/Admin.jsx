import { useState } from 'react';
import { ADMIN_PIN, ALL_TEAMS, ROUNDS, getFlag } from '../data/teams';

const EMPTY_FORM = {
  teamA: '',
  teamB: '',
  scoreA: '',
  scoreB: '',
  penalties: false,
  penaltyWinner: '',
  round: 'Group Stage',
  isFirstInRound: true,
};

export default function Admin({ state, dispatch }) {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
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

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.teamA || !form.teamB) {
      setError('Select both teams');
      return;
    }
    if (form.teamA === form.teamB) {
      setError('Teams must be different');
      return;
    }
    if (form.scoreA === '' || form.scoreB === '') {
      setError('Enter both scores');
      return;
    }
    if (form.penalties && !form.penaltyWinner) {
      setError('Select penalty winner');
      return;
    }

    dispatch({
      type: 'ADD_MATCH',
      teamA: form.teamA,
      teamB: form.teamB,
      scoreA: form.scoreA,
      scoreB: form.scoreB,
      penalties: form.penalties,
      penaltyWinner: form.penaltyWinner,
      round: form.round,
      isFirstInRound: form.isFirstInRound,
    });

    setForm(EMPTY_FORM);
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
          <p className="pin-hint">Default PIN: <strong>1234</strong></p>
          {error && <p className="error-msg">{error}</p>}
        </form>
      </section>
    );
  }

  const isDraw = Number(form.scoreA) === Number(form.scoreB);

  return (
    <section className="section">
      <header className="section__header">
        <h2>Match Entry</h2>
        <p className="section__subtitle">Results auto-calculate sweepstake points</p>
      </header>

      <form className="match-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            Team A
            <select
              value={form.teamA}
              onChange={(e) => handleChange('teamA', e.target.value)}
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
              value={form.teamB}
              onChange={(e) => handleChange('teamB', e.target.value)}
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
              value={form.scoreA}
              onChange={(e) => handleChange('scoreA', e.target.value)}
              className="input"
            />
          </label>
          <label>
            Score B
            <input
              type="number"
              min="0"
              value={form.scoreB}
              onChange={(e) => handleChange('scoreB', e.target.value)}
              className="input"
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            Round
            <select
              value={form.round}
              onChange={(e) => handleChange('round', e.target.value)}
              className="input"
            >
              {ROUNDS.map((r) => (
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
            checked={form.penalties}
            onChange={(e) => handleChange('penalties', e.target.checked)}
          />
          Match decided on penalties (after a draw)
        </label>

        {form.penalties && isDraw && (
          <fieldset className="penalty-fieldset">
            <legend>Penalty winner (+1 bonus)</legend>
            <label className="radio-label">
              <input
                type="radio"
                name="penaltyWinner"
                value={form.teamA}
                checked={form.penaltyWinner === form.teamA}
                onChange={() => handleChange('penaltyWinner', form.teamA)}
                disabled={!form.teamA}
              />
              {form.teamA ? `${getFlag(form.teamA)} ${form.teamA}` : 'Team A'}
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="penaltyWinner"
                value={form.teamB}
                checked={form.penaltyWinner === form.teamB}
                onChange={() => handleChange('penaltyWinner', form.teamB)}
                disabled={!form.teamB}
              />
              {form.teamB ? `${getFlag(form.teamB)} ${form.teamB}` : 'Team B'}
            </label>
          </fieldset>
        )}

        {form.round !== 'Group Stage' && (
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.isFirstInRound}
              onChange={(e) => handleChange('isFirstInRound', e.target.checked)}
            />
            First match in this round for teams (+1 advance point each, once per round)
          </label>
        )}

        {error && <p className="error-msg">{error}</p>}

        <button type="submit" className="btn btn--primary btn--full">
          Submit Result
        </button>
      </form>

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
