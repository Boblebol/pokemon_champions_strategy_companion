import { getFormatDefinition } from './formatRules';
import { toId } from './ids';
import { calculateBattleStats } from './statCalculator';
import { getDefensiveMultiplier } from './typeEffectiveness';
import type { CombatOpponent } from './damageCalculator';
import type { FormatId, MoveReference, ReferenceSnapshot, TeamMember } from './types';

export interface OpponentCoverageMove {
  move: string;
  targets: string[];
}

export interface OpponentThreat {
  species: string;
  score: number;
  severity: 'high' | 'medium' | 'low';
  speed: number;
  coveredTargetCount: number;
  outspedTargetCount: number;
  coverageMoves: OpponentCoverageMove[];
}

export function combatOpponentLimit(format: FormatId): number {
  return getFormatDefinition(format)?.battleStyle === 'doubles' ? 2 : 1;
}

export function normalizeCombatSlots(format: FormatId, slots: CombatOpponent[]): CombatOpponent[] {
  return Array.from({ length: combatOpponentLimit(format) }, (_, index) => ({
    ...slots[index],
    id: `opp-${index + 1}`,
  }));
}

export function assignThreatToCombatSlots(
  format: FormatId,
  currentSlots: CombatOpponent[],
  species: string,
): CombatOpponent[] {
  const slots = normalizeCombatSlots(format, currentSlots);
  const existingIndex = slots.findIndex((slot) => toId(slot.species) === toId(species));

  if (existingIndex >= 0) {
    return slots.map((slot, index) => (index === existingIndex ? { id: slot.id } : slot));
  }

  const emptyIndex = slots.findIndex((slot) => !slot.species);
  const targetIndex = emptyIndex >= 0 ? emptyIndex : slots.length - 1;

  return slots.map((slot, index) => (index === targetIndex ? { ...slot, species } : slot));
}

function damagingMovesForPokemon(reference: ReferenceSnapshot, species: string): MoveReference[] {
  const pokemon = reference.pokemon[toId(species)];

  return (
    pokemon?.moveIds
      .map((moveId) => reference.moves[moveId])
      .filter((move): move is MoveReference => Boolean(move) && move.category !== 'Status') ?? []
  );
}

function coverageIntoTeam(reference: ReferenceSnapshot, moves: MoveReference[], team: TeamMember[]): OpponentCoverageMove[] {
  return moves
    .map((move) => {
      const targets = team.flatMap((member) => {
        const target = reference.pokemon[toId(member.species)];
        return target && getDefensiveMultiplier(move.type, target.types) > 1 ? [target.name] : [];
      });

      return { move: move.name, targets };
    })
    .filter((entry) => entry.targets.length > 0)
    .sort((left, right) => right.targets.length - left.targets.length || left.move.localeCompare(right.move))
    .slice(0, 4);
}

function maxSpeed(reference: ReferenceSnapshot, species: string, format: FormatId): number {
  const pokemon = reference.pokemon[toId(species)];
  const level = getFormatDefinition(format)?.defaultLevel ?? 100;

  if (!pokemon) {
    return 0;
  }

  return calculateBattleStats({
    baseStats: pokemon.baseStats,
    evs: { spe: 252 },
    nature: 'Timid',
    level,
  }).spe;
}

function memberSpeed(reference: ReferenceSnapshot, member: TeamMember, format: FormatId): number {
  const pokemon = reference.pokemon[toId(member.species)];
  const level = getFormatDefinition(format)?.defaultLevel ?? 100;

  if (!pokemon) {
    return 0;
  }

  return calculateBattleStats({
    baseStats: pokemon.baseStats,
    evs: member.evs,
    nature: member.nature,
    level,
  }).spe;
}

export function rankOpponentTeamThreats({
  opponentTeam,
  selectedTeam,
  reference,
  format,
}: {
  opponentTeam: string[];
  selectedTeam: TeamMember[];
  reference: ReferenceSnapshot;
  format: FormatId;
}): OpponentThreat[] {
  const selectedSpecies = opponentTeam.filter((species, index, all) => {
    return Boolean(species) && all.findIndex((candidate) => toId(candidate) === toId(species)) === index;
  });
  const selectedSpeeds = selectedTeam.map((member) => memberSpeed(reference, member, format));

  return selectedSpecies
    .map((species) => {
      const speed = maxSpeed(reference, species, format);
      const coverageMoves = coverageIntoTeam(reference, damagingMovesForPokemon(reference, species), selectedTeam);
      const coveredTargetCount = new Set(coverageMoves.flatMap((entry) => entry.targets)).size;
      const outspedTargetCount = selectedSpeeds.filter((selectedSpeed) => speed > selectedSpeed).length;
      const score = coveredTargetCount * 18 + coverageMoves.length * 2 + outspedTargetCount * 5;

      return {
        species,
        score,
        severity: score >= 45 ? 'high' : score >= 25 ? 'medium' : 'low',
        speed,
        coveredTargetCount,
        outspedTargetCount,
        coverageMoves,
      } satisfies OpponentThreat;
    })
    .sort((left, right) => right.score - left.score || right.speed - left.speed || left.species.localeCompare(right.species));
}
