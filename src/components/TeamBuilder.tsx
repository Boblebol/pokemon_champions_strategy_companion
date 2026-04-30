import { useState } from 'react';
import type { BuilderSlot, TeamBuilderState } from '../domain/teamBuilder';
import { POKEMON_TYPES } from '../domain/types';
import type { MoveReference, PokemonReference, PokemonType, StatId, StatTable } from '../domain/types';

const STAT_FIELDS: Array<{ id: StatId; label: string }> = [
  { id: 'hp', label: 'HP' },
  { id: 'atk', label: 'Atk' },
  { id: 'def', label: 'Def' },
  { id: 'spa', label: 'SpA' },
  { id: 'spd', label: 'SpD' },
  { id: 'spe', label: 'Spe' },
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
          <p>Sélection de match : {pickSize} Pokémon à choisir depuis le roster de 6.</p>
          <p className="builder-source">
            {sourceLabel} : {referenceSource} · {pokemonOptions.length} Pokémon · {moveOptions.length} attaques
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
              <strong>Roster</strong>
              <small>{completedSlots}/6 slots remplis</small>
            </li>
            <li className={activeSlot.species ? 'funnel-step active' : 'funnel-step'}>
              <span>3</span>
              <strong>Set actif</strong>
              <small>Slot {activeSlot.id}</small>
            </li>
            <li className={selectedSlots.length === pickSize ? 'funnel-step done' : 'funnel-step active'}>
              <span>4</span>
              <strong>Pick match</strong>
              <small>
                {selectedSlots.length}/{pickSize} choisis
              </small>
            </li>
            <li className="funnel-step">
              <span>5</span>
              <strong>Analyse</strong>
              <small>Faiblesses et méta</small>
            </li>
          </ol>
        </aside>

        <article className={`builder-slot builder-slot-editor ${isSelected ? 'selected' : ''}`}>
          <div className="slot-header">
            <div>
              <strong>Slot {activeSlot.id}</strong>
              <span>{activeSlot.species ?? 'Choisir un Pokémon'}</span>
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

          <label className="field">
            <span>Slot {activeSlot.id} Pokémon</span>
            <select
              value={activeSlot.species ?? ''}
              onChange={(event) =>
                onSlotChange(activeSlot.id, {
                  species: event.target.value || undefined,
                  ability: undefined,
                  teraType: undefined,
                  moves: ['', '', '', ''],
                })
              }
            >
              <option value="">Choisir</option>
              {pokemonOptions.map((pokemon) => (
                <option key={pokemon.id} value={pokemon.name}>
                  {pokemon.name}
                </option>
              ))}
            </select>
          </label>

          <div className="slot-basics">
            <label className="field">
              <span>Slot {activeSlot.id} Objet</span>
              <select
                value={activeSlot.item ?? ''}
                onChange={(event) => onSlotChange(activeSlot.id, { item: event.target.value || undefined })}
              >
                <option value="">Choisir</option>
                {withCurrentOption(itemOptions, activeSlot.item).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
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
                    {ability}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Slot {activeSlot.id} Type Tera</span>
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
                    {type}
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
                    {nature}
                  </option>
                ))}
              </select>
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
                      {moveOption.name}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

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

        <aside className="builder-summary" aria-label="Résumé du roster">
          <div className="summary-heading">
            <h3>Roster</h3>
            <span>
              {selectedSlots.length}/{pickSize} joués
            </span>
          </div>
          <div className="roster-summary-list">
            {state.slots.map((slot) => {
              const slotSelected = selectedSlots.includes(slot.id);
              const slotActive = slot.id === activeSlot.id;

              return (
                <article className={`roster-summary-card ${slotActive ? 'active' : ''}`} key={slot.id}>
                  <div>
                    <strong>Slot {slot.id}</strong>
                    <span>{slot.species ?? 'Libre'}</span>
                    <small>{slotSelected ? 'Pick match' : 'Roster'}</small>
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
