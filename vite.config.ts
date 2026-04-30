import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

declare const process: {
  env: Record<string, string | undefined>;
};

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/pokemon_champions_strategy_companion/' : '/',
  plugins: [react()],
  server: {
    proxy: {
      '/smogon-stats': {
        target: 'https://www.smogon.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/smogon-stats/, ''),
      },
    },
  },
});
