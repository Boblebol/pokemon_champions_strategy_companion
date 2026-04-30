import { toId } from './ids';
import { formatLocalizedName, localizedLabelMap } from './localization';
import type { LocaleId, PokemonReference, PokemonType, ReferenceSnapshot } from './types';

function localeOf(reference: ReferenceSnapshot): LocaleId {
  return reference.locale || 'fr';
}

export function getPokemonReference(
  reference: ReferenceSnapshot,
  species: string | undefined,
): PokemonReference | undefined {
  return species ? reference.pokemon[toId(species)] : undefined;
}

export function pokemonDisplayName(reference: ReferenceSnapshot, species: string | undefined): string {
  if (!species) {
    return 'Libre';
  }

  const pokemon = getPokemonReference(reference, species);
  return formatLocalizedName(species, pokemon?.localizedNames, localeOf(reference));
}

export function moveDisplayName(reference: ReferenceSnapshot, move: string): string {
  const moveReference = reference.moves[toId(move)];
  return formatLocalizedName(move, moveReference?.localizedNames, localeOf(reference));
}

export function abilityDisplayName(reference: ReferenceSnapshot, ability: string): string {
  return formatLocalizedName(ability, localizedLabelMap(reference.labels.abilities, ability), localeOf(reference));
}

export function itemDisplayName(reference: ReferenceSnapshot, item: string): string {
  return formatLocalizedName(item, localizedLabelMap(reference.labels.items, item), localeOf(reference));
}

export function natureDisplayName(reference: ReferenceSnapshot, nature: string): string {
  return formatLocalizedName(nature, localizedLabelMap(reference.labels.natures, nature), localeOf(reference));
}

export function typeDisplayName(reference: ReferenceSnapshot, type: PokemonType): string {
  return formatLocalizedName(type, reference.labels.types[type], localeOf(reference));
}
