/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import istanbul from 'vite-plugin-istanbul';

import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    // Active l'instrumentation Istanbul uniquement si VITE_COVERAGE=true
    istanbul({
      include: 'src/*',
      exclude: ['node_modules', 'test/', '**/*.spec.ts', '**/*.spec.tsx'],
      extension: ['.js', '.ts', '.tsx', '.jsx'],
      requireEnv: true, // requiert VITE_COVERAGE=true
    }),
  ],
  resolve: {
    alias: {
      'shared': path.resolve(__dirname, '../shared/src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/features/**/*.tsx', 'src/features/**/*.ts'],
      exclude: ['**/*.spec.ts', '**/*.spec.tsx']
    }
  },
});
