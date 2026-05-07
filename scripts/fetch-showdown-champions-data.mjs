import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const SHOWDOWN_CHAMPIONS_FORMATS_DATA_URL =
  'https://raw.githubusercontent.com/smogon/pokemon-showdown/master/data/mods/champions/formats-data.ts';
const SHOWDOWN_CHAMPIONS_DIRECTORY_URL =
  'https://github.com/smogon/pokemon-showdown/tree/master/data/mods/champions';
const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const cacheSourcePath = resolve(repoRoot, 'node_modules/.cache/showdown-champions-formats-data.ts');
const cacheEntry = resolve(repoRoot, 'node_modules/.cache/showdown-champions-formats-data.mjs');
const outputPath = resolve(repoRoot, 'src/data/generated/championsShowdownSnapshot.ts');

function isLegalSpeciesRule(rule) {
  return typeof rule.tier === 'string' && rule.tier !== 'Illegal';
}

function normalizeSpeciesRule(rule) {
  return {
    ...(typeof rule.tier === 'string' ? { tier: rule.tier } : {}),
    ...(typeof rule.isNonstandard === 'string' ? { isNonstandard: rule.isNonstandard } : {}),
  };
}

async function fetchFormatsDataSource() {
  const response = await fetch(SHOWDOWN_CHAMPIONS_FORMATS_DATA_URL, {
    headers: {
      'user-agent': 'pokemon-champions-strategy-companion',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Impossible de télécharger Pokemon Showdown Champions formats-data.ts (${response.status} ${response.statusText})`,
    );
  }

  return response.text();
}

await mkdir(dirname(cacheSourcePath), { recursive: true });
await mkdir(dirname(outputPath), { recursive: true });

const sourceText = await fetchFormatsDataSource();
await writeFile(cacheSourcePath, sourceText);

await build({
  absWorkingDir: repoRoot,
  bundle: true,
  entryPoints: [cacheSourcePath],
  format: 'esm',
  outfile: cacheEntry,
  platform: 'node',
  sourcemap: false,
  target: 'node22',
});

const formatsDataModule = await import(`${pathToFileURL(cacheEntry).href}?t=${Date.now()}`);
const formatsData = formatsDataModule.FormatsData;

if (!formatsData || typeof formatsData !== 'object') {
  throw new Error('Le fichier Pokemon Showdown Champions formats-data.ts ne contient pas FormatsData.');
}

const speciesRules = Object.fromEntries(
  Object.entries(formatsData)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([speciesId, rule]) => [speciesId, normalizeSpeciesRule(rule)]),
);
const legalSpeciesIds = Object.entries(speciesRules)
  .filter(([, rule]) => isLegalSpeciesRule(rule))
  .map(([speciesId]) => speciesId);
const snapshot = {
  sourceUrls: {
    formatsData: SHOWDOWN_CHAMPIONS_FORMATS_DATA_URL,
    directory: SHOWDOWN_CHAMPIONS_DIRECTORY_URL,
  },
  checkedAt: new Date().toISOString(),
  speciesRules,
  legalSpeciesIds,
};
const serializedSnapshot = JSON.stringify(snapshot, null, 2);

await writeFile(
  outputPath,
  `import type { ChampionsShowdownSnapshot } from '../showdownChampions';\n\nexport const championsShowdownSnapshot = ${serializedSnapshot} satisfies ChampionsShowdownSnapshot;\n`,
);

console.log(
  `Generated ${outputPath} (${Object.keys(speciesRules).length} rules, ${legalSpeciesIds.length} legal species/form IDs)`,
);
