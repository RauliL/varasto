import { validateNamespace, validateNamespaceAndKey } from '@varasto/storage';
import { randomUUID } from 'node:crypto';
import { access, readdir } from 'node:fs/promises';
import fs from 'fs';
import { mkdirp } from 'mkdirp';
import path from 'path';
import { JsonObject } from 'type-fest';

export const createNamespace = async (
  dir: string,
  namespace: string
): Promise<void> => {
  validateNamespace(namespace);

  const filename = path.join(dir, namespace);

  try {
    await access(filename);
  } catch {
    await mkdirp(filename);
  }
};

export const buildFilename = (
  dir: string,
  namespace: string,
  key: string
): string => {
  validateNamespaceAndKey(namespace, key);

  return path.join(dir, namespace, `${key}.json`);
};

export const fileExists = (filename: string): Promise<boolean> =>
  new Promise<boolean>((resolve) => {
    fs.access(filename, fs.constants.F_OK, (err) => {
      resolve(!err);
    });
  });

export const globNamespace = async (
  dir: string,
  namespace: string
): Promise<string[]> => {
  validateNamespace(namespace);

  const namespaceDir = path.join(dir, namespace);

  try {
    return (await readdir(namespaceDir))
      .filter((file) => file.endsWith('.json'))
      .map((file) => path.join(namespaceDir, file));
  } catch (err) {
    if (
      err != null &&
      typeof err === 'object' &&
      'code' in err &&
      err.code === 'ENOENT'
    ) {
      return [];
    }

    throw err;
  }
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

export const DEFAULT_READ_CONCURRENCY = 16;

export async function* readNamespaceItems<T extends JsonObject>(
  filenames: string[],
  encoding: BufferEncoding,
  deserialize: (data: string) => JsonObject,
  concurrency = DEFAULT_READ_CONCURRENCY
): AsyncGenerator<{ filename: string; value: T }> {
  for (let i = 0; i < filenames.length; i += concurrency) {
    const batch = filenames.slice(i, i + concurrency);
    const items = await Promise.all(
      batch.map(async (filename) => ({
        filename,
        value: await readItem<T>(filename, encoding, deserialize),
      }))
    );

    for (const { filename, value } of items) {
      if (value !== undefined) {
        yield { filename, value };
      }
    }
  }
}

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
