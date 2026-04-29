import { describe, expect, it } from 'vitest';
import { demoDataBundle } from '../data/demoSnapshots';
import { createDataStore } from './dataStore';
import { rankMetaThreats } from './metaThreats';
import type { TeamMember } from './types';

const store = createDataStore(demoDataBundle);

function member(species: string, moves: string[] = []): TeamMember {
  return { slot: 1, species, moves, evs: {}, parseWarnings: [] };
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
    expect(threats[0].reasons.join(' ')).toContain('super effectively');
  });
});
