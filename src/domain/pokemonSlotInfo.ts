import type { BuilderSlot } from './teamBuilder';
import type { LocaleId, MoveReference, PokemonReference, PokemonType, StatId, StatTable } from './types';

export const EV_TOTAL_LIMIT = 510;
export const MOVE_SLOT_COUNT = 4;

export const STAT_FIELDS: Array<{ id: StatId; label: string }> = [
  { id: 'hp', label: 'HP' },
  { id: 'atk', label: 'Atk' },
  { id: 'def', label: 'Def' },
  { id: 'spa', label: 'SpA' },
  { id: 'spd', label: 'SpD' },
  { id: 'spe', label: 'Spe' },
];

const NATURE_EFFECTS: Partial<Record<string, { plus?: StatId; minus?: StatId }>> = {
  adamant: { plus: 'atk', minus: 'spa' },
  bashful: {},
  bold: { plus: 'def', minus: 'atk' },
  brave: { plus: 'atk', minus: 'spe' },
  calm: { plus: 'spd', minus: 'atk' },
  careful: { plus: 'spd', minus: 'spa' },
  docile: {},
  gentle: { plus: 'spd', minus: 'def' },
  hardy: {},
  hasty: { plus: 'spe', minus: 'def' },
  impish: { plus: 'def', minus: 'spa' },
  jolly: { plus: 'spe', minus: 'spa' },
  lax: { plus: 'def', minus: 'spd' },
  lonely: { plus: 'atk', minus: 'def' },
  mild: { plus: 'spa', minus: 'def' },
  modest: { plus: 'spa', minus: 'atk' },
  naive: { plus: 'spe', minus: 'spd' },
  naughty: { plus: 'atk', minus: 'spd' },
  quiet: { plus: 'spa', minus: 'spe' },
  quirky: {},
  rash: { plus: 'spa', minus: 'spd' },
  relaxed: { plus: 'def', minus: 'spe' },
  sassy: { plus: 'spd', minus: 'spe' },
  serious: {},
  timid: { plus: 'spe', minus: 'atk' },
};

const STAT_EFFECT_LABELS: Record<LocaleId, Record<StatId, string>> = {
  fr: {
    hp: 'PV',
    atk: 'Attaque',
    def: 'Défense',
    spa: 'Attaque Spéciale',
    spd: 'Défense Spéciale',
    spe: 'Vitesse',
  },
  en: {
    hp: 'HP',
    atk: 'Attack',
    def: 'Defense',
    spa: 'Special Attack',
    spd: 'Special Defense',
    spe: 'Speed',
  },
  ja: {
    hp: 'HP',
    atk: 'Attack',
    def: 'Defense',
    spa: 'Special Attack',
    spd: 'Special Defense',
    spe: 'Speed',
  },
};
const PREFERRED_ABILITIES_BY_POKEMON: Record<string, string[]> = {
  dragonite: ['Multiscale'],
  kangaskhan: ['Scrappy'],
  kingambit: ['Supreme Overlord', 'Defiant'],
  garchomp: ['Rough Skin'],
};

function toSimpleId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function emptyMoves(): string[] {
  return Array.from({ length: MOVE_SLOT_COUNT }, () => '');
}

export function evTotal(evs: StatTable): number {
  return STAT_FIELDS.reduce((total, stat) => total + (evs[stat.id] ?? 0), 0);
}

export function defaultNatureForPokemon(
  pokemon: PokemonReference | undefined,
  natureOptions: string[],
): string | undefined {
  if (!pokemon) {
    return undefined;
  }

  const preferred =
    pokemon.baseStats.atk >= pokemon.baseStats.spa
      ? pokemon.baseStats.spe >= 80
        ? 'Jolly'
        : 'Adamant'
      : pokemon.baseStats.spe >= 80
        ? 'Timid'
        : 'Modest';

  if (natureOptions.includes(preferred)) {
    return preferred;
  }

  return natureOptions[0];
}

export function defaultEvsForPokemon(pokemon: PokemonReference | undefined): StatTable {
  if (!pokemon) {
    return {};
  }

  return pokemon.baseStats.atk >= pokemon.baseStats.spa
    ? { hp: 6, atk: 252, spe: 252 }
    : { hp: 6, spa: 252, spe: 252 };
}

export function defaultTeraTypeForPokemon(pokemon: PokemonReference | undefined): PokemonType | undefined {
  return pokemon?.types[0];
}

export function defaultAbilityForPokemon(pokemon: PokemonReference | undefined): string | undefined {
  if (!pokemon) {
    return undefined;
  }

  const preferredAbilities = PREFERRED_ABILITIES_BY_POKEMON[pokemon.id] ?? [];
  return preferredAbilities.find((ability) => pokemon.abilities.includes(ability)) ?? pokemon.abilities[0];
}

export function hydrateSlotForPokemon(
  pokemon: PokemonReference | undefined,
  _natureOptions: string[],
): Partial<Omit<BuilderSlot, 'id'>> {
  return {
    species: pokemon?.name,
    ability: defaultAbilityForPokemon(pokemon),
    teraType: defaultTeraTypeForPokemon(pokemon),
    nature: undefined,
    evs: defaultEvsForPokemon(pokemon),
    moves: emptyMoves(),
  };
}

export function natureEffectLabel(nature: string | undefined, locale: LocaleId): string {
  if (!nature) {
    return '';
  }

  const effect = NATURE_EFFECTS[toSimpleId(nature)];
  if (!effect?.plus || !effect.minus || effect.plus === effect.minus) {
    return locale === 'fr' ? 'neutre' : 'neutral';
  }

  return `+${STAT_EFFECT_LABELS[locale][effect.plus]} / -${STAT_EFFECT_LABELS[locale][effect.minus]}`;
}

export function isStabMove(move: MoveReference, pokemon: PokemonReference | undefined): boolean {
  return Boolean(pokemon?.types.includes(move.type));
}

export function moveOptionsForSlot(
  slot: BuilderSlot,
  pokemon: PokemonReference | undefined,
  moveOptions: MoveReference[],
  moveIndex: number,
): MoveReference[] {
  const allowedMoveIds = new Set(pokemon?.moveIds ?? []);
  const currentMove = slot.moves[moveIndex];
  const selectedMovesInOtherFields = new Set(slot.moves.filter((move, index) => Boolean(move) && index !== moveIndex));

  return moveOptions.filter((move) => {
    if (selectedMovesInOtherFields.has(move.name)) {
      return false;
    }

    return allowedMoveIds.has(move.id) || move.name === currentMove;
  });
}
