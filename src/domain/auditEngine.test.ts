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

  it('calculates exact level 100 speed tiers for Champions 3v3', () => {
    const result = auditTeam({
      team: [member('Garchomp', ['Earthquake'], { spe: 252 }, { nature: 'Jolly' })],
      store,
      format: 'champions-bss',
    });

    expect(result.format.label).toBe('Champions 3v3');
    expect(result.format.defaultLevel).toBe(100);
    expect(result.speed[0]).toMatchObject({
      species: 'Garchomp',
      speed: 333,
      estimated: false,
    });
    expect(result.speed[0].benchmarks).toContainEqual({ label: '+1', speed: 499 });
  });

  it('exposes Champions VGC format context', () => {
    const result = auditTeam({
      team: [member('Kingambit', ['Sucker Punch'])],
      store,
      format: 'champions-vgc',
    });

    expect(result.format.label).toBe('Champions VGC 4v4 Duo');
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

  it('keeps exact speed tiers when Speed EVs and nature are present', () => {
    const result = auditTeam({
      team: [member('Garchomp', ['Earthquake'], { spe: 252 }, { nature: 'Jolly' })],
      store,
      format: 'champions-ou',
    });

    expect(result.speed[0].estimated).toBe(false);
    expect(result.speed[0].note).toContain('exact');
  });

  it('includes selected format context in exact speed notes', () => {
    const result = auditTeam({
      team: [member('Garchomp', ['Earthquake'], { spe: 252 }, { nature: 'Jolly' })],
      store,
      format: 'champions-ou',
    });

    expect(result.speed[0].estimated).toBe(false);
    expect(result.speed[0].note).toContain('Champions OU');
    expect(result.speed[0].note).toContain('niveau par défaut 100');
  });
});
