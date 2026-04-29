import type { DataStore } from './dataStore';
import { detectRoles } from './roleDetection';
import { getDefensiveMultiplier, getWeaknessSummary } from './typeEffectiveness';
import type { FormatId, PokemonType, TeamMember } from './types';
import { POKEMON_TYPES } from './types';

export interface AuditFinding {
  severity: 'high' | 'medium' | 'low';
  title: string;
  evidence: string[];
}

export interface SpeedFinding {
  species: string;
  speed: number;
  estimated: boolean;
  note: string;
}

export interface TeamAudit {
  defensive: AuditFinding[];
  offensive: AuditFinding[];
  roles: ReturnType<typeof detectRoles>;
  speed: SpeedFinding[];
  dataWarnings: string[];
}

function resolveTeamTypes(team: TeamMember[], store: DataStore) {
  return team.flatMap((member) => {
    const reference = store.getPokemon(member.species);
    return reference ? [{ name: reference.name, types: reference.types }] : [];
  });
}

function buildDefensiveFindings(team: TeamMember[], store: DataStore): AuditFinding[] {
  const typedMembers = resolveTeamTypes(team, store);
  const summary = getWeaknessSummary(typedMembers);

  return summary
    .filter((entry) => entry.weakCount >= 2)
    .slice(0, 5)
    .map((entry) => ({
      severity: entry.weakCount >= 3 ? 'high' : 'medium',
      title: `${entry.type} pressure: ${entry.weakCount} team members weak`,
      evidence: [
        `Weak: ${entry.weakTo.join(', ')}`,
        entry.quadWeak.length > 0 ? `4x weak: ${entry.quadWeak.join(', ')}` : 'No 4x weakness',
        `${entry.resistOrImmuneCount} resist or are immune`,
      ],
    }));
}

function buildOffensiveFindings(team: TeamMember[], store: DataStore): AuditFinding[] {
  const coveredTypes = new Set<PokemonType>();

  for (const member of team) {
    for (const moveName of member.moves) {
      const move = store.getMove(moveName);
      if (!move || move.category === 'Status') {
        continue;
      }
      for (const type of POKEMON_TYPES) {
        if (getDefensiveMultiplier(move.type, [type]) > 1) {
          coveredTypes.add(type);
        }
      }
    }
  }

  const missing = POKEMON_TYPES.filter((type) => !coveredTypes.has(type));

  return [
    {
      severity: missing.length > 8 ? 'high' : missing.length > 4 ? 'medium' : 'low',
      title: `Offensive coverage: ${coveredTypes.size} defensive types covered by attacking moves`,
      evidence: [`Missing super-effective coverage into: ${missing.join(', ') || 'none'}`],
    },
  ];
}

function estimateSpeed(member: TeamMember, store: DataStore): SpeedFinding | undefined {
  const reference = store.getPokemon(member.species);
  if (!reference) {
    return undefined;
  }

  const hasSpeedEvs = typeof member.evs.spe === 'number';
  const speed = reference.baseStats.spe + Math.floor((member.evs.spe ?? 0) / 8);

  return {
    species: reference.name,
    speed,
    estimated: !hasSpeedEvs || !member.nature,
    note: hasSpeedEvs ? 'Uses entered Speed EVs.' : 'No Speed EVs entered; base Speed estimate only.',
  };
}

export function auditTeam({
  team,
  store,
}: {
  team: TeamMember[];
  store: DataStore;
  format: FormatId;
}): TeamAudit {
  const dataWarnings = team
    .filter((member) => !store.getPokemon(member.species))
    .map((member) => `Unknown Pokemon: ${member.species}`);

  return {
    defensive: buildDefensiveFindings(team, store),
    offensive: buildOffensiveFindings(team, store),
    roles: detectRoles(team),
    speed: team.flatMap((member) => estimateSpeed(member, store) ?? []),
    dataWarnings,
  };
}
