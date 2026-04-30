export const POKEMON_TYPES = [
  'Normal',
  'Fire',
  'Water',
  'Electric',
  'Grass',
  'Ice',
  'Fighting',
  'Poison',
  'Ground',
  'Flying',
  'Psychic',
  'Bug',
  'Rock',
  'Ghost',
  'Dragon',
  'Dark',
  'Steel',
  'Fairy',
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];
export type StatId = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe';
export type StatTable = Partial<Record<StatId, number>>;
export type MoveCategory = 'Physical' | 'Special' | 'Status';
export type FormatId = 'champions-vgc' | 'champions-bss' | 'champions-ou';
export type LocaleId = 'en' | 'fr' | 'ja';

export type LocalizedNames = Partial<Record<LocaleId, string>> & {
  en: string;
};

export interface PokemonImageSet {
  artwork?: string;
  sprite?: string;
  icon?: string;
}

export interface FormatDefinition {
  id: FormatId;
  label: string;
  battleStyle: 'doubles' | 'singles' | 'six-vs-six';
  teamSize: number;
  pickSize: number;
  defaultLevel: number;
}

export interface PokemonReference {
  id: string;
  name: string;
  localizedNames?: LocalizedNames;
  image?: PokemonImageSet;
  types: PokemonType[];
  baseStats: Required<StatTable>;
  abilities: string[];
  moveIds: string[];
}

export interface MoveReference {
  id: string;
  name: string;
  localizedNames?: LocalizedNames;
  type: PokemonType;
  category: MoveCategory;
  power?: number;
}

export interface ReferenceLabels {
  abilities: Record<string, LocalizedNames>;
  items: Record<string, LocalizedNames>;
  natures: Record<string, LocalizedNames>;
  types: Record<PokemonType, LocalizedNames>;
}

export interface ReferenceSnapshot {
  id: string;
  source: string;
  importedAt: string;
  locale: LocaleId;
  pokemon: Record<string, PokemonReference>;
  moves: Record<string, MoveReference>;
  items: string[];
  natures: string[];
  labels: ReferenceLabels;
}

export interface UsageEntry {
  rank: number;
  species: string;
  usage: number;
  commonMoves: string[];
}

export interface MetaSnapshot {
  id: string;
  format: FormatId;
  label: string;
  source: string;
  date: string;
  importedAt: string;
  battleCount?: number;
  isDemo: boolean;
  entries: UsageEntry[];
}

export interface DataBundle {
  reference: ReferenceSnapshot;
  meta: Record<FormatId, MetaSnapshot>;
}

export interface TeamMember {
  slot: number;
  nickname?: string;
  species: string;
  item?: string;
  ability?: string;
  level?: number;
  teraType?: PokemonType;
  nature?: string;
  evs: StatTable;
  moves: string[];
  parseWarnings: string[];
}

export interface ParsedTeam {
  members: TeamMember[];
  errors: string[];
}
