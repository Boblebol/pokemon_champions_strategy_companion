import { useMemo, useState } from 'react';
import { AuditPanel } from './components/AuditPanel';
import { HelpPanel } from './components/HelpPanel';
import { SetupWizard } from './components/SetupWizard';
import { SnapshotStatus } from './components/SnapshotStatus';
import { TeamBuilder } from './components/TeamBuilder';
import { TeamPreview } from './components/TeamPreview';
import { ThreatPanel } from './components/ThreatPanel';
import { demoDataBundle } from './data/demoSnapshots';
import { analyzeTeam } from './domain/analysis';
import { createDataStore } from './domain/dataStore';
import { getPickSize } from './domain/matchSelection';
import { refreshSnapshots } from './domain/snapshotRefresh';
import { parseShowdownTeam } from './domain/teamImport';
import {
  builderStateFromMembers,
  builderStateToShowdownPaste,
  updateBuilderSlot,
} from './domain/teamBuilder';
import type { BuilderSlot } from './domain/teamBuilder';
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
  const [builderState, setBuilderState] = useState(() => builderStateFromMembers(parseShowdownTeam(initialPaste).members));
  const [selectedSlots, setSelectedSlots] = useState<number[]>([1]);
  const [dataBundle, setDataBundle] = useState<DataBundle>(demoDataBundle);
  const [refreshMessage, setRefreshMessage] = useState<string>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const store = useMemo(() => createDataStore(dataBundle), [dataBundle]);
  const pickSize = getPickSize(format);
  const pokemonOptions = useMemo(() => {
    return Object.values(dataBundle.reference.pokemon).sort((left, right) => left.name.localeCompare(right.name));
  }, [dataBundle]);
  const moveOptions = useMemo(() => {
    return Object.values(dataBundle.reference.moves).sort((left, right) => left.name.localeCompare(right.name));
  }, [dataBundle]);
  const analysis = useMemo(() => {
    return analyzeTeam({ paste, format, store, selectedSlots });
  }, [paste, format, store, selectedSlots]);

  function handleFormatChange(nextFormat: FormatId) {
    const nextPickSize = getPickSize(nextFormat);
    setFormat(nextFormat);
    setSelectedSlots((currentSlots) => currentSlots.slice(0, nextPickSize));
  }

  function handlePasteChange(nextPaste: string) {
    const parsedTeam = parseShowdownTeam(nextPaste);
    setPaste(nextPaste);
    setBuilderState(builderStateFromMembers(parsedTeam.members));
    setSelectedSlots((currentSlots) => {
      const nextSlots = currentSlots.filter((slotId) => slotId <= parsedTeam.members.length).slice(0, pickSize);
      return nextSlots.length > 0 || parsedTeam.members.length === 0 ? nextSlots : [1];
    });
  }

  function handleBuilderSlotChange(slotId: number, patch: Partial<Omit<BuilderSlot, 'id'>>) {
    const nextState = updateBuilderSlot(builderState, slotId, patch);
    setBuilderState(nextState);
    setPaste(builderStateToShowdownPaste(nextState));
  }

  function handleToggleSelection(slotId: number, selected: boolean) {
    setSelectedSlots((currentSlots) => {
      if (selected) {
        return currentSlots.includes(slotId) ? currentSlots : [...currentSlots, slotId].slice(0, pickSize);
      }

      return currentSlots.filter((currentSlot) => currentSlot !== slotId);
    });
  }

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
        onFormatChange={handleFormatChange}
        paste={paste}
        onPasteChange={handlePasteChange}
        analysis={analysis}
      />

      <TeamBuilder
        state={builderState}
        pokemonOptions={pokemonOptions}
        moveOptions={moveOptions}
        selectedSlots={selectedSlots}
        pickSize={pickSize}
        onSlotChange={handleBuilderSlotChange}
        onToggleSelection={handleToggleSelection}
      />

      <div className="dashboard">
        <TeamPreview team={analysis.team} />
        <AuditPanel audit={analysis.audit} />
        <section className="panel selected-analysis">
          <h2>Analyse sélection jouée</h2>
          <p>Sélection de match : {analysis.pickSize} Pokémon à choisir.</p>
          {analysis.selectionWarnings.map((warning) => (
            <p className="warning" key={warning}>
              {warning}
            </p>
          ))}
          <p>
            Joués : {analysis.selectedTeam.members.map((member) => member.species).join(', ') || 'aucun'}
          </p>
          <div className="finding-list">
            {[...analysis.selectedAudit.defensive, ...analysis.selectedAudit.offensive].map((finding) => (
              <article className={`finding ${finding.severity}`} key={finding.title}>
                <strong>{finding.title}</strong>
                {finding.evidence.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </article>
            ))}
          </div>
        </section>
        <ThreatPanel threats={analysis.threats} />
        <HelpPanel />
      </div>
    </main>
  );
}
