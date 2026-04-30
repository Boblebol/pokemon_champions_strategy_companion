import type { DataStore } from './dataStore';
import { getFormatDefinition } from './formatRules';
import { detectRoles } from './roleDetection';
import { calculateBattleStats, speedBenchmarks } from './statCalculator';
import type { SpeedBenchmark } from './statCalculator';
import { getDefensiveMultiplier, getWeaknessSummary } from './typeEffectiveness';
import type { FormatDefinition, FormatId, PokemonType, TeamMember } from './types';
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
  benchmarks: SpeedBenchmark[];
  note: string;
}

export type AuditFormatContext = Pick<FormatDefinition, 'id' | 'label' | 'battleStyle' | 'teamSize' | 'defaultLevel'>;

export interface TeamAudit {
  format: AuditFormatContext;
  defensive: AuditFinding[];
  offensive: AuditFinding[];
  roles: ReturnType<typeof detectRoles>;
  speed: SpeedFinding[];
  dataWarnings: string[];
}

const TYPE_LABELS_FR: Record<PokemonType, string> = {
  Normal: 'Normal',
  Fire: 'Feu',
  Water: 'Eau',
  Electric: 'Electrik',
  Grass: 'Plante',
  Ice: 'Glace',
  Fighting: 'Combat',
  Poison: 'Poison',
  Ground: 'Sol',
  Flying: 'Vol',
  Psychic: 'Psy',
  Bug: 'Insecte',
  Rock: 'Roche',
  Ghost: 'Spectre',
  Dragon: 'Dragon',
  Dark: 'Ténèbres',
  Steel: 'Acier',
  Fairy: 'Fée',
};

function typeLabel(type: PokemonType): string {
  return TYPE_LABELS_FR[type];
}

function typeList(types: PokemonType[]): string {
  return types.map(typeLabel).join(', ');
}

function getAuditFormatContext(format: FormatId): AuditFormatContext {
  const definition = getFormatDefinition(format);
  if (!definition) {
    throw new Error(`Unsupported format: ${format}`);
  }

  const { id, label, battleStyle, teamSize, defaultLevel } = definition;
  return { id, label, battleStyle, teamSize, defaultLevel };
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
      title: `Pression ${typeLabel(entry.type)} : ${entry.weakCount} membre(s) faibles`,
      evidence: [
        `Faibles : ${entry.weakTo.join(', ')}`,
        entry.quadWeak.length > 0 ? `Faiblesse x4 : ${entry.quadWeak.join(', ')}` : 'Aucune faiblesse x4',
        `${entry.resistOrImmuneCount} résistance(s) ou immunité(s)`,
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
      title: `Couverture offensive : ${coveredTypes.size} types défensifs couverts par les attaques`,
      evidence: [`Couverture super efficace manquante sur : ${typeList(missing) || 'aucune'}`],
    },
  ];
}

function collectDataWarnings(team: TeamMember[], store: DataStore): string[] {
  const warnings: string[] = [];

  for (const member of team) {
    if (!store.getPokemon(member.species)) {
      warnings.push(`Pokémon inconnu : ${member.species}`);
    }

    for (const moveName of member.moves) {
      if (!store.getMove(moveName)) {
        warnings.push(`Attaque inconnue pour ${member.species} : ${moveName}`);
      }
    }
  }

  return warnings;
}

function estimateSpeed(member: TeamMember, store: DataStore, format: AuditFormatContext): SpeedFinding | undefined {
  const reference = store.getPokemon(member.species);
  if (!reference) {
    return undefined;
  }

  const stats = calculateBattleStats({
    baseStats: reference.baseStats,
    evs: member.evs,
    nature: member.nature,
    level: format.defaultLevel,
  });
  const note = `Calcul exact pour ${format.label} au niveau par défaut ${format.defaultLevel}, avec IV 31 par défaut et la nature saisie si disponible.`;

  return {
    species: reference.name,
    speed: stats.spe,
    estimated: false,
    benchmarks: speedBenchmarks(stats.spe),
    note,
  };
}

export function auditTeam({
  team,
  store,
  format,
}: {
  team: TeamMember[];
  store: DataStore;
  format: FormatId;
}): TeamAudit {
  const formatContext = getAuditFormatContext(format);

  return {
    format: formatContext,
    defensive: buildDefensiveFindings(team, store),
    offensive: buildOffensiveFindings(team, store),
    roles: detectRoles(team),
    speed: team.flatMap((member) => estimateSpeed(member, store, formatContext) ?? []),
    dataWarnings: collectDataWarnings(team, store),
  };
}
