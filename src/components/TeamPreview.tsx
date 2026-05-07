import { PokemonAvatar } from './PokemonMedia';
import { itemDisplayName, moveDisplayName, pokemonDisplayName } from '../domain/referenceDisplay';
import type { LocaleId, ParsedTeam, ReferenceSnapshot } from '../domain/types';

export function TeamPreview({
  reference,
  team,
  locale,
}: {
  reference: ReferenceSnapshot;
  team: ParsedTeam;
  locale?: LocaleId;
}) {
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
                <strong>{pokemonDisplayName(reference, member.species, locale)}</strong>
                <span>{member.item ? itemDisplayName(reference, member.item, locale) : 'Aucun objet'}</span>
              </div>
            </div>
            <small>{member.moves.map((move) => moveDisplayName(reference, move, locale)).join(' / ')}</small>
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
