import { describe, expect, it } from 'vitest';
import { demoDataBundle } from '../data/demoSnapshots';
import { createDataStore } from './dataStore';
import { auditTeam } from './auditEngine';
import type { TeamMember } from './types';

const store = createDataStore(demoDataBundle);

function member(species: string, moves: string[], evs = {}, overrides: Partial<TeamMember> = {}): TeamMember {
  return { slot: 1, species, moves, evs, parseWarnings: [], ...overrides };
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

    expect(result.defensive[0].title).toContain('Glace');
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

    expect(result.offensive.some((finding) => finding.title.includes('Couverture offensive'))).toBe(true);
    expect(result.roles.detected.map((role) => role.role)).toContain('hazard removal');
    expect(result.roles.detected).toContainEqual({
      role: 'hazard removal',
      member: 'Corviknight',
      evidence: 'Defog',
    });
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

  it('exposes Champions VGC format context', () => {
    const result = auditTeam({
      team: [member('Kingambit', ['Sucker Punch'])],
      store,
      format: 'champions-vgc',
    });

    expect(result.format.label).toBe('Champions VGC');
    expect(result.format.defaultLevel).toBe(50);
  });

  it('exposes Champions OU format context', () => {
    const result = auditTeam({
      team: [member('Garchomp', ['Earthquake'])],
      store,
      format: 'champions-ou',
    });

    expect(result.format.label).toBe('Champions OU');
    expect(result.format.defaultLevel).toBe(100);
  });

  it('reports unknown Pokemon and unknown moves as data warnings', () => {
    const result = auditTeam({
      team: [
        member('Missingno', ['Earthquake']),
        member('Garchomp', ['Made Up Move']),
      ],
      store,
      format: 'champions-ou',
    });

    expect(result.dataWarnings).toContain('Pokémon inconnu : Missingno');
    expect(result.dataWarnings).toContain('Attaque inconnue pour Garchomp : Made Up Move');
  });

  it('marks speed tiers as estimated even with Speed EVs and nature', () => {
    const result = auditTeam({
      team: [member('Garchomp', ['Earthquake'], { spe: 252 }, { nature: 'Jolly' })],
      store,
      format: 'champions-vgc',
    });

    expect(result.speed[0].estimated).toBe(true);
    expect(result.speed[0].note).toContain('approximatif');
  });

  it('includes selected format context in speed notes while keeping speed estimated', () => {
    const result = auditTeam({
      team: [member('Garchomp', ['Earthquake'], { spe: 252 }, { nature: 'Jolly' })],
      store,
      format: 'champions-ou',
    });

    expect(result.speed[0].estimated).toBe(true);
    expect(result.speed[0].note).toContain('Champions OU');
    expect(result.speed[0].note).toContain('niveau par défaut 100');
  });
});
