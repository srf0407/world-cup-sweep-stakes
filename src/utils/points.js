export function calculateMatchPoints({
  teamA,
  teamB,
  scoreA,
  scoreB,
  penalties,
  penaltyWinner,
  round,
  roundsPlayed = {},
  isFirstInRound = false,
}) {
  const marginA = scoreA - scoreB;
  const marginB = scoreB - scoreA;

  let resultA;
  let resultB;
  if (scoreA > scoreB) {
    resultA = 'win';
    resultB = 'loss';
  } else if (scoreB > scoreA) {
    resultA = 'loss';
    resultB = 'win';
  } else {
    resultA = 'draw';
    resultB = 'draw';
  }

  let pointsA = 0;
  let pointsB = 0;

  if (resultA === 'win') pointsA += 4;
  if (resultB === 'win') pointsB += 4;
  if (resultA === 'draw') {
    pointsA += 2;
    pointsB += 2;
  }

  if (penalties) {
    if (penaltyWinner === teamA) pointsA += 1;
    else pointsB += 1;
  }

  pointsA += scoreA * 0.5;
  pointsB += scoreB * 0.5;

  if (resultA === 'loss' && marginB >= 4) {
    // goals conceded nullified
  } else {
    pointsA -= scoreB * 0.5;
  }

  if (resultB === 'loss' && marginA >= 4) {
    // goals conceded nullified
  } else {
    pointsB -= scoreA * 0.5;
  }

  if (marginA >= 4) pointsA += 1;
  if (marginB >= 4) pointsB += 1;

  const advanceBonus = { teamA: 0, teamB: 0 };
  if (round !== 'Group Stage' && isFirstInRound) {
    if (!roundsPlayed[teamA]?.[round]) {
      pointsA += 1;
      advanceBonus.teamA = 1;
    }
    if (!roundsPlayed[teamB]?.[round]) {
      pointsB += 1;
      advanceBonus.teamB = 1;
    }
  }

  const goalsAgainstA = resultA === 'loss' && marginB >= 4 ? 0 : scoreB;
  const goalsAgainstB = resultB === 'loss' && marginA >= 4 ? 0 : scoreA;

  return {
    pointsA,
    pointsB,
    goalsForA: scoreA,
    goalsForB: scoreB,
    goalsAgainstA,
    goalsAgainstB,
    advanceBonus,
  };
}

export function getPlayerTotal(teams, playerTeams) {
  if (!teams || !playerTeams || !Array.isArray(playerTeams)) return 0;
  return playerTeams.reduce((sum, team) => sum + (teams[team]?.points || 0), 0);
}

export function formatPoints(value) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}
