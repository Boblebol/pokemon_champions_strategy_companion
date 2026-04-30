import { describe, expect, it } from 'vitest';
import { buildPkmnReferenceSnapshot } from './pkmnReference';

describe('pkmnReference', () => {
  it('builds a complete Showdown Gen 9 reference with learnset-filtered moves', async () => {
    const snapshot = await buildPkmnReferenceSnapshot();

    expect(Object.keys(snapshot.pokemon).length).toBeGreaterThan(500);
    expect(Object.keys(snapshot.moves).length).toBeGreaterThan(600);
    expect(snapshot.items).toContain('Rocky Helmet');
    expect(snapshot.natures).toContain('Jolly');
    expect(snapshot.pokemon.garchomp.abilities).toContain('Rough Skin');
    expect(snapshot.pokemon.garchomp.moveIds).toContain('earthquake');
    expect(snapshot.pokemon.garchomp.moveIds).not.toContain('moonblast');
    expect(snapshot.locale).toBe('fr');
    expect(snapshot.pokemon.greattusk.localizedNames?.fr).toBe('Fort-Ivoire');
    expect(snapshot.pokemon.greattusk.image?.artwork).toContain('/official-artwork/984.png');
    expect(snapshot.moves.earthquake.localizedNames?.fr).toBe('Séisme');
    expect(snapshot.labels.items.rockyhelmet.fr).toBe('Casque Brut');
    expect(snapshot.labels.abilities.roughskin.fr).toBe('Peau Dure');
    expect(snapshot.labels.natures.jolly.fr).toBe('Jovial');
  });

  it('exposes damage-relevant move metadata from @pkmn', async () => {
    const snapshot = await buildPkmnReferenceSnapshot();

    expect(snapshot.moves.closecombat).toMatchObject({
      name: 'Close Combat',
      type: 'Fighting',
      category: 'Physical',
      power: 120,
      target: 'normal',
    });
    expect(snapshot.moves.suckerpunch?.priority).toBe(1);
    expect(snapshot.moves.earthquake?.target).toBe('allAdjacent');
  });
});
