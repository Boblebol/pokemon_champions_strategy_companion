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

  it('analyzes selected match members separately from the six-slot roster', () => {
    const result = analyzeTeam({
      paste: `
Garchomp @ Rocky Helmet
Ability: Rough Skin
- Earthquake

Dragonite @ Heavy-Duty Boots
Ability: Multiscale
- Dragon Dance
- Extreme Speed

Kingambit @ Black Glasses
Ability: Supreme Overlord
- Sucker Punch
- Iron Head

Rotom-Wash @ Leftovers
Ability: Levitate
- Thunderbolt
- Hydro Pump
`,
      format: 'champions-bss',
      store: createDataStore(demoDataBundle),
      selectedSlots: [2, 3, 4],
    });

    expect(result.team.members).toHaveLength(4);
    expect(result.selectedTeam.members.map((member) => member.species)).toEqual([
      'Dragonite',
      'Kingambit',
      'Rotom-Wash',
    ]);
    expect(result.selectedAudit.format.label).toBe('Champions 3v3');
    expect(result.selectedThreats.length).toBeGreaterThan(0);
    expect(result.selectionWarnings).toEqual([]);
  });

  it('ranks possible non-meta threats only when the match selection is complete', () => {
    const result = analyzeTeam({
      paste: `
Garchomp @ Rocky Helmet
Ability: Rough Skin
- Earthquake

Dragonite @ Heavy-Duty Boots
Ability: Multiscale
- Dragon Dance
- Extreme Speed

Great Tusk @ Booster Energy
Ability: Protosynthesis
- Close Combat
`,
      format: 'champions-bss',
      store: createDataStore(demoDataBundle),
      selectedSlots: [1, 2, 3],
    });

    expect(result.selectedPossibleThreats.map((threat) => threat.species)).toContain('Flutter Mane');
    expect(result.possibleThreats).toEqual([]);
  });

  it('reports incomplete selected match teams', () => {
    const result = analyzeTeam({
      paste: `
Garchomp @ Rocky Helmet
Ability: Rough Skin
- Earthquake
`,
      format: 'champions-bss',
      store: createDataStore(demoDataBundle),
      selectedSlots: [1],
    });

    expect(result.selectedTeam.members).toHaveLength(1);
    expect(result.selectionWarnings).toContain('Sélection incomplète : choisis 3 Pokémon pour ce format.');
  });
});
