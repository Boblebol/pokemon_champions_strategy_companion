import type { ParsedTeam } from '../domain/types';

export function TeamPreview({ team }: { team: ParsedTeam }) {
  return (
    <section className="panel">
      <h2>Équipe</h2>
      {team.errors.map((error) => (
        <p className="warning" key={error}>
          {error}
        </p>
      ))}
      <div className="team-grid">
        {team.members.map((member) => (
          <article className="team-card" key={`${member.slot}-${member.species}`}>
            <strong>{member.species}</strong>
            <span>{member.item ?? 'Aucun objet'}</span>
            <small>{member.moves.join(' / ')}</small>
            {member.parseWarnings.map((warning) => (
              <small className="warning" key={warning}>
                {warning}
              </small>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
