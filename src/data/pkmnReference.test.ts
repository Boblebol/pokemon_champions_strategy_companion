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
    expect(snapshot.pokemon.kangaskhan.localizedNames?.fr).toBe('Kangourex');
    expect(snapshot.pokemon.kangaskhan.image?.sprite).toContain('/115.png');
    expect(snapshot.pokemon.kangaskhan.moveIds).toContain('fakeout');
    expect(snapshot.pokemon.kangaskhan.moveIds).toContain('earthquake');
    expect(snapshot.pokemon.kangaskhan.moveIds.length).toBeGreaterThan(0);
    expect(snapshot.pokemon.kangaskhanmega).toBeUndefined();
    expect(snapshot.pokemon.charizardgmax).toBeUndefined();
    expect(snapshot.pokemon.groudonprimal).toBeUndefined();
    expect(snapshot.locale).toBe('fr');
    expect(snapshot.pokemon.greattusk.localizedNames?.fr).toBe('Fort-Ivoire');
    expect(snapshot.pokemon.greattusk.image?.artwork).toContain('/official-artwork/984.png');
    expect(snapshot.moves.earthquake.localizedNames?.fr).toBe('Séisme');
    expect(snapshot.labels.items.rockyhelmet.fr).toBe('Casque Brut');
    expect(snapshot.itemDetails.rockyhelmet.description).toContain('touché par une capacité');
    expect(snapshot.itemDetails.rockyhelmet.image).toContain('/rocky-helmet.png');
    expect(snapshot.itemDetails.heavydutyboots.image).toContain('/items/gen8/heavy-duty-boots.png');
    expect(snapshot.itemDetails.boosterenergy.image).toContain('/items/gen9/booster-energy.png');
    expect(snapshot.itemDetails.loadeddice.imageFallbacks).toContain(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/loaded-dice.png',
    );
    expect(snapshot.labels.abilities.roughskin.fr).toBe('Peau Dure');
    expect(snapshot.abilityDetails.roughskin.localizedNames?.fr).toBe('Peau Dure');
    expect(snapshot.abilityDetails.roughskin.description).toMatch(/contact|direct/i);
    expect(snapshot.labels.natures.jolly.fr).toBe('Jovial');
    expect(snapshot.natureDetails.jolly.localizedNames?.fr).toBe('Jovial');
    expect(snapshot.natureDetails.jolly.description).toContain("augmente la Vitesse");
    expect(snapshot.natureDetails.jolly.description).toContain("baisse l'Attaque Spéciale");
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
