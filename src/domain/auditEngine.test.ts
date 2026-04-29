import { describe, expect, it } from 'vitest';
import { demoDataBundle } from '../data/demoSnapshots';
import { createDataStore } from './dataStore';
import { auditTeam } from './auditEngine';
import type { TeamMember } from './types';

const store = createDataStore(demoDataBundle);

function member(species: string, moves: string[], evs = {}): TeamMember {
  return { slot: 1, species, moves, evs, parseWarnings: [] };
}

describe('auditTeam', () => {
  it('reports stacked weaknesses with evidence', () => {
    const result = auditTeam({
      team: [
        member('Garchomp', ['Earthquake']),
        member('Dragonite', ['Extreme Speed']),
        member('Great Tusk', ['Close Combat']),
      ],
      store,
      format: 'champions-ou',
    });

    expect(result.defensive[0].title).toContain('Ice');
    expect(result.defensive[0].evidence.join(' ')).toContain('Garchomp');
  });

  it('reports offensive coverage and missing roles', () => {
    const result = auditTeam({
      team: [
        member('Corviknight', ['Roost', 'Defog', 'U-turn']),
        member('Rotom-Wash', ['Thunderbolt', 'Hydro Pump', 'Will-O-Wisp']),
      ],
      store,
      format: 'champions-bss',
    });

    expect(result.offensive.some((finding) => finding.title.includes('Offensive coverage'))).toBe(true);
    expect(result.roles.detected.map((role) => role.role)).toContain('hazard removal');
    expect(result.roles.missing).toContain('speed control');
  });

  it('marks speed tiers as estimated when EVs are incomplete', () => {
    const result = auditTeam({
      team: [member('Kingambit', ['Sucker Punch'])],
      store,
      format: 'champions-vgc',
    });

    expect(result.speed[0].estimated).toBe(true);
  });
});
