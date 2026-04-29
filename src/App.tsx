import { useMemo, useState } from 'react';
import { AuditPanel } from './components/AuditPanel';
import { HelpPanel } from './components/HelpPanel';
import { SetupWizard } from './components/SetupWizard';
import { SnapshotStatus } from './components/SnapshotStatus';
import { TeamPreview } from './components/TeamPreview';
import { ThreatPanel } from './components/ThreatPanel';
import { demoDataBundle } from './data/demoSnapshots';
import { analyzeTeam } from './domain/analysis';
import { createDataStore } from './domain/dataStore';
import { refreshSnapshots } from './domain/snapshotRefresh';
import type { DataBundle, FormatId } from './domain/types';

const initialPaste = `Great Tusk @ Booster Energy
Ability: Protosynthesis
Tera Type: Ground
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Earthquake
- Close Combat
- Stealth Rock
- Ice Beam`;

export default function App() {
  const [format, setFormat] = useState<FormatId>('champions-vgc');
  const [paste, setPaste] = useState(initialPaste);
  const [dataBundle, setDataBundle] = useState<DataBundle>(demoDataBundle);
  const [refreshMessage, setRefreshMessage] = useState<string>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const store = useMemo(() => createDataStore(dataBundle), [dataBundle]);
  const analysis = useMemo(() => analyzeTeam({ paste, format, store }), [paste, format, store]);

  async function handleRefresh() {
    setIsRefreshing(true);
    const result = await refreshSnapshots({ format, useProxy: import.meta.env.DEV });
    if (result.ok) {
      setDataBundle((currentBundle) => ({
        ...currentBundle,
        meta: {
          ...currentBundle.meta,
          [result.snapshot.format]: result.snapshot,
        },
      }));
    }
    setRefreshMessage(result.message);
    setIsRefreshing(false);
  }

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div>
          <span className="eyebrow">V1 locale · Smogon-ready</span>
          <h1>Assistant stratégique Pokémon Champions</h1>
          <p>Importe ton équipe, lis les faiblesses et cible les menaces du méta.</p>
        </div>
        <SnapshotStatus
          label={analysis.snapshotStatus.label}
          source={analysis.snapshotStatus.source}
          onRefresh={handleRefresh}
          refreshMessage={refreshMessage}
          isRefreshing={isRefreshing}
        />
      </header>

      <SetupWizard
        format={format}
        onFormatChange={setFormat}
        paste={paste}
        onPasteChange={setPaste}
        analysis={analysis}
      />

      <div className="dashboard">
        <TeamPreview team={analysis.team} />
        <AuditPanel audit={analysis.audit} />
        <ThreatPanel threats={analysis.threats} />
        <HelpPanel />
      </div>
    </main>
  );
}
