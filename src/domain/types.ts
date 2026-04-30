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
  types: PokemonType[];
  baseStats: Required<StatTable>;
  abilities: string[];
  moveIds: string[];
}

export interface MoveReference {
  id: string;
  name: string;
  type: PokemonType;
  category: MoveCategory;
  power?: number;
}

export interface ReferenceSnapshot {
  id: string;
  source: string;
  importedAt: string;
  pokemon: Record<string, PokemonReference>;
  moves: Record<string, MoveReference>;
  items: string[];
  natures: string[];
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
