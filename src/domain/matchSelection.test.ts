import { describe, expect, it } from 'vitest';
import { getPickSize, selectMembersForMatch, selectionWarnings } from './matchSelection';
import type { TeamMember } from './types';

function member(slot: number, species: string): TeamMember {
  return {
    slot,
    species,
    evs: {},
    moves: ['Earthquake'],
    parseWarnings: [],
  };
}

describe('matchSelection', () => {
  it('uses Champions pick sizes by format', () => {
    expect(getPickSize('champions-bss')).toBe(3);
    expect(getPickSize('champions-vgc')).toBe(4);
    expect(getPickSize('champions-ou')).toBe(6);
  });

  it('selects members by slot id while preserving selection order', () => {
    const roster = [
      member(1, 'Garchomp'),
      member(2, 'Dragonite'),
      member(3, 'Kingambit'),
      member(4, 'Rotom-Wash'),
    ];

    expect(selectMembersForMatch(roster, [3, 1], 'champions-bss').map((entry) => entry.species)).toEqual([
      'Kingambit',
      'Garchomp',
    ]);
  });

  it('caps over-selection at the format pick size', () => {
    const roster = [
      member(1, 'Garchomp'),
      member(2, 'Dragonite'),
      member(3, 'Kingambit'),
      member(4, 'Rotom-Wash'),
    ];

    expect(selectMembersForMatch(roster, [1, 2, 3, 4], 'champions-bss').map((entry) => entry.species)).toEqual([
      'Garchomp',
      'Dragonite',
      'Kingambit',
    ]);
  });

  it('warns when match selection is incomplete', () => {
    expect(selectionWarnings({ selectedCount: 2, pickSize: 3 })).toEqual([
      'Sélection incomplète : choisis 3 Pokémon pour ce format.',
    ]);
  });
});
