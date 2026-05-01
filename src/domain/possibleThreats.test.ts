import { describe, expect, it } from 'vitest';
import { demoDataBundle } from '../data/demoSnapshots';
import { createDataStore } from './dataStore';
import { rankPossibleThreats } from './possibleThreats';
import type { DataBundle, TeamMember } from './types';

const store = createDataStore(demoDataBundle);

function member(species: string, moves: string[] = [], overrides: Partial<TeamMember> = {}): TeamMember {
  return { slot: 1, species, moves, evs: {}, parseWarnings: [], ...overrides };
}

describe('rankPossibleThreats', () => {
  it('finds non-meta Pokemon with legal coverage into the selected team', () => {
    const threats = rankPossibleThreats({
      team: [
        member('Garchomp', ['Earthquake'], { evs: { spe: 252 }, nature: 'Jolly' }),
        member('Dragonite', ['Extreme Speed']),
        member('Great Tusk', ['Close Combat'], { evs: { spe: 252 }, nature: 'Jolly' }),
      ],
      store,
      format: 'champions-bss',
      limit: 3,
    });

    const flutterMane = threats.find((threat) => threat.species === 'Flutter Mane');

    expect(flutterMane).toBeDefined();
    expect(flutterMane?.isMeta).toBe(false);
    expect(flutterMane?.coverageMoves).toContainEqual({
      move: 'Moonblast',
      targets: ['Garchomp', 'Dragonite', 'Great Tusk'],
    });
    expect(flutterMane?.reasons.join(' ')).toContain('dépass');
  });

  it('suggests compact set archetypes from possible moves', () => {
    const threats = rankPossibleThreats({
      team: [member('Garchomp', ['Earthquake'])],
      store,
      format: 'champions-bss',
      limit: 5,
    });

    const flutterMane = threats.find((threat) => threat.species === 'Flutter Mane');

    expect(flutterMane?.setArchetypes[0]).toEqual({
      name: 'Attaquant spécial',
      moves: ['Moonblast', 'Shadow Ball', 'Thunderbolt'],
    });
  });

  it('keeps low-usage snapshot entries as non-meta possible threats', () => {
    const bundle: DataBundle = {
      ...demoDataBundle,
      meta: {
        ...demoDataBundle.meta,
        'champions-bss': {
          ...demoDataBundle.meta['champions-bss'],
          entries: [
            { rank: 1, species: 'Gholdengo', usage: 31.4, commonMoves: ['Make It Rain', 'Shadow Ball'] },
            { rank: 42, species: 'Flutter Mane', usage: 0.8, commonMoves: ['Moonblast'] },
          ],
        },
      },
    };

    const threats = rankPossibleThreats({
      team: [member('Garchomp', ['Earthquake'])],
      store: createDataStore(bundle),
      format: 'champions-bss',
      limit: 10,
    });

    expect(threats.map((threat) => threat.species)).toContain('Flutter Mane');
    expect(threats.map((threat) => threat.species)).not.toContain('Gholdengo');
  });
});
