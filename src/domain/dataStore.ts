import { toId } from './ids';
import type { DataBundle, FormatId } from './types';

export function createDataStore(bundle: DataBundle) {
  return {
    reference: bundle.reference,
    getPokemon(name: string) {
      return bundle.reference.pokemon[toId(name)];
    },
    getMove(name: string) {
      return bundle.reference.moves[toId(name)];
    },
    getMetaSnapshot(format: FormatId) {
      return bundle.meta[format];
    },
  };
}

export type DataStore = ReturnType<typeof createDataStore>;
