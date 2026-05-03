import { describe, expect, it } from 'vitest';
import { demoDataBundle } from '../data/demoSnapshots';
import { buildAnalysisReport, reportDownloadHref } from './analysisReport';
import { analyzeTeam } from './analysis';
import { createDataStore } from './dataStore';

describe('analysisReport', () => {
  it('builds a markdown report from the current analysis', () => {
    const store = createDataStore(demoDataBundle);
    const analysis = analyzeTeam({
      paste: `Great Tusk @ Booster Energy
Ability: Protosynthesis
- Earthquake`,
      format: 'champions-bss',
      store,
      selectedSlots: [1],
    });

    const report = buildAnalysisReport({
      analysis,
      reference: demoDataBundle.reference,
      format: 'champions-bss',
    });

    expect(report).toContain('# Rapport Champions Companion');
    expect(report).toContain('Format : Champions 3v3');
    expect(report).toContain('Great Tusk');
    expect(report).toContain('## Menaces frequentes');
    expect(report).toContain('Score');
    expect(report).toContain('## Statut des donnees');
  });

  it('encodes the markdown report as a downloadable href', () => {
    const href = reportDownloadHref('# Rapport\n\nGreat Tusk');

    expect(href).toMatch(/^data:text\/markdown;charset=utf-8,/);
    expect(decodeURIComponent(href)).toContain('Great Tusk');
  });
});
