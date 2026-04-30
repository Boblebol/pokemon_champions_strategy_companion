import { Generations } from '@pkmn/data';
import { Dex } from '@pkmn/dex';
import { toId } from '../domain/ids';
import { toSearchId } from '../domain/localization';
import { POKEMON_TYPES } from '../domain/types';
import type {
  LocalizedNames,
  MoveCategory,
  PokemonType,
  ReferenceLabels,
  ReferenceSnapshot,
  StatTable,
} from '../domain/types';
import { generatedPokeAssets } from './generated/pokeAssets';
import type { LocalizedEntityAsset, PokeAssetData } from './pokeAssets';
import { TYPE_LABELS } from './pokeAssets';

const SHOWDOWN_GENERATION = 9;
const TYPE_SET = new Set<string>(POKEMON_TYPES);
const pokeAssets = generatedPokeAssets as PokeAssetData;
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

function namesBySearchId(assets: Record<string, LocalizedEntityAsset>): Record<string, LocalizedNames> {
  return Object.fromEntries(Object.entries(assets).map(([id, asset]) => [id, asset.names]));
}

function buildReferenceLabels(): ReferenceLabels {
  return {
    abilities: namesBySearchId(pokeAssets.abilities),
    items: namesBySearchId(pokeAssets.items),
    natures: namesBySearchId(pokeAssets.natures),
    types: TYPE_LABELS,
  };
}

export async function buildPkmnReferenceSnapshot(): Promise<ReferenceSnapshot> {
  const gen = new Generations(Dex).get(SHOWDOWN_GENERATION);
  const moves = Object.fromEntries(
    Array.from(gen.moves)
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((move) => {
        const moveAsset = pokeAssets.moves[toSearchId(move.name)];

        return [
          toId(move.name),
          {
            id: toId(move.name),
            name: move.name,
            ...(moveAsset ? { localizedNames: moveAsset.names } : {}),
            type: asPokemonType(move.type),
            category: asMoveCategory(move.category),
            ...(move.basePower > 0 ? { power: move.basePower } : {}),
            ...(typeof move.accuracy === 'number' ? { accuracy: move.accuracy } : {}),
            ...(move.priority !== 0 ? { priority: move.priority } : {}),
            target: move.target,
          },
        ];
      }),
  );
  const pokemonEntries = await Promise.all(
    Array.from(gen.species)
      .sort((left, right) => left.name.localeCompare(right.name))
      .map(async (species) => {
        const learnable = await gen.learnsets.learnable(species.name);
        const pokemonAsset = pokeAssets.pokemon[toSearchId(species.name)];

        return [
          toId(species.name),
          {
            id: toId(species.name),
            name: species.name,
            ...(pokemonAsset ? { localizedNames: pokemonAsset.names, image: pokemonAsset.image } : {}),
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
    source: `@pkmn/dex + @pkmn/data Gen ${SHOWDOWN_GENERATION} · ${pokeAssets.source}`,
    importedAt: new Date().toISOString(),
    locale: 'fr',
    pokemon: Object.fromEntries(pokemonEntries),
    moves,
    items: Array.from(gen.items)
      .map((item) => item.name)
      .sort((left, right) => left.localeCompare(right)),
    natures: Array.from(gen.natures)
      .map((nature) => nature.name)
      .sort((left, right) => left.localeCompare(right)),
    labels: buildReferenceLabels(),
  };
}

export function getPkmnReferenceSnapshot(): Promise<ReferenceSnapshot> {
  cachedReferenceSnapshot ??= buildPkmnReferenceSnapshot();
  return cachedReferenceSnapshot;
}
