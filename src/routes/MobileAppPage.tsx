import { useEffect, useMemo, useState } from 'react';
import { AnalysisExport } from '../components/AnalysisExport';
import { AuditPanel } from '../components/AuditPanel';
import { DeferredCombatCalculator } from '../components/DeferredCombatCalculator';
import { HelpPanel } from '../components/HelpPanel';
import { PossibleThreatPanel } from '../components/PossibleThreatPanel';
import { ProjectCreditPanel } from '../components/ProjectCreditPanel';
import { PwaStatus } from '../components/PwaStatus';
import { PokemonAvatar } from '../components/PokemonMedia';
import { SavedTeamManager } from '../components/SavedTeamManager';
import { SearchablePicker } from '../components/SearchablePicker';
import { SnapshotStatus } from '../components/SnapshotStatus';
import { TeamBuilder } from '../components/TeamBuilder';
import { TeamPreview } from '../components/TeamPreview';
import { ThreatPanel } from '../components/ThreatPanel';
import { demoDataBundle } from '../data/demoSnapshots';
import { getPkmnReferenceSnapshot } from '../data/pkmnReference';
import { analyzeTeam } from '../domain/analysis';
import { createDataStore } from '../domain/dataStore';
import { toId } from '../domain/ids';
import { localizedSearchText } from '../domain/localization';
import { getPickSize } from '../domain/matchSelection';
import { moveDisplayName, pokemonDisplayName } from '../domain/referenceDisplay';
import type { SavedTeam } from '../domain/savedTeams';
import { refreshSnapshots } from '../domain/snapshotRefresh';
import { parseShowdownTeam } from '../domain/teamImport';
import {
  builderStateFromMembers,
  builderStateToMembers,
  builderStateToShowdownPaste,
  createEmptyBuilderState,
  updateBuilderSlot,
} from '../domain/teamBuilder';
import type { BuilderSlot } from '../domain/teamBuilder';
import type { DataBundle, FormatId, LocaleId } from '../domain/types';

type MobileTab = 'home' | 'team' | 'selection' | 'combat' | 'analysis' | 'data';

const MOBILE_TABS: Array<{ id: MobileTab; label: string }> = [
  { id: 'home', label: 'Accueil' },
  { id: 'team', label: 'Équipe' },
  { id: 'selection', label: 'Sélection' },
  { id: 'combat', label: 'Combat' },
  { id: 'analysis', label: 'Analyse' },
  { id: 'data', label: 'Données' },
];

const QUICK_MODES: Array<{ format: FormatId; label: string; description: string }> = [
  { format: 'champions-bss', label: '1v1 actif', description: '3 Pokémon à choisir' },
  { format: 'champions-vgc', label: '2v2 actif', description: '4 Pokémon à choisir' },
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

function teamExportHref(value: string): string {
  return `data:text/plain;charset=utf-8,${encodeURIComponent(value)}`;
}

function isMatchToolTab(tab: MobileTab): boolean {
  return tab === 'combat' || tab === 'analysis';
}

export default function MobileAppPage() {
  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [format, setFormat] = useState<FormatId>('champions-bss');
  const [builderState, setBuilderState] = useState(() => builderStateFromMembers(parseShowdownTeam(initialPaste).members));
  const [selectedSlots, setSelectedSlots] = useState<number[]>([1]);
  const [dataBundle, setDataBundle] = useState<DataBundle>(demoDataBundle);
  const [locale, setLocale] = useState<LocaleId>('fr');
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
  const paste = useMemo(() => builderStateToShowdownPaste(builderState), [builderState]);
  const teamMembers = useMemo(() => builderStateToMembers(builderState), [builderState]);
  const pickSize = getPickSize(format);
  const pokemonOptions = useMemo(() => {
    return Object.values(dataBundle.reference.pokemon).sort((left, right) =>
      pokemonDisplayName(dataBundle.reference, left.name, locale).localeCompare(
        pokemonDisplayName(dataBundle.reference, right.name, locale),
        locale,
      ),
    );
  }, [dataBundle, locale]);
  const moveOptions = useMemo(() => {
    return Object.values(dataBundle.reference.moves).sort((left, right) =>
      moveDisplayName(dataBundle.reference, left.name, locale).localeCompare(
        moveDisplayName(dataBundle.reference, right.name, locale),
        locale,
      ),
    );
  }, [dataBundle, locale]);
  const analysis = useMemo(() => {
    return analyzeTeam({ format, store, teamMembers, selectedSlots });
  }, [format, selectedSlots, store, teamMembers]);
  const filledSlots = builderState.slots.filter((slot) => Boolean(slot.species));
  const activeReadyCount = selectedSlots
    .slice(0, pickSize)
    .filter((slotId) => builderState.slots.some((slot) => slot.id === slotId && slot.species)).length;
  const canUseMatchTools = activeReadyCount >= pickSize;
  const readyLabel = `${activeReadyCount}/${pickSize} actifs prêts`;
  const selectedNames = analysis.selectedTeam.members.map((member) =>
    pokemonDisplayName(dataBundle.reference, member.species, locale),
  );
  const topThreat = analysis.threats[0];
  const activePickerOptions = useMemo(
    () =>
      filledSlots.map((slot) => {
        const species = slot.species as string;
        const pokemon = dataBundle.reference.pokemon[toId(species)];
        const label = pokemonDisplayName(dataBundle.reference, species, locale);

        return {
          value: String(slot.id),
          label,
          searchText: localizedSearchText(species, pokemon?.localizedNames, locale),
          description: `Slot ${slot.id}`,
          media: <PokemonAvatar reference={dataBundle.reference} species={species} />,
        };
      }),
    [dataBundle.reference, filledSlots, locale],
  );

  function handleFormatChange(nextFormat: FormatId) {
    const nextPickSize = getPickSize(nextFormat);
    setFormat(nextFormat);
    setSelectedSlots((currentSlots) => currentSlots.slice(0, nextPickSize));
  }

  function handleTabChange(tab: MobileTab) {
    if (isMatchToolTab(tab) && !canUseMatchTools) {
      return;
    }

    setActiveTab(tab);
  }

  function handleCreateEmptyTeam() {
    const nextState = createEmptyBuilderState();
    setBuilderState(nextState);
    setSelectedSlots([]);
    setActiveTab('team');
  }

  function handleBuilderSlotChange(slotId: number, patch: Partial<Omit<BuilderSlot, 'id'>>) {
    const nextState = updateBuilderSlot(builderState, slotId, patch);
    setBuilderState(nextState);
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
    setBuilderState(builderStateFromMembers(parsedTeam.members));
    setSelectedSlots(parsedTeam.members.length > 0 ? [1] : []);
    setActiveTab('team');
  }

  function handleActivePickChange(index: number, value: string | undefined) {
    setSelectedSlots((currentSlots) => {
      const slotId = value ? Number(value) : undefined;
      const nextSlots = currentSlots.filter((currentSlot, currentIndex) => currentIndex !== index && currentSlot !== slotId);

      if (slotId) {
        nextSlots.splice(index, 0, slotId);
      }

      return nextSlots.slice(0, pickSize);
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
    <main className="mobile-shell" aria-label="Application mobile Champions">
      <header className="mobile-topbar">
        <div>
          <span className="eyebrow">PWA mobile</span>
          <h1>Champions mobile</h1>
          <p>Pensé pour le doigt : un écran, une action, les mêmes calculs.</p>
        </div>
        <div className="locale-switch" aria-label="Langue">
          {(['fr', 'en'] as const).map((nextLocale) => (
            <button
              type="button"
              aria-pressed={locale === nextLocale}
              onClick={() => setLocale(nextLocale)}
              key={nextLocale}
            >
              {nextLocale.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <nav className="mobile-tabbar" aria-label="Navigation mobile tactile">
        {MOBILE_TABS.map((tab) => {
          const disabled = isMatchToolTab(tab.id) && !canUseMatchTools;

          return (
            <button
              type="button"
              aria-pressed={activeTab === tab.id}
              className={activeTab === tab.id ? 'active' : ''}
              disabled={disabled}
              onClick={() => handleTabChange(tab.id)}
              key={tab.id}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {activeTab === 'home' ? (
        <section className="mobile-screen mobile-home" aria-label="Accueil mobile">
          <section className="mobile-quick-start" aria-label="Préparer la team">
            <div className="panel-heading">
              <div>
                <h2>Préparer la team</h2>
                <p>Crée, charge et sauve depuis le premier écran, puis remplis juste les actifs nécessaires.</p>
              </div>
              <strong className={canUseMatchTools ? 'ready-pill done' : 'ready-pill'}>{readyLabel}</strong>
            </div>
            <div className="quick-mode-switch" aria-label="Mode de match rapide">
              {QUICK_MODES.map((mode) => (
                <button
                  type="button"
                  aria-pressed={format === mode.format}
                  onClick={() => handleFormatChange(mode.format)}
                  key={mode.format}
                >
                  <strong>{mode.label}</strong>
                  <span>{mode.description}</span>
                </button>
              ))}
            </div>
            <div className="quick-actions">
              <button type="button" className="mobile-primary-action" onClick={() => setActiveTab('team')}>
                Continuer l'équipe
              </button>
              <button type="button" className="secondary-action" onClick={handleCreateEmptyTeam}>
                Créer une team vide
              </button>
            </div>
            <SavedTeamManager paste={paste} format={format} onLoad={handleLoadSavedTeam} />
          </section>
          <div className="mobile-summary-grid">
            <article>
              <span>Format</span>
              <strong>{format === 'champions-vgc' ? '2v2 actif' : '1v1 actif'}</strong>
            </article>
            <article>
              <span>Équipe</span>
              <strong>{filledSlots.length}/6</strong>
            </article>
            <article>
              <span>Actifs</span>
              <strong>{readyLabel}</strong>
            </article>
            <article>
              <span>Menace</span>
              <strong>
                {topThreat ? pokemonDisplayName(dataBundle.reference, topThreat.species, locale) : 'À compléter'}
              </strong>
            </article>
          </div>
          <PwaStatus />
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
            locale={locale}
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
          <h2>Actifs du match</h2>
          <p>{readyLabel}. Les slots restants peuvent rester vides tant que ces actifs sont prêts.</p>
          <div className="active-pick-grid">
            {Array.from({ length: pickSize }, (_, index) => {
              const currentValue = selectedSlots[index] ? String(selectedSlots[index]) : undefined;

              return (
                <SearchablePicker
                  label={`Actif ${index + 1}`}
                  value={currentValue}
                  placeholder="Chercher dans ta team"
                  options={activePickerOptions}
                  emptyLabel="Remplis d'abord un slot d'équipe"
                  onChange={(value) => handleActivePickChange(index, value)}
                  key={index}
                />
              );
            })}
          </div>
          {!canUseMatchTools ? (
            <p className="warning">Il faut {pickSize} Pokémon actifs remplis pour ouvrir la couverture et le combat.</p>
          ) : null}
          <button
            type="button"
            className="mobile-primary-action"
            disabled={!canUseMatchTools}
            onClick={() => setActiveTab('analysis')}
          >
            Voir couverture et menaces
          </button>
        </section>
      ) : null}

      {activeTab === 'combat' ? (
        <section className="mobile-screen" aria-label="Combat mobile">
          <DeferredCombatCalculator
            format={format}
            selectedTeam={analysis.selectedTeam.members}
            reference={dataBundle.reference}
            locale={locale}
          />
        </section>
      ) : null}

      {activeTab === 'analysis' ? (
        <section className="mobile-screen" aria-label="Analyse mobile">
          <TeamPreview reference={dataBundle.reference} team={analysis.selectedTeam} locale={locale} />
          <section className="panel selected-analysis">
            <h2>Plan de match</h2>
            <p>Joués : {selectedNames.join(', ') || 'aucun'}</p>
            {analysis.selectionWarnings.map((warning) => (
              <p className="warning" key={warning}>
                {warning}
              </p>
            ))}
          </section>
          <AuditPanel audit={analysis.selectedAudit} title="Couverture rapide" />
          <ThreatPanel reference={dataBundle.reference} threats={analysis.selectedThreats} locale={locale} />
          <PossibleThreatPanel
            reference={dataBundle.reference}
            threats={analysis.selectedPossibleThreats}
            selectedCount={analysis.selectedTeam.members.length}
            pickSize={analysis.pickSize}
            locale={locale}
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
          <section className="panel team-export-panel" aria-label="Export équipe">
            <h2>Export équipe</h2>
            <p>Le fichier reste compatible Pokémon Showdown.</p>
            <a className="team-file-action" href={teamExportHref(paste)} download="pokemon-champions-team.txt">
              Exporter l'équipe
            </a>
          </section>
          <AnalysisExport analysis={analysis} reference={dataBundle.reference} format={format} />
        </section>
      ) : null}
    </main>
  );
}
