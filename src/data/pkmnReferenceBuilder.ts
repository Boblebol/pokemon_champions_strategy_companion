import { Generations } from '@pkmn/data';
import type { Data, GenerationNum } from '@pkmn/data';
import { Dex } from '@pkmn/dex';
import { toId } from '../domain/ids';
import { toSearchId } from '../domain/localization';
import { POKEMON_TYPES } from '../domain/types';
import type {
  AbilityReference,
  LocalizedNames,
  ItemReference,
  MoveCategory,
  NatureReference,
  PokemonType,
  ReferenceLabels,
  ReferenceSnapshot,
  StatId,
  StatTable,
} from '../domain/types';
import { generatedPokeAssets } from './generated/pokeAssets';
import type { LocalizedEntityAsset, PokeAssetData } from './pokeAssets';
import { TYPE_LABELS } from './pokeAssets';

const SHOWDOWN_GENERATION = 9;
const TYPE_SET = new Set<string>(POKEMON_TYPES);
const pokeAssets = generatedPokeAssets as PokeAssetData;
const ITEM_SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items';
const ITEM_DESCRIPTION_OVERRIDES_FR: Record<string, string> = {
  abilityshield: "Protège le talent du porteur contre les effets qui tentent de le modifier ou de l'ignorer.",
  boosterenergy: 'Active Paléosynthèse ou Charge Quantique une seule fois, sans soleil ni terrain électrique.',
  clearamulet: 'Empêche les adversaires de baisser les statistiques du porteur.',
  covertcloak: "Protège le porteur contre les effets secondaires des attaques qu'il reçoit.",
  ejectpack: 'Fait quitter le terrain au porteur si ses statistiques baissent.',
  heavydutyboots: 'Protège le porteur des pièges posés de son côté quand il arrive sur le terrain.',
  loadeddice: 'Aide les attaques à coups multiples à toucher plus souvent.',
  mirrorherb: "Copie une hausse de statistiques d'un adversaire une seule fois.",
  punchingglove: 'Augmente la puissance des attaques de poing et évite le contact direct.',
  roomservice: 'Baisse la Vitesse du porteur quand Distorsion est active.',
  throatspray: "Augmente l'Attaque Spéciale du porteur après une attaque sonore.",
  utilityumbrella: 'Protège le porteur de certains effets du soleil et de la pluie.',
};
const ABILITY_DESCRIPTION_OVERRIDES_FR: Record<string, string> = {
  defiant: "Augmente fortement l'Attaque quand une statistique est baissée par l'adversaire.",
  earlybird: 'Réduit le temps passé endormi.',
  innerfocus: 'Empêche la peur et protège contre Intimidation.',
  levitate: 'Rend le Pokémon immunisé aux attaques de type Sol.',
  mirrorarmor: "Renvoie à l'adversaire les baisses de statistiques qu'il tente d'infliger.",
  multiscale: 'Réduit les dégâts reçus quand le Pokémon a tous ses PV.',
  pressure: "Fait consommer plus de PP aux attaques qui ciblent ce Pokémon.",
  protosynthesis: "Active Paléosynthèse avec le soleil ou l'Énergie Booster : la meilleure stat augmente.",
  quarkdrive: "Active Charge Quantique avec le terrain électrique ou l'Énergie Booster : la meilleure stat augmente.",
  roughskin: "Blesse l'adversaire quand il touche ce Pokémon avec une attaque de contact.",
  scrappy: 'Permet de toucher les Pokémon Spectre avec les attaques Normal et Combat, et bloque Intimidation.',
  solarpower: "Augmente l'Attaque Spéciale sous le soleil, mais fait perdre des PV.",
  stancechange: "Change de forme selon que le Pokémon attaque ou utilise Bouclier Royal.",
  supremeoverlord: "Renforce les attaques selon le nombre d'alliés déjà mis K.O.",
  unaware: "Ignore les changements de statistiques de l'adversaire quand ce Pokémon attaque ou encaisse.",
};
const STAT_LABELS_FR: Record<StatId, string> = {
  hp: 'les PV',
  atk: "l'Attaque",
  def: 'la Défense',
  spa: "l'Attaque Spéciale",
  spd: 'la Défense Spéciale',
  spe: 'la Vitesse',
};
const NATDEX_UNOBTAINABLE_SPECIES = new Set([
  'Eevee-Starter',
  'Floette-Eternal',
  'Pichu-Spiky-eared',
  'Pikachu-Belle',
  'Pikachu-Cosplay',
  'Pikachu-Libre',
  'Pikachu-PhD',
  'Pikachu-Pop-Star',
  'Pikachu-Rock-Star',
  'Pikachu-Starter',
  'Eternatus-Eternamax',
]);

function natDexExists(data: Data, generation: GenerationNum): boolean {
  if (generation < 8) {
    return Generations.DEFAULT_EXISTS(data);
  }

  if (!data.exists) {
    return false;
  }

  if (data.kind === 'Ability' && data.id === 'noability') {
    return false;
  }

  if ('isNonstandard' in data && data.isNonstandard && data.isNonstandard !== 'Past') {
    return false;
  }

  if ('tier' in data && data.tier === 'Unreleased') {
    return false;
  }

  if (data.kind === 'Species' && NATDEX_UNOBTAINABLE_SPECIES.has(data.name)) {
    return false;
  }

  return !(
    data.kind === 'Item' &&
    data.isNonstandard != null &&
    ['Past', 'Unobtainable'].includes(data.isNonstandard) &&
    !data.zMove &&
    !data.itemUser &&
    !data.forcedForme
  );
}

function natDexExistsForShowdownGeneration(data: Data): boolean {
  return natDexExists(data, SHOWDOWN_GENERATION);
}

function asPokemonType(value: string): PokemonType {
  if (!TYPE_SET.has(value)) {
    throw new Error(`Type Pokémon inconnu depuis @pkmn: ${value}`);
  }

  return value as PokemonType;
}

function asMoveCategory(value: string): MoveCategory {
  if (value === 'Physical' || value === 'Special' || value === 'Status') {
    return value;
  }

  throw new Error(`Catégorie d'attaque inconnue depuis @pkmn: ${value}`);
}

function normalizeStats(stats: {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}): Required<StatTable> {
  return {
    hp: stats.hp,
    atk: stats.atk,
    def: stats.def,
    spa: stats.spa,
    spd: stats.spd,
    spe: stats.spe,
  };
}

function normalizeAbilities(abilities: Readonly<{ 0: string; 1?: string; H?: string; S?: string }>): string[] {
  return Array.from(new Set(Object.values(abilities).filter(Boolean))).sort((left, right) =>
    left.localeCompare(right),
  );
}

function namesBySearchId(assets: Record<string, LocalizedEntityAsset>): Record<string, LocalizedNames> {
  return Object.fromEntries(Object.entries(assets).map(([id, asset]) => [id, asset.names]));
}

function buildReferenceLabels(): ReferenceLabels {
  return {
    abilities: namesBySearchId(pokeAssets.abilities),
    items: namesBySearchId(pokeAssets.items),
    natures: namesBySearchId(pokeAssets.natures),
    types: TYPE_LABELS,
  };
}

function itemIconUrls(itemName: string, generation: number): string[] {
  const spriteName = itemName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const candidates = [
    generation >= 9 ? `${ITEM_SPRITE_BASE}/gen9/${spriteName}.png` : undefined,
    generation >= 8 ? `${ITEM_SPRITE_BASE}/gen8/${spriteName}.png` : undefined,
    `${ITEM_SPRITE_BASE}/${spriteName}.png`,
  ].filter(Boolean) as string[];

  return Array.from(new Set(candidates));
}

function itemReference(item: { id: string; name: string; gen: number; shortDesc?: string; desc?: string }): ItemReference {
  const itemAsset = pokeAssets.items[toSearchId(item.name)];
  const imageCandidates = itemIconUrls(item.name, item.gen);

  return {
    id: toId(item.name),
    name: item.name,
    ...(itemAsset ? { localizedNames: itemAsset.names } : {}),
    description: ITEM_DESCRIPTION_OVERRIDES_FR[toId(item.name)] || itemAsset?.description || item.shortDesc || item.desc || undefined,
    image: imageCandidates[0],
    ...(imageCandidates.length > 1 ? { imageFallbacks: imageCandidates.slice(1) } : {}),
  };
}

function abilityReference(ability: { name: string; shortDesc?: string; desc?: string }): AbilityReference {
  const abilityAsset = pokeAssets.abilities[toSearchId(ability.name)];

  return {
    id: toId(ability.name),
    name: ability.name,
    ...(abilityAsset ? { localizedNames: abilityAsset.names } : {}),
    description:
      ABILITY_DESCRIPTION_OVERRIDES_FR[toId(ability.name)] ||
      abilityAsset?.description ||
      ability.shortDesc ||
      ability.desc ||
      undefined,
  };
}

function natureDescription(plus?: StatId, minus?: StatId): string {
  if (!plus || !minus || plus === minus) {
    return 'Ne change aucune statistique.';
  }

  return `augmente ${STAT_LABELS_FR[plus]} et baisse ${STAT_LABELS_FR[minus]}.`;
}

function natureReference(nature: { name: string; plus?: string; minus?: string }): NatureReference {
  const natureAsset = pokeAssets.natures[toSearchId(nature.name)];
  const plus = nature.plus as StatId | undefined;
  const minus = nature.minus as StatId | undefined;

  return {
    id: toId(nature.name),
    name: nature.name,
    ...(natureAsset ? { localizedNames: natureAsset.names } : {}),
    description: natureDescription(plus, minus),
  };
}

function isSelectableSpecies(species: { num: number; forme?: string; isMega?: boolean; battleOnly?: unknown }): boolean {
  if (species.num <= 0 || species.isMega || species.battleOnly) {
    return false;
  }

  return !['Gmax', 'Primal', 'Eternamax'].includes(species.forme ?? '') && !(species.forme ?? '').includes('Totem');
}

export async function buildPkmnReferenceSnapshot({
  importedAt = new Date().toISOString(),
}: {
  importedAt?: string;
} = {}): Promise<ReferenceSnapshot> {
  const gen = new Generations(Dex, natDexExistsForShowdownGeneration).get(SHOWDOWN_GENERATION);
  const moves = Object.fromEntries(
    Array.from(gen.moves)
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((move) => {
        const moveAsset = pokeAssets.moves[toSearchId(move.name)];

        return [
          toId(move.name),
          {
            id: toId(move.name),
            name: move.name,
            ...(moveAsset ? { localizedNames: moveAsset.names } : {}),
            type: asPokemonType(move.type),
            category: asMoveCategory(move.category),
            ...(move.basePower > 0 ? { power: move.basePower } : {}),
            ...(typeof move.accuracy === 'number' ? { accuracy: move.accuracy } : {}),
            ...(move.priority !== 0 ? { priority: move.priority } : {}),
            target: move.target,
          },
        ];
      }),
  );
  const pokemonEntries = await Promise.all(
    Array.from(gen.species)
      .filter(isSelectableSpecies)
      .sort((left, right) => left.name.localeCompare(right.name))
      .map(async (species) => {
        const learnable = await gen.learnsets.learnable(species.name);
        const pokemonAsset = pokeAssets.pokemon[toSearchId(species.name)];

        return [
          toId(species.name),
          {
            id: toId(species.name),
            name: species.name,
            ...(pokemonAsset ? { localizedNames: pokemonAsset.names, image: pokemonAsset.image } : {}),
            types: species.types.map(asPokemonType),
            baseStats: normalizeStats(species.baseStats),
            abilities: normalizeAbilities(species.abilities),
            moveIds: Object.keys(learnable ?? {}).filter((moveId) => moves[moveId]),
          },
        ] as const;
      }),
  );
  const itemDetails = Object.fromEntries(
    Array.from(gen.items)
      .map(itemReference)
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((item) => [item.id, item]),
  );
  const abilityDetails = Object.fromEntries(
    Array.from(gen.abilities)
      .map(abilityReference)
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((ability) => [ability.id, ability]),
  );
  const natureDetails = Object.fromEntries(
    Array.from(gen.natures)
      .map(natureReference)
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((nature) => [nature.id, nature]),
  );

  return {
    id: `pkmn-showdown-gen${SHOWDOWN_GENERATION}`,
    source: `@pkmn/dex + @pkmn/data Gen ${SHOWDOWN_GENERATION} · ${pokeAssets.source}`,
    importedAt,
    locale: 'fr',
    pokemon: Object.fromEntries(pokemonEntries),
    moves,
    items: Object.values(itemDetails).map((item) => item.name),
    itemDetails,
    natures: Object.values(natureDetails).map((nature) => nature.name),
    abilityDetails,
    natureDetails,
    labels: buildReferenceLabels(),
  };
}
