import { describe, expect, it } from 'vitest';
import { getDefensiveMultiplier, getWeaknessSummary } from './typeEffectiveness';

describe('typeEffectiveness', () => {
  it('calculates immunities and double weaknesses', () => {
    expect(getDefensiveMultiplier('Electric', ['Ground'])).toBe(0);
    expect(getDefensiveMultiplier('Ice', ['Dragon', 'Flying'])).toBe(4);
    expect(getDefensiveMultiplier('Fire', ['Steel', 'Flying'])).toBe(2);
  });

  it('summarizes stacked team weaknesses', () => {
    const summary = getWeaknessSummary([
      { name: 'Garchomp', types: ['Dragon', 'Ground'] },
      { name: 'Dragonite', types: ['Dragon', 'Flying'] },
      { name: 'Great Tusk', types: ['Ground', 'Fighting'] },
    ]);

    expect(summary.find((entry) => entry.type === 'Ice')?.weakCount).toBe(3);
    expect(summary.find((entry) => entry.type === 'Ice')?.quadWeak).toEqual(['Garchomp', 'Dragonite']);
  });
});
