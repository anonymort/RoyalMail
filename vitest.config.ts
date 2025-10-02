import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.')
    }
  },
  test: {
    environment: 'node',
    clearMocks: true,
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts']
  }
});
