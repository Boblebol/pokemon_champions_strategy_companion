import { describe, expect, it } from 'vitest';
import { demoDataBundle } from './demoSnapshots';

describe('demoSnapshots', () => {
  it('keeps Champions demo data usable while the complete reference loads', () => {
    const reference = demoDataBundle.reference;
    const demoPokemon = Object.values(reference.pokemon).map((pokemon) => pokemon.name);
    const demoUsage = Object.values(demoDataBundle.meta).flatMap((snapshot) =>
      snapshot.entries.map((entry) => entry.species),
    );

    expect(reference.pokemon.kangaskhan.localizedNames?.fr).toBe('Kangourex');
    expect(reference.pokemon.kangaskhan.image?.sprite).toContain('/pokemon/115.png');
    expect(reference.pokemon.kangaskhan.moveIds).toEqual(expect.arrayContaining(['fakeout', 'earthquake']));
    expect(demoPokemon).toEqual(expect.arrayContaining(['Dragonite', 'Kingambit', 'Kangaskhan', 'Charizard']));
    expect([...demoPokemon, ...demoUsage]).not.toEqual(
      expect.arrayContaining(['Great Tusk', 'Flutter Mane', 'Dondozo']),
    );
    expect(reference.moves.fakeout.localizedNames?.fr).toBe('Bluff');
    expect(reference.abilityDetails.scrappy.description).toMatch(/spectre/i);
    expect(reference.natureDetails.jolly.description).toContain("augmente la Vitesse");
    expect(reference.itemDetails.leftovers.description).toContain('PV');
  });
});
