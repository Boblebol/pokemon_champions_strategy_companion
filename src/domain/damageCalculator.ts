import { calculate, Field, Generations, Move, Pokemon } from '@smogon/calc';
import { getFormatDefinition } from './formatRules';
import { toSearchId } from './localization';
import type { FormatId, MoveReference, PokemonReference, ReferenceSnapshot, StatId, StatTable, TeamMember } from './types';

export type WeatherId = 'none' | 'Sun' | 'Rain' | 'Sand' | 'Hail' | 'Snow';
export type TerrainId = 'none' | 'Electric' | 'Grassy' | 'Misty' | 'Psychic';

export interface CombatPokemonModifiers {
  boosts?: Partial<Record<Exclude<StatId, 'hp'>, number>>;
  teraActive?: boolean;
  burned?: boolean;
  criticalHit?: boolean;
}

export interface CombatOpponent {
  id: string;
  species?: string;
  item?: string;
  ability?: string;
  nature?: string;
  teraType?: TeamMember['teraType'];
  evs?: StatTable;
  moves?: string[];
}

export interface CombatSideConditions {
  reflect: boolean;
  lightScreen: boolean;
  auroraVeil: boolean;
}

export interface CombatState {
  friendlyActiveSlots: number[];
  opponents: CombatOpponent[];
  friendly: Record<number, CombatPokemonModifiers>;
  opponent: Record<string, CombatPokemonModifiers>;
  friendlySide: CombatSideConditions;
  opponentSide: CombatSideConditions;
  weather: WeatherId;
  terrain: TerrainId;
}

export interface DamageRow {
  move: string;
  moveType: MoveReference['type'];
  category: MoveReference['category'];
  power?: number;
  minDamage: number;
  maxDamage: number;
  minPercent: number;
  maxPercent: number;
  koChanceLabel: string;
  notes: string[];
}

export interface CombatMatchup {
  friendly: TeamMember;
  opponent: CombatOpponent;
  friendlyDamage: DamageRow[];
  opponentDamage: DamageRow[];
}

export interface CombatScenarioResult {
  level: number;
  isDoubles: boolean;
  matchups: CombatMatchup[];
  warnings: string[];
}

const gen = Generations.get(9);
const TOP_OPPONENT_MOVES = 8;
const MAX_SEARCH_RESULTS = 12;

function clampBoost(value: number | undefined): number {
  return Math.max(-6, Math.min(6, value ?? 0));
}

function normalizeSearchLabel(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function pokemonSearchLabels(pokemon: PokemonReference): string[] {
  const labels = [
    pokemon.name,
    pokemon.localizedNames?.fr,
    pokemon.localizedNames?.en,
    pokemon.localizedNames?.ja,
  ].filter((label): label is string => Boolean(label));

  return Array.from(new Set(labels.flatMap((label) => [normalizeSearchLabel(label), toSearchId(label)])));
}

function legalDamagingMoves(reference: ReferenceSnapshot, species: string | undefined): MoveReference[] {
  const pokemon = species ? reference.pokemon[toSearchId(species)] : undefined;
  return (pokemon?.moveIds ?? [])
    .map((moveId) => reference.moves[moveId])
    .filter((move): move is MoveReference => Boolean(move) && move.category !== 'Status');
}

function selectedOpponentMoves(reference: ReferenceSnapshot, opponent: CombatOpponent): MoveReference[] {
  const moves = opponent.moves?.length
    ? opponent.moves.flatMap((move) => {
        const referenceMove = reference.moves[toSearchId(move)];
        return referenceMove && referenceMove.category !== 'Status' ? [referenceMove] : [];
      })
    : legalDamagingMoves(reference, opponent.species);

  return moves;
}

function memberMoves(reference: ReferenceSnapshot, member: TeamMember, includeAllMoves: boolean): MoveReference[] {
  const setMoves = member.moves.flatMap((move) => {
    const referenceMove = reference.moves[toSearchId(move)];
    return referenceMove && referenceMove.category !== 'Status' ? [referenceMove] : [];
  });

  return includeAllMoves ? legalDamagingMoves(reference, member.species) : setMoves;
}

function asCalcPokemon(
  species: string,
  level: number,
  reference: ReferenceSnapshot,
  options: {
    item?: string;
    ability?: string;
    nature?: string;
    evs?: StatTable;
    teraType?: TeamMember['teraType'];
    modifiers?: CombatPokemonModifiers;
  },
) {
  const pokemon = reference.pokemon[toSearchId(species)];

  return new Pokemon(gen, species, {
    level,
    item: options.item,
    ability: options.ability,
    nature: options.nature,
    evs: options.evs,
    boosts: {
      atk: clampBoost(options.modifiers?.boosts?.atk),
      def: clampBoost(options.modifiers?.boosts?.def),
      spa: clampBoost(options.modifiers?.boosts?.spa),
      spd: clampBoost(options.modifiers?.boosts?.spd),
      spe: clampBoost(options.modifiers?.boosts?.spe),
    },
    status: options.modifiers?.burned ? 'brn' : undefined,
    teraType: options.modifiers?.teraActive ? options.teraType ?? pokemon?.types[0] : undefined,
  });
}

function asField(state: CombatState, defender: 'friendly' | 'opponent') {
  const side = defender === 'friendly' ? state.friendlySide : state.opponentSide;
  const defenderSide = {
    isReflect: side.reflect,
    isLightScreen: side.lightScreen,
    isAuroraVeil: side.auroraVeil,
  };

  return new Field({
    gameType: state.friendlyActiveSlots.length > 1 || state.opponents.length > 1 ? 'Doubles' : 'Singles',
    weather: state.weather === 'none' ? undefined : state.weather,
    terrain: state.terrain === 'none' ? undefined : state.terrain,
    attackerSide: {},
    defenderSide,
  });
}

function flattenDamage(damage: number | number[] | number[][]): number[] {
  if (typeof damage === 'number') {
    return [damage];
  }

  return damage.flat().filter((value): value is number => typeof value === 'number');
}

function damageToRow(move: MoveReference, rawDamage: number[], maxHp: number, notes: string[]): DamageRow {
  const damageRolls = rawDamage.length > 0 ? rawDamage : [0];
  const minDamage = Math.min(...damageRolls);
  const maxDamage = Math.max(...damageRolls);
  const minPercent = Math.round((minDamage / maxHp) * 1000) / 10;
  const maxPercent = Math.round((maxDamage / maxHp) * 1000) / 10;
  const hitsToKo = maxDamage > 0 ? Math.ceil(maxHp / maxDamage) : Infinity;
  const koChanceLabel =
    hitsToKo === Infinity ? 'Aucun dégât' : hitsToKo === 1 ? 'OHKO possible' : hitsToKo === 2 ? '2HKO possible' : `${hitsToKo}HKO+`;

  return {
    move: move.name,
    moveType: move.type,
    category: move.category,
    power: move.power,
    minDamage,
    maxDamage,
    minPercent,
    maxPercent,
    koChanceLabel,
    notes,
  };
}

function calculateRows(args: {
  attacker: Pokemon;
  defender: Pokemon;
  moves: MoveReference[];
  state: CombatState;
  defenderSide: 'friendly' | 'opponent';
  criticalHit?: boolean;
}) {
  return args.moves
    .map((move) => {
      const result = calculate(
        gen,
        args.attacker,
        args.defender,
        new Move(gen, move.name, {
          isCrit: args.criticalHit,
        }),
        asField(args.state, args.defenderSide),
      );
      const damage = flattenDamage(result.damage);
      const notes = damage.some((value) => value > 0)
        ? [result.desc().replace(/\s+/g, ' ')]
        : ['Immunité ou dégâts nuls.'];

      return damageToRow(move, damage, args.defender.maxHP(), notes);
    })
    .sort((left, right) => right.maxPercent - left.maxPercent);
}

export function createDefaultCombatState(format: FormatId, selectedTeam: TeamMember[]): CombatState {
  const isDoubles = getFormatDefinition(format)?.battleStyle === 'doubles';

  return {
    friendlyActiveSlots: selectedTeam.slice(0, isDoubles ? 2 : 1).map((member) => member.slot),
    opponents: [{ id: 'opp-1' }, ...(isDoubles ? [{ id: 'opp-2' }] : [])],
    friendly: {},
    opponent: {},
    friendlySide: { reflect: false, lightScreen: false, auroraVeil: false },
    opponentSide: { reflect: false, lightScreen: false, auroraVeil: false },
    weather: 'none',
    terrain: 'none',
  };
}

export function searchCombatPokemon(reference: ReferenceSnapshot, query: string) {
  const normalizedQuery = normalizeSearchLabel(query.trim());
  const compactQuery = toSearchId(query);
  if (!normalizedQuery && !compactQuery) {
    return [];
  }

  return Object.values(reference.pokemon)
    .filter((pokemon) =>
      pokemonSearchLabels(pokemon).some((label) => label.includes(normalizedQuery) || label.includes(compactQuery)),
    )
    .slice(0, MAX_SEARCH_RESULTS);
}

export function calculateCombatScenario({
  format,
  reference,
  friendlyTeam,
  state,
  includeAllFriendlyMoves = false,
}: {
  format: FormatId;
  reference: ReferenceSnapshot;
  friendlyTeam: TeamMember[];
  state: CombatState;
  includeAllFriendlyMoves?: boolean;
}): CombatScenarioResult {
  const definition = getFormatDefinition(format);
  const level = definition?.defaultLevel ?? 100;
  const activeFriendly = state.friendlyActiveSlots.flatMap((slot) => friendlyTeam.find((member) => member.slot === slot) ?? []);
  const activeOpponents = state.opponents.filter((opponent) => opponent.species);

  return {
    level,
    isDoubles: definition?.battleStyle === 'doubles',
    warnings:
      activeFriendly.length === 0 || activeOpponents.length === 0
        ? ['Choisis au moins un Pokémon actif et un adversaire.']
        : [],
    matchups: activeFriendly.flatMap((friendly) =>
      activeOpponents.map((opponent) => {
        const friendlyCalc = asCalcPokemon(friendly.species, friendly.level ?? level, reference, {
          item: friendly.item,
          ability: friendly.ability,
          nature: friendly.nature,
          evs: friendly.evs,
          teraType: friendly.teraType,
          modifiers: state.friendly[friendly.slot],
        });
        const opponentCalc = asCalcPokemon(opponent.species as string, level, reference, {
          item: opponent.item,
          ability: opponent.ability,
          nature: opponent.nature,
          evs: opponent.evs,
          teraType: opponent.teraType,
          modifiers: state.opponent[opponent.id],
        });

        return {
          friendly,
          opponent,
          friendlyDamage: calculateRows({
            attacker: friendlyCalc,
            defender: opponentCalc,
            moves: memberMoves(reference, friendly, includeAllFriendlyMoves),
            state,
            defenderSide: 'opponent',
            criticalHit: state.friendly[friendly.slot]?.criticalHit,
          }),
          opponentDamage: calculateRows({
            attacker: opponentCalc,
            defender: friendlyCalc,
            moves: selectedOpponentMoves(reference, opponent),
            state,
            defenderSide: 'friendly',
            criticalHit: state.opponent[opponent.id]?.criticalHit,
          }).slice(0, TOP_OPPONENT_MOVES),
        };
      }),
    ),
  };
}
