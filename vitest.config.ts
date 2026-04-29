import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vitest/config';

export default defineConfig({
  // Vitest 2 installs Vite 5 internally while the scaffold uses Vite 6.
  plugins: [react() as unknown as Plugin[]],
  test: {
    environment: 'jsdom',
    globals: true,
    passWithNoTests: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
