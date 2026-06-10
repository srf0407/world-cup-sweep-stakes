import { useState } from 'react';
import { GROUP_FIXTURES } from '../data/fixtures';
import { GROUPS } from '../data/groups';
import { fromFixtureName, getFlag, toFixtureName } from '../data/teams';
import { findMatchResult } from '../utils/matches';

function TeamLine({ name }) {
  const sweepName = fromFixtureName(name);
  return (
    <span className="fixture-team">
      <span className="fixture-team__flag">{getFlag(sweepName)}</span>
      <span>{name}</span>
    </span>
  );
}

export default function Fixtures({ state }) {
  const [activeGroup, setActiveGroup] = useState('All');

  const filtered =
    activeGroup === 'All'
      ? GROUP_FIXTURES
      : GROUP_FIXTURES.filter((f) => f.group === activeGroup);

  const sorted = [...filtered].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });

  return (
    <section className="section">
      <header className="section__header">
        <h2>Fixtures</h2>
        <p className="section__subtitle">72 group stage matches · World Cup 2026</p>
      </header>

      <div className="group-filter">
        <button
          className={`group-filter__btn ${activeGroup === 'All' ? 'group-filter__btn--active' : ''}`}
          onClick={() => setActiveGroup('All')}
        >
          All
        </button>
        {GROUPS.map((g) => (
          <button
            key={g.name}
            className={`group-filter__btn ${activeGroup === g.name ? 'group-filter__btn--active' : ''}`}
            onClick={() => setActiveGroup(g.name)}
          >
            {g.name.replace('Group ', '')}
          </button>
        ))}
      </div>

      <div className="fixtures-list">
        {sorted.map((fixture, i) => {
          const result = findMatchResult(state.matches, fixture.team1, fixture.team2);
          const played = Boolean(result);

          return (
            <div key={`${fixture.team1}-${fixture.team2}-${i}`} className={`fixture-row ${played ? 'fixture-row--played' : ''}`}>
              <div className="fixture-row__meta">
                <span className="fixture-row__date">{fixture.date}</span>
                <span className="fixture-row__time">{fixture.time}</span>
                <span className="fixture-row__group">{fixture.group}</span>
              </div>
              <div className="fixture-row__match">
                <TeamLine name={fixture.team1} />
                {played ? (
                  <span className="fixture-score">
                    {result.scoreA} – {result.scoreB}
                    {result.penalties && ' (p)'}
                  </span>
                ) : (
                  <span className="fixture-vs">vs</span>
                )}
                <TeamLine name={fixture.team2} />
              </div>
              <div className="fixture-row__venue">{fixture.ground}</div>
            </div>
          );
        })}
      </div>

      {state.matches.filter((m) => m.round !== 'Group Stage').length > 0 && (
        <div className="knockout-section">
          <h3>Knockout Matches</h3>
          <div className="fixtures-list">
            {state.matches
              .filter((m) => m.round !== 'Group Stage')
              .map((match) => (
                <div key={match.id} className="fixture-row fixture-row--played">
                  <div className="fixture-row__meta">
                    <span className="fixture-row__group">{match.round}</span>
                  </div>
                  <div className="fixture-row__match">
                    <TeamLine name={toFixtureName(match.teamA)} />
                    <span className="fixture-score">
                      {match.scoreA} – {match.scoreB}
                      {match.penalties && ' (p)'}
                    </span>
                    <TeamLine name={toFixtureName(match.teamB)} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}
