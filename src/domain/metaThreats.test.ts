import { describe, expect, it } from 'vitest';
import { demoDataBundle } from '../data/demoSnapshots';
import { createDataStore } from './dataStore';
import { rankMetaThreats } from './metaThreats';
import type { DataBundle, TeamMember, UsageEntry } from './types';

const store = createDataStore(demoDataBundle);

function member(species: string, moves: string[] = []): TeamMember {
  return { slot: 1, species, moves, evs: {}, parseWarnings: [] };
}

function storeWithOuEntries(entries: UsageEntry[]) {
  const bundle: DataBundle = {
    ...demoDataBundle,
    meta: {
      ...demoDataBundle.meta,
      'champions-ou': {
        ...demoDataBundle.meta['champions-ou'],
        entries,
      },
    },
  };

  return createDataStore(bundle);
}

describe('rankMetaThreats', () => {
  it('uses the selected format snapshot only', () => {
    const threats = rankMetaThreats({
      team: [member('Corviknight')],
      store,
      format: 'champions-bss',
      limit: 2,
    });

    expect(threats.map((threat) => threat.species)).toEqual(['Dragonite', 'Kingambit']);
  });

  it('explains why a high-usage attacker is dangerous', () => {
    const threats = rankMetaThreats({
      team: [member('Garchomp'), member('Dragonite'), member('Great Tusk')],
      store,
      format: 'champions-vgc',
      limit: 1,
    });

    expect(threats[0].species).toBe('Flutter Mane');
    expect(threats[0].reasons.join(' ')).toContain('usage');
    expect(threats[0].reasons.join(' ')).toContain('super efficacement');
  });

  it('ignores status moves when scoring common attack coverage', () => {
    const threats = rankMetaThreats({
      team: [member('Garchomp')],
      store,
      format: 'champions-bss',
    });

    const dragonite = threats.find((threat) => threat.species === 'Dragonite');

    expect(dragonite?.score).toBeCloseTo(31.4);
    expect(dragonite?.reasons).toContain(
      '0 membre(s) de ton équipe touchés super efficacement par ses attaques connues',
    );
  });

  it('skips unknown common moves when checking resisted known attacks', () => {
    const customStore = storeWithOuEntries([
      {
        rank: 1,
        species: 'Known Plus Unknown',
        usage: 30,
        commonMoves: ['Iron Head', 'Missing Coverage'],
      },
    ]);

    const threats = rankMetaThreats({
      team: [member('Rotom-Wash')],
      store: customStore,
      format: 'champions-ou',
    });

    expect(threats[0]).toMatchObject({
      species: 'Known Plus Unknown',
      score: 25,
    });
    expect(threats[0].reasons).toContain('1 membre(s) de ton équipe encaissent bien ses attaques connues');
  });

  it('orders equal scores by usage, rank, then species', () => {
    const customStore = storeWithOuEntries([
      {
        rank: 0,
        species: 'Boosted Low Usage',
        usage: 20,
        commonMoves: ['Ice Beam'],
      },
      {
        rank: 2,
        species: 'Middle',
        usage: 32,
        commonMoves: ['Extreme Speed'],
      },
      {
        rank: 1,
        species: 'Zeta',
        usage: 32,
        commonMoves: ['Extreme Speed'],
      },
      {
        rank: 1,
        species: 'Alpha',
        usage: 32,
        commonMoves: ['Extreme Speed'],
      },
    ]);

    const threats = rankMetaThreats({
      team: [member('Garchomp')],
      store: customStore,
      format: 'champions-ou',
    });

    expect(threats.map((threat) => threat.species)).toEqual(['Alpha', 'Zeta', 'Middle', 'Boosted Low Usage']);
    expect(threats.map((threat) => threat.score)).toEqual([32, 32, 32, 32]);
  });
});
