import { Entry, Storage } from '@varasto/storage';
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

  return new (class extends Storage {
    async *keys(namespace: string): AsyncGenerator<string> {
      let keys = keyCache.get(namespace);

      if (keys != null) {
        for (const key of keys) {
          yield key;
        }
      } else {
        keys = [];
        for await (const key of storage.keys(namespace)) {
          keys.push(key);
          yield key;
        }
        keyCache.set(namespace, keys);
      }
    }

    async *values<T extends JsonObject>(namespace: string): AsyncGenerator<T> {
      let values = valueCache.get(namespace);

      if (values != null) {
        for (const value of values) {
          yield value as T;
        }
      } else {
        values = [];
        for await (const value of storage.values<T>(namespace)) {
          values.push(value);
          yield value;
        }
        valueCache.set(namespace, values);
      }
    }

    async *entries<T extends JsonObject>(
      namespace: string
    ): AsyncGenerator<Entry<T>> {
      let entries = entryCache.get(namespace);

      if (entries != null) {
        for (const entry of entries) {
          yield entry as Entry<T>;
        }
      } else {
        entries = [];
        for await (const entry of storage.entries<T>(namespace)) {
          entries.push(entry);
          yield entry;
        }
        entryCache.set(namespace, entries);
      }
    }

    has(namespace: string, key: string): Promise<boolean> {
      const cachedValue = namespaceCache.get(namespace, key);

      if (cachedValue != null) {
        return Promise.resolve(true);
      }

      return storage.has(namespace, key);
    }

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
    }

    set<T extends JsonObject>(
      namespace: string,
      key: string,
      value: T
    ): Promise<void> {
      return storage.set<T>(namespace, key, value).then(() => {
        keyCache.delete(namespace);
        valueCache.delete(namespace);
        entryCache.delete(namespace);
        namespaceCache.set(namespace, key, value);

        return Promise.resolve();
      });
    }

    update<T extends JsonObject>(
      namespace: string,
      key: string,
      value: Partial<T>
    ): Promise<T> {
      return storage.update<T>(namespace, key, value).then((result) => {
        valueCache.delete(namespace);
        entryCache.delete(namespace);
        namespaceCache.set(namespace, key, result);

        return Promise.resolve(result);
      });
    }

    delete(namespace: string, key: string): Promise<boolean> {
      keyCache.delete(namespace);
      valueCache.delete(namespace);
      entryCache.delete(namespace);
      namespaceCache.delete(namespace, key);

      return storage.delete(namespace, key);
    }
  })();
};
