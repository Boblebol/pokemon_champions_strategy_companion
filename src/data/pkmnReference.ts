import { Generations } from '@pkmn/data';
import { Dex } from '@pkmn/dex';
import { toId } from '../domain/ids';
import { POKEMON_TYPES } from '../domain/types';
import type { MoveCategory, PokemonType, ReferenceSnapshot, StatTable } from '../domain/types';

const SHOWDOWN_GENERATION = 9;
const TYPE_SET = new Set<string>(POKEMON_TYPES);
let cachedReferenceSnapshot: Promise<ReferenceSnapshot> | undefined;

function asPokemonType(value: string): PokemonType {
  if (!TYPE_SET.has(value)) {
    throw new Error(`Type Pokémon inconnu depuis @pkmn: ${value}`);
  }

  return value as PokemonType;
}

function asMoveCategory(value: string): MoveCategory {
  if (value === 'Physical' || value === 'Special' || value === 'Status') {
    return value;
  }

  throw new Error(`Catégorie d'attaque inconnue depuis @pkmn: ${value}`);
}

function normalizeStats(stats: {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}): Required<StatTable> {
  return {
    hp: stats.hp,
    atk: stats.atk,
    def: stats.def,
    spa: stats.spa,
    spd: stats.spd,
    spe: stats.spe,
  };
}

function normalizeAbilities(abilities: Readonly<{ 0: string; 1?: string; H?: string; S?: string }>): string[] {
  return Array.from(new Set(Object.values(abilities).filter(Boolean))).sort((left, right) =>
    left.localeCompare(right),
  );
}

export async function buildPkmnReferenceSnapshot(): Promise<ReferenceSnapshot> {
  const gen = new Generations(Dex).get(SHOWDOWN_GENERATION);
  const moves = Object.fromEntries(
    Array.from(gen.moves)
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((move) => [
        toId(move.name),
        {
          id: toId(move.name),
          name: move.name,
          type: asPokemonType(move.type),
          category: asMoveCategory(move.category),
          ...(move.basePower > 0 ? { power: move.basePower } : {}),
        },
      ]),
  );
  const pokemonEntries = await Promise.all(
    Array.from(gen.species)
      .sort((left, right) => left.name.localeCompare(right.name))
      .map(async (species) => {
        const learnable = await gen.learnsets.learnable(species.name);

        return [
          toId(species.name),
          {
            id: toId(species.name),
            name: species.name,
            types: species.types.map(asPokemonType),
            baseStats: normalizeStats(species.baseStats),
            abilities: normalizeAbilities(species.abilities),
            moveIds: Object.keys(learnable ?? {}).filter((moveId) => moves[moveId]),
          },
        ] as const;
      }),
  );

  return {
    id: `pkmn-showdown-gen${SHOWDOWN_GENERATION}`,
    source: `@pkmn/dex + @pkmn/data Gen ${SHOWDOWN_GENERATION}`,
    importedAt: new Date().toISOString(),
    pokemon: Object.fromEntries(pokemonEntries),
    moves,
    items: Array.from(gen.items)
      .map((item) => item.name)
      .sort((left, right) => left.localeCompare(right)),
    natures: Array.from(gen.natures)
      .map((nature) => nature.name)
      .sort((left, right) => left.localeCompare(right)),
  };
}

export function getPkmnReferenceSnapshot(): Promise<ReferenceSnapshot> {
  cachedReferenceSnapshot ??= buildPkmnReferenceSnapshot();
  return cachedReferenceSnapshot;
}
