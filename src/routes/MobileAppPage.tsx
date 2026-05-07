import { useEffect, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import { AnalysisExport } from '../components/AnalysisExport';
import { AuditPanel } from '../components/AuditPanel';
import { DeferredCombatCalculator } from '../components/DeferredCombatCalculator';
import { OpponentTeamPanel } from '../components/OpponentTeamPanel';
import { PossibleThreatPanel } from '../components/PossibleThreatPanel';
import { PokemonAvatar } from '../components/PokemonMedia';
import { SavedTeamManager } from '../components/SavedTeamManager';
import { SearchablePicker } from '../components/SearchablePicker';
import { SnapshotStatus } from '../components/SnapshotStatus';
import { TeamBuilder } from '../components/TeamBuilder';
import { ThreatPanel } from '../components/ThreatPanel';
import { demoDataBundle } from '../data/demoSnapshots';
import { getPkmnReferenceSnapshot } from '../data/pkmnReference';
import { analyzeTeam } from '../domain/analysis';
import { createDataStore } from '../domain/dataStore';
import { toId } from '../domain/ids';
import { localizedSearchText } from '../domain/localization';
import { getPickSize } from '../domain/matchSelection';
import { normalizeCombatSlots } from '../domain/opponentTeam';
import { abilityDisplayName, moveDisplayName, pokemonDisplayName, typeDisplayName } from '../domain/referenceDisplay';
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
import type { CombatOpponent } from '../domain/damageCalculator';
import type { DataBundle, FormatId, LocaleId } from '../domain/types';

type MobileTab = 'team' | 'build' | 'active' | 'match';

type NavIconProps = { active: boolean };

function TeamIcon({ active }: NavIconProps) {
  return (
    <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20">
      <path
        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={active ? 2.5 : 2}
      />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth={active ? 2.5 : 2} />
      <path
        d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={active ? 2.5 : 2}
      />
    </svg>
  );
}

function BuildIcon({ active }: NavIconProps) {
  return (
    <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20">
      <path
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={active ? 2.5 : 2}
      />
    </svg>
  );
}

function ActifsIcon({ active }: NavIconProps) {
  return (
    <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20">
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={active ? 2.5 : 2}
      />
    </svg>
  );
}

function MatchIcon({ active }: NavIconProps) {
  return (
    <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={active ? 2.5 : 2} />
      <path
        d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={active ? 2.5 : 2}
      />
    </svg>
  );
}

const MOBILE_TABS: Array<{ id: MobileTab; label: Record<'fr' | 'en', string>; Icon: ComponentType<NavIconProps> }> = [
  { id: 'team', label: { fr: 'Team', en: 'Team' }, Icon: TeamIcon },
  { id: 'build', label: { fr: 'Build', en: 'Build' }, Icon: BuildIcon },
  { id: 'active', label: { fr: 'Actifs', en: 'Active' }, Icon: ActifsIcon },
  { id: 'match', label: { fr: 'Match', en: 'Match' }, Icon: MatchIcon },
];

const QUICK_MODES: Array<{ format: FormatId; label: string; description: string }> = [
  { format: 'champions-bss', label: '1v1 actif', description: '3 Pokémon à choisir' },
  { format: 'champions-vgc', label: '2v2 actif', description: '4 Pokémon à choisir' },
];
const SAVED_TEAM_NAME_INPUT_ID = 'mobile-saved-team-name';

function teamExportHref(value: string): string {
  return `data:text/plain;charset=utf-8,${encodeURIComponent(value)}`;
}

function filledSlotIds(state: ReturnType<typeof createEmptyBuilderState>, limit: number): number[] {
  return state.slots.flatMap((slot) => (slot.species ? [slot.id] : [])).slice(0, limit);
}

export default function MobileAppPage() {
  const [activeTab, setActiveTab] = useState<MobileTab>('team');
  const [format, setFormat] = useState<FormatId>('champions-bss');
  const [builderState, setBuilderState] = useState(() => createEmptyBuilderState());
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [combatSlots, setCombatSlots] = useState<CombatOpponent[]>(() => normalizeCombatSlots('champions-bss', []));
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

  useEffect(() => {
    setCombatSlots((currentSlots) => normalizeCombatSlots(format, currentSlots));
  }, [format]);

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
  const teamStatusLabel = filledSlots.length > 0 ? `${filledSlots.length}/6 Pokémon` : 'Team vide';
  const screenTitle = MOBILE_TABS.find((tab) => tab.id === activeTab)?.label[locale === 'en' ? 'en' : 'fr'] ?? 'Team';
  const activeStatusClass = activeReadyCount === pickSize ? 'ready' : activeReadyCount > 0 ? 'partial' : 'empty';
  const teamStatusClass = filledSlots.length === 6 ? 'ready' : filledSlots.length > 0 ? 'partial' : 'empty';
  const selectedNames = analysis.selectedTeam.members.map((member) =>
    pokemonDisplayName(dataBundle.reference, member.species, locale),
  );
  const topThreat = analysis.threats[0];
  function activePickerOptionsForIndex(index: number) {
    const selectedInOtherFields = new Set(
      selectedSlots.filter((slotId, slotIndex) => slotIndex !== index && Boolean(slotId)),
    );

    return filledSlots
      .filter((slot) => !selectedInOtherFields.has(slot.id))
      .map((slot) => {
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
      });
  }

  function handleFormatChange(nextFormat: FormatId) {
    const nextPickSize = getPickSize(nextFormat);
    setFormat(nextFormat);
    setSelectedSlots((currentSlots) => {
      const validCurrentSlots = currentSlots.filter((slotId) =>
        builderState.slots.some((slot) => slot.id === slotId && slot.species),
      );
      const nextSlots = validCurrentSlots.length > 0 ? validCurrentSlots : filledSlotIds(builderState, nextPickSize);

      return nextSlots.slice(0, nextPickSize);
    });
  }

  function handleCreateEmptyTeam() {
    const nextState = createEmptyBuilderState();
    setBuilderState(nextState);
    setSelectedSlots([]);
    setActiveTab('build');
  }

  function handleBuilderSlotChange(slotId: number, patch: Partial<Omit<BuilderSlot, 'id'>>) {
    const nextState = updateBuilderSlot(builderState, slotId, patch);
    setBuilderState(nextState);
    if (Object.prototype.hasOwnProperty.call(patch, 'species')) {
      setSelectedSlots((currentSlots) => {
        const slotStillFilled = nextState.slots.some((slot) => slot.id === slotId && slot.species);
        const validSlots = currentSlots.filter((currentSlot) =>
          nextState.slots.some((slot) => slot.id === currentSlot && slot.species),
        );

        if (slotStillFilled && !validSlots.includes(slotId) && validSlots.length < pickSize) {
          return [...validSlots, slotId].slice(0, pickSize);
        }

        return validSlots.slice(0, pickSize);
      });
    }
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
    const nextState = builderStateFromMembers(parsedTeam.members);
    setBuilderState(nextState);
    setSelectedSlots(filledSlotIds(nextState, getPickSize(team.format)));
    setActiveTab('build');
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
    <main className="mockup-mobile-shell mobile-shell" data-design-source="maquette_v1" aria-label="Application mobile Champions">
      <header className="mockup-app-header mobile-topbar">
        <div className="mockup-app-title">
          <span>Pokémon Champions</span>
          <h1>{screenTitle}</h1>
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
        {MOBILE_TABS.map((tab) => (
          <button
            type="button"
            aria-pressed={activeTab === tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label[locale === 'en' ? 'en' : 'fr']}
            key={tab.id}
          >
            <tab.Icon active={activeTab === tab.id} />
            <span>{tab.label[locale === 'en' ? 'en' : 'fr']}</span>
          </button>
        ))}
      </nav>

      {activeTab === 'team' ? (
        <section className="mobile-screen mobile-home" aria-label="Team mobile">
          <section className="mobile-quick-start" aria-label="Préparer la team">
            <div className="mockup-card team-status-card">
              <div className="team-status-heading">
                <span>Mon équipe</span>
                <div className="team-status-pills">
                  <strong className={`status-pill ${teamStatusClass}`}>{teamStatusLabel}</strong>
                  <strong className={`status-pill ${activeStatusClass}`}>{readyLabel}</strong>
                </div>
              </div>
              <div className="mobile-team-strip" aria-label="Slots équipe">
                {builderState.slots.map((slot) => {
                  const pokemon = slot.species ? dataBundle.reference.pokemon[toId(slot.species)] : undefined;
                  const isActiveSlot = selectedSlots.includes(slot.id);
                  const slotLabel = slot.species
                    ? pokemonDisplayName(dataBundle.reference, slot.species, locale)
                    : 'Libre';

                  return (
                    <button
                      type="button"
                      className="mobile-team-slot"
                      aria-label={`Slot ${slot.id} ${slotLabel}${isActiveSlot ? ' actif' : ''}`}
                      data-filled={Boolean(slot.species)}
                      data-active-slot={isActiveSlot}
                      onClick={() => setActiveTab('build')}
                      key={slot.id}
                    >
                      {slot.species && pokemon ? (
                        <>
                          <span className="mobile-team-slot-index">S{slot.id}</span>
                          <PokemonAvatar reference={dataBundle.reference} species={slot.species} variant="artwork" />
                          <span className="mobile-team-slot-name">{slotLabel}</span>
                          {pokemon ? (
                            <span className="mobile-team-slot-types">
                              {pokemon.types.slice(0, 1).map((type) => (
                                <span className={`type-chip type-${type.toLowerCase()}`} key={type}>
                                  {typeDisplayName(dataBundle.reference, type, locale)}
                                </span>
                              ))}
                            </span>
                          ) : null}
                        </>
                      ) : (
                        <>
                          <span className="mobile-team-slot-index">S{slot.id}</span>
                          <span className="mobile-team-slot-empty" aria-hidden="true">
                            +
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="quick-mode-switch" aria-label="Mode de match rapide">
                {QUICK_MODES.map((mode) => (
                  <button
                    type="button"
                    aria-label={`${mode.label} ${mode.description}`}
                    aria-pressed={format === mode.format}
                    onClick={() => handleFormatChange(mode.format)}
                    key={mode.format}
                  >
                    <strong>{mode.format === 'champions-vgc' ? '2v2 · 4 Pokémon' : '1v1 · 3 Pokémon'}</strong>
                  </button>
                ))}
              </div>
              <button type="button" className="mobile-primary-action" onClick={() => setActiveTab('build')}>
                Continuer le build
              </button>
            </div>
            <div className="quick-actions">
              <button type="button" className="secondary-action" onClick={handleCreateEmptyTeam}>
                Créer une team vide
              </button>
              <button
                type="button"
                className="team-file-action"
                aria-controls={SAVED_TEAM_NAME_INPUT_ID}
                onClick={() => document.getElementById(SAVED_TEAM_NAME_INPUT_ID)?.focus()}
              >
                Sauvegarder
              </button>
              <a
                className="team-file-action"
                href={teamExportHref(paste)}
                download="pokemon-champions-team.txt"
                aria-label="Exporter l'équipe"
              >
                Exporter
              </a>
            </div>
            <SavedTeamManager
              paste={paste}
              format={format}
              onLoad={handleLoadSavedTeam}
              nameInputId={SAVED_TEAM_NAME_INPUT_ID}
            />
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
          <div className="mockup-offline-indicator">
            <span aria-hidden="true" />
            <strong>Disponible hors ligne</strong>
          </div>
        </section>
      ) : null}

      {activeTab === 'build' ? (
        <section className="mobile-screen mobile-build-screen" aria-label="Build mobile">
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

      {activeTab === 'active' ? (
        <section className="mobile-screen active-screen" aria-label="Actifs mobile">
          <div className="active-status-heading">
            <h2>Actifs</h2>
            <strong className={`status-pill ${activeStatusClass}`}>{readyLabel}</strong>
          </div>
          <p className="active-intro">
            {selectedNames.join(', ') || 'Cherche tes Pokémon dès que le build commence.'}
          </p>
          <div className="active-pick-card" aria-label="Sélection des actifs">
            {Array.from({ length: pickSize }, (_, index) => {
              const currentValue = selectedSlots[index] ? String(selectedSlots[index]) : undefined;
              const currentSlot = currentValue
                ? builderState.slots.find((slot) => String(slot.id) === currentValue)
                : undefined;
              const currentPokemon = currentSlot?.species
                ? dataBundle.reference.pokemon[toId(currentSlot.species)]
                : undefined;

              return (
                <div className="active-pick-row" data-filled={Boolean(currentSlot?.species)} key={index}>
                  <span className="active-pick-index" aria-hidden="true">
                    {currentSlot?.species ? '✓' : index + 1}
                  </span>
                  <div className="active-pick-control">
                    <SearchablePicker
                      label={`Actif ${index + 1}`}
                      value={currentValue}
                      placeholder={`Actif ${index + 1}...`}
                      options={activePickerOptionsForIndex(index)}
                      emptyLabel="Remplis d'abord un slot d'équipe"
                      onChange={(value) => handleActivePickChange(index, value)}
                    />
                    {currentSlot?.species && currentPokemon ? (
                      <div className="active-pick-preview">
                        {currentPokemon.types.map((type) => (
                          <span className={`type-chip type-${type.toLowerCase()}`} key={type}>
                            {typeDisplayName(dataBundle.reference, type, locale)}
                          </span>
                        ))}
                        {currentSlot.ability ? (
                          <span>{abilityDisplayName(dataBundle.reference, currentSlot.ability, locale)}</span>
                        ) : null}
                        {currentSlot.teraType ? (
                          <span>Tera {typeDisplayName(dataBundle.reference, currentSlot.teraType, locale)}</span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
          {filledSlots.length > 0 ? (
            <section className="available-team" aria-label="Team disponible">
              <h3>Team disponible</h3>
              <div className="available-team-list">
                {filledSlots.map((slot) => {
                  const species = slot.species as string;
                  const pokemon = dataBundle.reference.pokemon[toId(species)];
                  const isActive = selectedSlots.includes(slot.id);

                  return (
                    <button
                      type="button"
                      className="available-team-chip"
                      data-active={isActive}
                      disabled={isActive || (!isActive && selectedSlots.length >= pickSize)}
                      onClick={() => {
                        if (isActive || selectedSlots.length >= pickSize) {
                          return;
                        }
                        setSelectedSlots((currentSlots) => [...currentSlots, slot.id].slice(0, pickSize));
                      }}
                      key={slot.id}
                    >
                      <span>{pokemonDisplayName(dataBundle.reference, species, locale)}</span>
                      {pokemon?.types.slice(0, 1).map((type) => (
                        <span className={`type-chip type-${type.toLowerCase()}`} key={type}>
                          {typeDisplayName(dataBundle.reference, type, locale)}
                        </span>
                      ))}
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}
          <button
            type="button"
            className={`mobile-primary-action ${canUseMatchTools ? 'success' : ''}`}
            disabled={activeReadyCount === 0}
            onClick={() => setActiveTab('match')}
          >
            Ouvrir le match
          </button>
        </section>
      ) : null}

      {activeTab === 'match' ? (
        <section className="mobile-screen" aria-label="Match mobile">
          <div className="match-active-strip" aria-label="Actifs sélectionnés">
            {Array.from({ length: pickSize }, (_, index) => {
              const slot = selectedSlots[index]
                ? builderState.slots.find((candidate) => candidate.id === selectedSlots[index])
                : undefined;
              return (
                <span className="match-active-chip" data-filled={Boolean(slot?.species)} key={index}>
                  {slot?.species ? pokemonDisplayName(dataBundle.reference, slot.species, locale) : `Actif ${index + 1}`}
                </span>
              );
            })}
          </div>
          <section className="match-header-panel">
            <div>
              <h2>Match rapide</h2>
              <p>{canUseMatchTools ? `Joués : ${selectedNames.join(', ')}` : `${readyLabel}. Ajoute les actifs manquants.`}</p>
            </div>
            {!canUseMatchTools ? (
              <button type="button" className="secondary-action" onClick={() => setActiveTab('active')}>
                Compléter les actifs
              </button>
            ) : null}
          </section>
          <OpponentTeamPanel
            format={format}
            selectedTeam={analysis.selectedTeam.members}
            reference={dataBundle.reference}
            locale={locale}
            combatSlots={combatSlots}
            onCombatSlotsChange={(nextSlots) => setCombatSlots(normalizeCombatSlots(format, nextSlots))}
          />
          <DeferredCombatCalculator
            format={format}
            selectedTeam={analysis.selectedTeam.members}
            reference={dataBundle.reference}
            locale={locale}
            opponents={combatSlots}
            onOpponentsChange={(nextSlots) => setCombatSlots(normalizeCombatSlots(format, nextSlots))}
          />
          <section className="panel selected-analysis">
            <h2>Plan de match</h2>
            <p>Joués : {selectedNames.join(', ') || 'aucun'}</p>
            {analysis.selectionWarnings.map((warning) => (
              <p className="warning" key={warning}>
                {warning}
              </p>
            ))}
          </section>
          <AuditPanel audit={analysis.selectedAudit} title="Couverture" />
          <ThreatPanel reference={dataBundle.reference} threats={analysis.selectedThreats} locale={locale} />
          <PossibleThreatPanel
            reference={dataBundle.reference}
            threats={analysis.selectedPossibleThreats}
            selectedCount={analysis.selectedTeam.members.length}
            pickSize={analysis.pickSize}
            locale={locale}
          />
          <AnalysisExport analysis={analysis} reference={dataBundle.reference} format={format} />
          <SnapshotStatus
            label={analysis.snapshotStatus.label}
            source={analysis.snapshotStatus.source}
            onRefresh={handleRefresh}
            refreshMessage={refreshMessage}
            isRefreshing={isRefreshing}
          />
        </section>
      ) : null}
    </main>
  );
}
