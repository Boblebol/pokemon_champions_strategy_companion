import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_PATH = resolve(ROOT_DIR, 'src/data/generated/pokeAssets.ts');
const CSV_BASE = 'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/';
const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites';
const LOCALES = {
  fr: '5',
  en: '9',
  ja: '11',
};

function toSearchId(value) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function parseCsv(text) {
  const rows = [];
  let currentRow = [];
  let currentValue = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (quoted && nextChar === '"') {
        currentValue += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      currentRow.push(currentValue);
      currentValue = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && nextChar === '\n') {
        index += 1;
      }
      currentRow.push(currentValue);
      rows.push(currentRow);
      currentRow = [];
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  if (currentValue || currentRow.length > 0) {
    currentRow.push(currentValue);
    rows.push(currentRow);
  }

  const [headers, ...body] = rows.filter((row) => row.some((value) => value.length > 0));
  return body.map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])),
  );
}

async function fetchCsv(fileName) {
  const response = await fetch(`${CSV_BASE}${fileName}`);
  if (!response.ok) {
    throw new Error(`Unable to fetch ${fileName}: ${response.status} ${response.statusText}`);
  }
  return parseCsv(await response.text());
}

function collectNames(rows, idColumn, valueColumns) {
  const grouped = new Map();

  for (const row of rows) {
    const locale = Object.entries(LOCALES).find(([, languageId]) => languageId === row.local_language_id)?.[0];
    if (!locale) {
      continue;
    }

    const value = valueColumns.map((column) => row[column]?.trim()).find(Boolean);
    if (!value) {
      continue;
    }

    const id = row[idColumn];
    grouped.set(id, {
      ...(grouped.get(id) ?? {}),
      [locale]: value,
    });
  }

  return grouped;
}

function completeNames(names) {
  if (!names?.en) {
    return undefined;
  }

  return {
    en: names.en,
    ...(names.fr ? { fr: names.fr } : {}),
    ...(names.ja ? { ja: names.ja } : {}),
  };
}

function addEntry(target, key, entry) {
  const searchId = toSearchId(key);
  if (searchId && !target[searchId]) {
    target[searchId] = entry;
  }
}

function localizedEntityMap(rows, idColumn) {
  const namesById = collectNames(rows, idColumn, ['name']);
  const result = {};

  for (const names of namesById.values()) {
    const complete = completeNames(names);
    if (!complete) {
      continue;
    }

    result[toSearchId(complete.en)] = { names: complete };
  }

  return result;
}

function collectItemDescriptions(rows) {
  const result = new Map();

  for (const row of rows) {
    if (row.local_language_id !== LOCALES.fr) {
      continue;
    }

    const description = row.short_effect?.trim().replace(/\s+/g, ' ');
    if (!description || description.startsWith('XXX')) {
      continue;
    }

    result.set(row.item_id, description);
  }

  return result;
}

function itemMap(itemNameRows, itemProseRows) {
  const namesById = collectNames(itemNameRows, 'item_id', ['name']);
  const descriptionsById = collectItemDescriptions(itemProseRows);
  const result = {};

  for (const [itemId, names] of namesById.entries()) {
    const complete = completeNames(names);
    if (!complete) {
      continue;
    }

    const description = descriptionsById.get(itemId);
    result[toSearchId(complete.en)] = {
      names: complete,
      ...(description ? { description } : {}),
    };
  }

  return result;
}

function abilityMap(abilityNameRows, abilityProseRows) {
  const namesById = collectNames(abilityNameRows, 'ability_id', ['name']);
  const descriptionsById = collectItemDescriptions(abilityProseRows);
  const result = {};

  for (const [abilityId, names] of namesById.entries()) {
    const complete = completeNames(names);
    if (!complete) {
      continue;
    }

    const description = descriptionsById.get(abilityId);
    result[toSearchId(complete.en)] = {
      names: complete,
      ...(description ? { description } : {}),
    };
  }

  return result;
}

function pokemonImageSet(pokemonId) {
  return {
    artwork: `${SPRITE_BASE}/pokemon/other/official-artwork/${pokemonId}.png`,
    sprite: `${SPRITE_BASE}/pokemon/${pokemonId}.png`,
    icon: `${SPRITE_BASE}/pokemon/versions/generation-viii/icons/${pokemonId}.png`,
  };
}

function pokemonMap({ pokemonRows, pokemonFormRows, pokemonFormNameRows, pokemonSpeciesNameRows }) {
  const speciesNamesById = collectNames(pokemonSpeciesNameRows, 'pokemon_species_id', ['name']);
  const formNamesById = collectNames(pokemonFormNameRows, 'pokemon_form_id', ['pokemon_name', 'form_name']);
  const formIdByPokemonId = new Map(pokemonFormRows.map((row) => [row.pokemon_id, row.id]));
  const result = {};

  for (const row of pokemonRows) {
    const formId = formIdByPokemonId.get(row.id);
    const names = completeNames(formNamesById.get(formId) ?? speciesNamesById.get(row.species_id));
    if (!names) {
      continue;
    }

    const entry = {
      names,
      image: pokemonImageSet(row.id),
    };

    addEntry(result, row.identifier, entry);
    addEntry(result, names.en, entry);
  }

  return result;
}

function stable(value) {
  if (Array.isArray(value)) {
    return value.map(stable);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, entry]) => [
    key,
    stable(entry),
  ]));
}

async function main() {
  const [
    pokemonRows,
    pokemonFormRows,
    pokemonFormNameRows,
    pokemonSpeciesNameRows,
    moveNameRows,
    abilityNameRows,
    abilityProseRows,
    itemNameRows,
    itemProseRows,
    natureNameRows,
  ] = await Promise.all([
    fetchCsv('pokemon.csv'),
    fetchCsv('pokemon_forms.csv'),
    fetchCsv('pokemon_form_names.csv'),
    fetchCsv('pokemon_species_names.csv'),
    fetchCsv('move_names.csv'),
    fetchCsv('ability_names.csv'),
    fetchCsv('ability_prose.csv'),
    fetchCsv('item_names.csv'),
    fetchCsv('item_prose.csv'),
    fetchCsv('nature_names.csv'),
  ]);

  const data = stable({
    source: 'PokeAPI CSV + PokeAPI sprites raw GitHub',
    importedAt: new Date().toISOString(),
    pokemon: pokemonMap({
      pokemonRows,
      pokemonFormRows,
      pokemonFormNameRows,
      pokemonSpeciesNameRows,
    }),
    moves: localizedEntityMap(moveNameRows, 'move_id'),
    abilities: abilityMap(abilityNameRows, abilityProseRows),
    items: itemMap(itemNameRows, itemProseRows),
    natures: localizedEntityMap(natureNameRows, 'nature_id'),
  });

  const content = `import type { PokeAssetData } from '../pokeAssets';\n\nexport const generatedPokeAssets = ${JSON.stringify(
    data,
    null,
    2,
  )} as const satisfies PokeAssetData;\n`;

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, content);

  console.log(
    `Generated ${Object.keys(data.pokemon).length} Pokemon, ${Object.keys(data.moves).length} moves, ${Object.keys(
      data.items,
    ).length} items, ${Object.keys(data.abilities).length} abilities and ${Object.keys(data.natures).length} natures.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
