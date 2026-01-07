import { defineConfig, mergeConfig } from 'vitest/config';
import swc from 'unplugin-swc';

import sharedConfig from '../../vitest.config';

export default mergeConfig(
  sharedConfig,
  defineConfig({
    plugins: [swc.vite()],
  }),
);
