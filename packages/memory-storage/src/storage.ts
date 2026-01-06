import { Entry, InvalidSlugError } from '@varasto/storage';
import { isValidSlug } from 'is-valid-slug';
import { JsonObject } from 'type-fest';

import { MemoryStorage } from './types';

/**
 * Constructs storage implementation that stores values in memory instead of
 * hard disk.
 */
export const createMemoryStorage = (): MemoryStorage => {
  const data = new Map<string, Map<string, JsonObject>>();

  const getNamespace = <T extends JsonObject>(
    namespace: string
  ): Promise<Map<string, T>> =>
    new Promise<Map<string, T>>((resolve, reject) => {
      if (isValidSlug(namespace)) {
        let mapping = data.get(namespace);

        if (!mapping) {
          mapping = new Map<string, JsonObject>();
          data.set(namespace, mapping);
        }
        resolve(mapping as Map<string, T>);
      } else {
        reject(new InvalidSlugError('Given namespace is not valid slug'));
      }
    });

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
      const mapping = await getNamespace<T>(namespace);

      if (isValidSlug(key)) {
        return mapping.get(key);
      }

      throw new InvalidSlugError('Given key is not valid slug');
    }

    async set<T extends JsonObject>(
      namespace: string,
      key: string,
      value: T
    ): Promise<void> {
      const mapping = await getNamespace<T>(namespace);

      if (isValidSlug(key)) {
        mapping.set(key, value);
        return;
      }

      throw new InvalidSlugError('Given key is not valid slug');
    }

    async delete(namespace: string, key: string): Promise<boolean> {
      const mapping = await getNamespace(namespace);

      if (isValidSlug(key)) {
        return mapping.delete(key);
      }

      throw new InvalidSlugError('Given key is not valid slug');
    }
  })();
};
