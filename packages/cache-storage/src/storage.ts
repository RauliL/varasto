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

    values(namespace: string) {
      const values = valueCache.get(namespace);

      if (values != null) {
        return Promise.resolve(values);
      }

      return storage.values(namespace).then((values) => {
        valueCache.set(namespace, values);

        return Promise.resolve(values);
      });
    },

    entries(namespace: string) {
      const entries = entryCache.get(namespace);

      if (entries != null) {
        return Promise.resolve(entries);
      }

      return storage.entries(namespace).then((entries) => {
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

    get(namespace: string, key: string) {
      const cachedValue = namespaceCache.get(namespace, key);

      if (cachedValue != null) {
        return Promise.resolve(cachedValue);
      }

      return storage.get(namespace, key).then((value) => {
        if (value != null) {
          namespaceCache.set(namespace, key, value);
        }

        return Promise.resolve(value);
      });
    },

    set(namespace: string, key: string, value: JsonObject) {
      return storage.set(namespace, key, value).then(() => {
        namespaceCache.set(namespace, key, value);

        return Promise.resolve();
      });
    },

    update(namespace: string, key: string, value: JsonObject) {
      return storage.update(namespace, key, value).then((result) => {
        namespaceCache.set(namespace, key, result);

        return Promise.resolve(result);
      });
    },

    delete(namespace: string, key: string) {
      namespaceCache.delete(namespace, key);

      return storage.delete(namespace, key);
    },
  };
};
