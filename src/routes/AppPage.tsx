import { useEffect, useMemo, useState } from 'react';
import { AnalysisExport } from '../components/AnalysisExport';
import { AuditPanel } from '../components/AuditPanel';
import { DeferredCombatCalculator } from '../components/DeferredCombatCalculator';
import { HelpPanel } from '../components/HelpPanel';
import { PossibleThreatPanel } from '../components/PossibleThreatPanel';
import { SavedTeamManager } from '../components/SavedTeamManager';
import { SetupWizard } from '../components/SetupWizard';
import { SnapshotStatus } from '../components/SnapshotStatus';
import { TeamBuilder } from '../components/TeamBuilder';
import { TeamPreview } from '../components/TeamPreview';
import { ThreatPanel } from '../components/ThreatPanel';
import { demoDataBundle } from '../data/demoSnapshots';
import { getPkmnReferenceSnapshot } from '../data/pkmnReference';
import { analyzeTeam } from '../domain/analysis';
import { createDataStore } from '../domain/dataStore';
import { getPickSize } from '../domain/matchSelection';
import { pokemonDisplayName } from '../domain/referenceDisplay';
import { refreshSnapshots } from '../domain/snapshotRefresh';
import { parseShowdownTeam } from '../domain/teamImport';
import {
  builderStateFromMembers,
  builderStateToShowdownPaste,
  updateBuilderSlot,
} from '../domain/teamBuilder';
import type { SavedTeam } from '../domain/savedTeams';
import type { BuilderSlot } from '../domain/teamBuilder';
import type { DataBundle, FormatId } from '../domain/types';
import { MarketingFooter } from './navigation';

const initialPaste = `Great Tusk @ Booster Energy
Ability: Protosynthesis
Tera Type: Ground
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Earthquake
- Close Combat
- Stealth Rock
- Ice Beam`;

export default function AppPage() {
  const [format, setFormat] = useState<FormatId>('champions-bss');
  const [paste, setPaste] = useState(initialPaste);
  const [builderState, setBuilderState] = useState(() => builderStateFromMembers(parseShowdownTeam(initialPaste).members));
  const [selectedSlots, setSelectedSlots] = useState<number[]>([1]);
  const [dataBundle, setDataBundle] = useState<DataBundle>(demoDataBundle);
  const [referenceStatus, setReferenceStatus] = useState<'loading' | 'complete' | 'error'>('loading');
  const [refreshMessage, setRefreshMessage] = useState<string>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let mounted = true;

    getPkmnReferenceSnapshot()
      .then((reference) => {
        if (!mounted) {
          return;
        }

        setDataBundle((currentBundle) => ({
          ...currentBundle,
          reference,
        }));
        setReferenceStatus('complete');
      })
      .catch(() => {
        if (mounted) {
          setReferenceStatus('error');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const store = useMemo(() => createDataStore(dataBundle), [dataBundle]);
  const pickSize = getPickSize(format);
  const pokemonOptions = useMemo(() => {
    return Object.values(dataBundle.reference.pokemon).sort((left, right) =>
      pokemonDisplayName(dataBundle.reference, left.name).localeCompare(
        pokemonDisplayName(dataBundle.reference, right.name),
        'fr',
      ),
    );
  }, [dataBundle]);
  const moveOptions = useMemo(() => {
    return Object.values(dataBundle.reference.moves).sort((left, right) => left.name.localeCompare(right.name));
  }, [dataBundle]);
  const analysis = useMemo(() => {
    return analyzeTeam({ paste, format, store, selectedSlots });
  }, [paste, format, store, selectedSlots]);
  const selectedNames = analysis.selectedTeam.members.map((member) =>
    pokemonDisplayName(dataBundle.reference, member.species),
  );
  const topThreat = analysis.threats[0];

  function handleFormatChange(nextFormat: FormatId) {
    const nextPickSize = getPickSize(nextFormat);
    setFormat(nextFormat);
    setSelectedSlots((currentSlots) => currentSlots.slice(0, nextPickSize));
  }

  function applyPaste(nextPaste: string, nextFormat: FormatId) {
    const parsedTeam = parseShowdownTeam(nextPaste);
    setPaste(nextPaste);
    setBuilderState(builderStateFromMembers(parsedTeam.members));
    setSelectedSlots((currentSlots) => {
      const nextPickSize = getPickSize(nextFormat);
      const nextSlots = currentSlots.filter((slotId) => slotId <= parsedTeam.members.length).slice(0, nextPickSize);
      return nextSlots.length > 0 || parsedTeam.members.length === 0 ? nextSlots : [1];
    });
  }

  function handlePasteChange(nextPaste: string) {
    applyPaste(nextPaste, format);
  }

  function handleLoadSavedTeam(team: SavedTeam) {
    setFormat(team.format);
    applyPaste(team.paste, team.format);
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
    <main className="product-shell app-only-shell app-redesign">
      <section className="app-shell" id="app" aria-label="Cockpit d'analyse">
        <header className="top-bar">
          <div className="cockpit-intro">
            <span className="eyebrow">Cockpit local · 3v3 / 4v4</span>
            <h1>Cockpit stratégique</h1>
            <p>Importe, ajuste et valide ton équipe : tu prépares 6 Pokémon, puis tu choisis ceux qui jouent le match.</p>
            <dl className="cockpit-kpis">
              <div>
                <dt>Équipe de 6</dt>
                <dd>{analysis.team.members.length}/6</dd>
              </div>
              <div>
                <dt>Sélection jouée</dt>
                <dd>
                  {selectedSlots.length}/{pickSize}
                </dd>
              </div>
              <div>
                <dt>Adversaire à surveiller</dt>
                <dd>{topThreat ? pokemonDisplayName(dataBundle.reference, topThreat.species) : 'À compléter'}</dd>
              </div>
            </dl>
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

        <div className="app-actions">
          <SavedTeamManager paste={paste} format={format} onLoad={handleLoadSavedTeam} />
          <AnalysisExport analysis={analysis} reference={dataBundle.reference} format={format} />
        </div>

        <TeamBuilder
          state={builderState}
          pokemonOptions={pokemonOptions}
          moveOptions={moveOptions}
          itemOptions={dataBundle.reference.items}
          natureOptions={dataBundle.reference.natures}
          reference={dataBundle.reference}
          referenceStatus={referenceStatus}
          referenceSource={dataBundle.reference.source}
          selectedSlots={selectedSlots}
          pickSize={pickSize}
          onSlotChange={handleBuilderSlotChange}
          onToggleSelection={handleToggleSelection}
        />

        <DeferredCombatCalculator
          format={format}
          selectedTeam={analysis.selectedTeam.members}
          reference={dataBundle.reference}
        />

        <div className="dashboard">
          <div className="dashboard-primary">
            <TeamPreview reference={dataBundle.reference} team={analysis.team} />
            <section className="panel selected-analysis">
              <h2>Plan de match 3v3</h2>
              <h3>Analyse sélection jouée</h3>
              <p>
                Sélection de match : choisis {analysis.pickSize} Pokémon au niveau{' '}
                {analysis.selectedAudit.format.defaultLevel}.
              </p>
              {analysis.selectionWarnings.map((warning) => (
                <p className="warning" key={warning}>
                  {warning}
                </p>
              ))}
              <p>Joués : {selectedNames.join(', ') || 'aucun'}</p>
              <div className="speed-tier-list" aria-label="Speed tiers sélection">
                {analysis.selectedAudit.speed.map((speed) => (
                  <article className="speed-tier" key={speed.species}>
                    <strong>
                      {pokemonDisplayName(dataBundle.reference, speed.species)}: {speed.speed}{' '}
                      {speed.estimated ? 'estimé' : 'exact'}
                    </strong>
                    <span>
                      {speed.benchmarks
                        .filter((benchmark) => benchmark.label !== 'Base')
                        .map((benchmark) => `${benchmark.label} ${benchmark.speed}`)
                        .join(' · ')}
                    </span>
                  </article>
                ))}
              </div>
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
          </div>
          <div className="dashboard-secondary">
            <AuditPanel audit={analysis.audit} />
            <ThreatPanel reference={dataBundle.reference} threats={analysis.threats} />
            <PossibleThreatPanel
              reference={dataBundle.reference}
              threats={analysis.selectedPossibleThreats}
              selectedCount={analysis.selectedTeam.members.length}
              pickSize={analysis.pickSize}
            />
            <HelpPanel />
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
