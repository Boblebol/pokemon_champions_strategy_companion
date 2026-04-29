import type { RankedThreat } from '../domain/metaThreats';

export function ThreatPanel({ threats }: { threats: RankedThreat[] }) {
  return (
    <section className="panel">
      <h2>Menaces méta</h2>
      {threats.length === 0 ? <p>Aucun snapshot d'usage disponible pour ce format.</p> : null}
      <div className="threat-list">
        {threats.map((threat) => (
          <article className={`threat ${threat.severity}`} key={threat.species}>
            <strong>
              #{threat.rank} {threat.species}
            </strong>
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
