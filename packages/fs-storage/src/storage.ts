import { Entry, ItemDoesNotExistError, Storage } from '@varasto/storage';
import fs from 'fs';
import path from 'path';
import { JsonObject } from 'type-fest';

import { FileSystemStorageOptions } from './types.js';
import {
  buildFilename,
  createNamespace,
  fileExists,
  globNamespace,
  readItem,
  readNamespaceItems,
  writeItem,
} from './utils.js';

/**
 * Creates new file system storage with given options.
 */
export const createFileSystemStorage = (
  options: Partial<FileSystemStorageOptions> = {}
): Storage => {
  const dir = options.dir ?? './data';
  const encoding = options.encoding ?? 'utf-8';
  const serialize = options.serialize ?? JSON.stringify;
  const deserialize = options.deserialize ?? JSON.parse;

  return new (class extends Storage {
    has(namespace: string, key: string): Promise<boolean> {
      let filename: string;

      try {
        filename = buildFilename(dir, namespace, key);
      } catch {
        return Promise.resolve(false);
      }

      return fileExists(filename);
    }

    async *keys(namespace: string): AsyncGenerator<string> {
      const matches = await globNamespace(dir, namespace);

      for (const match of matches) {
        yield path.basename(match, '.json');
      }
    }

    async *values<T extends JsonObject>(namespace: string): AsyncGenerator<T> {
      const filenames = await globNamespace(dir, namespace);

      for await (const { value } of readNamespaceItems<T>(
        filenames,
        encoding,
        deserialize
      )) {
        yield value;
      }
    }

    async *entries<T extends JsonObject>(
      namespace: string
    ): AsyncGenerator<Entry<T>> {
      const filenames = await globNamespace(dir, namespace);

      for await (const { filename, value } of readNamespaceItems<T>(
        filenames,
        encoding,
        deserialize
      )) {
        yield [path.basename(filename, '.json'), value];
      }
    }

    get<T extends JsonObject>(
      namespace: string,
      key: string
    ): Promise<T | undefined> {
      let filename: string;

      try {
        filename = buildFilename(dir, namespace, key);
      } catch (err) {
        return Promise.reject(err);
      }

      return readItem<T>(filename, encoding, deserialize);
    }

    set<T extends JsonObject>(
      namespace: string,
      key: string,
      value: T
    ): Promise<void> {
      return createNamespace(dir, namespace).then(
        () =>
          new Promise<void>((resolve, reject) => {
            let filename: string;

            try {
              filename = buildFilename(dir, namespace, key);
            } catch (err) {
              reject(err);
              return;
            }

            writeItem(filename, serialize(value), encoding).then(resolve).catch(reject);
          })
      );
    }

    update<T extends JsonObject>(
      namespace: string,
      key: string,
      value: Partial<T>
    ): Promise<T> {
      let filename: string;

      try {
        filename = buildFilename(dir, namespace, key);
      } catch (err) {
        return Promise.reject(err);
      }

      return readItem(filename, encoding, deserialize).then((oldValue) => {
        if (oldValue !== undefined) {
          const newValue = { ...oldValue, ...value } as T;

          return writeItem(filename, serialize(newValue), encoding).then(
            () => newValue
          );
        }

        return Promise.reject(
          new ItemDoesNotExistError('Item does not exist')
        );
      });
    }

    delete(namespace: string, key: string): Promise<boolean> {
      return new Promise<boolean>((resolve, reject) => {
        let filename: string;

        try {
          filename = buildFilename(dir, namespace, key);
        } catch (err) {
          reject(err);
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
    }
  })();
};
