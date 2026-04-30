import { copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const routes = ['app', 'docs', 'landing'];
const source = join('dist', 'index.html');

await Promise.all(
  routes.map(async (route) => {
    const directory = join('dist', route);
    await mkdir(directory, { recursive: true });
    await copyFile(source, join(directory, 'index.html'));
  }),
);
