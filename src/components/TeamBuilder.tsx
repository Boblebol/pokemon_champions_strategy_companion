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

const ITEM_OPTIONS = [
  'Booster Energy',
  'Black Glasses',
  'Clear Amulet',
  'Choice Band',
  'Choice Scarf',
  'Choice Specs',
  'Covert Cloak',
  'Eject Button',
  'Expert Belt',
  'Focus Sash',
  'Heavy-Duty Boots',
  'Life Orb',
  'Leftovers',
  'Loaded Dice',
  'Lum Berry',
  'Mystic Water',
  'Rocky Helmet',
  'Safety Goggles',
  'Sitrus Berry',
  'Throat Spray',
  'Weakness Policy',
];

const NATURE_OPTIONS = [
  'Adamant',
  'Bashful',
  'Bold',
  'Brave',
  'Calm',
  'Careful',
  'Docile',
  'Gentle',
  'Hardy',
  'Hasty',
  'Impish',
  'Jolly',
  'Lax',
  'Lonely',
  'Mild',
  'Modest',
  'Naive',
  'Naughty',
  'Quiet',
  'Quirky',
  'Rash',
  'Relaxed',
  'Sassy',
  'Serious',
  'Timid',
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
    <section className="panel team-builder" id="builder">
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
          const selectedPokemon = findPokemon(pokemonOptions, slot.species);
          const abilityOptions = withCurrentOption(selectedPokemon?.abilities ?? [], slot.ability);
          const filteredMoveOptions = moveOptionsForSlot(slot, selectedPokemon, moveOptions);

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
                  onChange={(event) =>
                    onSlotChange(slot.id, {
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
                  <span>Slot {slot.id} Objet</span>
                  <select
                    value={slot.item ?? ''}
                    onChange={(event) => onSlotChange(slot.id, { item: event.target.value || undefined })}
                  >
                    <option value="">Choisir</option>
                    {withCurrentOption(ITEM_OPTIONS, slot.item).map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Slot {slot.id} Talent</span>
                  <select
                    value={slot.ability ?? ''}
                    disabled={!selectedPokemon}
                    onChange={(event) => onSlotChange(slot.id, { ability: event.target.value || undefined })}
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
                  <span>Slot {slot.id} Type Tera</span>
                  <select
                    value={slot.teraType ?? ''}
                    onChange={(event) =>
                      onSlotChange(slot.id, { teraType: (event.target.value || undefined) as PokemonType | undefined })
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
                  <span>Slot {slot.id} Nature</span>
                  <select
                    value={slot.nature ?? ''}
                    onChange={(event) => onSlotChange(slot.id, { nature: event.target.value || undefined })}
                  >
                    <option value="">Choisir</option>
                    {withCurrentOption(NATURE_OPTIONS, slot.nature).map((nature) => (
                      <option key={nature} value={nature}>
                        {nature}
                      </option>
                    ))}
                  </select>
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
                      disabled={!selectedPokemon}
                      onChange={(event) => onSlotChange(slot.id, { moves: replaceMove(slot.moves, index, event.target.value) })}
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
