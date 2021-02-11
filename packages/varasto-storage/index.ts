/* eslint-disable @typescript-eslint/ban-types */
import crypto from 'crypto';
import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';

/**
 * JSON key-value store that persists JSON objects to disk.
 */
export type Storage = {
  /**
   * Attempts to retrieve an item identified by `key`. Returned promise will
   * resolve into the value, or `undefined` if item with the given identifier
   * does not exist.
   *
   * The promise will fail if an I/O error occurs.
   */
  getItem: (key: string) => Promise<Object | undefined>;

  /**
   * Attempts to store an item identified by `key`.
   *
   * The promise will fail if an I/O error occurs.
   */
  setItem: (key: string, value: Object) => Promise<void>;

  /**
   * Attempts to remove an item identified by `key`. Returned promise will
   * resolve into a boolean value which tells whether an value with the given
   * identifier existed or not.
   *
   * The promise will fail if an I/O error occurs.
   */
  removeItem: (key: string) => Promise<boolean>;
};

/**
 * Various options that can be given to the storage instance.
 */
export type StorageOptions = {
  /** Path to the directory where items are being stored. */
  dir: string;
  /** Character encoding to use. Defaults to UTF-8. */
  encoding: string;
};

/**
 * Constructs new storage instance.
 *
 * @param options Options for the created storage instance.
 */
export const createStorage = (options?: Partial<StorageOptions>): Storage => {
  const dir = options?.dir ?? './data';
  const encoding = options?.encoding ?? 'utf-8';
  const getItemPath = (key: string): string =>
    path.join(
      dir,
      `${crypto.createHash('md5').update(key).digest('hex')}.json`,
    );
  const ensureDirectoryExists = (): Promise<void> =>
    new Promise<void>((resolve, reject) => {
      fs.exists(dir, (exists) => {
        if (exists) {
          resolve();
        } else {
          mkdirp(dir)
            .then(() => resolve())
            .catch(reject);
        }
      });
    });

  return {
    getItem(key: string): Promise<Object | undefined> {
      const itemPath = getItemPath(key);

      return new Promise<Object | undefined>((resolve, reject) => {
        fs.readFile(
          itemPath,
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
              const content = JSON.parse(text);

              if (content.key === key &&
                  content.value != null &&
                  typeof content.value === 'object') {
                resolve(content.value);
              } else {
                resolve(undefined);
              }
            } catch (err) {
              reject(err);
              return;
            }
          },
        );
      });
    },

    setItem(key: string, value: Object): Promise<void> {
      const itemPath = getItemPath(key);

      return ensureDirectoryExists()
        .then(() => new Promise((resolve, reject) => {
          const content = { key, value };

          fs.writeFile(
            itemPath,
            JSON.stringify(content),
            encoding,
            (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            },
          );
        }));
    },

    removeItem(key: string): Promise<boolean> {
      const itemPath = getItemPath(key);

      return new Promise<boolean>((resolve, reject) => {
        fs.exists(itemPath, (exists) => {
          if (!exists) {
            resolve(false);
            return;
          }

          fs.unlink(itemPath, (err) => {
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
      });
    }
  }
};
