import type { PossibleThreat } from '../domain/possibleThreats';

export function PossibleThreatPanel({
  threats,
  selectedCount,
  pickSize,
}: {
  threats: PossibleThreat[];
  selectedCount: number;
  pickSize: number;
}) {
  const isSelectionComplete = selectedCount >= pickSize;

  return (
    <section className="panel possible-threat-panel">
      <h2>Menaces possibles hors méta</h2>
      <p>Coverage possible depuis les learnsets complets, hors Pokémon déjà hauts en usage dans le snapshot.</p>
      {!isSelectionComplete ? (
        <p>Complète la sélection de {pickSize} Pokémon pour scanner les menaces hors méta.</p>
      ) : null}
      {isSelectionComplete && threats.length === 0 ? <p>Aucune menace hors méta forte sur la sélection actuelle.</p> : null}
      <div className="possible-threat-list">
        {threats.map((threat) => (
          <article className={`threat ${threat.severity}`} key={threat.species}>
            <strong>{threat.species}</strong>
            <span>
              Score {threat.score.toFixed(1)} · Vitesse max {threat.speed}
            </span>
            {threat.reasons.map((reason) => (
              <small key={reason}>{reason}</small>
            ))}
            <div className="coverage-list">
              {threat.coverageMoves.map((coverage) => (
                <small key={coverage.move}>
                  {coverage.move} : {coverage.targets.join(', ')}
                </small>
              ))}
            </div>
            <div className="set-archetype-list">
              {threat.setArchetypes.map((set) => (
                <small key={set.name}>
                  {set.name} : {set.moves.join(' / ')}
                </small>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
