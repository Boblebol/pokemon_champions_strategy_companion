import { useMemo, useState } from 'react';
import { ItemIcon } from './ItemMedia';
import { PokemonAvatar } from './PokemonMedia';
import { SearchablePicker } from './SearchablePicker';
import type { BuilderSlot, TeamBuilderState } from '../domain/teamBuilder';
import { toId } from '../domain/ids';
import { localizedSearchText } from '../domain/localization';
import {
  EV_TOTAL_LIMIT,
  STAT_FIELDS,
  evTotal,
  hydrateSlotForPokemon,
  isStabMove,
  moveOptionsForSlot,
  natureEffectLabel,
} from '../domain/pokemonSlotInfo';
import {
  abilityDescription,
  abilityDisplayName,
  itemDescription,
  itemDisplayName,
  moveDisplayName,
  natureDescription,
  natureDisplayName,
  pokemonDisplayName,
  typeDisplayName,
} from '../domain/referenceDisplay';
import { POKEMON_TYPES } from '../domain/types';
import type {
  LocaleId,
  MoveCategory,
  MoveReference,
  PokemonReference,
  PokemonType,
  ReferenceSnapshot,
  StatId,
  StatTable,
} from '../domain/types';

const MOVE_CATEGORY_LABELS: Record<MoveCategory, Record<LocaleId, string>> = {
  Physical: { fr: 'Physique', en: 'Physical', ja: 'Physical' },
  Special: { fr: 'Spécial', en: 'Special', ja: 'Special' },
  Status: { fr: 'Statut', en: 'Status', ja: 'Status' },
};

const EV_PRESETS: Array<{ label: string; description: string; evs: StatTable }> = [
  {
    label: 'Attaquant physique rapide',
    description: 'Atk + Vitesse, 6 en HP',
    evs: { hp: 6, atk: 252, spe: 252 },
  },
  {
    label: 'Attaquant spécial rapide',
    description: 'SpA + Vitesse, 6 en HP',
    evs: { hp: 6, spa: 252, spe: 252 },
  },
  {
    label: 'Défensif physique',
    description: 'HP + Def, 6 en SpD',
    evs: { hp: 252, def: 252, spd: 6 },
  },
  {
    label: 'Défensif spécial',
    description: 'HP + SpD, 6 en Def',
    evs: { hp: 252, def: 6, spd: 252 },
  },
];

function numberInputValue(value: number | undefined): string {
  return typeof value === 'number' ? String(value) : '';
}

function nextEvs(evs: StatTable, stat: StatId, rawValue: string): StatTable {
  const parsed = Number(rawValue);
  const next = { ...evs };
  if (rawValue === '' || !Number.isFinite(parsed)) {
    delete next[stat];
  } else {
    next[stat] = Math.max(0, Math.min(252, parsed));
  }
  return next;
}

function replaceMove(moves: string[], index: number, move: string): string[] {
  return moves.map((currentMove, currentIndex) => (currentIndex === index ? move : currentMove));
}

function withCurrentOption(options: string[], currentValue: string | undefined): string[] {
  if (!currentValue || options.includes(currentValue)) {
    return options;
  }

  return [currentValue, ...options];
}

function findPokemon(pokemonOptions: PokemonReference[], species: string | undefined): PokemonReference | undefined {
  return pokemonOptions.find((pokemon) => pokemon.name === species);
}

function pokemonSearchText(pokemon: PokemonReference, locale: LocaleId): string {
  return localizedSearchText(pokemon.name, pokemon.localizedNames, locale);
}

function itemSearchText(reference: ReferenceSnapshot, item: string, locale: LocaleId): string {
  const itemReference = reference.itemDetails[toId(item)];
  return localizedSearchText(item, itemReference?.localizedNames, locale);
}

function moveSearchText(move: MoveReference, locale: LocaleId): string {
  return localizedSearchText(move.name, move.localizedNames, locale);
}

function moveStatValue(value: number | undefined): string {
  return typeof value === 'number' ? String(value) : '-';
}

function SelectedMoveRow({
  move,
  pokemon,
  reference,
  locale,
}: {
  move: MoveReference | undefined;
  pokemon: PokemonReference | undefined;
  reference: ReferenceSnapshot;
  locale: LocaleId;
}) {
  if (!move) {
    return null;
  }

  const moveType = typeDisplayName(reference, move.type, locale);
  const moveCategory = MOVE_CATEGORY_LABELS[move.category][locale];

  return (
    <div className="selected-move-row">
      <strong>{moveDisplayName(reference, move.name, locale)}</strong>
      <div>
        <span className={`type-chip type-${move.type.toLowerCase()}`}>{moveType}</span>
        <span className={`move-category-pill category-${move.category.toLowerCase()}`}>{moveCategory}</span>
        {isStabMove(move, pokemon) ? <span className="stab-chip">STAB</span> : null}
        <span>{moveStatValue(move.power)}</span>
        <span>{moveStatValue(move.accuracy)}%</span>
        <span>PP {moveStatValue(move.pp)}</span>
      </div>
    </div>
  );
}

function TeraChoiceGroup({
  slot,
  reference,
  locale,
  onSlotChange,
}: {
  slot: BuilderSlot;
  reference: ReferenceSnapshot;
  locale: LocaleId;
  onSlotChange: (slotId: number, patch: Partial<Omit<BuilderSlot, 'id'>>) => void;
}) {
  return (
    <fieldset className="tera-choice-group" aria-label={`Types Tera slot ${slot.id}`}>
      <legend>Tera</legend>
      <div className="tera-choice-list">
        {POKEMON_TYPES.map((type) => {
          const typeLabel = typeDisplayName(reference, type, locale);

          return (
            <button
              type="button"
              aria-pressed={slot.teraType === type}
              className="tera-choice"
              onClick={() => onSlotChange(slot.id, { teraType: type })}
              key={type}
            >
              <span className={`type-chip type-${type.toLowerCase()}`}>{typeLabel}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function TeamSlotRail({
  slots,
  activeSlotId,
  selectedSlots,
  pickSize,
  reference,
  locale,
  onActiveSlotChange,
}: {
  slots: BuilderSlot[];
  activeSlotId: number;
  selectedSlots: number[];
  pickSize: number;
  reference: ReferenceSnapshot;
  locale: LocaleId;
  onActiveSlotChange: (slotId: number) => void;
}) {
  return (
    <aside className="builder-summary" aria-label="Slots de l'équipe">
      <div className="summary-heading">
        <h3>Équipe de 6</h3>
        <span>
          {selectedSlots.length}/{pickSize} joués
        </span>
      </div>
      <div className="roster-summary-list">
        {slots.map((slot) => {
          const slotSelected = selectedSlots.includes(slot.id);
          const slotActive = slot.id === activeSlotId;
          const pokemon = slot.species ? reference.pokemon[toId(slot.species)] : undefined;
          const slotName = slot.species ? pokemonDisplayName(reference, slot.species, locale) : `S${slot.id}`;
          const evDone = evTotal(slot.evs) === EV_TOTAL_LIMIT;

          return (
            <button
              type="button"
              className={`roster-summary-card ${slotActive ? 'active' : ''}`}
              aria-label={`Modifier slot ${slot.id} ${slot.species ? slotName : 'Libre'}`}
              aria-pressed={slotActive}
              data-selected={slotSelected}
              data-filled={Boolean(slot.species)}
              data-ev-complete={evDone}
              onClick={() => onActiveSlotChange(slot.id)}
              key={slot.id}
            >
              {slot.species ? (
                <>
                  <span className="roster-summary-name">{slotName}</span>
                  <span className="roster-summary-types">
                    {pokemon?.types.slice(0, 1).map((type) => (
                      <span className={`type-chip type-${type.toLowerCase()}`} key={type}>
                        {typeDisplayName(reference, type, locale)}
                      </span>
                    ))}
                  </span>
                  {evDone && !slotActive ? <span className="roster-summary-complete" aria-hidden="true" /> : null}
                </>
              ) : (
                <span className="roster-summary-empty">S{slot.id}</span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function ActiveSlotSummary({
  slot,
  pokemon,
  reference,
  locale,
}: {
  slot: BuilderSlot;
  pokemon: PokemonReference | undefined;
  reference: ReferenceSnapshot;
  locale: LocaleId;
}) {
  return (
    <div className="builder-active-summary" aria-label={`Résumé slot ${slot.id}`}>
      <span className="builder-active-name">
        {slot.species ? pokemonDisplayName(reference, slot.species, locale) : `Slot ${slot.id}`}
      </span>
      {pokemon?.types.map((type) => (
        <span className={`type-chip type-${type.toLowerCase()}`} key={type}>
          {typeDisplayName(reference, type, locale)}
        </span>
      ))}
      {slot.ability ? <span className="builder-summary-pill">{abilityDisplayName(reference, slot.ability, locale)}</span> : null}
      {slot.item ? <span className="builder-summary-pill muted">{itemDisplayName(reference, slot.item, locale)}</span> : null}
    </div>
  );
}

function AbilityChoiceGroup({
  slot,
  pokemon,
  reference,
  locale,
  onSlotChange,
}: {
  slot: BuilderSlot;
  pokemon: PokemonReference | undefined;
  reference: ReferenceSnapshot;
  locale: LocaleId;
  onSlotChange: (slotId: number, patch: Partial<Omit<BuilderSlot, 'id'>>) => void;
}) {
  if (!pokemon || pokemon.abilities.length === 0) {
    return null;
  }

  const abilityOptions = withCurrentOption(pokemon.abilities, slot.ability);
  const selectedAbility = slot.ability ?? pokemon.abilities[0];

  return (
    <fieldset className="ability-choice-group" aria-label={`Talents slot ${slot.id}`}>
      <legend>Talent</legend>
      <div className="ability-choice-list">
        {abilityOptions.map((ability) => {
          const isSelected = selectedAbility === ability;
          const description = abilityDescription(reference, ability);

          return (
            <button
              type="button"
              className="ability-choice"
              aria-pressed={isSelected}
              onClick={() => onSlotChange(slot.id, { ability })}
              key={ability}
            >
              <strong>{abilityDisplayName(reference, ability, locale)}</strong>
              {description ? <span>{description}</span> : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function TeamBuilder({
  state,
  pokemonOptions,
  moveOptions,
  itemOptions,
  natureOptions,
  reference,
  locale,
  referenceStatus,
  referenceSource,
  selectedSlots,
  pickSize,
  onSlotChange,
  onToggleSelection,
}: {
  state: TeamBuilderState;
  pokemonOptions: PokemonReference[];
  moveOptions: MoveReference[];
  itemOptions: string[];
  natureOptions: string[];
  reference: ReferenceSnapshot;
  locale: LocaleId;
  referenceStatus: 'loading' | 'complete' | 'error';
  referenceSource: string;
  selectedSlots: number[];
  pickSize: number;
  onSlotChange: (slotId: number, patch: Partial<Omit<BuilderSlot, 'id'>>) => void;
  onToggleSelection: (slotId: number, selected: boolean) => void;
}) {
  const [activeSlotId, setActiveSlotId] = useState(1);
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);
  const activeSlot = state.slots.find((slot) => slot.id === activeSlotId) ?? state.slots[0];

  if (!activeSlot) {
    return null;
  }

  const isSelected = selectedSlots.includes(activeSlot.id);
  const cannotSelectMore = !isSelected && selectedSlots.length >= pickSize;
  const selectedPokemon = findPokemon(pokemonOptions, activeSlot.species);
  const activePokemonLabel = activeSlot.species
    ? pokemonDisplayName(reference, activeSlot.species, locale)
    : 'Choisir un Pokémon';
  const activeEvTotal = evTotal(activeSlot.evs);
  const remainingEvs = Math.max(0, EV_TOTAL_LIMIT - activeEvTotal);
  const activeNatureDescription = natureDescription(reference, activeSlot.nature);
  const activeNatureEffect = natureEffectLabel(activeSlot.nature, locale);
  const speciesSelectedInOtherSlots = useMemo(
    () =>
      new Set(
        state.slots.flatMap((slot) => (slot.id !== activeSlot.id && slot.species ? [slot.species] : [])),
      ),
    [activeSlot.id, state.slots],
  );
  const evStatus =
    activeEvTotal > EV_TOTAL_LIMIT
      ? `EV utilisés : ${activeEvTotal}/${EV_TOTAL_LIMIT} · baisse une stat.`
      : activeEvTotal === EV_TOTAL_LIMIT
        ? `EV utilisés : ${activeEvTotal}/${EV_TOTAL_LIMIT} · complet, les autres stats restent vides.`
        : `EV utilisés : ${activeEvTotal}/${EV_TOTAL_LIMIT} · reste ${remainingEvs}.`;
  const pokemonPickerOptions = useMemo(
    () =>
      pokemonOptions
        .filter((pokemon) => pokemon.name === activeSlot.species || !speciesSelectedInOtherSlots.has(pokemon.name))
        .map((pokemon) => ({
          value: pokemon.name,
          label: pokemonDisplayName(reference, pokemon.name, locale),
          searchText: pokemonSearchText(pokemon, locale),
          description: `Type : ${pokemon.types.map((type) => typeDisplayName(reference, type, locale)).join(' / ')}`,
          media: <PokemonAvatar reference={reference} species={pokemon.name} />,
        })),
    [activeSlot.species, locale, pokemonOptions, reference, speciesSelectedInOtherSlots],
  );
  const itemPickerOptions = useMemo(
    () =>
      withCurrentOption(itemOptions, activeSlot.item).map((item) => ({
        value: item,
        label: itemDisplayName(reference, item, locale),
        searchText: itemSearchText(reference, item, locale),
        description: itemDescription(reference, item),
        media: <ItemIcon reference={reference} item={item} />,
      })),
    [activeSlot.item, itemOptions, locale, reference],
  );
  const naturePickerOptions = useMemo(
    () =>
      withCurrentOption(natureOptions, activeSlot.nature).map((nature) => {
        const effect = natureEffectLabel(nature, locale);
        const description = natureDescription(reference, nature);

        return {
          value: nature,
          label: natureDisplayName(reference, nature, locale),
          searchText: `${nature} ${effect} ${description ?? ''}`,
          description: effect,
          media: <span className="nature-effect-token">{effect || 'neutre'}</span>,
          details: description ? <span>{description}</span> : undefined,
        };
      }),
    [activeSlot.nature, locale, natureOptions, reference],
  );
  const sourceLabel =
    referenceStatus === 'complete'
      ? 'Roster Showdown Champions'
      : referenceStatus === 'error'
        ? 'Source démo active'
        : 'Source démo, chargement complet';

  function movePickerOptionsForIndex(moveIndex: number) {
    return moveOptionsForSlot(activeSlot, selectedPokemon, moveOptions, moveIndex).map((moveOption) => {
      const moveType = typeDisplayName(reference, moveOption.type, locale);
      const moveCategory = MOVE_CATEGORY_LABELS[moveOption.category][locale];
      const isStab = isStabMove(moveOption, selectedPokemon);

      return {
        value: moveOption.name,
        label: moveDisplayName(reference, moveOption.name, locale),
        searchText: moveSearchText(moveOption, locale),
        description: `${moveType} · ${moveCategory}`,
        media: <span className={`type-chip type-${moveOption.type.toLowerCase()}`}>{moveType}</span>,
        details: (
          <span className="move-result-details">
            <span className={`move-category-pill category-${moveOption.category.toLowerCase()}`}>{moveCategory}</span>
            {isStab ? <span className="stab-chip">STAB</span> : null}
            <span>Puissance {moveStatValue(moveOption.power)}</span>
            <span>Précision {moveStatValue(moveOption.accuracy)}</span>
            <span>PP {moveStatValue(moveOption.pp)}</span>
          </span>
        ),
      };
    });
  }

  return (
    <section className="panel team-builder" id="builder">
      <div className="panel-heading">
        <div>
          <h2>Build rapide</h2>
          <p>Cherche le Pokémon, l'objet et les attaques. Les réglages avancés restent dans les détails.</p>
          <p className="builder-source">
            {sourceLabel} : {referenceSource} · {pokemonOptions.length} Pokémon · {moveOptions.length} attaques
          </p>
        </div>
      </div>
      <div className="builder-workspace">
        <TeamSlotRail
          slots={state.slots}
          activeSlotId={activeSlot.id}
          selectedSlots={selectedSlots}
          pickSize={pickSize}
          reference={reference}
          locale={locale}
          onActiveSlotChange={setActiveSlotId}
        />

        <ActiveSlotSummary
          slot={activeSlot}
          pokemon={selectedPokemon}
          reference={reference}
          locale={locale}
        />

        <article className={`builder-slot builder-slot-editor ${isSelected ? 'selected' : ''}`}>
          <div className="slot-header">
            <div className="slot-title">
              <PokemonAvatar reference={reference} species={activeSlot.species} variant="artwork" />
              <div>
                <strong>{activePokemonLabel}</strong>
                <span>{activeSlot.species ? `Nom export : ${activeSlot.species}` : `Slot ${activeSlot.id}`}</span>
              </div>
            </div>
            <label className="pick-toggle">
              <input
                type="checkbox"
                checked={isSelected}
                disabled={cannotSelectMore}
                onChange={(event) => onToggleSelection(activeSlot.id, event.target.checked)}
              />
              Jouer slot {activeSlot.id}
            </label>
          </div>

          <div className="pokemon-search-row">
            <SearchablePicker
              label={`Slot ${activeSlot.id} Pokémon`}
              value={activeSlot.species}
              placeholder="Rechercher un Pokémon..."
              options={pokemonPickerOptions}
              emptyLabel="Aucun Pokémon trouvé"
              onChange={(value) => {
                const nextPokemon = findPokemon(pokemonOptions, value);

                return onSlotChange(activeSlot.id, hydrateSlotForPokemon(nextPokemon, natureOptions));
              }}
            />
            {selectedPokemon ? (
              <div className="pokemon-search-types" aria-label={`Types ${activePokemonLabel}`}>
                {selectedPokemon.types.map((type) => (
                  <span className={`type-chip type-${type.toLowerCase()}`} key={type}>
                    {typeDisplayName(reference, type, locale)}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <AbilityChoiceGroup
            slot={activeSlot}
            pokemon={selectedPokemon}
            reference={reference}
            locale={locale}
            onSlotChange={onSlotChange}
          />

          <div className="slot-basics">
            <SearchablePicker
              label={`Slot ${activeSlot.id} Objet`}
              value={activeSlot.item}
              placeholder="Chercher un objet en français"
              options={itemPickerOptions}
              emptyLabel="Aucun objet trouvé"
              onChange={(value) => onSlotChange(activeSlot.id, { item: value })}
            />
          </div>

          <div className="move-grid">
            {activeSlot.moves.map((move, index) => {
              const selectedMove = moveOptions.find((moveOption) => moveOption.name === move);

              return (
                <div className="move-picker-stack" key={`${activeSlot.id}-${index}`}>
                  <SearchablePicker
                    label={`Slot ${activeSlot.id} Attaque ${index + 1}`}
                    value={move || undefined}
                    placeholder={selectedPokemon ? `Attaque ${index + 1}...` : "Choisis d'abord un Pokémon"}
                    options={selectedPokemon ? movePickerOptionsForIndex(index) : []}
                    emptyLabel="Aucune attaque trouvée"
                    onChange={(value) =>
                      onSlotChange(activeSlot.id, {
                        moves: replaceMove(activeSlot.moves, index, value ?? ''),
                      })
                    }
                  />
                  <SelectedMoveRow
                    move={selectedMove}
                    pokemon={selectedPokemon}
                    reference={reference}
                    locale={locale}
                  />
                </div>
              );
            })}
          </div>

          <section
            className="slot-advanced-details"
            data-open={showAdvancedDetails}
          >
            <button
              type="button"
              className="slot-details-summary"
              aria-expanded={showAdvancedDetails}
              aria-label={`Détails avancés slot ${activeSlot.id}`}
              onClick={() => setShowAdvancedDetails((currentValue) => !currentValue)}
            >
              <span className="slot-details-chevron" aria-hidden="true" />
              <span>Détails avancés</span>
              <span className="slot-details-badges">
                {activeSlot.nature ? (
                  <span>Nature : {natureDisplayName(reference, activeSlot.nature, locale)}</span>
                ) : null}
                {activeSlot.teraType ? (
                  <span>Tera {typeDisplayName(reference, activeSlot.teraType, locale)}</span>
                ) : null}
                <span>{activeEvTotal}/{EV_TOTAL_LIMIT} EV</span>
              </span>
            </button>
            {showAdvancedDetails ? (
              <>
                <div className="slot-details-section advanced-slot-basics">
                  <div className="slot-detail-block nature-field">
                    <span className="slot-detail-label">Nature</span>
                    <SearchablePicker
                      label={`Slot ${activeSlot.id} Nature`}
                      value={activeSlot.nature}
                      placeholder="Chercher une nature"
                      options={naturePickerOptions}
                      emptyLabel="Aucune nature trouvée"
                      onChange={(value) => onSlotChange(activeSlot.id, { nature: value })}
                    />
                  </div>
                  <TeraChoiceGroup
                    slot={activeSlot}
                    reference={reference}
                    locale={locale}
                    onSlotChange={onSlotChange}
                  />
                </div>

                <section className="ev-helper" aria-label={`Aide EV slot ${activeSlot.id}`}>
                  <span className="slot-detail-label">EV</span>
                  <div className="ev-helper-heading">
                    <div>
                      <strong>Points d'entraînement (EV)</strong>
                      <small>Choisis un modèle 252 / 252 / 6. Les stats non remplies valent 0.</small>
                      {activeSlot.nature ? (
                        <small className="ev-nature-note">
                          Nature : {natureDisplayName(reference, activeSlot.nature, locale)}
                          {activeNatureEffect ? ` (${activeNatureEffect})` : ''}
                        </small>
                      ) : null}
                    </div>
                    <div className="ev-status-stack">
                      <strong className={activeEvTotal > EV_TOTAL_LIMIT ? 'ev-total-pill warning' : 'ev-total-pill'}>
                        {activeEvTotal}/{EV_TOTAL_LIMIT} EV
                      </strong>
                      <span
                        className={activeEvTotal > EV_TOTAL_LIMIT ? 'ev-status warning' : 'ev-status'}
                        aria-live="polite"
                      >
                        {evStatus}
                      </span>
                    </div>
                  </div>
                  <div
                    className="ev-progress"
                    role="progressbar"
                    aria-label={`Progression EV slot ${activeSlot.id}`}
                    aria-valuemin={0}
                    aria-valuemax={EV_TOTAL_LIMIT}
                    aria-valuenow={Math.min(activeEvTotal, EV_TOTAL_LIMIT)}
                  >
                    <span style={{ width: `${Math.min((activeEvTotal / EV_TOTAL_LIMIT) * 100, 100)}%` }} />
                  </div>
                  <div className="ev-preset-list" aria-label={`Modèles EV slot ${activeSlot.id}`}>
                    {EV_PRESETS.map((preset) => (
                      <button
                        type="button"
                        key={preset.label}
                        className="ev-preset-button"
                        onClick={() => onSlotChange(activeSlot.id, { evs: preset.evs })}
                      >
                        <strong>{preset.label}</strong>
                        <small>{preset.description}</small>
                      </button>
                    ))}
                    <button
                      type="button"
                      className="ev-preset-button subtle"
                      onClick={() => onSlotChange(activeSlot.id, { evs: {} })}
                    >
                      <strong>Vider les EV</strong>
                      <small>Remet toutes les stats à vide</small>
                    </button>
                  </div>
                </section>

                <div className="ev-grid">
                  {STAT_FIELDS.map((stat) => (
                    <label className="field compact-field" key={stat.id}>
                      <span>
                        Slot {activeSlot.id} EV {stat.label}
                      </span>
                      <input
                        inputMode="numeric"
                        min="0"
                        max="252"
                        type="number"
                        value={numberInputValue(activeSlot.evs[stat.id])}
                        onChange={(event) =>
                          onSlotChange(activeSlot.id, {
                            evs: nextEvs(activeSlot.evs, stat.id, event.target.value),
                          })
                        }
                      />
                    </label>
                  ))}
                </div>

                <label className="field">
                  <span className="slot-detail-label">Note</span>
                  <textarea
                    aria-label={`Commentaire slot ${activeSlot.id}`}
                    className="slot-comment"
                    value={activeSlot.comment}
                    onChange={(event) => onSlotChange(activeSlot.id, { comment: event.target.value })}
                  />
                </label>
              </>
            ) : null}
          </section>
        </article>
      </div>
    </section>
  );
}
