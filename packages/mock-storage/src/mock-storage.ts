import { JsonObject } from 'type-fest';

import { MockStorage } from './types';

/**
 * Constructs and returns storage implementation that stores values in memory
 * instead of hard disk.
 */
export const createMockStorage = (): MockStorage => {
  const data = new Map<string, Map<string, JsonObject>>();

  return {
    clear() {
      data.clear();
    },

    has(namespace: string, key: string): boolean {
      const mapping = data.get(namespace);

      return mapping != null ? mapping.has(key) : false;
    },

    keys(namespace: string): Promise<string[]> {
      const mapping = data.get(namespace);

      return Promise.resolve(mapping != null ? [...mapping.keys()] : []);
    },

    values(namespace: string): Promise<JsonObject[]> {
      const mapping = data.get(namespace);

      return Promise.resolve(mapping != null ? [...mapping.values()] : []);
    },

    entries(namespace: string): Promise<[string, JsonObject][]> {
      const mapping = data.get(namespace);

      return Promise.resolve(mapping != null ? [...mapping.entries()] : []);
    },

    get(namespace: string, key: string): Promise<JsonObject | undefined> {
      const mapping = data.get(namespace);

      return Promise.resolve(mapping ? mapping.get(key) : undefined);
    },

    set(namespace: string, key: string, value: JsonObject): Promise<void> {
      let mapping = data.get(namespace);

      if (!mapping) {
        mapping = new Map<string, JsonObject>();
        data.set(namespace, mapping);
      }
      mapping.set(key, { ...value });

      return Promise.resolve();
    },

    delete(namespace: string, key: string): Promise<boolean> {
      const mapping = data.get(namespace);

      if (mapping) {
        const has = mapping.has(key);

        mapping.delete(key);

        return Promise.resolve(has);
      }

      return Promise.resolve(false);
    },
  }
};
