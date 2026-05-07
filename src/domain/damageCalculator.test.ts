import { describe, expect, it } from 'vitest';
import { demoDataBundle } from '../data/demoSnapshots';
import { calculateCombatScenario, createDefaultCombatState, searchCombatPokemon } from './damageCalculator';
import type { TeamMember } from './types';

const dragonite: TeamMember = {
  slot: 1,
  species: 'Dragonite',
  item: 'Heavy-Duty Boots',
  ability: 'Multiscale',
  nature: 'Jolly',
  teraType: 'Ground',
  evs: { atk: 252, spe: 252 },
  moves: ['Earthquake', 'Extreme Speed', 'Fire Blast', 'Ice Beam'],
  parseWarnings: [],
};

describe('damageCalculator', () => {
  it('creates one active slot in singles and two in VGC', () => {
    const kingambit: TeamMember = { ...dragonite, slot: 2, species: 'Kingambit' };

    expect(createDefaultCombatState('champions-bss', [dragonite, kingambit]).friendlyActiveSlots).toEqual([1]);
    expect(createDefaultCombatState('champions-vgc', [dragonite, kingambit]).friendlyActiveSlots).toEqual([1, 2]);
  });

  it('searches Pokemon by localized and English names', () => {
    const results = searchCombatPokemon(demoDataBundle.reference, 'kang');
    expect(results[0]?.name).toBe('Kangaskhan');
    expect(searchCombatPokemon(demoDataBundle.reference, 'Kangourex')[0]?.name).toBe('Kangaskhan');
  });

  it('calculates friendly damage and opposing top damage', () => {
    const state = createDefaultCombatState('champions-bss', [dragonite]);
    const result = calculateCombatScenario({
      format: 'champions-bss',
      reference: demoDataBundle.reference,
      friendlyTeam: [dragonite],
      state: {
        ...state,
        opponents: [{ id: 'opp-1', species: 'Kingambit', ability: 'Defiant', item: 'Black Glasses', nature: 'Adamant' }],
      },
    });

    expect(result.matchups[0]?.friendlyDamage.some((row) => row.move === 'Earthquake' && row.maxPercent > 50)).toBe(
      true,
    );
    expect(result.matchups[0]?.opponentDamage[0]?.maxPercent).toBeGreaterThan(0);
  });

  it('keeps variable-power damaging moves in set and learnset scans', () => {
    const state = createDefaultCombatState('champions-bss', [dragonite]);
    const result = calculateCombatScenario({
      format: 'champions-bss',
      reference: demoDataBundle.reference,
      friendlyTeam: [{ ...dragonite, moves: ['Low Kick'] }],
      state: {
        ...state,
        opponents: [{ id: 'opp-1', species: 'Kingambit' }],
      },
    });

    const lowKick = result.matchups[0]?.friendlyDamage.find((row) => row.move === 'Low Kick');
    expect(lowKick?.maxDamage ?? 0).toBeGreaterThan(0);
  });

  it('applies side protections only to the protected side', () => {
    const state = createDefaultCombatState('champions-bss', [dragonite]);
    const baseState = {
      ...state,
      opponents: [{ id: 'opp-1', species: 'Kingambit' }],
    };
    const noScreens = calculateCombatScenario({
      format: 'champions-bss',
      reference: demoDataBundle.reference,
      friendlyTeam: [dragonite],
      state: baseState,
    });
    const opponentReflect = calculateCombatScenario({
      format: 'champions-bss',
      reference: demoDataBundle.reference,
      friendlyTeam: [dragonite],
      state: {
        ...baseState,
        opponentSide: { ...state.opponentSide, reflect: true },
      },
    });
    const friendlyReflect = calculateCombatScenario({
      format: 'champions-bss',
      reference: demoDataBundle.reference,
      friendlyTeam: [dragonite],
      state: {
        ...baseState,
        friendlySide: { ...state.friendlySide, reflect: true },
      },
    });

    const baseEarthquake = noScreens.matchups[0]?.friendlyDamage.find((row) => row.move === 'Earthquake');
    const opponentProtectedEarthquake = opponentReflect.matchups[0]?.friendlyDamage.find(
      (row) => row.move === 'Earthquake',
    );
    const friendlyProtectedEarthquake = friendlyReflect.matchups[0]?.friendlyDamage.find(
      (row) => row.move === 'Earthquake',
    );
    const baseIncoming = noScreens.matchups[0]?.opponentDamage[0];
    const protectedIncoming = friendlyReflect.matchups[0]?.opponentDamage[0];

    expect(opponentProtectedEarthquake?.maxDamage ?? 0).toBeLessThan(baseEarthquake?.maxDamage ?? 0);
    expect(friendlyProtectedEarthquake?.maxDamage).toBe(baseEarthquake?.maxDamage);
    expect(protectedIncoming?.maxDamage ?? 0).toBeLessThan(baseIncoming?.maxDamage ?? 0);
  });

  it('keeps immunities readable and respects explicit friendly levels', () => {
    const state = createDefaultCombatState('champions-bss', [dragonite]);
    const level100 = calculateCombatScenario({
      format: 'champions-bss',
      reference: demoDataBundle.reference,
      friendlyTeam: [{ ...dragonite, level: 100 }],
      state: {
        ...state,
        opponents: [{ id: 'opp-1', species: 'Dragonite' }],
      },
    });
    const level50 = calculateCombatScenario({
      format: 'champions-bss',
      reference: demoDataBundle.reference,
      friendlyTeam: [{ ...dragonite, level: 50 }],
      state: {
        ...state,
        opponents: [{ id: 'opp-1', species: 'Dragonite' }],
      },
    });

    const immuneEarthquake = level100.matchups[0]?.friendlyDamage.find((row) => row.move === 'Earthquake');
    const level100ExtremeSpeed = level100.matchups[0]?.friendlyDamage.find((row) => row.move === 'Extreme Speed');
    const level50ExtremeSpeed = level50.matchups[0]?.friendlyDamage.find((row) => row.move === 'Extreme Speed');

    expect(immuneEarthquake).toMatchObject({ maxDamage: 0, koChanceLabel: 'Aucun dégât' });
    expect(level50ExtremeSpeed?.maxDamage ?? 0).toBeLessThan(level100ExtremeSpeed?.maxDamage ?? 0);
  });

  it('applies boosts and Tera toggles to damage output', () => {
    const base = createDefaultCombatState('champions-bss', [dragonite]);
    const normal = calculateCombatScenario({
      format: 'champions-bss',
      reference: demoDataBundle.reference,
      friendlyTeam: [dragonite],
      state: {
        ...base,
        opponents: [{ id: 'opp-1', species: 'Kingambit' }],
      },
    });
    const boosted = calculateCombatScenario({
      format: 'champions-bss',
      reference: demoDataBundle.reference,
      friendlyTeam: [dragonite],
      state: {
        ...base,
        friendly: { 1: { boosts: { atk: 2 }, teraActive: true } },
        opponents: [{ id: 'opp-1', species: 'Kingambit' }],
      },
    });

    const normalEarthquake = normal.matchups[0]?.friendlyDamage.find((row) => row.move === 'Earthquake');
    const boostedEarthquake = boosted.matchups[0]?.friendlyDamage.find((row) => row.move === 'Earthquake');
    expect(boostedEarthquake?.maxPercent ?? 0).toBeGreaterThan(normalEarthquake?.maxPercent ?? 0);
  });
});
