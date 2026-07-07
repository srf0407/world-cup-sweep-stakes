export const TIERS = {
  1: ['France', 'Spain', 'Argentina', 'England', 'Portugal', 'Brazil', 'Germany', 'Holland'],
  2: ['Mexico', 'Uruguay', 'Norway', 'Belgium', 'USA', 'Morocco', 'Colombia', 'Croatia'],
  3: ['Switzerland', 'Turkey', 'Japan', 'Iran', 'Ecuador', 'South Korea', 'Senegal', 'Austria'],
  4: ['Algeria', 'Egypt', 'Sweden', 'Canada', 'Ivory Coast', 'Paraguay', 'Panama', 'Australia'],
  5: ['Scotland', 'Czechia', 'South Africa', 'Iraq', 'Qatar', 'Bosnia', 'DR Congo', 'Saudi Arabia'],
  6: ['New Zealand', 'Haiti', 'Ghana', 'Curacao', 'Cape Verde', 'Uzbekistan', 'Tunisia', 'Jordan'],
};

export const NAME_ALIASES = {
  Holland: 'Netherlands',
  Czechia: 'Czech Republic',
  Curacao: 'Curaçao',
  Bosnia: 'Bosnia & Herzegovina',
};

export const REVERSE_ALIASES = Object.fromEntries(
  Object.entries(NAME_ALIASES).map(([k, v]) => [v, k])
);

REVERSE_ALIASES['United States'] = 'USA';
REVERSE_ALIASES['Bosnia and Herzegovina'] = 'Bosnia';

export const ALL_TEAMS = Object.values(TIERS).flat();

export function toFixtureName(team) {
  return NAME_ALIASES[team] || team;
}

export function fromFixtureName(name) {
  return REVERSE_ALIASES[name] || name;
}

export function getTierForTeam(team) {
  for (const [tier, teams] of Object.entries(TIERS)) {
    if (teams.includes(team)) return Number(tier);
  }
  return null;
}

export const DEFAULT_PLAYER_NAMES = [
  'Sam',
  'Dane',
  'Gabay',
  'Greg',
  'Josh',
  'Nadav',
  'Shai',
  'Sandler',
];

export const ROUNDS = [
  'Group Stage',
  'Round of 32',
  'Round of 16',
  'Quarter-Final',
  'Semi-Final',
  'Final',
];

export const ADMIN_PIN = '2001';

export const PRIZES = { first: 2700, second: 1300 };
