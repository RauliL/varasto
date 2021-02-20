import fs from 'fs';
import { JsonObject } from 'type-fest';

import { buildFilename, createNamespace } from './utils';
import { Storage, StorageOptions } from './types';

/**
 * Creates new storage with given options.
 */
export const createStorage = (options?: Partial<StorageOptions>): Storage => {
  const dir = options?.dir ?? './data';
  const encoding = options?.encoding ?? 'utf-8';

  return {
    has: (namespace: string, key: string): boolean => {
      let filename: string;

      try {
        filename = buildFilename(dir, namespace, key);
      } catch {
        return false;
      }

      return fs.existsSync(filename);
    },

    get: (namespace: string, key: string): Promise<JsonObject | undefined> =>
      new Promise<JsonObject | undefined>((resolve, reject) => {
        let filename: string;

        try {
          filename = buildFilename(dir, namespace, key);
        } catch (err) {
          reject(err);
          return;
        }

        fs.readFile(
          filename,
          encoding,
          (err, text) => {
            if (err) {
              if (err.code === 'ENOENT') {
                resolve(undefined);
              } else {
                reject(err);
              }
              return;
            }

            try {
              const value = JSON.parse(text);

              if (typeof value === 'object') {
                resolve(value);
              } else {
                resolve(undefined); // XXX: Perhaps this should be an error?
              }
            } catch (err) {
              reject(err);
              return;
            }
          },
        );
      }),

    set: (namespace: string, key: string, value: JsonObject): Promise<void> =>
      createNamespace(dir, namespace)
        .then(() => new Promise<void>((resolve, reject) => {
          let filename: string;

          try {
            filename = buildFilename(dir, namespace, key);
          } catch (err) {
            reject(err);
            return;
          }

          fs.writeFile(
            filename,
            JSON.stringify(value),
            encoding,
            (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            },
          )
        })),

    delete: (namespace: string, key: string): Promise<boolean> =>
      new Promise<boolean>((resolve, reject) => {
        let filename: string;

        try {
          filename = buildFilename(dir, namespace, key);
        } catch (err) {
          reject(err);
          return;
        }

        fs.exists(filename, (exists) => {
          if (!exists) {
            resolve(false);
            return;
          }

          fs.unlink(filename, (err) => {
            if (err) {
              if (err.code === 'ENOENT') {
                resolve(false);
              } else {
                reject(err);
              }
            } else {
              resolve(true);
            }
          });
        });
      }),
  }
};
