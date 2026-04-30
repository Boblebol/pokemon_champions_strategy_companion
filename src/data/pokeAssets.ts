import type { LocalizedNames, PokemonImageSet, PokemonType, ReferenceLabels } from '../domain/types';

export interface PokemonAssetEntry {
  names: LocalizedNames;
  image: PokemonImageSet;
}

export interface LocalizedEntityAsset {
  names: LocalizedNames;
}

export interface PokeAssetData {
  source: string;
  importedAt: string;
  pokemon: Record<string, PokemonAssetEntry>;
  moves: Record<string, LocalizedEntityAsset>;
  abilities: Record<string, LocalizedEntityAsset>;
  items: Record<string, LocalizedEntityAsset>;
  natures: Record<string, LocalizedEntityAsset>;
}

export const TYPE_LABELS: ReferenceLabels['types'] = {
  Normal: { en: 'Normal', fr: 'Normal', ja: 'ノーマル' },
  Fire: { en: 'Fire', fr: 'Feu', ja: 'ほのお' },
  Water: { en: 'Water', fr: 'Eau', ja: 'みず' },
  Electric: { en: 'Electric', fr: 'Électrik', ja: 'でんき' },
  Grass: { en: 'Grass', fr: 'Plante', ja: 'くさ' },
  Ice: { en: 'Ice', fr: 'Glace', ja: 'こおり' },
  Fighting: { en: 'Fighting', fr: 'Combat', ja: 'かくとう' },
  Poison: { en: 'Poison', fr: 'Poison', ja: 'どく' },
  Ground: { en: 'Ground', fr: 'Sol', ja: 'じめん' },
  Flying: { en: 'Flying', fr: 'Vol', ja: 'ひこう' },
  Psychic: { en: 'Psychic', fr: 'Psy', ja: 'エスパー' },
  Bug: { en: 'Bug', fr: 'Insecte', ja: 'むし' },
  Rock: { en: 'Rock', fr: 'Roche', ja: 'いわ' },
  Ghost: { en: 'Ghost', fr: 'Spectre', ja: 'ゴースト' },
  Dragon: { en: 'Dragon', fr: 'Dragon', ja: 'ドラゴン' },
  Dark: { en: 'Dark', fr: 'Ténèbres', ja: 'あく' },
  Steel: { en: 'Steel', fr: 'Acier', ja: 'はがね' },
  Fairy: { en: 'Fairy', fr: 'Fée', ja: 'フェアリー' },
};

export function emptyReferenceLabels(): ReferenceLabels {
  return {
    abilities: {},
    items: {},
    natures: {},
    types: TYPE_LABELS satisfies Record<PokemonType, LocalizedNames>,
  };
}
