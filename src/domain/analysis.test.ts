import { describe, expect, it } from 'vitest';
import { analyzeTeam } from './analysis';
import { createDataStore } from './dataStore';
import { demoDataBundle } from '../data/demoSnapshots';

describe('analyzeTeam', () => {
  it('returns audit, threats, parse errors, and snapshot metadata', () => {
    const result = analyzeTeam({
      paste: `
Garchomp @ Rocky Helmet
Ability: Rough Skin
- Earthquake
- Stealth Rock

Dragonite @ Heavy-Duty Boots
Ability: Multiscale
- Dragon Dance
- Extreme Speed
`,
      format: 'champions-ou',
      store: createDataStore(demoDataBundle),
    });

    expect(result.team.members).toHaveLength(2);
    expect(result.audit.defensive.length).toBeGreaterThan(0);
    expect(result.threats.length).toBeGreaterThan(0);
    expect(result.snapshotStatus.label).toContain('Demo');
  });
});
