import type { TeamAudit } from '../domain/auditEngine';

export function AuditPanel({ audit }: { audit: TeamAudit }) {
  return (
    <section className="panel">
      <h2>Team audit</h2>
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
      <h3>Roles</h3>
      <p>Detected: {audit.roles.detected.map((role) => `${role.role} (${role.member})`).join(', ') || 'none'}</p>
      <p>Missing: {audit.roles.missing.join(', ') || 'none'}</p>
      <h3>Speed tiers</h3>
      {audit.speed.map((speed) => (
        <p key={speed.species}>
          {speed.species}: {speed.speed} {speed.estimated ? '(estimated)' : ''}
        </p>
      ))}
    </section>
  );
}
