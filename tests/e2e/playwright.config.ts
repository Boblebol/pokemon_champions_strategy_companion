import { defineConfig } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(currentDir, '../..');
const port = Number(process.env.E2E_PORT ?? 4179);
const baseURL = `http://127.0.0.1:${port}`;
const localChromeChannel = process.env.CI ? undefined : (process.env.PLAYWRIGHT_CHANNEL ?? 'chrome');

export default defineConfig({
  testDir: currentDir,
  timeout: 45_000,
  expect: {
    timeout: 8_000,
  },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    browserName: 'chromium',
    channel: localChromeChannel,
    viewport: { width: 390, height: 844 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: `pnpm run build && pnpm exec vite preview --host 127.0.0.1 --port ${port} --strictPort`,
    cwd: rootDir,
    url: `${baseURL}/app`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
