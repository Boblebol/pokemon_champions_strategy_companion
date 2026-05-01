import { toId } from './ids';
import { formatLocalizedName, localizedLabelMap } from './localization';
import type {
  AbilityReference,
  ItemReference,
  LocaleId,
  NatureReference,
  PokemonReference,
  PokemonType,
  ReferenceSnapshot,
} from './types';

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

export function getAbilityReference(reference: ReferenceSnapshot, ability: string | undefined): AbilityReference | undefined {
  return ability ? reference.abilityDetails[toId(ability)] : undefined;
}

export function abilityDisplayName(reference: ReferenceSnapshot, ability: string): string {
  const abilityReference = getAbilityReference(reference, ability);
  return formatLocalizedName(
    ability,
    abilityReference?.localizedNames ?? localizedLabelMap(reference.labels.abilities, ability),
    localeOf(reference),
  );
}

export function abilityDescription(reference: ReferenceSnapshot, ability: string | undefined): string {
  return ability ? getAbilityReference(reference, ability)?.description ?? 'Effet non documenté dans la source.' : '';
}

export function getItemReference(reference: ReferenceSnapshot, item: string | undefined): ItemReference | undefined {
  return item ? reference.itemDetails[toId(item)] : undefined;
}

export function itemDisplayName(reference: ReferenceSnapshot, item: string): string {
  const itemReference = getItemReference(reference, item);
  return formatLocalizedName(
    item,
    itemReference?.localizedNames ?? localizedLabelMap(reference.labels.items, item),
    localeOf(reference),
  );
}

export function itemDescription(reference: ReferenceSnapshot, item: string): string {
  return getItemReference(reference, item)?.description ?? 'Effet non documenté dans la source.';
}

export function getNatureReference(reference: ReferenceSnapshot, nature: string | undefined): NatureReference | undefined {
  return nature ? reference.natureDetails[toId(nature)] : undefined;
}

export function natureDisplayName(reference: ReferenceSnapshot, nature: string): string {
  const natureReference = getNatureReference(reference, nature);
  return formatLocalizedName(
    nature,
    natureReference?.localizedNames ?? localizedLabelMap(reference.labels.natures, nature),
    localeOf(reference),
  );
}

export function natureDescription(reference: ReferenceSnapshot, nature: string | undefined): string {
  return nature ? getNatureReference(reference, nature)?.description ?? 'Effet non documenté dans la source.' : '';
}

export function typeDisplayName(reference: ReferenceSnapshot, type: PokemonType): string {
  return formatLocalizedName(type, reference.labels.types[type], localeOf(reference));
}
