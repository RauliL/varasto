import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['src/index.ts'],
      include: ['src/**/*.ts'],
      provider: 'v8',
      reporter: ['lcov', 'text'],
    },
    server: {
      deps: {
        inline: ['glob', 'mkdirp', 'path-scurry'],
      },
    },
  },
});
