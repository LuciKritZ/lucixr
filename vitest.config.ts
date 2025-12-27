import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  test: {
    environment: 'jsdom',
    exclude: [
      ...configDefaults.exclude,
      '.trunk/**',
      '.next/**',
      'out/**',
      'build/**',
    ],
    globals: true,
    setupFiles: [],
  },
});
