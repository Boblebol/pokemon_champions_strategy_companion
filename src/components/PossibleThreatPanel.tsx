import { PokemonAvatar } from './PokemonMedia';
import { POSSIBLE_THREAT_SCORE_EXPLANATION } from '../domain/possibleThreats';
import { moveDisplayName, pokemonDisplayName } from '../domain/referenceDisplay';
import type { PossibleThreat } from '../domain/possibleThreats';
import type { ReferenceSnapshot } from '../domain/types';

export function PossibleThreatPanel({
  reference,
  threats,
  selectedCount,
  pickSize,
}: {
  reference: ReferenceSnapshot;
  threats: PossibleThreat[];
  selectedCount: number;
  pickSize: number;
}) {
  const isSelectionComplete = selectedCount >= pickSize;

  return (
    <section className="panel possible-threat-panel">
      <h2>Adversaires rares dangereux</h2>
      <p>{POSSIBLE_THREAT_SCORE_EXPLANATION}</p>
      {!isSelectionComplete ? (
        <p>Choisis {pickSize} Pokémon pour voir les adversaires rares à surveiller.</p>
      ) : null}
      {isSelectionComplete && threats.length === 0 ? <p>Aucun adversaire rare très dangereux sur la sélection actuelle.</p> : null}
      <div className="possible-threat-list">
        {threats.map((threat) => (
          <article className={`threat ${threat.severity}`} key={threat.species}>
            <div className="threat-main">
              <PokemonAvatar reference={reference} species={threat.species} />
              <strong>{pokemonDisplayName(reference, threat.species)}</strong>
            </div>
            <span>
              Score {threat.score.toFixed(1)} · Vitesse max {threat.speed}
            </span>
            {threat.reasons.map((reason) => (
              <small key={reason}>{reason}</small>
            ))}
            <div className="coverage-list">
              {threat.coverageMoves.map((coverage) => (
                <small key={coverage.move}>
                  {moveDisplayName(reference, coverage.move)} :{' '}
                  {coverage.targets.map((target) => pokemonDisplayName(reference, target)).join(', ')}
                </small>
              ))}
            </div>
            <div className="set-archetype-list">
              {threat.setArchetypes.map((set) => (
                <small key={set.name}>
                  {set.name} : {set.moves.map((move) => moveDisplayName(reference, move)).join(' / ')}
                </small>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
