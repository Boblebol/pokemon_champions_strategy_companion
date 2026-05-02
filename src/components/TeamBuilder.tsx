import { useMemo, useState } from 'react';
import { ItemIcon } from './ItemMedia';
import { PokemonAvatar } from './PokemonMedia';
import { SearchablePicker } from './SearchablePicker';
import type { BuilderSlot, TeamBuilderState } from '../domain/teamBuilder';
import { toId } from '../domain/ids';
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
import type { MoveReference, PokemonReference, PokemonType, ReferenceSnapshot, StatId, StatTable } from '../domain/types';

const STAT_FIELDS: Array<{ id: StatId; label: string }> = [
  { id: 'hp', label: 'HP' },
  { id: 'atk', label: 'Atk' },
  { id: 'def', label: 'Def' },
  { id: 'spa', label: 'SpA' },
  { id: 'spd', label: 'SpD' },
  { id: 'spe', label: 'Spe' },
];

const EV_TOTAL_LIMIT = 510;

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

function evTotal(evs: StatTable): number {
  return STAT_FIELDS.reduce((total, stat) => total + (evs[stat.id] ?? 0), 0);
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

function pokemonSearchText(pokemon: PokemonReference): string {
  return [pokemon.name, pokemon.localizedNames?.fr, pokemon.localizedNames?.en, pokemon.localizedNames?.ja]
    .filter(Boolean)
    .join(' ');
}

function itemSearchText(reference: ReferenceSnapshot, item: string): string {
  const itemReference = reference.itemDetails[toId(item)];
  return [item, itemReference?.localizedNames?.fr, itemReference?.localizedNames?.en, itemReference?.localizedNames?.ja]
    .filter(Boolean)
    .join(' ');
}

function moveOptionsForSlot(
  slot: BuilderSlot,
  pokemon: PokemonReference | undefined,
  moveOptions: MoveReference[],
): MoveReference[] {
  const allowedMoveIds = new Set(pokemon?.moveIds ?? []);
  const currentMoves = new Set(slot.moves.filter(Boolean));

  return moveOptions.filter((move) => allowedMoveIds.has(move.id) || currentMoves.has(move.name));
}

export function TeamBuilder({
  state,
  pokemonOptions,
  moveOptions,
  itemOptions,
  natureOptions,
  reference,
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
  referenceStatus: 'loading' | 'complete' | 'error';
  referenceSource: string;
  selectedSlots: number[];
  pickSize: number;
  onSlotChange: (slotId: number, patch: Partial<Omit<BuilderSlot, 'id'>>) => void;
  onToggleSelection: (slotId: number, selected: boolean) => void;
}) {
  const [activeSlotId, setActiveSlotId] = useState(1);
  const activeSlot = state.slots.find((slot) => slot.id === activeSlotId) ?? state.slots[0];

  if (!activeSlot) {
    return null;
  }

  const completedSlots = state.slots.filter((slot) => Boolean(slot.species)).length;
  const isSelected = selectedSlots.includes(activeSlot.id);
  const cannotSelectMore = !isSelected && selectedSlots.length >= pickSize;
  const selectedPokemon = findPokemon(pokemonOptions, activeSlot.species);
  const abilityOptions = withCurrentOption(selectedPokemon?.abilities ?? [], activeSlot.ability);
  const filteredMoveOptions = moveOptionsForSlot(activeSlot, selectedPokemon, moveOptions);
  const activePokemonLabel = activeSlot.species ? pokemonDisplayName(reference, activeSlot.species) : 'Choisir un Pokémon';
  const activeEvTotal = evTotal(activeSlot.evs);
  const remainingEvs = Math.max(0, EV_TOTAL_LIMIT - activeEvTotal);
  const activeAbilityDescription = abilityDescription(reference, activeSlot.ability);
  const activeNatureDescription = natureDescription(reference, activeSlot.nature);
  const evStatus =
    activeEvTotal > EV_TOTAL_LIMIT
      ? `EV utilisés : ${activeEvTotal}/${EV_TOTAL_LIMIT} · baisse une stat.`
      : activeEvTotal === EV_TOTAL_LIMIT
        ? `EV utilisés : ${activeEvTotal}/${EV_TOTAL_LIMIT} · complet, les autres stats restent vides.`
        : `EV utilisés : ${activeEvTotal}/${EV_TOTAL_LIMIT} · reste ${remainingEvs}.`;
  const pokemonPickerOptions = useMemo(
    () =>
      pokemonOptions.map((pokemon) => ({
        value: pokemon.name,
        label: pokemonDisplayName(reference, pokemon.name),
        searchText: pokemonSearchText(pokemon),
        description: `Type : ${pokemon.types.map((type) => typeDisplayName(reference, type)).join(' / ')}`,
        media: <PokemonAvatar reference={reference} species={pokemon.name} />,
      })),
    [pokemonOptions, reference],
  );
  const itemPickerOptions = useMemo(
    () =>
      withCurrentOption(itemOptions, activeSlot.item).map((item) => ({
        value: item,
        label: itemDisplayName(reference, item),
        searchText: itemSearchText(reference, item),
        description: itemDescription(reference, item),
        media: <ItemIcon reference={reference} item={item} />,
      })),
    [activeSlot.item, itemOptions, reference],
  );
  const sourceLabel =
    referenceStatus === 'complete'
      ? 'Source complète'
      : referenceStatus === 'error'
        ? 'Source démo active'
        : 'Source démo, chargement complet';

  return (
    <section className="panel team-builder" id="builder">
      <div className="panel-heading">
        <div>
          <h2>Constructeur d'équipe</h2>
          <p>Sélection de match : choisis {pickSize} Pokémon parmi ton équipe de 6.</p>
          <p className="builder-source">
            {sourceLabel} : {referenceSource} · {pokemonOptions.length} Pokémon · {moveOptions.length} attaques ·
            labels FR
          </p>
        </div>
      </div>
      <div className="builder-workspace">
        <aside className="builder-funnel" aria-label="Étapes constructeur">
          <h3>Étapes constructeur</h3>
          <ol>
            <li className="funnel-step done">
              <span>1</span>
              <strong>Format</strong>
              <small>{pickSize} Pokémon joués</small>
            </li>
            <li className={completedSlots > 0 ? 'funnel-step done' : 'funnel-step'}>
              <span>2</span>
              <strong>Équipe</strong>
              <small>{completedSlots}/6 slots remplis</small>
            </li>
            <li className={activeSlot.species ? 'funnel-step active' : 'funnel-step'}>
              <span>3</span>
              <strong>Fiche active</strong>
              <small>Slot {activeSlot.id}</small>
            </li>
            <li className={selectedSlots.length === pickSize ? 'funnel-step done' : 'funnel-step active'}>
              <span>4</span>
              <strong>Sélection match</strong>
              <small>
                {selectedSlots.length}/{pickSize} choisis
              </small>
            </li>
            <li className="funnel-step">
              <span>5</span>
              <strong>Analyse</strong>
              <small>Points faibles et adversaires dangereux</small>
            </li>
          </ol>
        </aside>

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

          <SearchablePicker
            label={`Slot ${activeSlot.id} Pokémon`}
            value={activeSlot.species}
            placeholder="Chercher un Pokémon en français"
            options={pokemonPickerOptions}
            emptyLabel="Aucun Pokémon trouvé"
            onChange={(value) =>
              onSlotChange(activeSlot.id, {
                species: value,
                ability: undefined,
                teraType: undefined,
                moves: ['', '', '', ''],
              })
            }
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
            <label className="field">
              <span>Slot {activeSlot.id} Talent</span>
              <select
                value={activeSlot.ability ?? ''}
                disabled={!selectedPokemon}
                onChange={(event) => onSlotChange(activeSlot.id, { ability: event.target.value || undefined })}
              >
                <option value="">Choisir</option>
                {abilityOptions.map((ability) => (
                  <option key={ability} value={ability}>
                    {abilityDisplayName(reference, ability)}
                  </option>
                ))}
              </select>
              {activeAbilityDescription ? <small className="field-help">{activeAbilityDescription}</small> : null}
            </label>
            <label className="field">
              <span>Slot {activeSlot.id} Téracristallisation (Type Tera)</span>
              <select
                value={activeSlot.teraType ?? ''}
                onChange={(event) =>
                  onSlotChange(activeSlot.id, {
                    teraType: (event.target.value || undefined) as PokemonType | undefined,
                  })
                }
              >
                <option value="">Choisir</option>
                {POKEMON_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {typeDisplayName(reference, type)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Slot {activeSlot.id} Nature</span>
              <select
                value={activeSlot.nature ?? ''}
                onChange={(event) => onSlotChange(activeSlot.id, { nature: event.target.value || undefined })}
              >
                <option value="">Choisir</option>
                {withCurrentOption(natureOptions, activeSlot.nature).map((nature) => (
                  <option key={nature} value={nature}>
                    {natureDisplayName(reference, nature)}
                  </option>
                ))}
              </select>
              {activeNatureDescription ? <small className="field-help">{activeNatureDescription}</small> : null}
            </label>
          </div>

          <div className="move-grid">
            {activeSlot.moves.map((move, index) => (
              <label className="field" key={`${activeSlot.id}-${index}`}>
                <span>
                  Slot {activeSlot.id} Attaque {index + 1}
                </span>
                <select
                  value={move}
                  disabled={!selectedPokemon}
                  onChange={(event) =>
                    onSlotChange(activeSlot.id, {
                      moves: replaceMove(activeSlot.moves, index, event.target.value),
                    })
                  }
                >
                  <option value="">Choisir</option>
                  {filteredMoveOptions.map((moveOption) => (
                    <option key={moveOption.id} value={moveOption.name}>
                      {moveDisplayName(reference, moveOption.name)}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <section className="ev-helper" aria-label={`Aide EV slot ${activeSlot.id}`}>
            <div className="ev-helper-heading">
              <div>
                <strong>Points d'entraînement (EV)</strong>
                <small>Choisis un modèle 252 / 252 / 6. Les stats non remplies valent 0.</small>
              </div>
              <span className={activeEvTotal > EV_TOTAL_LIMIT ? 'ev-status warning' : 'ev-status'} aria-live="polite">
                {evStatus}
              </span>
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
            <span>Commentaire slot {activeSlot.id}</span>
            <textarea
              className="slot-comment"
              value={activeSlot.comment}
              onChange={(event) => onSlotChange(activeSlot.id, { comment: event.target.value })}
            />
          </label>
        </article>

        <aside className="builder-summary" aria-label="Résumé de l'équipe">
          <div className="summary-heading">
            <h3>Équipe de 6</h3>
            <span>
              {selectedSlots.length}/{pickSize} joués
            </span>
          </div>
          <div className="roster-summary-list">
            {state.slots.map((slot) => {
              const slotSelected = selectedSlots.includes(slot.id);
              const slotActive = slot.id === activeSlot.id;

              return (
                <article
                  className={`roster-summary-card ${slotActive ? 'active' : ''}`}
                  data-selected={slotSelected}
                  data-filled={Boolean(slot.species)}
                  key={slot.id}
                >
                  <div className="roster-summary-main">
                    <PokemonAvatar reference={reference} species={slot.species} />
                    <div>
                      <strong>Slot {slot.id}</strong>
                      <span>{slot.species ? pokemonDisplayName(reference, slot.species) : 'Libre'}</span>
                      <small>{slotSelected ? 'Joué au match' : 'Dans l’équipe'}</small>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="slot-edit-button"
                    aria-pressed={slotActive}
                    onClick={() => setActiveSlotId(slot.id)}
                  >
                    Modifier slot {slot.id}
                  </button>
                </article>
              );
            })}
          </div>
        </aside>
      </div>
    </section>
  );
}
