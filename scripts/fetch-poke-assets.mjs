import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_PATH = resolve(ROOT_DIR, 'src/data/generated/pokeAssets.ts');
const POKEAPI_DATA_REF = process.env.POKEAPI_DATA_REF ?? 'master';
const CSV_URL_PREFIX = 'https://raw.githubusercontent.com/PokeAPI/pokeapi';
const CSV_URL_SUFFIX = 'data/v2/csv';
const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites';
const FETCH_TIMEOUT_MS = 15_000;
const MAX_CSV_BYTES = 5 * 1024 * 1024;
const REQUIRED_CSV_HEADERS = {
  'pokemon.csv': ['id', 'identifier', 'species_id'],
  'pokemon_forms.csv': ['id', 'pokemon_id'],
  'pokemon_form_names.csv': ['pokemon_form_id', 'local_language_id', 'pokemon_name', 'form_name'],
  'pokemon_species_names.csv': ['pokemon_species_id', 'local_language_id', 'name'],
  'move_names.csv': ['move_id', 'local_language_id', 'name'],
  'ability_names.csv': ['ability_id', 'local_language_id', 'name'],
  'ability_prose.csv': ['ability_id', 'local_language_id', 'short_effect'],
  'item_names.csv': ['item_id', 'local_language_id', 'name'],
  'item_prose.csv': ['item_id', 'local_language_id', 'short_effect'],
  'nature_names.csv': ['nature_id', 'local_language_id', 'name'],
};
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

function byteLength(value) {
  return Buffer.byteLength(value, 'utf8');
}

export function buildPokeApiCsvUrl(fileName, ref = POKEAPI_DATA_REF) {
  return `${CSV_URL_PREFIX}/${ref}/${CSV_URL_SUFFIX}/${fileName}`;
}

export function parseCsv(text) {
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
  if (!headers) {
    return [];
  }

  return body.map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])),
  );
}

function validateRequiredHeaders(fileName, rows, requiredHeaders = REQUIRED_CSV_HEADERS[fileName] ?? []) {
  if (requiredHeaders.length === 0) {
    return;
  }

  const headers = new Set(Object.keys(rows[0] ?? {}));
  const missingHeader = requiredHeaders.find((header) => !headers.has(header));
  if (missingHeader) {
    throw new Error(`${fileName} missing required header ${missingHeader}`);
  }
}

export async function fetchCsv(
  fileName,
  {
    fetcher = fetch,
    ref = POKEAPI_DATA_REF,
    timeoutMs = FETCH_TIMEOUT_MS,
    maxBytes = MAX_CSV_BYTES,
    requiredHeaders = REQUIRED_CSV_HEADERS[fileName],
  } = {},
) {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetcher(buildPokeApiCsvUrl(fileName, ref), { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Unable to fetch ${fileName}: ${response.status} ${response.statusText}`);
    }

    const contentLength = Number(response.headers?.get?.('content-length'));
    if (Number.isFinite(contentLength) && contentLength > maxBytes) {
      throw new Error(`${fileName} is too large (${contentLength} bytes > ${maxBytes} bytes)`);
    }

    const text = await response.text();
    const textBytes = byteLength(text);
    if (textBytes > maxBytes) {
      throw new Error(`${fileName} is too large (${textBytes} bytes > ${maxBytes} bytes)`);
    }

    const rows = parseCsv(text);
    validateRequiredHeaders(fileName, rows, requiredHeaders);
    return rows;
  } catch (error) {
    if (timedOut || error?.name === 'AbortError') {
      throw new Error(`Fetching ${fileName} timed out after ${timeoutMs}ms`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
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

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
