import {
  InvalidSlugError,
  ItemDoesNotExistError,
  Storage as VarastoStorage,
} from '@varasto/storage';
import isArray from 'isarray';
import { isValidSlug } from 'is-valid-slug';
import { JsonObject } from 'type-fest';

import { WebStorageOptions } from './types';

/**
 * Creates new Web storage.
 *
 * @param storage Browser storage to use for storing the data.
 * @param options Optional serialization options.
 */
export const createWebStorage = (
  storage: Storage,
  options: Partial<WebStorageOptions> = {}
): VarastoStorage => {
  const serialize = options.serialize ?? JSON.stringify;
  const deserialize = options.deserialize ?? JSON.parse;

  const buildKey = (namespace: string, key: string) =>
    new Promise<string>((resolve, reject) => {
      if (!isValidSlug(namespace)) {
        reject(new InvalidSlugError('Given namespace is not valid slug'));
      } else if (!isValidSlug(key)) {
        reject(new InvalidSlugError('Given key is not valid slug'));
      } else {
        resolve(`${namespace}:${key}`);
      }
    });

  const getAllKeys = (namespace: string) =>
    new Promise<string[]>((resolve, reject) => {
      let data: string | null;
      let parsedData;

      if (!isValidSlug(namespace)) {
        reject(new InvalidSlugError('Given namespace is not valid slug'));
        return;
      }

      data = storage.getItem(`${namespace}:[[keys]]`);
      if (data == null) {
        resolve([]);
        return;
      }

      try {
        parsedData = JSON.parse(data);
      } catch (err) {
        reject(err);
        return;
      }

      resolve(isArray(parsedData) ? parsedData : []);
    });

  return {
    has(namespace: string, key: string): Promise<boolean> {
      return buildKey(namespace, key).then(
        (key) => storage.getItem(key) != null
      );
    },

    keys(namespace: string): Promise<string[]> {
      return getAllKeys(namespace);
    },

    values<T extends JsonObject>(namespace: string): Promise<T[]> {
      return getAllKeys(namespace).then((keys) =>
        Promise.all(keys.map((key) => this.get<T>(namespace, key))).then(
          (values) => values.filter((value) => value != null) as T[]
        )
      );
    },

    entries<T extends JsonObject>(namespace: string): Promise<[string, T][]> {
      return getAllKeys(namespace).then((keys) =>
        Promise.all(
          keys.map((key) =>
            this.get<T>(namespace, key).then((value) => [key, value])
          )
        ).then(
          (entries) =>
            entries.filter((entry) => entry[1] != null) as [string, T][]
        )
      );
    },

    get<T extends JsonObject>(
      namespace: string,
      key: string
    ): Promise<T | undefined> {
      return buildKey(namespace, key).then((key) => {
        const data = storage.getItem(key);
        let parsedData;

        if (data == null) {
          return undefined;
        }
        try {
          parsedData = deserialize(data);
        } catch (err) {
          return Promise.reject(err);
        }

        return parsedData != null && typeof parsedData === 'object'
          ? parsedData
          : undefined;
      });
    },

    set<T extends JsonObject>(
      namespace: string,
      key: string,
      value: T
    ): Promise<void> {
      return buildKey(namespace, key).then((fullKey) => {
        try {
          storage.setItem(fullKey, serialize(value));
        } catch (err) {
          return Promise.reject(err);
        }

        return getAllKeys(namespace).then((keys) => {
          if (!keys.includes(key)) {
            storage.setItem(
              `${namespace}:[[keys]]`,
              JSON.stringify([...keys, key])
            );
          }
        });
      });
    },

    update<T extends JsonObject>(
      namespace: string,
      key: string,
      value: Partial<T>
    ): Promise<T> {
      return this.get<T>(namespace, key).then((currentValue) => {
        if (currentValue != null) {
          const newValue = { ...currentValue, ...value };

          return this.set(namespace, key, newValue).then(() => newValue);
        }

        return Promise.reject(
          new ItemDoesNotExistError('Item does not exist')
        );
      });
    },

    delete(namespace: string, key: string): Promise<boolean> {
      return buildKey(namespace, key).then((fullKey) => {
        const exists = storage.getItem(fullKey) != null;

        storage.removeItem(fullKey);

        return getAllKeys(namespace).then((keys) => {
          storage.setItem(
            `${namespace}:[[keys]]`,
            JSON.stringify(keys.filter((k) => k !== key))
          );

          return exists;
        });
      });
    },
  };
};
