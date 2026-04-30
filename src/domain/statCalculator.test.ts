import { describe, expect, it } from 'vitest';
import { calculateBattleStats, speedBenchmarks } from './statCalculator';

describe('statCalculator', () => {
  it('calculates exact level 100 stats with EVs, IVs and nature', () => {
    const stats = calculateBattleStats({
      baseStats: { hp: 108, atk: 130, def: 95, spa: 80, spd: 85, spe: 102 },
      evs: { atk: 252, spe: 252, spd: 4 },
      nature: 'Jolly',
      level: 100,
    });

    expect(stats.hp).toBe(357);
    expect(stats.atk).toBe(359);
    expect(stats.spa).toBe(176);
    expect(stats.spe).toBe(333);
  });

  it('builds useful speed benchmarks for level 100 battle prep', () => {
    expect(speedBenchmarks(333)).toEqual([
      { label: 'Base', speed: 333 },
      { label: '+1', speed: 499 },
      { label: '+2', speed: 666 },
      { label: 'Mouchoir Choix', speed: 499 },
    ]);
  });
});
