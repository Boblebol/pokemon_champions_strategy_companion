import type { ParsedTeam } from '../domain/types';

export function TeamPreview({ team }: { team: ParsedTeam }) {
  return (
    <section className="panel">
      <h2>Team</h2>
      {team.errors.map((error) => (
        <p className="warning" key={error}>
          {error}
        </p>
      ))}
      <div className="team-grid">
        {team.members.map((member) => (
          <article className="team-card" key={`${member.slot}-${member.species}`}>
            <strong>{member.species}</strong>
            <span>{member.item ?? 'No item'}</span>
            <small>{member.moves.join(' / ')}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
