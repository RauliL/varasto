import { vol } from 'memfs';
import { vi } from 'vitest';

vi.mock('fs', async () => {
  const memfs = await vi.importActual<typeof import('memfs')>('memfs');

  return { default: memfs.fs, ...memfs.fs };
});
vi.mock('node:fs', async () => {
  const memfs = await vi.importActual<typeof import('memfs')>('memfs');

  return { default: memfs.fs, ...memfs.fs };
});
vi.mock('node:fs/promises', async () => {
  const memfs = await vi.importActual<typeof import('memfs')>('memfs');

  return { default: memfs.fs.promises, ...memfs.fs.promises };
});

export const setupVol = (json: Parameters<typeof vol.fromNestedJSON>[0]) => {
  vol.fromNestedJSON(json, process.cwd());
};

export const resetVol = () => {
  vol.reset();
};

export { vol };
