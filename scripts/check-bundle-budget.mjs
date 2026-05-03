import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const assetsDir = resolve('dist/assets');
const INITIAL_JS_GZIP_LIMIT = 300 * 1024;
const TOTAL_JS_GZIP_LIMIT = 900 * 1024;

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

const files = await readdir(assetsDir);
const jsFiles = files.filter((file) => file.endsWith('.js'));
const learnsetChunk = jsFiles.find((file) => file.startsWith('learnsets-'));

if (learnsetChunk) {
  throw new Error(`Unexpected learnsets browser chunk remains: ${learnsetChunk}`);
}

const sizes = await Promise.all(
  jsFiles.map(async (file) => {
    const content = await readFile(resolve(assetsDir, file));
    return {
      file,
      rawBytes: content.byteLength,
      gzipBytes: gzipSync(content).byteLength,
    };
  }),
);
const initialChunk = sizes.find((asset) => asset.file.startsWith('index-') && asset.file.endsWith('.js'));

if (!initialChunk) {
  throw new Error('Unable to find initial index JS chunk in dist/assets.');
}

const totalGzipBytes = sizes.reduce((total, asset) => total + asset.gzipBytes, 0);

console.log('Bundle gzip sizes:');
for (const asset of sizes.sort((left, right) => left.file.localeCompare(right.file))) {
  console.log(`- ${asset.file}: ${formatBytes(asset.gzipBytes)} gzip, ${formatBytes(asset.rawBytes)} raw`);
}

if (initialChunk.gzipBytes > INITIAL_JS_GZIP_LIMIT) {
  throw new Error(
    `Initial JS gzip ${formatBytes(initialChunk.gzipBytes)} exceeds ${formatBytes(INITIAL_JS_GZIP_LIMIT)}.`,
  );
}

if (totalGzipBytes > TOTAL_JS_GZIP_LIMIT) {
  throw new Error(`Total JS gzip ${formatBytes(totalGzipBytes)} exceeds ${formatBytes(TOTAL_JS_GZIP_LIMIT)}.`);
}

console.log(
  `Bundle budget OK: initial ${formatBytes(initialChunk.gzipBytes)}, total JS ${formatBytes(totalGzipBytes)}.`,
);
