import { describe, expect, it } from 'vitest';
import { demoDataBundle } from '../data/demoSnapshots';
import {
  assignThreatToCombatSlots,
  normalizeCombatSlots,
  rankOpponentTeamThreats,
} from './opponentTeam';
import type { TeamMember } from './types';

function member(species: string, overrides: Partial<TeamMember> = {}): TeamMember {
  return { slot: 1, species, moves: [], evs: {}, parseWarnings: [], ...overrides };
}

describe('opponentTeam', () => {
  it('normalizes Combat slots to one opponent in singles and two in doubles', () => {
    expect(
      normalizeCombatSlots('champions-bss', [
        { id: 'custom-a', species: 'Kangaskhan' },
        { id: 'custom-b', species: 'Kingambit' },
      ]),
    ).toEqual([{ id: 'opp-1', species: 'Kangaskhan' }]);

    expect(normalizeCombatSlots('champions-vgc', [{ id: 'custom-a', species: 'Kangaskhan' }])).toEqual([
      { id: 'opp-1', species: 'Kangaskhan' },
      { id: 'opp-2' },
    ]);
  });

  it('fills the first empty Combat slot and toggles an already selected threat', () => {
    const firstPick = assignThreatToCombatSlots('champions-vgc', [], 'Kangaskhan');
    const secondPick = assignThreatToCombatSlots('champions-vgc', firstPick, 'Kingambit');

    expect(firstPick).toEqual([{ id: 'opp-1', species: 'Kangaskhan' }, { id: 'opp-2' }]);
    expect(secondPick).toEqual([
      { id: 'opp-1', species: 'Kangaskhan' },
      { id: 'opp-2', species: 'Kingambit' },
    ]);
    expect(assignThreatToCombatSlots('champions-vgc', secondPick, 'Kangaskhan')).toEqual([
      { id: 'opp-1' },
      { id: 'opp-2', species: 'Kingambit' },
    ]);
  });

  it('ranks unique opponent team threats from real local coverage and speed data', () => {
    const threats = rankOpponentTeamThreats({
      opponentTeam: ['Palafin', 'Kangaskhan', 'Palafin'],
      selectedTeam: [
        member('Garchomp', { slot: 1, evs: { spe: 252 }, nature: 'Jolly' }),
        member('Dragonite', { slot: 2 }),
        member('Kingambit', { slot: 3 }),
      ],
      reference: demoDataBundle.reference,
      format: 'champions-bss',
    });

    expect(threats.map((threat) => threat.species).sort()).toEqual(['Kangaskhan', 'Palafin']);
    expect(threats[0]?.score ?? 0).toBeGreaterThanOrEqual(threats[1]?.score ?? 0);

    const palafin = threats.find((threat) => threat.species === 'Palafin');

    expect(palafin).toMatchObject({
      species: 'Palafin',
      coveredTargetCount: 3,
      severity: 'high',
    });
    expect(palafin?.coverageMoves).toContainEqual({
      move: 'Ice Beam',
      targets: ['Garchomp', 'Dragonite'],
    });
    expect(palafin?.coverageMoves).toContainEqual({
      move: 'Close Combat',
      targets: ['Kingambit'],
    });
  });
});
