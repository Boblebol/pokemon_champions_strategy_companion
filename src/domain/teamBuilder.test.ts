import { describe, expect, it } from 'vitest';
import {
  builderStateFromMembers,
  builderStateToMembers,
  builderStateToShowdownPaste,
  createEmptyBuilderState,
  updateBuilderSlot,
} from './teamBuilder';
import type { TeamMember } from './types';

function member(overrides: Partial<TeamMember>): TeamMember {
  return {
    slot: 1,
    species: 'Great Tusk',
    evs: {},
    moves: [],
    parseWarnings: [],
    ...overrides,
  };
}

describe('teamBuilder', () => {
  it('creates six empty roster slots by default', () => {
    const state = createEmptyBuilderState();

    expect(state.slots).toHaveLength(6);
    expect(state.slots[0]).toMatchObject({
      id: 1,
      evs: {},
      moves: ['', '', '', ''],
      comment: '',
    });
  });

  it('updates one slot without mutating the previous state', () => {
    const initial = createEmptyBuilderState();
    const updated = updateBuilderSlot(initial, 2, {
      species: 'Garchomp',
      item: 'Rocky Helmet',
      ability: 'Rough Skin',
      nature: 'Jolly',
      evs: { atk: 252, spe: 252 },
      moves: ['Earthquake', 'Stealth Rock', '', ''],
      comment: 'Lead solide contre les équipes physiques.',
    });

    expect(initial.slots[1].species).toBeUndefined();
    expect(updated.slots[1]).toMatchObject({
      id: 2,
      species: 'Garchomp',
      item: 'Rocky Helmet',
      ability: 'Rough Skin',
      nature: 'Jolly',
      evs: { atk: 252, spe: 252 },
      moves: ['Earthquake', 'Stealth Rock', '', ''],
      comment: 'Lead solide contre les équipes physiques.',
    });
  });

  it('converts complete builder slots into TeamMember records', () => {
    const state = updateBuilderSlot(createEmptyBuilderState(), 1, {
      species: 'Rotom-Wash',
      item: 'Leftovers',
      ability: 'Levitate',
      evs: { hp: 252, def: 116 },
      moves: ['Thunderbolt', '', 'Hydro Pump', 'Will-O-Wisp'],
      comment: 'Check Eau/Vol.',
    });

    expect(builderStateToMembers(state)).toEqual([
      {
        slot: 1,
        species: 'Rotom-Wash',
        item: 'Leftovers',
        ability: 'Levitate',
        evs: { hp: 252, def: 116 },
        moves: ['Thunderbolt', 'Hydro Pump', 'Will-O-Wisp'],
        parseWarnings: [],
      },
    ]);
  });

  it('exports Showdown text without internal comments', () => {
    const state = updateBuilderSlot(createEmptyBuilderState(), 1, {
      species: 'Kingambit',
      item: 'Black Glasses',
      ability: 'Supreme Overlord',
      nature: 'Adamant',
      evs: { hp: 252, atk: 252, spe: 4 },
      moves: ['Sucker Punch', 'Iron Head', 'Swords Dance', ''],
      comment: 'Win condition de fin de partie.',
    });

    expect(builderStateToShowdownPaste(state)).toBe(
      [
        'Kingambit @ Black Glasses',
        'Ability: Supreme Overlord',
        'EVs: 252 HP / 252 Atk / 4 Spe',
        'Adamant Nature',
        '- Sucker Punch',
        '- Iron Head',
        '- Swords Dance',
      ].join('\n'),
    );
  });

  it('can initialize builder slots from parsed team members', () => {
    const state = builderStateFromMembers([
      member({
        slot: 1,
        species: 'Dragonite',
        item: 'Heavy-Duty Boots',
        ability: 'Multiscale',
        nature: 'Adamant',
        evs: { atk: 252, spe: 252 },
        moves: ['Dragon Dance', 'Extreme Speed'],
      }),
    ]);

    expect(state.slots[0]).toMatchObject({
      species: 'Dragonite',
      item: 'Heavy-Duty Boots',
      ability: 'Multiscale',
      nature: 'Adamant',
      evs: { atk: 252, spe: 252 },
      moves: ['Dragon Dance', 'Extreme Speed', '', ''],
    });
    expect(state.slots).toHaveLength(6);
  });
});
