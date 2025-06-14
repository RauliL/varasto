import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  plugins: [swc.vite()],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text'],
    },
  },
});
