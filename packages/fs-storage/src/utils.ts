import { InvalidSlugError } from '@varasto/storage';
import { randomUUID } from 'node:crypto';
import fs from 'fs';
import { isValidSlug } from 'is-valid-slug';
import { mkdirp } from 'mkdirp';
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

export const fileExists = (filename: string): Promise<boolean> =>
  new Promise<boolean>((resolve) => {
    fs.access(filename, fs.constants.F_OK, (err) => {
      resolve(!err);
    });
  });

export const globNamespace = (
  dir: string,
  namespace: string
): Promise<string[]> => {
  if (!isValidSlug(namespace)) {
    return Promise.reject(
      new InvalidSlugError('Given namespace is not valid slug')
    );
  }

  const namespaceDir = path.join(dir, namespace);

  return new Promise<string[]>((resolve, reject) => {
    fs.readdir(namespaceDir, (err, files) => {
      if (err) {
        if (err.code === 'ENOENT') {
          resolve([]);
        } else {
          reject(err);
        }
        return;
      }

      resolve(
        files
          .filter((file) => file.endsWith('.json'))
          .map((file) => path.join(namespaceDir, file))
      );
    });
  });
};

export const readItem = <T extends JsonObject>(
  filename: string,
  encoding: BufferEncoding,
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

export const writeItem = (
  filename: string,
  data: string,
  encoding: BufferEncoding
): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    const tempFilename = `${filename}.${randomUUID()}.tmp`;

    fs.writeFile(tempFilename, data, encoding, (err) => {
      if (err) {
        reject(err);
        return;
      }

      fs.rename(tempFilename, filename, (err) => {
        if (err) {
          fs.unlink(tempFilename, () => reject(err));
        } else {
          resolve();
        }
      });
    });
  });
