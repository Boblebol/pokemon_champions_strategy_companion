import { useEffect, useMemo, useState } from 'react';
import { AnalysisExport } from '../components/AnalysisExport';
import { AuditPanel } from '../components/AuditPanel';
import { DeferredCombatCalculator } from '../components/DeferredCombatCalculator';
import { HelpPanel } from '../components/HelpPanel';
import { PossibleThreatPanel } from '../components/PossibleThreatPanel';
import { ProjectCreditPanel } from '../components/ProjectCreditPanel';
import { PwaStatus } from '../components/PwaStatus';
import { SavedTeamManager } from '../components/SavedTeamManager';
import { SnapshotStatus } from '../components/SnapshotStatus';
import { TeamBuilder } from '../components/TeamBuilder';
import { TeamPreview } from '../components/TeamPreview';
import { ThreatPanel } from '../components/ThreatPanel';
import { demoDataBundle } from '../data/demoSnapshots';
import { getPkmnReferenceSnapshot } from '../data/pkmnReference';
import { analyzeTeam } from '../domain/analysis';
import { createDataStore } from '../domain/dataStore';
import { SUPPORTED_FORMATS } from '../domain/formatRules';
import { getPickSize } from '../domain/matchSelection';
import { pokemonDisplayName } from '../domain/referenceDisplay';
import type { SavedTeam } from '../domain/savedTeams';
import { refreshSnapshots } from '../domain/snapshotRefresh';
import { parseShowdownTeam } from '../domain/teamImport';
import {
  builderStateFromMembers,
  builderStateToShowdownPaste,
  updateBuilderSlot,
} from '../domain/teamBuilder';
import type { BuilderSlot } from '../domain/teamBuilder';
import type { DataBundle, FormatId } from '../domain/types';
import { pageHref } from '../routing';

type MobileTab = 'home' | 'team' | 'selection' | 'combat' | 'analysis' | 'data';

const MOBILE_TABS: Array<{ id: MobileTab; label: string }> = [
  { id: 'home', label: 'Accueil' },
  { id: 'team', label: 'Équipe' },
  { id: 'selection', label: 'Sélection' },
  { id: 'combat', label: 'Combat' },
  { id: 'analysis', label: 'Analyse' },
  { id: 'data', label: 'Données' },
];

const initialPaste = `Dragonite @ Heavy-Duty Boots
Ability: Multiscale
Tera Type: Normal
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Dragon Dance
- Extreme Speed
- Earthquake
- Roost`;

export default function MobileAppPage() {
  const [activeTab, setActiveTab] = useState<MobileTab>('home');
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

  function handleLoadSavedTeam(team: SavedTeam) {
    setFormat(team.format);
    const parsedTeam = parseShowdownTeam(team.paste);
    setPaste(team.paste);
    setBuilderState(builderStateFromMembers(parsedTeam.members));
    setSelectedSlots(parsedTeam.members.length > 0 ? [1] : []);
    setActiveTab('team');
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
    <main className="mobile-shell" aria-label="Application mobile Champions">
      <header className="mobile-topbar">
        <div>
          <span className="eyebrow">PWA mobile</span>
          <h1>Champions mobile</h1>
          <p>Pensé pour le doigt : un écran, une action, les mêmes calculs.</p>
        </div>
        <a href={pageHref('app')}>Desktop</a>
      </header>

      <nav className="mobile-tabbar" aria-label="Navigation mobile tactile">
        {MOBILE_TABS.map((tab) => (
          <button
            type="button"
            aria-pressed={activeTab === tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
            key={tab.id}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'home' ? (
        <section className="mobile-screen mobile-home" aria-label="Accueil mobile">
          <PwaStatus />
          <div className="mobile-summary-grid">
            <article>
              <span>Format</span>
              <strong>{SUPPORTED_FORMATS.find((currentFormat) => currentFormat.id === format)?.label}</strong>
            </article>
            <article>
              <span>Équipe</span>
              <strong>{analysis.team.members.length}/6</strong>
            </article>
            <article>
              <span>Sélection</span>
              <strong>
                {selectedSlots.length}/{pickSize}
              </strong>
            </article>
            <article>
              <span>Menace</span>
              <strong>{topThreat ? pokemonDisplayName(dataBundle.reference, topThreat.species) : 'À compléter'}</strong>
            </article>
          </div>
          <label className="mobile-field">
            Format Showdown Champions
            <select value={format} onChange={(event) => handleFormatChange(event.target.value as FormatId)}>
              {SUPPORTED_FORMATS.map((currentFormat) => (
                <option value={currentFormat.id} key={currentFormat.id}>
                  {currentFormat.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="mobile-primary-action" onClick={() => setActiveTab('team')}>
            Continuer l'équipe
          </button>
          <ProjectCreditPanel />
        </section>
      ) : null}

      {activeTab === 'team' ? (
        <section className="mobile-screen" aria-label="Équipe mobile">
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
        </section>
      ) : null}

      {activeTab === 'selection' ? (
        <section className="mobile-screen" aria-label="Sélection mobile">
          <h2>Sélection de match</h2>
          <p>
            Choisis {pickSize} Pokémon. Actuellement : {selectedSlots.length}/{pickSize}.
          </p>
          <div className="mobile-pick-list">
            {builderState.slots.map((slot) => {
              const selected = selectedSlots.includes(slot.id);
              return (
                <label className="mobile-pick-card" data-selected={selected} key={slot.id}>
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={!selected && selectedSlots.length >= pickSize}
                    onChange={(event) => handleToggleSelection(slot.id, event.target.checked)}
                  />
                  <span>Slot {slot.id}</span>
                  <strong>{slot.species ? pokemonDisplayName(dataBundle.reference, slot.species) : 'Libre'}</strong>
                </label>
              );
            })}
          </div>
          <button type="button" className="mobile-primary-action" onClick={() => setActiveTab('analysis')}>
            Analyser la sélection
          </button>
        </section>
      ) : null}

      {activeTab === 'combat' ? (
        <section className="mobile-screen" aria-label="Combat mobile">
          <DeferredCombatCalculator
            format={format}
            selectedTeam={analysis.selectedTeam.members}
            reference={dataBundle.reference}
          />
        </section>
      ) : null}

      {activeTab === 'analysis' ? (
        <section className="mobile-screen" aria-label="Analyse mobile">
          <TeamPreview reference={dataBundle.reference} team={analysis.team} />
          <section className="panel selected-analysis">
            <h2>Plan de match</h2>
            <p>Joués : {selectedNames.join(', ') || 'aucun'}</p>
            {analysis.selectionWarnings.map((warning) => (
              <p className="warning" key={warning}>
                {warning}
              </p>
            ))}
          </section>
          <AuditPanel audit={analysis.audit} />
          <ThreatPanel reference={dataBundle.reference} threats={analysis.threats} />
          <PossibleThreatPanel
            reference={dataBundle.reference}
            threats={analysis.selectedPossibleThreats}
            selectedCount={analysis.selectedTeam.members.length}
            pickSize={analysis.pickSize}
          />
          <HelpPanel />
        </section>
      ) : null}

      {activeTab === 'data' ? (
        <section className="mobile-screen" aria-label="Données mobile">
          <SnapshotStatus
            label={analysis.snapshotStatus.label}
            source={analysis.snapshotStatus.source}
            onRefresh={handleRefresh}
            refreshMessage={refreshMessage}
            isRefreshing={isRefreshing}
          />
          <SavedTeamManager paste={paste} format={format} onLoad={handleLoadSavedTeam} />
          <AnalysisExport analysis={analysis} reference={dataBundle.reference} format={format} />
        </section>
      ) : null}
    </main>
  );
}
