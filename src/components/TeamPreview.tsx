import { PokemonAvatar } from './PokemonMedia';
import { itemDisplayName, moveDisplayName, pokemonDisplayName } from '../domain/referenceDisplay';
import type { ParsedTeam, ReferenceSnapshot } from '../domain/types';

export function TeamPreview({ reference, team }: { reference: ReferenceSnapshot; team: ParsedTeam }) {
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
            <div className="team-card-main">
              <PokemonAvatar reference={reference} species={member.species} />
              <div>
                <strong>{pokemonDisplayName(reference, member.species)}</strong>
                <span>{member.item ? itemDisplayName(reference, member.item) : 'Aucun objet'}</span>
              </div>
            </div>
            <small>{member.moves.map((move) => moveDisplayName(reference, move)).join(' / ')}</small>
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
