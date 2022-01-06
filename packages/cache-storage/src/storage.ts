import { Storage } from '@varasto/storage';
import { JsonObject } from 'type-fest';

import { Cache, NamespaceCache } from './cache';

/**
 * Constructs storage that acts as an cache for another storage.
 *
 * @param storage Storage to create cache for.
 * @param ttl Lifespan in milliseconds for cached entries. If omitted, entries
 *            will be cached indefinitely.
 */
export const createCacheStorage = (
  storage: Storage,
  ttl?: number
): Storage => {
  const keyCache = new Cache<string[]>(ttl);
  const valueCache = new Cache<JsonObject[]>(ttl);
  const entryCache = new Cache<[string, JsonObject][]>(ttl);
  const namespaceCache = new NamespaceCache(ttl);

  return {
    keys(namespace: string) {
      const keys = keyCache.get(namespace);

      if (keys != null) {
        return Promise.resolve(keys);
      }

      return storage.keys(namespace).then((keys) => {
        keyCache.set(namespace, keys);

        return Promise.resolve(keys);
      });
    },

    values<T extends JsonObject>(namespace: string) {
      const values = valueCache.get(namespace);

      if (values != null) {
        return Promise.resolve(values as T[]);
      }

      return storage.values<T>(namespace).then((values) => {
        valueCache.set(namespace, values);

        return Promise.resolve(values);
      });
    },

    entries<T extends JsonObject>(namespace: string) {
      const entries = entryCache.get(namespace);

      if (entries != null) {
        return Promise.resolve(entries as [string, T][]);
      }

      return storage.entries<T>(namespace).then((entries) => {
        entryCache.set(namespace, entries);

        return Promise.resolve(entries);
      });
    },

    has(namespace: string, key: string) {
      const cachedValue = namespaceCache.get(namespace, key);

      if (cachedValue != null) {
        return Promise.resolve(true);
      }

      return storage.has(namespace, key);
    },

    get<T extends JsonObject>(
      namespace: string,
      key: string
    ): Promise<T | undefined> {
      const cachedValue = namespaceCache.get(namespace, key);

      if (cachedValue != null) {
        return Promise.resolve(cachedValue as T);
      }

      return storage.get<T>(namespace, key).then((value) => {
        if (value != null) {
          namespaceCache.set(namespace, key, value);
        }

        return Promise.resolve(value);
      });
    },

    set<T extends JsonObject>(namespace: string, key: string, value: T) {
      return storage.set<T>(namespace, key, value).then(() => {
        keyCache.delete(namespace);
        valueCache.delete(namespace);
        entryCache.delete(namespace);
        namespaceCache.set(namespace, key, value);

        return Promise.resolve();
      });
    },

    update<T extends JsonObject>(
      namespace: string,
      key: string,
      value: Partial<T>
    ) {
      return storage.update<T>(namespace, key, value).then((result) => {
        valueCache.delete(namespace);
        entryCache.delete(namespace);
        namespaceCache.set(namespace, key, result);

        return Promise.resolve(result);
      });
    },

    delete(namespace: string, key: string) {
      keyCache.delete(namespace);
      valueCache.delete(namespace);
      entryCache.delete(namespace);
      namespaceCache.delete(namespace, key);

      return storage.delete(namespace, key);
    },
  };
};
