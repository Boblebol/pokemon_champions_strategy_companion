import type { StatId, StatTable } from './types';

const STAT_IDS: StatId[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
const DEFAULT_IV = 31;

const NATURE_EFFECTS: Record<string, Partial<Record<StatId, number>>> = {
  Adamant: { atk: 1.1, spa: 0.9 },
  Bold: { def: 1.1, atk: 0.9 },
  Brave: { atk: 1.1, spe: 0.9 },
  Calm: { spd: 1.1, atk: 0.9 },
  Careful: { spd: 1.1, spa: 0.9 },
  Gentle: { spd: 1.1, def: 0.9 },
  Hasty: { spe: 1.1, def: 0.9 },
  Impish: { def: 1.1, spa: 0.9 },
  Jolly: { spe: 1.1, spa: 0.9 },
  Lax: { def: 1.1, spd: 0.9 },
  Lonely: { atk: 1.1, def: 0.9 },
  Mild: { spa: 1.1, def: 0.9 },
  Modest: { spa: 1.1, atk: 0.9 },
  Naive: { spe: 1.1, spd: 0.9 },
  Naughty: { atk: 1.1, spd: 0.9 },
  Quiet: { spa: 1.1, spe: 0.9 },
  Rash: { spa: 1.1, spd: 0.9 },
  Relaxed: { def: 1.1, spe: 0.9 },
  Sassy: { spd: 1.1, spe: 0.9 },
  Timid: { spe: 1.1, atk: 0.9 },
};

export interface BattleStatsInput {
  baseStats: Required<StatTable>;
  evs?: StatTable;
  ivs?: StatTable;
  nature?: string;
  level: number;
}

export interface SpeedBenchmark {
  label: string;
  speed: number;
}

function normalizedEffort(value: number | undefined): number {
  return Math.floor(Math.max(0, Math.min(252, value ?? 0)) / 4);
}

function normalizedIv(value: number | undefined): number {
  return Math.max(0, Math.min(31, value ?? DEFAULT_IV));
}

function natureModifier(nature: string | undefined, stat: StatId): number {
  return NATURE_EFFECTS[nature ?? '']?.[stat] ?? 1;
}

function calculateHp(base: number, ev: number, iv: number, level: number): number {
  return Math.floor(((2 * base + iv + ev) * level) / 100) + level + 10;
}

function calculateNonHpStat(base: number, ev: number, iv: number, level: number, modifier: number): number {
  const neutral = Math.floor(((2 * base + iv + ev) * level) / 100) + 5;
  return Math.floor(neutral * modifier);
}

export function calculateBattleStats({ baseStats, evs = {}, ivs = {}, nature, level }: BattleStatsInput) {
  return Object.fromEntries(
    STAT_IDS.map((stat) => {
      const ev = normalizedEffort(evs[stat]);
      const iv = normalizedIv(ivs[stat]);
      const value =
        stat === 'hp'
          ? calculateHp(baseStats.hp, ev, iv, level)
          : calculateNonHpStat(baseStats[stat], ev, iv, level, natureModifier(nature, stat));

      return [stat, value];
    }),
  ) as Required<StatTable>;
}

export function speedBenchmarks(baseSpeed: number): SpeedBenchmark[] {
  return [
    { label: 'Base', speed: baseSpeed },
    { label: '+1', speed: Math.floor(baseSpeed * 1.5) },
    { label: '+2', speed: baseSpeed * 2 },
    { label: 'Mouchoir Choix', speed: Math.floor(baseSpeed * 1.5) },
  ];
}
