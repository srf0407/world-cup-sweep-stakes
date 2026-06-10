import { fromFixtureName } from '../data/teams';

export function matchKey(team1, team2) {
  return [team1, team2].sort().join('|');
}

export function findMatchResult(matches, team1, team2) {
  const canonical = matchKey(fromFixtureName(team1), fromFixtureName(team2));
  return matches.find((m) => matchKey(m.teamA, m.teamB) === canonical);
}

export function fixtureId(fixture) {
  return `${fixture.date}|${fixture.team1}|${fixture.team2}`;
}
