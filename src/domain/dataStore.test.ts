import { describe, expect, it } from 'vitest';
import { createDataStore } from './dataStore';
import { SUPPORTED_FORMATS } from './formatRules';
import { demoDataBundle } from '../data/demoSnapshots';

describe('dataStore', () => {
  it('finds reference Pokemon and moves by normalized id', () => {
    const store = createDataStore(demoDataBundle);

    expect(store.getPokemon('Kangaskhan')?.name).toBe('Kangaskhan');
    expect(store.getPokemon('kangaskhan')?.types).toEqual(['Normal']);
    expect(store.getMove('Thunderbolt')?.type).toBe('Electric');
  });

  it('finds reference Pokemon and moves by localized aliases', () => {
    const store = createDataStore({
      ...demoDataBundle,
      reference: {
        ...demoDataBundle.reference,
        pokemon: {
          ...demoDataBundle.reference.pokemon,
          kangaskhan: {
            ...demoDataBundle.reference.pokemon.kangaskhan,
            localizedNames: { en: 'Kangaskhan', fr: 'Kangourex', ja: 'ガルーラ' },
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

    expect(store.getPokemon('Kangourex')?.name).toBe('Kangaskhan');
    expect(store.getMove('Séisme')?.name).toBe('Earthquake');
  });

  it('returns the format-specific meta snapshot without mixing formats', () => {
    const store = createDataStore(demoDataBundle);

    expect(store.getMetaSnapshot('champions-vgc')?.format).toBe('champions-vgc');
    expect(store.getMetaSnapshot('champions-bss')?.format).toBe('champions-bss');
    expect(store.getMetaSnapshot('champions-vgc')?.id).toBe('demo-vgc-2026-04');
    expect(store.getMetaSnapshot('champions-bss')?.id).toBe('demo-bss-2026-04');
  });

  it('exposes all V1 formats with Pokemon Showdown labels and Smogon slugs', () => {
    expect(
      SUPPORTED_FORMATS.map((format) => ({
        id: format.id,
        label: format.label,
        showdownName: format.showdownName,
        smogonSlug: format.smogonSlug,
      })),
    ).toEqual([
      {
        id: 'champions-vgc',
        label: '[Champions] VGC 2026 Reg M-A',
        showdownName: '[Gen 9 Champions] VGC 2026 Reg M-A',
        smogonSlug: 'gen9championsvgc2026regma',
      },
      {
        id: 'champions-bss',
        label: '[Champions] BSS Reg M-A',
        showdownName: '[Gen 9 Champions] BSS Reg M-A',
        smogonSlug: 'gen9championsbssregma',
      },
      {
        id: 'champions-ou',
        label: '[Champions] OU',
        showdownName: '[Gen 9 Champions] OU',
        smogonSlug: 'gen9championsou',
      },
    ]);
  });
});
