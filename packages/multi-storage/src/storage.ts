import { ItemDoesNotExistError, Storage } from '@varasto/storage';
import { JsonObject } from 'type-fest';

/**
 * Constructs an storage that uses multiple other storages for storing data.
 */
export const createMultiStorage = (...storages: Storage[]): Storage => ({
  async keys(namespace: string) {
    const allKeys = new Set<string>();
    const { length } = storages;

    for (let i = 0; i < length; ++i) {
      (await storages[i].keys(namespace)).forEach((key) => allKeys.add(key));
    }

    return [...allKeys.values()];
  },

  async values<T extends JsonObject>(namespace: string) {
    const mapping = new Map<string, T>();
    const { length } = storages;

    for (let i = 0; i < length; ++i) {
      (await storages[i].entries<T>(namespace)).forEach((entry) =>
        mapping.set(entry[0], entry[1])
      );
    }

    return [...mapping.values()];
  },

  async entries<T extends JsonObject>(namespace: string) {
    const mapping = new Map<string, T>();
    const { length } = storages;

    for (let i = 0; i < length; ++i) {
      (await storages[i].entries<T>(namespace)).forEach((entry) =>
        mapping.set(entry[0], entry[1])
      );
    }

    return [...mapping.entries()];
  },

  async has(namespace: string, key: string) {
    const { length } = storages;

    for (let i = 0; i < length; ++i) {
      if (await storages[i].has(namespace, key)) {
        return true;
      }
    }

    return false;
  },

  async get<T extends JsonObject>(namespace: string, key: string) {
    const { length } = storages;

    for (let i = 0; i < length; ++i) {
      const value = await storages[i].get<T>(namespace, key);

      if (value != null) {
        return value;
      }
    }

    return undefined;
  },

  set<T extends JsonObject>(namespace: string, key: string, value: T) {
    return storages.length > 0
      ? Promise.all(
          storages.map((storage) => storage.set<T>(namespace, key, value))
        ).then(() => Promise.resolve(undefined))
      : Promise.resolve(undefined);
  },

  update<T extends JsonObject>(
    namespace: string,
    key: string,
    value: Partial<T>
  ): Promise<T> {
    return storages.length > 0
      ? Promise.all(
          storages.map((storage) => storage.update<T>(namespace, key, value))
        ).then((results) =>
          results.length > 0
            ? results[0]
            : Promise.reject(new ItemDoesNotExistError('Item does not exist'))
        )
      : Promise.reject(new ItemDoesNotExistError('Item does not exist'));
  },

  async delete(namespace: string, key: string) {
    const { length } = storages;
    let found = false;

    for (let i = 0; i < length; ++i) {
      const result = await storages[i].delete(namespace, key);

      if (result) {
        found = true;
      }
    }

    return found;
  },
});
