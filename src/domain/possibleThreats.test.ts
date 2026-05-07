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
        member('Garchomp', ['Earthquake']),
        member('Dragonite', ['Extreme Speed']),
        member('Kingambit', ['Sucker Punch']),
      ],
      store,
      format: 'champions-bss',
      limit: 3,
    });

    const palafin = threats.find((threat) => threat.species === 'Palafin');

    expect(palafin).toBeDefined();
    expect(palafin?.isMeta).toBe(false);
    expect(palafin?.coverageMoves).toContainEqual({
      move: 'Close Combat',
      targets: ['Kingambit'],
    });
    expect(palafin?.coverageMoves).toContainEqual({
      move: 'Ice Beam',
      targets: ['Garchomp', 'Dragonite'],
    });
    expect(palafin?.reasons.join(' ')).toContain('dépass');
  });

  it('suggests compact set archetypes from possible moves', () => {
    const threats = rankPossibleThreats({
      team: [member('Garchomp', ['Earthquake'])],
      store,
      format: 'champions-bss',
      limit: 5,
    });

    const clefable = threats.find((threat) => threat.species === 'Clefable');

    expect(clefable?.setArchetypes[0]).toEqual({
      name: 'Attaquant spécial',
      moves: ['Moonblast', 'Thunderbolt', 'Fire Blast', 'Ice Beam'],
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
            { rank: 1, species: 'Kingambit', usage: 31.4, commonMoves: ['Sucker Punch', 'Iron Head'] },
            { rank: 42, species: 'Clefable', usage: 0.8, commonMoves: ['Moonblast'] },
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

    expect(threats.map((threat) => threat.species)).toContain('Clefable');
    expect(threats.map((threat) => threat.species)).not.toContain('Kingambit');
  });
});
