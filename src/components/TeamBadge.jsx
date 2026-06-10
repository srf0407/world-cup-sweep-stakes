import { getTierForTeam } from '../data/teams';
import { formatPoints } from '../utils/points';

export default function TeamBadge({ team, points, showTier = false, compact = false }) {
  if (!team) return null;

  return (
    <span className={`team-badge ${compact ? 'team-badge--compact' : ''}`} title={team}>
      <span className="team-badge__name">{team}</span>
      {showTier && <span className="team-badge__tier">T{getTierForTeam(team)}</span>}
      {points !== undefined && (
        <span className="team-badge__pts">{formatPoints(points)}</span>
      )}
    </span>
  );
}
