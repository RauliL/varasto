import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    alias: {
      redis: 'redis-mock',
    },
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text'],
    },
  },
});
