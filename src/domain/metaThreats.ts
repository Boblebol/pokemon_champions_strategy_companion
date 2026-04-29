import type { DataStore } from './dataStore';
import { getDefensiveMultiplier } from './typeEffectiveness';
import type { FormatId, TeamMember } from './types';

export interface RankedThreat {
  species: string;
  rank: number;
  usage: number;
  score: number;
  severity: 'high' | 'medium' | 'low';
  reasons: string[];
}

function countSuperEffectiveTargets(attackingMoves: string[], team: TeamMember[], store: DataStore) {
  let count = 0;

  for (const member of team) {
    const defender = store.getPokemon(member.species);
    if (!defender) {
      continue;
    }

    const isHit = attackingMoves.some((moveName) => {
      const move = store.getMove(moveName);
      return move ? getDefensiveMultiplier(move.type, defender.types) > 1 : false;
    });

    if (isHit) {
      count += 1;
    }
  }

  return count;
}

function countResists(attackingMoves: string[], team: TeamMember[], store: DataStore) {
  let count = 0;

  for (const member of team) {
    const defender = store.getPokemon(member.species);
    if (!defender) {
      continue;
    }

    const resistsAllKnownAttacks = attackingMoves.every((moveName) => {
      const move = store.getMove(moveName);
      return move ? getDefensiveMultiplier(move.type, defender.types) < 1 : false;
    });

    if (resistsAllKnownAttacks && attackingMoves.length > 0) {
      count += 1;
    }
  }

  return count;
}

export function rankMetaThreats({
  team,
  store,
  format,
  limit = 10,
}: {
  team: TeamMember[];
  store: DataStore;
  format: FormatId;
  limit?: number;
}): RankedThreat[] {
  const snapshot = store.getMetaSnapshot(format);

  if (!snapshot) {
    return [];
  }

  return snapshot.entries
    .map((entry) => {
      const superEffectiveTargets = countSuperEffectiveTargets(entry.commonMoves, team, store);
      const resists = countResists(entry.commonMoves, team, store);
      const score = entry.usage + superEffectiveTargets * 12 - resists * 5;
      const severity: RankedThreat['severity'] = score >= 45 ? 'high' : score >= 25 ? 'medium' : 'low';
      const reasons = [
        `${entry.usage.toFixed(1)}% usage in ${snapshot.label}`,
        `${superEffectiveTargets} team member(s) hit super effectively by common moves`,
        `${resists} team member(s) resist the known common attacks`,
      ];

      return {
        species: entry.species,
        rank: entry.rank,
        usage: entry.usage,
        score,
        severity,
        reasons,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
