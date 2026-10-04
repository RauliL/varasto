import { memfs } from 'memfs';
import { vi } from 'vitest';

const { fs, vol } = memfs(
  {},
  {
    process: {
      cwd: () => process.cwd(),
      platform: process.platform,
      emitWarning: process.emitWarning.bind(process),
      env: process.env,
      getuid: process.getuid?.bind(process),
      getgid: process.getgid?.bind(process),
    },
  }
);

vi.mock('fs', () => ({
  default: fs,
  ...fs,
}));
vi.mock('node:fs', () => ({
  default: fs,
  ...fs,
}));
vi.mock('node:fs/promises', () => ({
  default: fs.promises,
  ...fs.promises,
}));

export const setupVolFiles = (json: Parameters<typeof vol.fromJSON>[0]) => {
  vol.fromJSON(json, process.cwd());
};

export const resetVol = () => {
  vol.reset();
};

export { vol };
