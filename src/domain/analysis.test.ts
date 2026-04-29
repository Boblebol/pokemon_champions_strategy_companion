import { describe, expect, it } from 'vitest';
import { analyzeTeam } from './analysis';
import type { AnalysisResult, SnapshotStatus } from './analysis';
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
    expect(result.snapshotStatus.label).toContain('demo');
  });

  it('returns fallback snapshot metadata when the selected format has no usage snapshot', () => {
    const meta = { ...demoDataBundle.meta };
    delete (meta as Partial<typeof demoDataBundle.meta>)['champions-ou'];
    const missingSnapshotStatus: SnapshotStatus = {
      label: "Aucun snapshot d'usage pour ce format",
      source: 'aucune',
      date: 'inconnue',
      isDemo: false,
    };

    const result: AnalysisResult = analyzeTeam({
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
      store: createDataStore({ ...demoDataBundle, meta }),
    });

    expect(result.audit.defensive.length).toBeGreaterThan(0);
    expect(result.threats).toEqual([]);
    expect(result.snapshotStatus).toEqual(missingSnapshotStatus);
  });
});
