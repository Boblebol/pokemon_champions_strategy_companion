import { access, readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const repoRoot = process.cwd();
const requiredFiles = [
  'public/manifest.webmanifest',
  'public/sw.js',
  'public/icons/icon.svg',
  'public/icons/maskable-icon.svg',
  'public/icons/apple-touch-icon.svg',
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function fileExists(path) {
  await access(resolve(repoRoot, path));
}

for (const file of requiredFiles) {
  await fileExists(file);
}

const manifest = JSON.parse(await readFile(resolve(repoRoot, 'public/manifest.webmanifest'), 'utf8'));
assert(manifest.name === 'Pokemon Champions Strategy Companion', 'manifest.name is incorrect');
assert(manifest.short_name === 'Champions', 'manifest.short_name is incorrect');
assert(manifest.lang === 'fr', 'manifest.lang must be fr');
assert(manifest.display === 'standalone', 'manifest.display must be standalone');
assert(manifest.start_url === './mobile', 'manifest.start_url must target ./mobile for the PWA mobile front');
assert(manifest.scope === './', 'manifest.scope must be ./ for GitHub Pages');
assert(Array.isArray(manifest.icons) && manifest.icons.length >= 3, 'manifest.icons must include app icons');
assert(
  manifest.icons.some((icon) => icon.purpose?.includes('maskable')),
  'manifest.icons must include a maskable icon',
);

const indexHtml = await readFile(resolve(repoRoot, 'index.html'), 'utf8');
assert(
  indexHtml.includes('<link rel="manifest" href="%BASE_URL%manifest.webmanifest"'),
  'index.html must link manifest through %BASE_URL%',
);
assert(indexHtml.includes('name="theme-color"'), 'index.html must define theme-color');
assert(indexHtml.includes('apple-mobile-web-app-capable'), 'index.html must define iOS standalone metadata');
assert(indexHtml.includes('apple-touch-icon'), 'index.html must link an Apple touch icon');

const sw = await readFile(resolve(repoRoot, 'public/sw.js'), 'utf8');
assert(sw.includes('install'), 'service worker must listen for install');
assert(sw.includes('fetch'), 'service worker must listen for fetch');
assert(sw.includes('pokemon-champions-shell'), 'service worker must use an app shell cache');

const styles = await readFile(resolve(repoRoot, 'src/styles.css'), 'utf8');
assert(styles.includes('.mobile-app-nav'), 'styles must define the mobile app navigation');
assert(styles.includes('env(safe-area-inset-bottom'), 'styles must account for mobile safe-area inset');
assert(styles.includes('@media (max-width: 900px)'), 'styles must include the mobile breakpoint');

await fileExists('dist/index.html');
await fileExists('dist/mobile/index.html');
await fileExists('dist/manifest.webmanifest');
await fileExists('dist/sw.js');

const distIndexHtml = await readFile(resolve(repoRoot, 'dist/index.html'), 'utf8');
assert(distIndexHtml.includes('rel="manifest"'), 'dist/index.html must link manifest');
assert(distIndexHtml.includes('apple-mobile-web-app-capable'), 'dist/index.html must keep iOS metadata');

const assetFiles = await readdir(resolve(repoRoot, 'dist/assets'));
const jsAssets = assetFiles.filter((file) => file.endsWith('.js'));
const jsContents = await Promise.all(jsAssets.map((file) => readFile(resolve(repoRoot, 'dist/assets', file), 'utf8')));
assert(
  jsContents.some((content) => content.includes('serviceWorker') && content.includes('sw.js')),
  'built JS must register the service worker',
);

console.log('PWA metadata OK');
