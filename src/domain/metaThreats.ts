import type { DataStore } from './dataStore';
import { getDefensiveMultiplier } from './typeEffectiveness';
import type { FormatId, MoveReference, TeamMember } from './types';

export interface RankedThreat {
  species: string;
  rank: number;
  usage: number;
  score: number;
  severity: 'high' | 'medium' | 'low';
  reasons: string[];
}

function resolveKnownDamagingMoves(commonMoves: string[], store: DataStore): MoveReference[] {
  return commonMoves.flatMap((moveName) => {
    const move = store.getMove(moveName);
    return move && move.category !== 'Status' ? [move] : [];
  });
}

function countSuperEffectiveTargets(attackingMoves: MoveReference[], team: TeamMember[], store: DataStore) {
  let count = 0;

  for (const member of team) {
    const defender = store.getPokemon(member.species);
    if (!defender) {
      continue;
    }

    const isHit = attackingMoves.some((move) => {
      return getDefensiveMultiplier(move.type, defender.types) > 1;
    });

    if (isHit) {
      count += 1;
    }
  }

  return count;
}

function countResists(attackingMoves: MoveReference[], team: TeamMember[], store: DataStore) {
  let count = 0;

  for (const member of team) {
    const defender = store.getPokemon(member.species);
    if (!defender) {
      continue;
    }

    const resistsAllKnownAttacks = attackingMoves.every((move) => {
      return getDefensiveMultiplier(move.type, defender.types) < 1;
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
      const commonDamagingMoves = resolveKnownDamagingMoves(entry.commonMoves, store);
      const superEffectiveTargets = countSuperEffectiveTargets(commonDamagingMoves, team, store);
      const resists = countResists(commonDamagingMoves, team, store);
      const score = entry.usage + superEffectiveTargets * 12 - resists * 5;
      const severity: RankedThreat['severity'] = score >= 45 ? 'high' : score >= 25 ? 'medium' : 'low';
      const reasons = [
        `${entry.usage.toFixed(1)}% d'usage dans ${snapshot.label}`,
        `${superEffectiveTargets} membre(s) de ton équipe touchés super efficacement par ses attaques connues`,
        `${resists} membre(s) de ton équipe encaissent bien ses attaques connues`,
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
    .sort((a, b) => b.score - a.score || b.usage - a.usage || a.rank - b.rank || a.species.localeCompare(b.species))
    .slice(0, limit);
}
