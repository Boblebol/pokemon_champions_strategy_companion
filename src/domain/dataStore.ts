import { toId } from './ids';
import { toSearchId } from './localization';
import type { DataBundle, FormatId, LocalizedNames } from './types';

function addAlias(index: Record<string, string>, id: string, value: string | undefined) {
  const alias = toSearchId(value);
  if (alias) {
    index[alias] = id;
  }
}

function addLocalizedAliases(index: Record<string, string>, id: string, names: LocalizedNames | undefined) {
  if (!names) {
    return;
  }

  Object.values(names).forEach((name) => addAlias(index, id, name));
}

export function createDataStore(bundle: DataBundle) {
  const pokemonAliases = Object.fromEntries(
    Object.entries(bundle.reference.pokemon).flatMap(([id, pokemon]) => {
      const entries: Array<[string, string]> = [];
      const index: Record<string, string> = {};
      addAlias(index, id, pokemon.name);
      addLocalizedAliases(index, id, pokemon.localizedNames);
      entries.push(...Object.entries(index));
      return entries;
    }),
  );
  const moveAliases = Object.fromEntries(
    Object.entries(bundle.reference.moves).flatMap(([id, move]) => {
      const entries: Array<[string, string]> = [];
      const index: Record<string, string> = {};
      addAlias(index, id, move.name);
      addLocalizedAliases(index, id, move.localizedNames);
      entries.push(...Object.entries(index));
      return entries;
    }),
  );

  return {
    reference: bundle.reference,
    getPokemon(name: string) {
      return bundle.reference.pokemon[toId(name)] ?? bundle.reference.pokemon[pokemonAliases[toSearchId(name)]];
    },
    getMove(name: string) {
      return bundle.reference.moves[toId(name)] ?? bundle.reference.moves[moveAliases[toSearchId(name)]];
    },
    getMetaSnapshot(format: FormatId) {
      return bundle.meta[format];
    },
  };
}

export type DataStore = ReturnType<typeof createDataStore>;
