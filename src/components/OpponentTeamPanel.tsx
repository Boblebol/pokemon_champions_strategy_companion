import { useMemo, useState } from 'react';
import { assignThreatToCombatSlots, rankOpponentTeamThreats } from '../domain/opponentTeam';
import { toId } from '../domain/ids';
import { localizedSearchText } from '../domain/localization';
import { pokemonDisplayName, typeDisplayName, moveDisplayName } from '../domain/referenceDisplay';
import type { CombatOpponent } from '../domain/damageCalculator';
import type { FormatId, LocaleId, ReferenceSnapshot, TeamMember } from '../domain/types';
import { PokemonAvatar } from './PokemonMedia';
import { SearchablePicker } from './SearchablePicker';

const OPPONENT_TEAM_SIZE = 6;

const COPY = {
  fr: {
    title: 'Team adverse',
    subtitle: 'Renseigne jusqu’à 6 Pokémon adverses, puis tape une menace pour l’envoyer en Combat.',
    collapse: 'Replier la Team adverse',
    expand: 'Ouvrir la Team adverse',
    filled: 'Pokémon',
    slot: 'Slot adverse',
    placeholder: 'Nom FR ou EN',
    empty: 'Aucun adversaire trouvé',
    combat: 'Combat',
    noCombat: 'Aucun adversaire envoyé en Combat.',
    threats: 'Menaces de la team adverse',
    emptyThreats: 'Ajoute un Pokémon adverse pour afficher les cartes menaces.',
    selected: 'en Combat',
    send: 'Envoyer',
    danger: 'Danger',
    caution: 'Attention',
    low: 'À surveiller',
    score: 'Score',
    speed: 'Vitesse max',
    coverage: 'couverture',
    outspeed: 'dépassé(s)',
    noCoverage: 'Aucune couverture super efficace détectée sur tes actifs.',
  },
  en: {
    title: 'Opponent team',
    subtitle: 'Fill up to 6 opposing Pokémon, then tap a threat to send it to Combat.',
    collapse: 'Collapse opponent team',
    expand: 'Open opponent team',
    filled: 'Pokemon',
    slot: 'Opponent slot',
    placeholder: 'FR or EN name',
    empty: 'No opponent found',
    combat: 'Combat',
    noCombat: 'No opponent sent to Combat.',
    threats: 'Opponent team threats',
    emptyThreats: 'Add an opposing Pokemon to display threat cards.',
    selected: 'in Combat',
    send: 'Send',
    danger: 'Danger',
    caution: 'Caution',
    low: 'Watch',
    score: 'Score',
    speed: 'Max Speed',
    coverage: 'coverage',
    outspeed: 'outsped',
    noCoverage: 'No super-effective coverage detected into your active picks.',
  },
} as const;

function copyFor(locale: LocaleId) {
  return locale === 'en' ? COPY.en : COPY.fr;
}

function severityLabel(severity: 'high' | 'medium' | 'low', locale: LocaleId): string {
  const copy = copyFor(locale);
  return severity === 'high' ? copy.danger : severity === 'medium' ? copy.caution : copy.low;
}

export function OpponentTeamPanel({
  format,
  selectedTeam,
  reference,
  locale,
  combatSlots,
  onCombatSlotsChange,
}: {
  format: FormatId;
  selectedTeam: TeamMember[];
  reference: ReferenceSnapshot;
  locale: LocaleId;
  combatSlots: CombatOpponent[];
  onCombatSlotsChange: (slots: CombatOpponent[]) => void;
}) {
  const copy = copyFor(locale);
  const [isOpen, setIsOpen] = useState(true);
  const [opponentTeam, setOpponentTeam] = useState<Array<string | undefined>>(() => Array(OPPONENT_TEAM_SIZE).fill(undefined));
  const filledCount = opponentTeam.filter(Boolean).length;
  const threats = useMemo(
    () =>
      rankOpponentTeamThreats({
        opponentTeam: opponentTeam.filter((species): species is string => Boolean(species)),
        selectedTeam,
        reference,
        format,
      }),
    [format, opponentTeam, reference, selectedTeam],
  );

  const basePokemonOptions = useMemo(
    () =>
      Object.values(reference.pokemon)
        .sort((left, right) =>
          pokemonDisplayName(reference, left.name, locale).localeCompare(
            pokemonDisplayName(reference, right.name, locale),
            locale,
          ),
        )
        .map((pokemon) => {
          const label = pokemonDisplayName(reference, pokemon.name, locale);

          return {
            value: pokemon.name,
            label,
            searchText: localizedSearchText(pokemon.name, pokemon.localizedNames, locale),
            description: pokemon.types.map((type) => typeDisplayName(reference, type, locale)).join(' / '),
            media: <PokemonAvatar reference={reference} species={pokemon.name} />,
            details: (
              <span className="picker-type-row">
                {pokemon.types.map((type) => (
                  <span className={`type-chip type-${type.toLowerCase()}`} key={type}>
                    {typeDisplayName(reference, type, locale)}
                  </span>
                ))}
              </span>
            ),
          };
        }),
    [locale, reference],
  );

  function pickerOptionsForSlot(index: number) {
    const selectedInOtherSlots = new Set(
      opponentTeam.flatMap((species, slotIndex) => (slotIndex !== index && species ? [toId(species)] : [])),
    );

    return basePokemonOptions.filter((option) => !selectedInOtherSlots.has(toId(option.value)));
  }

  function updateOpponentTeamSlot(index: number, species: string | undefined) {
    setOpponentTeam((current) => {
      const nextTeam = current.map((currentSpecies, slotIndex) => (slotIndex === index ? species : currentSpecies));
      const previousSpecies = current[index];

      if (previousSpecies && !nextTeam.some((candidate) => toId(candidate) === toId(previousSpecies))) {
        onCombatSlotsChange(
          combatSlots.map((slot) => (toId(slot.species) === toId(previousSpecies) ? { id: slot.id } : slot)),
        );
      }

      return nextTeam;
    });
  }

  function sendThreatToCombat(species: string) {
    onCombatSlotsChange(assignThreatToCombatSlots(format, combatSlots, species));
  }

  return (
    <section className="panel opponent-team-panel" aria-label={copy.title}>
      <div className="opponent-team-header">
        <button
          type="button"
          className="opponent-team-toggle"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span>
            <strong>{copy.title}</strong>
            <small>{copy.subtitle}</small>
          </span>
          <span className="opponent-team-count">
            {filledCount}/6 {copy.filled}
          </span>
          <span className="visually-hidden">{isOpen ? copy.collapse : copy.expand}</span>
        </button>
      </div>

      {isOpen ? (
        <div className="opponent-team-body">
          <div className="opponent-team-grid">
            {opponentTeam.map((species, index) => (
              <SearchablePicker
                key={index}
                label={`${copy.slot} ${index + 1}`}
                value={species}
                placeholder={copy.placeholder}
                options={pickerOptionsForSlot(index)}
                emptyLabel={copy.empty}
                onChange={(nextSpecies) => updateOpponentTeamSlot(index, nextSpecies)}
              />
            ))}
          </div>

          <div className="opponent-combat-summary" aria-label={copy.combat}>
            <strong>{copy.combat}</strong>
            <div>
              {combatSlots.some((slot) => slot.species) ? (
                combatSlots.map((slot, index) => (
                  <span className="opponent-combat-chip" data-filled={Boolean(slot.species)} key={slot.id}>
                    {slot.species
                      ? pokemonDisplayName(reference, slot.species, locale)
                      : `${copy.combat} ${index + 1}`}
                  </span>
                ))
              ) : (
                <small>{copy.noCombat}</small>
              )}
            </div>
          </div>

          <div className="opponent-threat-list" aria-label={copy.threats}>
            <div className="opponent-threat-heading">
              <strong>{copy.threats}</strong>
              <small>
                {threats.length}/{filledCount}
              </small>
            </div>
            {threats.length === 0 ? <p>{copy.emptyThreats}</p> : null}
            {threats.map((threat) => {
              const pokemon = reference.pokemon[toId(threat.species)];
              const displayName = pokemonDisplayName(reference, threat.species, locale);
              const combatIndex = combatSlots.findIndex((slot) => toId(slot.species) === toId(threat.species));
              const isSelected = combatIndex >= 0;
              const actionLabel =
                locale === 'en' ? `${copy.send} ${displayName} to Combat` : `${copy.send} ${displayName} en Combat`;

              return (
                <button
                  type="button"
                  className={`opponent-threat-card ${threat.severity}`}
                  data-selected={isSelected}
                  aria-label={actionLabel}
                  key={threat.species}
                  onClick={() => sendThreatToCombat(threat.species)}
                >
                  <PokemonAvatar reference={reference} species={threat.species} />
                  <span className="opponent-threat-main">
                    <strong>{displayName}</strong>
                    <span className="picker-type-row">
                      {pokemon?.types.map((type) => (
                        <span className={`type-chip type-${type.toLowerCase()}`} key={type}>
                          {typeDisplayName(reference, type, locale)}
                        </span>
                      ))}
                    </span>
                  </span>
                  <span className="opponent-threat-score">
                    <strong>{severityLabel(threat.severity, locale)}</strong>
                    <small>
                      {copy.score} {threat.score.toFixed(0)} · {copy.speed} {threat.speed}
                    </small>
                  </span>
                  <span className="opponent-threat-reasons">
                    <small>
                      {threat.coveredTargetCount} {copy.coverage} · {threat.outspedTargetCount} {copy.outspeed}
                    </small>
                    {threat.coverageMoves.length > 0 ? (
                      threat.coverageMoves.slice(0, 2).map((coverage) => (
                        <small key={coverage.move}>
                          {moveDisplayName(reference, coverage.move, locale)} :{' '}
                          {coverage.targets.map((target) => pokemonDisplayName(reference, target, locale)).join(', ')}
                        </small>
                      ))
                    ) : (
                      <small>{copy.noCoverage}</small>
                    )}
                  </span>
                  {isSelected ? <span className="opponent-threat-selected">{copy.selected} {combatIndex + 1}</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
