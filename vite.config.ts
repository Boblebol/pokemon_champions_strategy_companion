import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
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
