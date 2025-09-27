import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';
import aliases from './aliases.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true, // Enable global test functions like describe, it, expect
    environment: 'jsdom', // Use jsdom for DOM testing
    setupFiles: [], // Can add setup files here if needed
  },
  resolve: {
    alias: {
      ...aliases,
      // Convert aliases to work with vitest
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // TypeScript support is built-in
});
