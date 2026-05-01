import type { DataStore } from './dataStore';
import { getFormatDefinition } from './formatRules';
import { toId } from './ids';
import { calculateBattleStats } from './statCalculator';
import { getDefensiveMultiplier } from './typeEffectiveness';
import type { FormatId, MoveReference, PokemonReference, TeamMember } from './types';

export interface CoverageMove {
  move: string;
  targets: string[];
}

export interface SetArchetype {
  name: string;
  moves: string[];
}

export interface PossibleThreat {
  species: string;
  score: number;
  severity: 'high' | 'medium' | 'low';
  isMeta: boolean;
  speed: number;
  coverageMoves: CoverageMove[];
  setArchetypes: SetArchetype[];
  reasons: string[];
}

const SETUP_MOVES = new Set(['dragondance', 'swordsdance', 'nastyplot', 'calmmind', 'quiverdance', 'bulkup']);
const PRIORITY_MOVES = new Set(['extremespeed', 'suckerpunch', 'aquajet', 'iceshard', 'machpunch', 'bulletpunch']);
const RECOVERY_MOVES = new Set(['roost', 'recover', 'slackoff', 'softboiled', 'moonlight', 'morningsun', 'synthesis']);
const HIGH_USAGE_META_THRESHOLD = 5;

interface PossibleThreatCandidate extends Omit<PossibleThreat, 'setArchetypes'> {
  pokemon: PokemonReference;
}

function damagingMovesForPokemon(pokemon: PokemonReference, store: DataStore): MoveReference[] {
  return pokemon.moveIds.flatMap((moveId) => {
    const move = store.reference.moves[moveId];
    return move && move.category !== 'Status' ? [move] : [];
  });
}

function statusMovesForPokemon(pokemon: PokemonReference, store: DataStore): MoveReference[] {
  return pokemon.moveIds.flatMap((moveId) => {
    const move = store.reference.moves[moveId];
    return move && move.category === 'Status' ? [move] : [];
  });
}

function coverageIntoTeam(moves: MoveReference[], team: TeamMember[], store: DataStore): CoverageMove[] {
  return moves
    .map((move) => {
      const targets = team.flatMap((member) => {
        const defender = store.getPokemon(member.species);
        return defender && getDefensiveMultiplier(move.type, defender.types) > 1 ? [defender.name] : [];
      });

      return { move: move.name, targets };
    })
    .filter((entry) => entry.targets.length > 0)
    .sort((left, right) => right.targets.length - left.targets.length || left.move.localeCompare(right.move))
    .slice(0, 6);
}

function calculateMaxSpeed(pokemon: PokemonReference, format: FormatId): number {
  const level = getFormatDefinition(format)?.defaultLevel ?? 100;

  return calculateBattleStats({
    baseStats: pokemon.baseStats,
    evs: { spe: 252 },
    nature: 'Timid',
    level,
  }).spe;
}

function calculateMemberSpeed(member: TeamMember, store: DataStore, format: FormatId): number {
  const reference = store.getPokemon(member.species);
  const level = getFormatDefinition(format)?.defaultLevel ?? 100;

  if (!reference) {
    return 0;
  }

  return calculateBattleStats({
    baseStats: reference.baseStats,
    evs: member.evs,
    nature: member.nature,
    level,
  }).spe;
}

function topMoves(moves: MoveReference[], pokemon: PokemonReference, category?: MoveReference['category']): string[] {
  const filtered = moves.filter((move) => !category || move.category === category);
  const stab = filtered.filter((move) => pokemon.types.includes(move.type));
  const coverage = filtered.filter((move) => !pokemon.types.includes(move.type));

  return [...stab, ...coverage].slice(0, 4).map((move) => move.name);
}

function generateSetArchetypes(pokemon: PokemonReference, store: DataStore): SetArchetype[] {
  const damagingMoves = damagingMovesForPokemon(pokemon, store);
  const statusMoves = statusMovesForPokemon(pokemon, store);
  const archetypes: SetArchetype[] = [];
  const specialMoves = topMoves(damagingMoves, pokemon, 'Special');
  const physicalMoves = topMoves(damagingMoves, pokemon, 'Physical');
  const setupMove = statusMoves.find((move) => SETUP_MOVES.has(move.id));
  const priorityMove = damagingMoves.find((move) => PRIORITY_MOVES.has(move.id));
  const recoveryMove = statusMoves.find((move) => RECOVERY_MOVES.has(move.id));

  if (specialMoves.length >= physicalMoves.length && specialMoves.length > 0) {
    archetypes.push({ name: 'Attaquant spécial', moves: specialMoves.slice(0, 4) });
  } else if (physicalMoves.length > 0) {
    archetypes.push({ name: 'Attaquant physique', moves: physicalMoves.slice(0, 4) });
  }

  if (setupMove) {
    archetypes.push({
      name: "Se booste avant d'attaquer",
      moves: [setupMove.name, ...topMoves(damagingMoves, pokemon).slice(0, 3)],
    });
  }

  if (priorityMove) {
    archetypes.push({
      name: 'Finit avec priorité',
      moves: [priorityMove.name, ...topMoves(damagingMoves, pokemon).slice(0, 3)],
    });
  }

  if (recoveryMove) {
    archetypes.push({
      name: 'Résistant avec soin',
      moves: [recoveryMove.name, ...topMoves(damagingMoves, pokemon).slice(0, 3)],
    });
  }

  return archetypes.slice(0, 3);
}

export function rankPossibleThreats({
  team,
  store,
  format,
  limit = 8,
}: {
  team: TeamMember[];
  store: DataStore;
  format: FormatId;
  limit?: number;
}): PossibleThreat[] {
  const highUsageMetaSpecies = new Set(
    store
      .getMetaSnapshot(format)
      ?.entries.filter((entry) => entry.usage >= HIGH_USAGE_META_THRESHOLD)
      .map((entry) => toId(entry.species)) ?? [],
  );
  const ownSpecies = new Set(team.map((member) => toId(member.species)));
  const teamSpeeds = team.map((member) => calculateMemberSpeed(member, store, format));

  return Object.values(store.reference.pokemon)
    .filter((pokemon) => !highUsageMetaSpecies.has(pokemon.id) && !ownSpecies.has(pokemon.id))
    .map((pokemon) => {
      const damagingMoves = damagingMovesForPokemon(pokemon, store);
      const coverageMoves = coverageIntoTeam(damagingMoves, team, store);
      const uniqueTargets = new Set(coverageMoves.flatMap((entry) => entry.targets));
      const speed = calculateMaxSpeed(pokemon, format);
      const outspedTargets = teamSpeeds.filter((teamSpeed) => speed > teamSpeed).length;
      const score = uniqueTargets.size * 18 + coverageMoves.length * 2 + outspedTargets * 5;
      const severity: PossibleThreat['severity'] = score >= 45 ? 'high' : score >= 25 ? 'medium' : 'low';

      return {
        pokemon,
        species: pokemon.name,
        score,
        severity,
        isMeta: false,
        speed,
        coverageMoves,
        reasons: [
          `${uniqueTargets.size} membre(s) de ton équipe peuvent être touchés super efficacement`,
          `${outspedTargets} membre(s) dépassés avec 252 points d'entraînement en Vitesse au niveau ${
            getFormatDefinition(format)?.defaultLevel ?? 100
          }`,
        ],
      } satisfies PossibleThreatCandidate;
    })
    .filter((threat) => threat.coverageMoves.length > 0)
    .sort((left, right) => right.score - left.score || right.speed - left.speed || left.species.localeCompare(right.species))
    .slice(0, limit)
    .map(({ pokemon, ...threat }) => ({
      ...threat,
      setArchetypes: generateSetArchetypes(pokemon, store),
    }));
}
