import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './public/manifest.json';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    crx({ manifest }),
  ],
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        content: 'src/content/index.ts',
      },
    },
  },
});
