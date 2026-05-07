import { championsShowdownSnapshot } from './generated/championsShowdownSnapshot';

export interface ChampionsSpeciesRule {
  tier?: string;
  isNonstandard?: string;
}

export interface ChampionsShowdownSnapshot {
  sourceUrls: {
    formatsData: string;
    directory: string;
  };
  checkedAt: string;
  speciesRules: Record<string, ChampionsSpeciesRule>;
  legalSpeciesIds: string[];
}

const legalSpeciesIdSet = new Set(championsShowdownSnapshot.legalSpeciesIds);
const speciesRules: Record<string, ChampionsSpeciesRule> = championsShowdownSnapshot.speciesRules;

export function isChampionsLegalSpeciesRule(rule: ChampionsSpeciesRule | undefined): boolean {
  return typeof rule?.tier === 'string' && rule.tier !== 'Illegal';
}

export function getChampionsSpeciesRule(speciesId: string): ChampionsSpeciesRule | undefined {
  return speciesRules[speciesId];
}

export function isChampionsLegalSpeciesId(speciesId: string): boolean {
  return legalSpeciesIdSet.has(speciesId);
}

export { championsShowdownSnapshot };
