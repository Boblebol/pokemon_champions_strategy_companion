import { useMemo, useState } from 'react';
import { AuditPanel } from './components/AuditPanel';
import { FormatSelector } from './components/FormatSelector';
import { SnapshotStatus } from './components/SnapshotStatus';
import { TeamInput } from './components/TeamInput';
import { TeamPreview } from './components/TeamPreview';
import { ThreatPanel } from './components/ThreatPanel';
import { demoDataBundle } from './data/demoSnapshots';
import { analyzeTeam } from './domain/analysis';
import { createDataStore } from './domain/dataStore';
import { refreshSnapshots } from './domain/snapshotRefresh';
import type { FormatId } from './domain/types';

const initialPaste = `Great Tusk @ Booster Energy
Ability: Protosynthesis
Tera Type: Ground
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Earthquake
- Close Combat
- Stealth Rock
- Ice Beam`;

const store = createDataStore(demoDataBundle);

export default function App() {
  const [format, setFormat] = useState<FormatId>('champions-vgc');
  const [paste, setPaste] = useState(initialPaste);
  const [refreshMessage, setRefreshMessage] = useState<string>();

  const analysis = useMemo(() => analyzeTeam({ paste, format, store }), [paste, format]);

  async function handleRefresh() {
    const result = await refreshSnapshots();
    setRefreshMessage(result.message);
  }

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div>
          <h1>Pokemon Champions Strategy Companion</h1>
          <p>Local team audit and meta threat companion.</p>
        </div>
        <FormatSelector value={format} onChange={setFormat} />
        <SnapshotStatus
          label={analysis.snapshotStatus.label}
          source={analysis.snapshotStatus.source}
          onRefresh={handleRefresh}
          refreshMessage={refreshMessage}
        />
      </header>

      <div className="dashboard">
        <aside className="left-column">
          <TeamInput value={paste} onChange={setPaste} />
          <TeamPreview team={analysis.team} />
        </aside>
        <AuditPanel audit={analysis.audit} />
        <ThreatPanel threats={analysis.threats} />
      </div>
    </main>
  );
}
