import { describe, expect, it } from 'vitest';
import { parseShowdownTeam } from './teamImport';

describe('parseShowdownTeam', () => {
  it('parses species, item, ability, tera type, EVs, nature, and moves', () => {
    const result = parseShowdownTeam(`
Great Tusk @ Booster Energy
Ability: Protosynthesis
Tera Type: Ground
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Earthquake
- Close Combat
- Stealth Rock
- Ice Beam
`);

    expect(result.errors).toEqual([]);
    expect(result.members).toHaveLength(1);
    expect(result.members[0]).toMatchObject({
      slot: 1,
      species: 'Great Tusk',
      item: 'Booster Energy',
      ability: 'Protosynthesis',
      teraType: 'Ground',
      nature: 'Jolly',
      evs: { atk: 252, spd: 4, spe: 252 },
      moves: ['Earthquake', 'Close Combat', 'Stealth Rock', 'Ice Beam'],
    });
  });

  it('keeps valid members and reports malformed blocks', () => {
    const result = parseShowdownTeam(`
Not a real block without moves

Rotom-Wash @ Leftovers
Ability: Levitate
- Thunderbolt
- Hydro Pump
`);

    expect(result.members).toHaveLength(1);
    expect(result.members[0].species).toBe('Rotom-Wash');
    expect(result.errors[0]).toContain('Block 1');
  });

  it('supports nicknames with explicit species', () => {
    const result = parseShowdownTeam(`
Washer (Rotom-Wash) @ Leftovers
Ability: Levitate
- Thunderbolt
`);

    expect(result.members[0].nickname).toBe('Washer');
    expect(result.members[0].species).toBe('Rotom-Wash');
  });
});
