import { Entry, validateKey, validateNamespace } from '@varasto/storage';
import { JsonObject } from 'type-fest';

import { MemoryStorage } from './types.js';

/**
 * Constructs storage implementation that stores values in memory instead of
 * hard disk.
 */
export const createMemoryStorage = (): MemoryStorage => {
  const data = new Map<string, Map<string, JsonObject>>();

  const getNamespace = <T extends JsonObject>(
    namespace: string
  ): Promise<Map<string, T>> => {
    validateNamespace(namespace);

    let mapping = data.get(namespace);

    if (!mapping) {
      mapping = new Map<string, JsonObject>();
      data.set(namespace, mapping);
    }

    return Promise.resolve(mapping as Map<string, T>);
  };

  return new (class extends MemoryStorage {
    clear(namespace?: string) {
      if (namespace != null) {
        data.delete(namespace);
      } else {
        data.clear();
      }
    }

    async *entries<T extends JsonObject>(
      namespace: string
    ): AsyncGenerator<Entry<T>> {
      const mapping = await getNamespace<T>(namespace);

      for (const entry of mapping.entries()) {
        yield entry;
      }
    }

    async *keys(namespace: string): AsyncGenerator<string> {
      const mapping = await getNamespace(namespace);

      for (const key of mapping.keys()) {
        yield key;
      }
    }

    async *values<T extends JsonObject>(namespace: string): AsyncGenerator<T> {
      const mapping = await getNamespace<T>(namespace);

      for (const value of mapping.values()) {
        yield value;
      }
    }

    async has(namespace: string, key: string): Promise<boolean> {
      const mapping = data.get(namespace);

      return mapping != null && mapping.has(key);
    }

    async get<T extends JsonObject>(
      namespace: string,
      key: string
    ): Promise<T | undefined> {
      validateKey(key);

      return (await getNamespace<T>(namespace)).get(key);
    }

    async set<T extends JsonObject>(
      namespace: string,
      key: string,
      value: T
    ): Promise<void> {
      validateKey(key);

      (await getNamespace<T>(namespace)).set(key, value);
    }

    async delete(namespace: string, key: string): Promise<boolean> {
      validateKey(key);

      return (await getNamespace(namespace)).delete(key);
    }
  })();
};
