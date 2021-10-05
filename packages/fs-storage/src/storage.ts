import { ItemDoesNotExistError, Storage } from '@varasto/storage';
import fs from 'fs';
import path from 'path';
import { JsonObject } from 'type-fest';

import { FileSystemStorageOptions } from './types';
import {
  buildFilename,
  createNamespace,
  globNamespace,
  readItem,
} from './utils';

/**
 * Creates new file system storage with given options.
 */
export const createFileSystemStorage = (
  options?: Partial<FileSystemStorageOptions>
): Storage => {
  const dir = options?.dir ?? './data';
  const encoding = options?.encoding ?? 'utf-8';

  return {
    has: (namespace: string, key: string): Promise<boolean> => {
      let filename: string;

      try {
        filename = buildFilename(dir, namespace, key);
      } catch {
        return Promise.resolve(false);
      }

      return Promise.resolve(fs.existsSync(filename));
    },

    keys: (namespace: string): Promise<string[]> =>
      globNamespace(dir, namespace).then((matches) =>
        matches.map((match) => path.basename(match, '.json'))
      ),

    values: <T extends JsonObject>(namespace: string): Promise<T[]> =>
      globNamespace(dir, namespace)
        .then((filenames) =>
          Promise.all(
            filenames.map((filename) => readItem(filename, encoding))
          )
        )
        .then(
          (values) => values.filter((value) => value !== undefined) as T[]
        ),

    entries: <T extends JsonObject>(
      namespace: string
    ): Promise<[string, T][]> =>
      globNamespace(dir, namespace)
        .then((filenames) =>
          Promise.all(
            filenames.map((filename) =>
              readItem(filename, encoding).then((value) => [
                path.basename(filename, '.json'),
                value,
              ])
            )
          )
        )
        .then(
          (entries) =>
            entries.filter((entry) => entry[1] !== undefined) as [string, T][]
        ),

    get: <T extends JsonObject>(
      namespace: string,
      key: string
    ): Promise<T | undefined> => {
      let filename: string;

      try {
        filename = buildFilename(dir, namespace, key);
      } catch (err) {
        return Promise.reject(err);
      }

      return readItem<T>(filename, encoding);
    },

    set: <T extends JsonObject>(
      namespace: string,
      key: string,
      value: T
    ): Promise<void> =>
      createNamespace(dir, namespace).then(
        () =>
          new Promise<void>((resolve, reject) => {
            let filename: string;

            try {
              filename = buildFilename(dir, namespace, key);
            } catch (err) {
              reject(err);
              return;
            }

            fs.writeFile(filename, JSON.stringify(value), encoding, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          })
      ),

    update: <T extends JsonObject>(
      namespace: string,
      key: string,
      value: Partial<T>
    ): Promise<T> => {
      let filename: string;

      try {
        filename = buildFilename(dir, namespace, key);
      } catch (err) {
        return Promise.reject(err);
      }

      return readItem(filename, encoding).then((oldValue) => {
        if (oldValue !== undefined) {
          const newValue = { ...oldValue, ...value } as T;

          return new Promise<T>((resolve, reject) => {
            fs.writeFile(
              filename,
              JSON.stringify(newValue),
              encoding,
              (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(newValue);
                }
              }
            );
          });
        }

        return Promise.reject(
          new ItemDoesNotExistError('Item does not exist')
        );
      });
    },

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
  };
};
