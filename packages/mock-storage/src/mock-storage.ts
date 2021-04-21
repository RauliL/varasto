import { InvalidSlugError, isValidSlug } from '@varasto/storage';
import { JsonObject } from 'type-fest';

import { MockStorage } from './types';

/**
 * Constructs and returns storage implementation that stores values in memory
 * instead of hard disk.
 */
export const createMockStorage = (): MockStorage => {
  const data = new Map<string, Map<string, JsonObject>>();
  const getNamespace = (namespace: string): Promise<Map<string, JsonObject>> =>
    new Promise<Map<string, JsonObject>>((resolve, reject) => {
      if (isValidSlug(namespace)) {
        let mapping = data.get(namespace);

        if (!mapping) {
          mapping = new Map<string, JsonObject>();
          data.set(namespace, mapping);
        }
        resolve(mapping);
      } else {
        reject(new InvalidSlugError('Given namespace is not valid slug'));
      }
    });

  return {
    clear() {
      data.clear();
    },

    has(namespace: string, key: string): boolean {
      const mapping = data.get(namespace);

      return mapping != null ? mapping.has(key) : false;
    },

    keys(namespace: string): Promise<string[]> {
      return getNamespace(namespace)
        .then((mapping) => [...mapping.keys()]);
    },

    values(namespace: string): Promise<JsonObject[]> {
      return getNamespace(namespace)
        .then((mapping) => [...mapping.values()]);
    },

    entries(namespace: string): Promise<[string, JsonObject][]> {
      return getNamespace(namespace)
        .then((mapping) => [...mapping.entries()]);
    },

    get(namespace: string, key: string): Promise<JsonObject | undefined> {
      return getNamespace(namespace)
        .then((mapping) =>
          isValidSlug(key)
            ? mapping.get(key)
            : Promise.reject(new InvalidSlugError('Given key is not valid slug'))
        );
    },

    set(namespace: string, key: string, value: JsonObject): Promise<void> {
      return getNamespace(namespace)
        .then((mapping) => {
          if (!isValidSlug(key)) {
            return Promise.reject(new InvalidSlugError('Given key is not valid slug'));
          }
          mapping.set(key, value);

          return Promise.resolve();
        });
    },

    delete(namespace: string, key: string): Promise<boolean> {
      return getNamespace(namespace)
        .then((mapping) =>
          isValidSlug(key)
            ? mapping.delete(key)
            : Promise.reject(new InvalidSlugError('Given key is not valid slug'))
        );
    },
  }
};
