import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const cacheEntry = resolve(repoRoot, 'node_modules/.cache/pkmn-reference-builder.mjs');
const outputPath = resolve(repoRoot, 'src/data/generated/pkmnReferenceSnapshot.ts');
const stableImportedAt = '2026-05-03T00:00:00.000Z';

await mkdir(dirname(cacheEntry), { recursive: true });
await mkdir(dirname(outputPath), { recursive: true });

await build({
  absWorkingDir: repoRoot,
  bundle: true,
  entryPoints: ['src/data/pkmnReferenceBuilder.ts'],
  format: 'esm',
  outfile: cacheEntry,
  platform: 'node',
  sourcemap: false,
  target: 'node22',
});

const builderModule = await import(`${pathToFileURL(cacheEntry).href}?t=${Date.now()}`);
const snapshot = await builderModule.buildPkmnReferenceSnapshot({ importedAt: stableImportedAt });
const serializedSnapshot = JSON.stringify(snapshot, null, 2);

await writeFile(
  outputPath,
  `import type { ReferenceSnapshot } from '../../domain/types';\n\nexport const pkmnReferenceSnapshot = ${serializedSnapshot} satisfies ReferenceSnapshot;\n`,
);

console.log(
  `Generated ${outputPath} (${Object.keys(snapshot.pokemon).length} Pokemon, ${Object.keys(snapshot.moves).length} moves)`,
);
