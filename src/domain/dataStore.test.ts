import { describe, expect, it } from 'vitest';
import { createDataStore } from './dataStore';
import { SUPPORTED_FORMATS } from './formatRules';
import { demoDataBundle } from '../data/demoSnapshots';

describe('dataStore', () => {
  it('finds reference Pokemon and moves by normalized id', () => {
    const store = createDataStore(demoDataBundle);

    expect(store.getPokemon('Great Tusk')?.name).toBe('Great Tusk');
    expect(store.getPokemon('greattusk')?.types).toEqual(['Ground', 'Fighting']);
    expect(store.getMove('Thunderbolt')?.type).toBe('Electric');
  });

  it('finds reference Pokemon and moves by localized aliases', () => {
    const store = createDataStore({
      ...demoDataBundle,
      reference: {
        ...demoDataBundle.reference,
        pokemon: {
          ...demoDataBundle.reference.pokemon,
          greattusk: {
            ...demoDataBundle.reference.pokemon.greattusk,
            localizedNames: { en: 'Great Tusk', fr: 'Fort-Ivoire', ja: 'イダイナキバ' },
          },
        },
        moves: {
          ...demoDataBundle.reference.moves,
          earthquake: {
            ...demoDataBundle.reference.moves.earthquake,
            localizedNames: { en: 'Earthquake', fr: 'Séisme', ja: 'じしん' },
          },
        },
      },
    });

    expect(store.getPokemon('Fort-Ivoire')?.name).toBe('Great Tusk');
    expect(store.getMove('Séisme')?.name).toBe('Earthquake');
  });

  it('returns the format-specific meta snapshot without mixing formats', () => {
    const store = createDataStore(demoDataBundle);

    expect(store.getMetaSnapshot('champions-vgc')?.format).toBe('champions-vgc');
    expect(store.getMetaSnapshot('champions-bss')?.format).toBe('champions-bss');
    expect(store.getMetaSnapshot('champions-vgc')?.entries[0].species).not.toBe(
      store.getMetaSnapshot('champions-bss')?.entries[0].species,
    );
  });

  it('exposes all V1 formats with user-facing labels', () => {
    expect(SUPPORTED_FORMATS.map((format) => format.label)).toEqual([
      'Champions VGC',
      'Champions 3v3',
      'Champions OU',
    ]);
  });
});
