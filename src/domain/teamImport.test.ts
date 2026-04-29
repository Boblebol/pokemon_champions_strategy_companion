import { describe, expect, it } from 'vitest';
import { parseShowdownTeam } from './teamImport';

describe('parseShowdownTeam', () => {
  it('parses species, item, ability, tera type, EVs, nature, and moves', () => {
    const result = parseShowdownTeam(`
Great Tusk @ Booster Energy
Ability: Protosynthesis
Level: 50
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
      level: 50,
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

  it('rejects metadata-only blocks and keeps following valid members', () => {
    const result = parseShowdownTeam(`
Ability: Levitate
- Thunderbolt

Rotom-Wash @ Leftovers
Ability: Levitate
- Hydro Pump
`);

    expect(result.members).toHaveLength(1);
    expect(result.members[0]).toMatchObject({
      slot: 1,
      species: 'Rotom-Wash',
    });
    expect(result.errors[0]).toContain('Block 1');
  });

  it('rejects IV metadata-only blocks and keeps following valid members', () => {
    const result = parseShowdownTeam(`
IVs: 0 Atk
- Thunderbolt

Rotom-Wash @ Leftovers
Ability: Levitate
- Hydro Pump
`);

    expect(result.members).toHaveLength(1);
    expect(result.members[0]).toMatchObject({
      slot: 1,
      species: 'Rotom-Wash',
    });
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

  it('ignores gender suffixes on bare species and nicknamed sets', () => {
    const result = parseShowdownTeam(`
Ogerpon-Wellspring (F) @ Wellspring Mask
- Ivy Cudgel

Buddy (Kingambit) (M) @ Black Glasses
- Kowtow Cleave
`);

    expect(result.errors).toEqual([]);
    expect(result.members[0]).toMatchObject({
      slot: 1,
      species: 'Ogerpon-Wellspring',
      item: 'Wellspring Mask',
    });
    expect(result.members[0].nickname).toBeUndefined();
    expect(result.members[1]).toMatchObject({
      slot: 2,
      nickname: 'Buddy',
      species: 'Kingambit',
      item: 'Black Glasses',
    });
  });

  it('warns on malformed levels without setting level', () => {
    const result = parseShowdownTeam(`
Rotom-Wash @ Leftovers
Level: nope
- Hydro Pump
`);

    expect(result.members[0].level).toBeUndefined();
    expect(result.members[0].parseWarnings).toEqual([expect.stringContaining('Invalid Level')]);
  });
});
