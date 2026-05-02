import { useEffect, useMemo, useState } from 'react';
import {
  calculateCombatScenario,
  createDefaultCombatState,
  searchCombatPokemon,
} from '../domain/damageCalculator';
import { moveDisplayName, pokemonDisplayName } from '../domain/referenceDisplay';
import type { CombatOpponent, CombatPokemonModifiers, CombatState } from '../domain/damageCalculator';
import type { FormatId, ReferenceSnapshot, StatId, TeamMember } from '../domain/types';
import { PokemonAvatar } from './PokemonMedia';

const BOOST_STATS: Array<Exclude<StatId, 'hp'>> = ['atk', 'def', 'spa', 'spd', 'spe'];
const ADVANCED_CONTROLS_ID = 'combat-advanced-controls';

const WEATHER_OPTIONS: Array<{ value: CombatState['weather']; label: string }> = [
  { value: 'none', label: 'Aucune' },
  { value: 'Sun', label: 'Soleil' },
  { value: 'Rain', label: 'Pluie' },
  { value: 'Sand', label: 'Tempête de sable' },
  { value: 'Hail', label: 'Grêle' },
  { value: 'Snow', label: 'Neige' },
];

const TERRAIN_OPTIONS: Array<{ value: CombatState['terrain']; label: string }> = [
  { value: 'none', label: 'Aucun' },
  { value: 'Electric', label: 'Électrique' },
  { value: 'Grassy', label: 'Herbu' },
  { value: 'Misty', label: 'Brumeux' },
  { value: 'Psychic', label: 'Psychique' },
];

function replaceOpponent(opponents: CombatOpponent[], id: string, patch: Partial<CombatOpponent>): CombatOpponent[] {
  return opponents.map((opponent) => (opponent.id === id ? { ...opponent, ...patch } : opponent));
}

function clampBoost(rawValue: string): number {
  const value = Number(rawValue);
  return Number.isFinite(value) ? Math.max(-6, Math.min(6, value)) : 0;
}

function updateModifiers<T extends string | number>(
  modifiers: Record<T, CombatPokemonModifiers>,
  id: T,
  patch: CombatPokemonModifiers,
) {
  return { ...modifiers, [id]: { ...modifiers[id], ...patch } };
}

function stateKey(format: FormatId, selectedTeam: TeamMember[]): string {
  return `${format}:${selectedTeam.map((member) => `${member.slot}:${member.species}`).join('|')}`;
}

function countActiveSideConditions(side: CombatState['friendlySide']): number {
  return Object.values(side).filter(Boolean).length;
}

function countActiveModifiers(modifiers: CombatPokemonModifiers | undefined): number {
  if (!modifiers) {
    return 0;
  }

  const activeBoosts = Object.values(modifiers.boosts ?? {}).filter((boost) => boost !== 0).length;
  const activeFlags = [modifiers.teraActive, modifiers.burned, modifiers.criticalHit].filter(Boolean).length;

  return activeBoosts + activeFlags;
}

function opponentAdvancedControlsId(opponentId: string): string {
  return `combat-opponent-advanced-controls-${opponentId}`;
}

function ScreenControls({
  title,
  side,
  onChange,
}: {
  title: string;
  side: CombatState['friendlySide'];
  onChange: (patch: Partial<CombatState['friendlySide']>) => void;
}) {
  return (
    <div className="combat-screen-group">
      <h4>{title}</h4>
      {[
        ['reflect', 'Mur physique'],
        ['lightScreen', 'Mur spécial'],
        ['auroraVeil', 'Voile Aurore'],
      ].map(([key, label]) => (
        <label className="toggle-line" key={key}>
          <input
            type="checkbox"
            checked={Boolean(side[key as keyof typeof side])}
            onChange={(event) => onChange({ [key]: event.target.checked })}
          />
          {label}
        </label>
      ))}
    </div>
  );
}

function ModifierControls({
  title,
  modifiers,
  onChange,
}: {
  title: string;
  modifiers: CombatPokemonModifiers | undefined;
  onChange: (patch: CombatPokemonModifiers) => void;
}) {
  return (
    <div className="combat-modifiers">
      <h4>{title}</h4>
      <div className="combat-mod-grid">
        {BOOST_STATS.map((stat) => (
          <label className="field compact-field" key={stat}>
            <span>{stat.toUpperCase()}</span>
            <input
              type="number"
              min="-6"
              max="6"
              value={modifiers?.boosts?.[stat] ?? 0}
              onChange={(event) =>
                onChange({
                  boosts: {
                    ...modifiers?.boosts,
                    [stat]: clampBoost(event.target.value),
                  },
                })
              }
            />
          </label>
        ))}
      </div>
      <div className="combat-flags">
        <label className="toggle-line">
          <input
            type="checkbox"
            checked={Boolean(modifiers?.teraActive)}
            onChange={(event) => onChange({ teraActive: event.target.checked })}
          />
          Tera actif
        </label>
        <label className="toggle-line">
          <input
            type="checkbox"
            checked={Boolean(modifiers?.burned)}
            onChange={(event) => onChange({ burned: event.target.checked })}
          />
          Brûlé
        </label>
        <label className="toggle-line">
          <input
            type="checkbox"
            checked={Boolean(modifiers?.criticalHit)}
            onChange={(event) => onChange({ criticalHit: event.target.checked })}
          />
          Critique
        </label>
      </div>
    </div>
  );
}

export function CombatCalculator({
  format,
  selectedTeam,
  reference,
}: {
  format: FormatId;
  selectedTeam: TeamMember[];
  reference: ReferenceSnapshot;
}) {
  const defaultStateKey = stateKey(format, selectedTeam);
  const [state, setState] = useState<CombatState>(() => createDefaultCombatState(format, selectedTeam));
  const [queries, setQueries] = useState<Record<string, string>>({});
  const [includeAllFriendlyMoves, setIncludeAllFriendlyMoves] = useState(false);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);

  useEffect(() => {
    setState(createDefaultCombatState(format, selectedTeam));
    setQueries({});
  }, [defaultStateKey, format, selectedTeam]);

  const result = useMemo(
    () => calculateCombatScenario({ format, reference, friendlyTeam: selectedTeam, state, includeAllFriendlyMoves }),
    [format, includeAllFriendlyMoves, reference, selectedTeam, state],
  );
  const activeLimit = result.isDoubles ? 2 : 1;
  const activeAdvancedOptions = useMemo(() => {
    const fieldOptions = Number(state.weather !== 'none') + Number(state.terrain !== 'none');
    const sideConditions = countActiveSideConditions(state.friendlySide) + countActiveSideConditions(state.opponentSide);
    const friendlyModifiers = Object.values(state.friendly).reduce(
      (total, modifiers) => total + countActiveModifiers(modifiers),
      0,
    );
    const opponentModifiers = Object.values(state.opponent).reduce(
      (total, modifiers) => total + countActiveModifiers(modifiers),
      0,
    );

    return fieldOptions + sideConditions + friendlyModifiers + opponentModifiers;
  }, [state]);
  const advancedToggleLabel =
    activeAdvancedOptions > 0
      ? `Options Combat avancées · ${activeAdvancedOptions} ${activeAdvancedOptions > 1 ? 'actives' : 'active'}`
      : 'Options Combat avancées';
  const advancedControlsIds = [
    ADVANCED_CONTROLS_ID,
    ...state.opponents.map((opponent) => opponentAdvancedControlsId(opponent.id)),
  ].join(' ');

  return (
    <section className="panel combat-calculator" id="combat" aria-label="Calculateur de combat">
      <div className="panel-heading">
        <div>
          <h2>Combat</h2>
          <p>Compare les dégâts que tu fais et ceux que tu peux recevoir avec les Pokémon actifs et le terrain.</p>
        </div>
        <label className="toggle-line combat-main-toggle">
          <input
            type="checkbox"
            checked={includeAllFriendlyMoves}
            onChange={(event) => setIncludeAllFriendlyMoves(event.target.checked)}
          />
          Tester aussi les attaques apprenables
        </label>
        <button
          type="button"
          className="combat-advanced-toggle"
          aria-controls={advancedControlsIds}
          aria-expanded={showAdvancedControls}
          onClick={() => setShowAdvancedControls((current) => !current)}
        >
          {advancedToggleLabel}
        </button>
      </div>

      <div className="combat-layout">
        <aside className="combat-scene" aria-label="Scène de combat">
          <h3>Actifs et terrain</h3>
          <div className="combat-active-list" aria-label="Pokémon alliés actifs">
            {selectedTeam.length === 0 ? <p className="warning">Choisis au moins un Pokémon dans la sélection.</p> : null}
            {selectedTeam.map((member) => {
              const isActive = state.friendlyActiveSlots.includes(member.slot);
              const cannotAdd = !isActive && state.friendlyActiveSlots.length >= activeLimit;
              return (
                <label className="combat-pokemon-chip" key={member.slot}>
                  <input
                    type="checkbox"
                    checked={isActive}
                    disabled={cannotAdd}
                    onChange={(event) =>
                      setState((current) => ({
                        ...current,
                        friendlyActiveSlots: event.target.checked
                          ? [...current.friendlyActiveSlots, member.slot].slice(0, activeLimit)
                          : current.friendlyActiveSlots.filter((slot) => slot !== member.slot),
                      }))
                    }
                  />
                  <PokemonAvatar reference={reference} species={member.species} />
                  <span>{pokemonDisplayName(reference, member.species)}</span>
                </label>
              );
            })}
          </div>

          {showAdvancedControls ? (
            <div className="combat-advanced-controls" id={ADVANCED_CONTROLS_ID}>
              <div className="combat-field-grid">
                <label className="field">
                  <span>Météo</span>
                  <select
                    value={state.weather}
                    onChange={(event) =>
                      setState((current) => ({ ...current, weather: event.target.value as CombatState['weather'] }))
                    }
                  >
                    {WEATHER_OPTIONS.map((weather) => (
                      <option key={weather.value} value={weather.value}>
                        {weather.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Terrain</span>
                  <select
                    value={state.terrain}
                    onChange={(event) =>
                      setState((current) => ({ ...current, terrain: event.target.value as CombatState['terrain'] }))
                    }
                  >
                    {TERRAIN_OPTIONS.map((terrain) => (
                      <option key={terrain.value} value={terrain.value}>
                        {terrain.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="combat-screens">
                <ScreenControls
                  title="Protections alliées"
                  side={state.friendlySide}
                  onChange={(patch) =>
                    setState((current) => ({
                      ...current,
                      friendlySide: { ...current.friendlySide, ...patch },
                    }))
                  }
                />
                <ScreenControls
                  title="Protections adverses"
                  side={state.opponentSide}
                  onChange={(patch) =>
                    setState((current) => ({
                      ...current,
                      opponentSide: { ...current.opponentSide, ...patch },
                    }))
                  }
                />
              </div>

              {selectedTeam
                .filter((member) => state.friendlyActiveSlots.includes(member.slot))
                .map((member) => (
                  <ModifierControls
                    key={member.slot}
                    title={`Modifs allié · ${pokemonDisplayName(reference, member.species)}`}
                    modifiers={state.friendly[member.slot]}
                    onChange={(patch) =>
                      setState((current) => ({
                        ...current,
                        friendly: updateModifiers(current.friendly, member.slot, patch),
                      }))
                    }
                  />
                ))}
            </div>
          ) : null}
        </aside>

        <div className="combat-opponents">
          {state.opponents.map((opponent, index) => {
            const query = queries[opponent.id] ?? '';
            const options = searchCombatPokemon(reference, query).sort((left, right) =>
              pokemonDisplayName(reference, left.name).localeCompare(pokemonDisplayName(reference, right.name), 'fr'),
            );
            return (
              <article className="combat-opponent-card" key={opponent.id}>
                <div className="slot-header">
                  <strong>Adversaire {index + 1}</strong>
                  <span>{opponent.species ? pokemonDisplayName(reference, opponent.species) : 'Non défini'}</span>
                </div>
                <label className="field">
                  <span>Rechercher adversaire {index + 1}</span>
                  <input
                    value={query}
                    onChange={(event) => setQueries((current) => ({ ...current, [opponent.id]: event.target.value }))}
                    placeholder="Nom FR ou EN"
                  />
                </label>
                <div className="combat-search-results" aria-label={`Résultats adversaire ${index + 1}`}>
                  {options.map((pokemon) => (
                    <button
                      type="button"
                      key={pokemon.id}
                      onClick={() =>
                        setState((current) => ({
                          ...current,
                          opponents: replaceOpponent(current.opponents, opponent.id, { species: pokemon.name }),
                        }))
                      }
                    >
                      <PokemonAvatar reference={reference} species={pokemon.name} />
                      <span>{pokemonDisplayName(reference, pokemon.name)}</span>
                    </button>
                  ))}
                </div>
                {showAdvancedControls ? (
                  <div id={opponentAdvancedControlsId(opponent.id)}>
                    <ModifierControls
                      title="Modifs adversaire"
                      modifiers={state.opponent[opponent.id]}
                      onChange={(patch) =>
                        setState((current) => ({
                          ...current,
                          opponent: updateModifiers(current.opponent, opponent.id, patch),
                        }))
                      }
                    />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>

      {result.warnings.map((warning) => (
        <p className="warning" key={warning}>
          {warning}
        </p>
      ))}

      <div className="combat-results">
        {result.matchups.length === 0 ? (
          <article className="combat-result-card">
            <h3>Matchup à compléter</h3>
            <div className="damage-columns">
              <div>
                <h4>Dégâts que tu fais</h4>
                <p>Sélectionne un adversaire pour calculer les dégâts.</p>
              </div>
              <div>
                <h4>Dégâts que tu reçois</h4>
                <p>Les attaques adverses les plus dangereuses apparaîtront ici.</p>
              </div>
            </div>
          </article>
        ) : null}
        {result.matchups.map((matchup) => (
          <article className="combat-result-card" key={`${matchup.friendly.slot}-${matchup.opponent.id}`}>
            <h3>
              {pokemonDisplayName(reference, matchup.friendly.species)} vs{' '}
              {matchup.opponent.species ? pokemonDisplayName(reference, matchup.opponent.species) : 'adversaire'}
            </h3>
            <div className="damage-columns">
              <div>
                <h4>Dégâts que tu fais</h4>
                {matchup.friendlyDamage.length === 0 ? <p>Aucune attaque offensive côté allié.</p> : null}
                {matchup.friendlyDamage.map((row) => (
                  <p className="damage-row" key={row.move}>
                    <strong>{moveDisplayName(reference, row.move)}</strong>
                    <span>
                      {row.minPercent}% - {row.maxPercent}% · {row.koChanceLabel}
                    </span>
                  </p>
                ))}
              </div>
              <div>
                <h4>Dégâts que tu reçois</h4>
                {matchup.opponentDamage.length === 0 ? <p>Aucune attaque offensive adverse trouvée.</p> : null}
                {matchup.opponentDamage.map((row) => (
                  <p className="damage-row danger" key={row.move}>
                    <strong>{moveDisplayName(reference, row.move)}</strong>
                    <span>
                      {row.minPercent}% - {row.maxPercent}% · {row.koChanceLabel}
                    </span>
                  </p>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
