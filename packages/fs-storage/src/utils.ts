import { InvalidSlugError } from '@varasto/storage';
import fs from 'fs';
import glob from 'glob';
import { isValidSlug } from 'is-valid-slug';
import mkdirp from 'mkdirp';
import path from 'path';
import { JsonObject } from 'type-fest';

export const createNamespace = (
  dir: string,
  namespace: string
): Promise<void> =>
  new Promise<void>((resolve, reject) => {
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
  key: string
): string => {
  if (!isValidSlug(namespace)) {
    throw new InvalidSlugError('Given namespace is not valid slug');
  }

  if (!isValidSlug(key)) {
    throw new InvalidSlugError('Given key is not valid slug');
  }

  return path.join(dir, namespace, `${key}.json`);
};

export const globNamespace = (
  dir: string,
  namespace: string
): Promise<string[]> =>
  new Promise<string[]>((resolve, reject) => {
    if (!isValidSlug(namespace)) {
      reject(new InvalidSlugError('Given namespace is not valid slug'));
      return;
    }

    glob(`${path.join(dir, namespace)}/*.json`, (err, matches) => {
      if (err) {
        reject(err);
      } else {
        resolve(matches);
      }
    });
  });

export const readItem = <T extends JsonObject>(
  filename: string,
  encoding: string,
  deserialize: (data: string) => JsonObject
): Promise<T | undefined> =>
  new Promise<T | undefined>((resolve, reject) => {
    fs.readFile(filename, encoding, (err, text) => {
      if (err) {
        if (err.code === 'ENOENT') {
          resolve(undefined);
        } else {
          reject(err);
        }
        return;
      }

      try {
        const value = deserialize(text);

        if (typeof value === 'object') {
          resolve(value as T);
        } else {
          resolve(undefined); // XXX: Perhaps this should be an error?
        }
      } catch (err) {
        reject(err);
      }
    });
  });
