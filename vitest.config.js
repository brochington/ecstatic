import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
  },
  bench: {
    reporters: ['verbose'],
  },
  resolve: {
    alias: {
      // Convert aliases to work with vitest
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
