import { ALL_TEAMS, DEFAULT_PLAYER_NAMES, TIERS, getTierForTeam } from '../data/teams';
import { calculateMatchPoints } from './points';
import { loadState } from './storage';

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createInitialTeams() {
  const teams = {};
  for (const team of ALL_TEAMS) {
    teams[team] = {
      tier: getTierForTeam(team),
      owner: null,
      matchesPlayed: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    };
  }
  return teams;
}

export function createInitialState() {
  return {
    players: DEFAULT_PLAYER_NAMES.map((name, i) => ({
      id: i + 1,
      name,
      teams: [],
    })),
    teams: createInitialTeams(),
    matches: [],
    drawLocked: false,
    roundsPlayed: {},
    lastUpdatedPlayerIds: [],
  };
}

export function getInitialState() {
  const saved = loadState();
  if (!saved) return createInitialState();

  if (!saved.drawLocked) {
    saved.players = saved.players.map((p, i) => ({
      ...p,
      name: DEFAULT_PLAYER_NAMES[i] ?? p.name,
    }));
  }
  return saved;
}

function createDrawPools() {
  const pools = {};
  for (let tier = 1; tier <= 6; tier++) {
    pools[tier] = shuffle(TIERS[tier]);
  }
  return pools;
}

function isDrawComplete(players) {
  return players.every((p) => p.teams.length === 6);
}

function buildRoundsPlayed(matches) {
  const roundsPlayed = {};
  for (const match of matches) {
    if (match.round === 'Group Stage') continue;
    for (const team of [match.teamA, match.teamB]) {
      if (!roundsPlayed[team]) roundsPlayed[team] = {};
      roundsPlayed[team][match.round] = true;
    }
  }
  return roundsPlayed;
}

function recalcAllTeams(state) {
  const teams = createInitialTeams();
  const roundsPlayed = {};

  for (const match of state.matches) {
    const rp = buildRoundsPlayed(state.matches.filter((m) => m.id < match.id));
    const isFirstInRound =
      match.round !== 'Group Stage' &&
      match.isFirstInRound !== false &&
      (!rp[match.teamA]?.[match.round] || !rp[match.teamB]?.[match.round]);

    const result = calculateMatchPoints({
      teamA: match.teamA,
      teamB: match.teamB,
      scoreA: match.scoreA,
      scoreB: match.scoreB,
      penalties: match.penalties,
      penaltyWinner: match.penaltyWinner,
      round: match.round,
      roundsPlayed: rp,
      isFirstInRound,
    });

    for (const [team, pts, gf, ga] of [
      [match.teamA, result.pointsA, result.goalsForA, result.goalsAgainstA],
      [match.teamB, result.pointsB, result.goalsForB, result.goalsAgainstB],
    ]) {
      teams[team].matchesPlayed += 1;
      teams[team].goalsFor += gf;
      teams[team].goalsAgainst += ga;
      teams[team].points += pts;
    }

    if (match.round !== 'Group Stage') {
      for (const team of [match.teamA, match.teamB]) {
        if (!roundsPlayed[team]) roundsPlayed[team] = {};
        roundsPlayed[team][match.round] = true;
      }
    }
  }

  for (const team of ALL_TEAMS) {
    teams[team].owner = state.teams[team]?.owner ?? null;
  }

  return { teams, roundsPlayed };
}

function assignOwners(players, teams) {
  const updatedTeams = { ...teams };
  for (const player of players) {
    for (const team of player.teams) {
      if (updatedTeams[team]) {
        updatedTeams[team] = { ...updatedTeams[team], owner: player.id };
      }
    }
  }
  return updatedTeams;
}

function getAffectedPlayerIds(state, teamA, teamB) {
  const ids = new Set();
  for (const player of state.players) {
    if (player.teams.includes(teamA) || player.teams.includes(teamB)) {
      ids.add(player.id);
    }
  }
  return [...ids];
}

export function reducer(state, action) {
  switch (action.type) {
    case 'SET_PLAYER_NAMES': {
      const players = state.players.map((p, i) => ({
        ...p,
        name: action.names[i] || p.name,
      }));
      return { ...state, players };
    }

    case 'START_DRAW': {
      if (state.drawLocked) return state;

      const players = state.players.map((p) => ({ ...p, teams: [] }));
      const teams = assignOwners(players, createInitialTeams());

      return {
        ...state,
        players,
        teams,
        drawProgress: {
          activeTier: 1,
          nextPlayerIndex: 0,
          pools: createDrawPools(),
          lastReveal: null,
          complete: false,
        },
      };
    }

    case 'ASSIGN_NEXT_TEAM': {
      if (state.drawLocked || !state.drawProgress) return state;

      const { activeTier, nextPlayerIndex, pools } = state.drawProgress;
      const pool = pools[activeTier];
      if (!pool?.length) return state;

      const pickIndex = Math.floor(Math.random() * pool.length);
      const team = pool[pickIndex];
      const newPool = pool.filter((_, i) => i !== pickIndex);
      const playerName = state.players[nextPlayerIndex].name;

      const players = state.players.map((p, i) => {
        if (i !== nextPlayerIndex) return p;
        const teams = [...p.teams, team].sort(
          (a, b) => getTierForTeam(a) - getTierForTeam(b)
        );
        return { ...p, teams };
      });

      const teams = assignOwners(players, state.teams);
      const drawComplete = isDrawComplete(players);

      let nextIndex = nextPlayerIndex;
      let nextTier = activeTier;
      if (!drawComplete) {
        nextIndex = nextPlayerIndex + 1;
        if (nextIndex >= players.length) {
          nextIndex = 0;
          nextTier = activeTier + 1;
        }
      }

      return {
        ...state,
        players,
        teams,
        drawProgress: {
          activeTier: drawComplete ? activeTier : nextTier,
          nextPlayerIndex: drawComplete ? nextPlayerIndex : nextIndex,
          pools: { ...pools, [activeTier]: newPool },
          lastReveal: { playerName, team, tier: activeTier },
          complete: drawComplete,
        },
      };
    }

    case 'LOCK_DRAW': {
      if (state.drawLocked || !isDrawComplete(state.players)) return state;
      return { ...state, drawLocked: true, drawProgress: undefined };
    }

    case 'RESET_DRAW': {
      if (state.drawLocked) return state;
      const players = state.players.map((p) => ({ ...p, teams: [] }));
      const teams = assignOwners(players, createInitialTeams());
      return { ...state, players, teams, drawProgress: undefined };
    }

    case 'ADD_MATCH': {
      const {
        teamA,
        teamB,
        scoreA,
        scoreB,
        penalties,
        penaltyWinner,
        round,
        fixtureId,
        isFirstInRound,
      } = action;

      if (teamA === teamB) return state;

      const match = {
        id: state.matches.length + 1,
        teamA,
        teamB,
        scoreA: Number(scoreA),
        scoreB: Number(scoreB),
        penalties: Boolean(penalties),
        penaltyWinner: penalties ? penaltyWinner : null,
        round,
        isFirstInRound: round !== 'Group Stage' ? isFirstInRound !== false : false,
        fixtureId: fixtureId || null,
        timestamp: new Date().toISOString(),
      };

      const matches = [...state.matches, match];
      const { teams, roundsPlayed } = recalcAllTeams({ ...state, matches });
      const teamsWithOwners = assignOwners(state.players, teams);
      const lastUpdatedPlayerIds = getAffectedPlayerIds(state, teamA, teamB);

      return {
        ...state,
        matches,
        teams: teamsWithOwners,
        roundsPlayed,
        lastUpdatedPlayerIds,
      };
    }

    case 'DELETE_MATCH': {
      const matches = state.matches.filter((m) => m.id !== action.matchId);
      const { teams, roundsPlayed } = recalcAllTeams({ ...state, matches });
      const teamsWithOwners = assignOwners(state.players, teams);
      return {
        ...state,
        matches,
        teams: teamsWithOwners,
        roundsPlayed,
        lastUpdatedPlayerIds: [],
      };
    }

    case 'CLEAR_HIGHLIGHT':
      return { ...state, lastUpdatedPlayerIds: [] };

    case 'RESET_ALL':
      return createInitialState();

    default:
      return state;
  }
}

export function runDrawPreview() {
  const tierAssignments = {};
  const assignments = Array.from({ length: 8 }, () => []);

  for (let tier = 1; tier <= 6; tier++) {
    const shuffled = shuffle(TIERS[tier]);
    tierAssignments[tier] = shuffled;
    shuffled.forEach((team, i) => assignments[i].push(team));
  }

  assignments.forEach((teams) => {
    teams.sort((a, b) => getTierForTeam(a) - getTierForTeam(b));
  });

  return { tierAssignments, assignments };
}
