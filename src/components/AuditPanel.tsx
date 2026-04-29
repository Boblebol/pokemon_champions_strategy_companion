import type { TeamAudit } from '../domain/auditEngine';
import type { TeamRole } from '../domain/roleDetection';

const ROLE_LABELS: Record<TeamRole, string> = {
  'speed control': 'contrôle vitesse',
  'hazard setter': 'poseur de hazards',
  'hazard removal': 'retrait hazards',
  pivot: 'pivot',
  priority: 'priorité',
  'setup sweeper': 'setup sweeper',
  'bulky support': 'support bulky',
  recovery: 'soin',
  'status spreading': 'statuts',
};

function roleLabel(role: TeamRole): string {
  return ROLE_LABELS[role];
}

export function AuditPanel({ audit }: { audit: TeamAudit }) {
  return (
    <section className="panel">
      <h2>Audit d'équipe</h2>
      {audit.dataWarnings.map((warning) => (
        <p className="warning" key={warning}>
          {warning}
        </p>
      ))}
      <div className="finding-list">
        {[...audit.defensive, ...audit.offensive].map((finding) => (
          <article className={`finding ${finding.severity}`} key={finding.title}>
            <strong>{finding.title}</strong>
            {finding.evidence.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </article>
        ))}
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
          {speed.species}: {speed.speed} {speed.estimated ? '(estimé)' : ''}
        </p>
      ))}
    </section>
  );
}
