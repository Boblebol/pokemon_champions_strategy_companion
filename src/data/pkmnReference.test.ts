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
  });
});
