import type { TeamAudit } from '../domain/auditEngine';
import type { TeamRole } from '../domain/roleDetection';

const ROLE_LABELS: Record<TeamRole, string> = {
  'speed control': 'contrôle de la vitesse',
  'hazard setter': 'poseur de pièges',
  'hazard removal': 'retrait des pièges',
  pivot: 'pivot',
  priority: 'priorité',
  'setup sweeper': 'attaquant qui se booste',
  'bulky support': 'support résistant',
  recovery: 'soin',
  'status spreading': 'statuts',
};

function roleLabel(role: TeamRole): string {
  return ROLE_LABELS[role];
}

export function AuditPanel({ audit, title = "Audit d'équipe" }: { audit: TeamAudit; title?: string }) {
  return (
    <section className="panel coverage-panel">
      <h2>{title}</h2>
      {audit.dataWarnings.map((warning) => (
        <p className="warning" key={warning}>
          {warning}
        </p>
      ))}
      <div className="coverage-split">
        <article className="coverage-card offensive-coverage">
          <div className="coverage-card-heading">
            <span className="coverage-dot" aria-hidden="true" />
            <h3>Couverture offensive</h3>
          </div>
          <p>Ce que tes attaques peuvent menacer super efficacement.</p>
          <div className="finding-list compact-findings">
            {audit.offensive.map((finding) => (
              <article className={`finding ${finding.severity}`} key={finding.title}>
                <strong>{finding.title}</strong>
                {finding.evidence.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </article>
            ))}
          </div>
        </article>
        <article className="coverage-card defensive-coverage">
          <div className="coverage-card-heading">
            <span className="coverage-dot" aria-hidden="true" />
            <h3>Couverture défensive</h3>
          </div>
          <p>Ce que tes actifs encaissent mal ou couvrent déjà.</p>
          <div className="finding-list compact-findings">
            {audit.defensive.length > 0 ? (
              audit.defensive.map((finding) => (
                <article className={`finding ${finding.severity}`} key={finding.title}>
                  <strong>{finding.title}</strong>
                  {finding.evidence.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </article>
              ))
            ) : (
              <article className="finding low">
                <strong>Aucune faiblesse commune forte</strong>
                <span>Les actifs ne partagent pas de pression défensive majeure dans la référence actuelle.</span>
              </article>
            )}
          </div>
        </article>
      </div>
      <h3>Rôles</h3>
      <p>
        Détectés :{' '}
        {audit.roles.detected.map((role) => `${roleLabel(role.role)} (${role.member})`).join(', ') || 'aucun'}
      </p>
      <p>Manquants : {audit.roles.missing.map(roleLabel).join(', ') || 'aucun'}</p>
      <h3>Repères vitesse</h3>
      {audit.speed.map((speed) => (
        <p key={speed.species}>
          {speed.species}: {speed.speed} {speed.estimated ? 'estimé' : 'exact'}
          {speed.benchmarks.length > 1 ? ` · +1 ${speed.benchmarks[1].speed} · +2 ${speed.benchmarks[2].speed}` : ''}
        </p>
      ))}
    </section>
  );
}
