import { PokemonAvatar } from './PokemonMedia';
import { pokemonDisplayName } from '../domain/referenceDisplay';
import type { RankedThreat } from '../domain/metaThreats';
import type { ReferenceSnapshot } from '../domain/types';

export function ThreatPanel({ reference, threats }: { reference: ReferenceSnapshot; threats: RankedThreat[] }) {
  return (
    <section className="panel">
      <h2>Adversaires fréquents dangereux</h2>
      {threats.length === 0 ? <p>Aucune donnée d'usage disponible pour ce format.</p> : null}
      <div className="threat-list">
        {threats.map((threat) => (
          <article className={`threat ${threat.severity}`} key={threat.species}>
            <div className="threat-main">
              <PokemonAvatar reference={reference} species={threat.species} />
              <strong>
                #{threat.rank} {pokemonDisplayName(reference, threat.species)}
              </strong>
            </div>
            <span>Score {threat.score.toFixed(1)}</span>
            {threat.reasons.map((reason) => (
              <small key={reason}>{reason}</small>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
