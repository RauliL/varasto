import { InvalidSlugError, ItemDoesNotExistError } from '@varasto/storage';
import { isValidSlug } from 'is-valid-slug';
import { JsonObject } from 'type-fest';

import { MemoryStorage } from './types';

/**
 * Constructs and returns storage implementation that stores values in memory
 * instead of hard disk.
 */
export const createMemoryStorage = (): MemoryStorage => {
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
    clear(namespace?: string) {
      if (namespace != null) {
        data.delete(namespace);
      } else {
        data.clear();
      }
    },

    has(namespace: string, key: string): Promise<boolean> {
      const mapping = data.get(namespace);

      return Promise.resolve(mapping != null ? mapping.has(key) : false);
    },

    keys(namespace: string): Promise<string[]> {
      return getNamespace(namespace).then((mapping) => [...mapping.keys()]);
    },

    values(namespace: string): Promise<JsonObject[]> {
      return getNamespace(namespace).then((mapping) => [...mapping.values()]);
    },

    entries(namespace: string): Promise<[string, JsonObject][]> {
      return getNamespace(namespace).then((mapping) => [...mapping.entries()]);
    },

    get(namespace: string, key: string): Promise<JsonObject | undefined> {
      return getNamespace(namespace).then((mapping) =>
        isValidSlug(key)
          ? mapping.get(key)
          : Promise.reject(new InvalidSlugError('Given key is not valid slug'))
      );
    },

    set(namespace: string, key: string, value: JsonObject): Promise<void> {
      return getNamespace(namespace).then((mapping) => {
        if (!isValidSlug(key)) {
          return Promise.reject(
            new InvalidSlugError('Given key is not valid slug')
          );
        }
        mapping.set(key, value);

        return Promise.resolve();
      });
    },

    update(
      namespace: string,
      key: string,
      value: JsonObject
    ): Promise<JsonObject> {
      return getNamespace(namespace).then((mapping) => {
        if (!isValidSlug(key)) {
          return Promise.reject(
            new InvalidSlugError('Given key is not valid slug')
          );
        }

        const oldValue = mapping.get(key);

        if (oldValue === undefined) {
          return Promise.reject(
            new ItemDoesNotExistError('Item does not exist')
          );
        }

        const newValue = { ...oldValue, ...value };

        mapping.set(key, newValue);

        return Promise.resolve(newValue);
      });
    },

    delete(namespace: string, key: string): Promise<boolean> {
      return getNamespace(namespace).then((mapping) =>
        isValidSlug(key)
          ? mapping.delete(key)
          : Promise.reject(new InvalidSlugError('Given key is not valid slug'))
      );
    },
  };
};
