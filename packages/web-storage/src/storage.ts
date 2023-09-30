import {
  Entry,
  InvalidSlugError,
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

  const buildKey = async (namespace: string, key: string): Promise<string> => {
    if (!isValidSlug(namespace)) {
      throw new InvalidSlugError('Given namespace is not valid slug');
    } else if (!isValidSlug(key)) {
      throw new InvalidSlugError('Given key is not valid slug');
    }

    return `${namespace}:${key}`;
  };

  const getAllKeys = async (namespace: string): Promise<string[]> => {
    let data: string | null;
    let parsedData: string[];

    if (!isValidSlug(namespace)) {
      throw new InvalidSlugError('Given namespace is not valid slug');
    }

    data = storage.getItem(`${namespace}:[[keys]]`);
    if (data == null) {
      return [];
    }

    parsedData = JSON.parse(data);

    return isArray(parsedData) ? parsedData : [];
  };

  return new (class extends VarastoStorage {
    async *entries<T extends JsonObject>(
      namespace: string
    ): AsyncGenerator<Entry<T>> {
      const keys = await getAllKeys(namespace);

      for (const key of keys) {
        const value = await this.get<T>(namespace, key);

        if (value != null) {
          yield [key, value];
        }
      }
    }

    async *keys(namespace: string): AsyncGenerator<string> {
      const keys = await getAllKeys(namespace);

      for (const key of keys) {
        yield key;
      }
    }

    async *values<T extends JsonObject>(namespace: string): AsyncGenerator<T> {
      const keys = await getAllKeys(namespace);

      for (const key of keys) {
        const value = await this.get<T>(namespace, key);

        if (value != null) {
          yield value;
        }
      }
    }

    async has(namespace: string, key: string): Promise<boolean> {
      const storageKey = await buildKey(namespace, key);

      return storage.getItem(storageKey) != null;
    }

    async get<T extends JsonObject>(
      namespace: string,
      key: string
    ): Promise<T | undefined> {
      const storageKey = await buildKey(namespace, key);
      const data = storage.getItem(storageKey);
      let parsedData: T;

      if (data == null) {
        return undefined;
      }
      parsedData = deserialize(data) as T;

      return parsedData != null && typeof parsedData === 'object'
        ? parsedData
        : undefined;
    }

    async set<T extends JsonObject>(
      namespace: string,
      key: string,
      value: T
    ): Promise<void> {
      const storageKey = await buildKey(namespace, key);

      storage.setItem(storageKey, serialize(value));

      const keys = await getAllKeys(namespace);

      if (!keys.includes(key)) {
        storage.setItem(
          `${namespace}:[[keys]]`,
          JSON.stringify([...keys, key])
        );
      }
    }

    async delete(namespace: string, key: string): Promise<boolean> {
      const storageKey = await buildKey(namespace, key);
      const exists = storage.getItem(storageKey) != null;

      storage.removeItem(storageKey);

      const keys = await getAllKeys(namespace);

      storage.setItem(
        `${namespace}:[[keys]]`,
        JSON.stringify(keys.filter((k) => k !== key))
      );

      return exists;
    }
  })();
};
