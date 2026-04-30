import { describe, expect, it } from 'vitest';
import { demoDataBundle } from '../data/demoSnapshots';
import { calculateCombatScenario, createDefaultCombatState, searchCombatPokemon } from './damageCalculator';
import type { TeamMember } from './types';

const tusk: TeamMember = {
  slot: 1,
  species: 'Great Tusk',
  item: 'Booster Energy',
  ability: 'Protosynthesis',
  nature: 'Jolly',
  teraType: 'Ground',
  evs: { atk: 252, spe: 252 },
  moves: ['Earthquake', 'Close Combat', 'Ice Beam', 'Rapid Spin'],
  parseWarnings: [],
};

describe('damageCalculator', () => {
  it('creates one active slot in singles and two in VGC', () => {
    const flutter: TeamMember = { ...tusk, slot: 2, species: 'Flutter Mane' };

    expect(createDefaultCombatState('champions-bss', [tusk, flutter]).friendlyActiveSlots).toEqual([1]);
    expect(createDefaultCombatState('champions-vgc', [tusk, flutter]).friendlyActiveSlots).toEqual([1, 2]);
  });

  it('searches Pokemon by localized and English names', () => {
    const results = searchCombatPokemon(demoDataBundle.reference, 'fort');
    expect(results[0]?.name).toBe('Great Tusk');
    expect(searchCombatPokemon(demoDataBundle.reference, 'Fort Ivoire')[0]?.name).toBe('Great Tusk');
  });

  it('calculates friendly damage and opposing top damage', () => {
    const state = createDefaultCombatState('champions-bss', [tusk]);
    const result = calculateCombatScenario({
      format: 'champions-bss',
      reference: demoDataBundle.reference,
      friendlyTeam: [tusk],
      state: {
        ...state,
        opponents: [{ id: 'opp-1', species: 'Kingambit', ability: 'Defiant', item: 'Black Glasses', nature: 'Adamant' }],
      },
    });

    expect(result.matchups[0]?.friendlyDamage.some((row) => row.move === 'Close Combat' && row.maxPercent > 50)).toBe(
      true,
    );
    expect(result.matchups[0]?.opponentDamage[0]?.maxPercent).toBeGreaterThan(0);
  });

  it('keeps variable-power damaging moves in set and learnset scans', () => {
    const state = createDefaultCombatState('champions-bss', [tusk]);
    const result = calculateCombatScenario({
      format: 'champions-bss',
      reference: demoDataBundle.reference,
      friendlyTeam: [{ ...tusk, moves: ['Low Kick'] }],
      state: {
        ...state,
        opponents: [{ id: 'opp-1', species: 'Kingambit' }],
      },
    });

    const lowKick = result.matchups[0]?.friendlyDamage.find((row) => row.move === 'Low Kick');
    expect(lowKick?.maxDamage ?? 0).toBeGreaterThan(0);
  });

  it('applies side protections only to the protected side', () => {
    const state = createDefaultCombatState('champions-bss', [tusk]);
    const baseState = {
      ...state,
      opponents: [{ id: 'opp-1', species: 'Kingambit' }],
    };
    const noScreens = calculateCombatScenario({
      format: 'champions-bss',
      reference: demoDataBundle.reference,
      friendlyTeam: [tusk],
      state: baseState,
    });
    const opponentReflect = calculateCombatScenario({
      format: 'champions-bss',
      reference: demoDataBundle.reference,
      friendlyTeam: [tusk],
      state: {
        ...baseState,
        opponentSide: { ...state.opponentSide, reflect: true },
      },
    });
    const friendlyReflect = calculateCombatScenario({
      format: 'champions-bss',
      reference: demoDataBundle.reference,
      friendlyTeam: [tusk],
      state: {
        ...baseState,
        friendlySide: { ...state.friendlySide, reflect: true },
      },
    });

    const baseCloseCombat = noScreens.matchups[0]?.friendlyDamage.find((row) => row.move === 'Close Combat');
    const opponentProtectedCloseCombat = opponentReflect.matchups[0]?.friendlyDamage.find(
      (row) => row.move === 'Close Combat',
    );
    const friendlyProtectedCloseCombat = friendlyReflect.matchups[0]?.friendlyDamage.find(
      (row) => row.move === 'Close Combat',
    );
    const baseIncoming = noScreens.matchups[0]?.opponentDamage[0];
    const protectedIncoming = friendlyReflect.matchups[0]?.opponentDamage[0];

    expect(opponentProtectedCloseCombat?.maxDamage ?? 0).toBeLessThan(baseCloseCombat?.maxDamage ?? 0);
    expect(friendlyProtectedCloseCombat?.maxDamage).toBe(baseCloseCombat?.maxDamage);
    expect(protectedIncoming?.maxDamage ?? 0).toBeLessThan(baseIncoming?.maxDamage ?? 0);
  });

  it('keeps immunities readable and respects explicit friendly levels', () => {
    const state = createDefaultCombatState('champions-bss', [tusk]);
    const level100 = calculateCombatScenario({
      format: 'champions-bss',
      reference: demoDataBundle.reference,
      friendlyTeam: [tusk],
      state: {
        ...state,
        opponents: [{ id: 'opp-1', species: 'Dragonite' }],
      },
    });
    const level50 = calculateCombatScenario({
      format: 'champions-bss',
      reference: demoDataBundle.reference,
      friendlyTeam: [{ ...tusk, level: 50 }],
      state: {
        ...state,
        opponents: [{ id: 'opp-1', species: 'Dragonite' }],
      },
    });

    const immuneEarthquake = level100.matchups[0]?.friendlyDamage.find((row) => row.move === 'Earthquake');
    const level100CloseCombat = level100.matchups[0]?.friendlyDamage.find((row) => row.move === 'Close Combat');
    const level50CloseCombat = level50.matchups[0]?.friendlyDamage.find((row) => row.move === 'Close Combat');

    expect(immuneEarthquake).toMatchObject({ maxDamage: 0, koChanceLabel: 'Aucun dégât' });
    expect(level50CloseCombat?.maxDamage ?? 0).toBeLessThan(level100CloseCombat?.maxDamage ?? 0);
  });

  it('applies boosts and Tera toggles to damage output', () => {
    const base = createDefaultCombatState('champions-bss', [tusk]);
    const normal = calculateCombatScenario({
      format: 'champions-bss',
      reference: demoDataBundle.reference,
      friendlyTeam: [tusk],
      state: {
        ...base,
        opponents: [{ id: 'opp-1', species: 'Kingambit' }],
      },
    });
    const boosted = calculateCombatScenario({
      format: 'champions-bss',
      reference: demoDataBundle.reference,
      friendlyTeam: [tusk],
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
