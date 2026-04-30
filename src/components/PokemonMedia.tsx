import { getPokemonReference } from '../domain/referenceDisplay';
import type { ReferenceSnapshot } from '../domain/types';

function initials(species: string | undefined): string {
  return (species ?? '?')
    .split(/\s|-/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function PokemonAvatar({
  reference,
  species,
  variant = 'sprite',
}: {
  reference: ReferenceSnapshot;
  species: string | undefined;
  variant?: 'sprite' | 'artwork';
}) {
  const pokemon = getPokemonReference(reference, species);
  const image = variant === 'artwork' ? pokemon?.image?.artwork ?? pokemon?.image?.sprite : pokemon?.image?.sprite;

  return (
    <span className={`pokemon-avatar ${variant}`} aria-hidden="true">
      {image ? (
        <img
          alt=""
          loading="lazy"
          src={image}
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      ) : (
        <span>{initials(species)}</span>
      )}
    </span>
  );
}
