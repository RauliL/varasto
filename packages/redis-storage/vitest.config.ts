import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    alias: {
      redis: 'redis-mock',
    },
    coverage: {
      provider: 'istanbul',
      reporter: ['lcov', 'text'],
    },
  },
});
