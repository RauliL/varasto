import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';

import { isValidSlug } from './slug';
import { InvalidSlugError } from './types';

export const createNamespace = (
  dir: string,
  namespace: string,
): Promise<void> => new Promise<void>((resolve, reject) => {
  if (!isValidSlug(namespace)) {
    reject(new InvalidSlugError('Given namespace is not valid slug'));
    return;
  }

  const filename = path.join(dir, namespace);

  fs.exists(filename, (exists) => {
    if (exists) {
      resolve();
    } else {
      mkdirp(filename)
        .then(() => resolve())
        .catch(reject);
    }
  });
});

export const buildFilename = (
  dir: string,
  namespace: string,
  key: string,
): string => {
  if (!isValidSlug(namespace)) {
    throw new InvalidSlugError('Given namespace is not valid slug');
  }

  if (!isValidSlug(key)) {
    throw new InvalidSlugError('Given key is not valid slug');
  }

  return path.join(dir, namespace, `${key}.json`);
};
