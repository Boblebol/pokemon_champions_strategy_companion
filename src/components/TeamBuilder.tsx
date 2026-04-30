import type { BuilderSlot, TeamBuilderState } from '../domain/teamBuilder';
import type { MoveReference, PokemonReference, StatId, StatTable } from '../domain/types';

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

export function TeamBuilder({
  state,
  pokemonOptions,
  moveOptions,
  selectedSlots,
  pickSize,
  onSlotChange,
  onToggleSelection,
}: {
  state: TeamBuilderState;
  pokemonOptions: PokemonReference[];
  moveOptions: MoveReference[];
  selectedSlots: number[];
  pickSize: number;
  onSlotChange: (slotId: number, patch: Partial<Omit<BuilderSlot, 'id'>>) => void;
  onToggleSelection: (slotId: number, selected: boolean) => void;
}) {
  return (
    <section className="panel team-builder">
      <div className="panel-heading">
        <div>
          <h2>Constructeur d'équipe</h2>
          <p>Sélection de match : {pickSize} Pokémon à choisir depuis le roster de 6.</p>
        </div>
      </div>
      <div className="builder-grid">
        {state.slots.map((slot) => {
          const isSelected = selectedSlots.includes(slot.id);
          const cannotSelectMore = !isSelected && selectedSlots.length >= pickSize;

          return (
            <article className={`builder-slot ${isSelected ? 'selected' : ''}`} key={slot.id}>
              <div className="slot-header">
                <strong>Slot {slot.id}</strong>
                <label className="pick-toggle">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={cannotSelectMore}
                    onChange={(event) => onToggleSelection(slot.id, event.target.checked)}
                  />
                  Jouer slot {slot.id}
                </label>
              </div>

              <label className="field">
                <span>Slot {slot.id} Pokémon</span>
                <select
                  value={slot.species ?? ''}
                  onChange={(event) => onSlotChange(slot.id, { species: event.target.value || undefined })}
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
                  <span>Slot {slot.id} Objet</span>
                  <input
                    value={slot.item ?? ''}
                    onChange={(event) => onSlotChange(slot.id, { item: event.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Slot {slot.id} Talent</span>
                  <input
                    value={slot.ability ?? ''}
                    onChange={(event) => onSlotChange(slot.id, { ability: event.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Slot {slot.id} Nature</span>
                  <input
                    value={slot.nature ?? ''}
                    onChange={(event) => onSlotChange(slot.id, { nature: event.target.value })}
                  />
                </label>
              </div>

              <div className="move-grid">
                {slot.moves.map((move, index) => (
                  <label className="field" key={`${slot.id}-${index}`}>
                    <span>
                      Slot {slot.id} Attaque {index + 1}
                    </span>
                    <select
                      value={move}
                      onChange={(event) => onSlotChange(slot.id, { moves: replaceMove(slot.moves, index, event.target.value) })}
                    >
                      <option value="">Choisir</option>
                      {moveOptions.map((moveOption) => (
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
                      Slot {slot.id} EV {stat.label}
                    </span>
                    <input
                      inputMode="numeric"
                      min="0"
                      max="252"
                      type="number"
                      value={numberInputValue(slot.evs[stat.id])}
                      onChange={(event) => onSlotChange(slot.id, { evs: nextEvs(slot.evs, stat.id, event.target.value) })}
                    />
                  </label>
                ))}
              </div>

              <label className="field">
                <span>Commentaire slot {slot.id}</span>
                <textarea
                  className="slot-comment"
                  value={slot.comment}
                  onChange={(event) => onSlotChange(slot.id, { comment: event.target.value })}
                />
              </label>
            </article>
          );
        })}
      </div>
    </section>
  );
}
