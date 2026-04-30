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

  useEffect(() => {
    setState(createDefaultCombatState(format, selectedTeam));
    setQueries({});
  }, [defaultStateKey, format, selectedTeam]);

  const result = useMemo(
    () => calculateCombatScenario({ format, reference, friendlyTeam: selectedTeam, state, includeAllFriendlyMoves }),
    [format, includeAllFriendlyMoves, reference, selectedTeam, state],
  );
  const activeLimit = result.isDoubles ? 2 : 1;

  return (
    <section className="panel combat-calculator" id="combat" aria-label="Calculateur de combat">
      <div className="panel-heading">
        <div>
          <h2>Combat</h2>
          <p>Compare les dégâts sortants et entrants avec les actifs, le terrain et les boosts du match.</p>
        </div>
        <label className="toggle-line combat-main-toggle">
          <input
            type="checkbox"
            checked={includeAllFriendlyMoves}
            onChange={(event) => setIncludeAllFriendlyMoves(event.target.checked)}
          />
          Toutes les attaques apprenables côté équipe
        </label>
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
        </aside>

        <div className="combat-opponents">
          {state.opponents.map((opponent, index) => {
            const query = queries[opponent.id] ?? '';
            const options = searchCombatPokemon(reference, query);
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
                <h4>Dégâts sortants</h4>
                <p>Sélectionne un adversaire pour calculer les dégâts.</p>
              </div>
              <div>
                <h4>Dégâts entrants</h4>
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
                <h4>Dégâts sortants</h4>
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
                <h4>Dégâts entrants</h4>
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
