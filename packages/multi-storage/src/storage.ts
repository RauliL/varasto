import { Entry, ItemDoesNotExistError, Storage } from '@varasto/storage';
import { JsonObject } from 'type-fest';

/**
 * Constructs an storage that uses multiple other storages for storing data.
 */
export const createMultiStorage = (...storages: Storage[]): Storage =>
  new (class extends Storage {
    async *keys(namespace: string): AsyncGenerator<string> {
      const allKeys = new Set<string>();
      const { length } = storages;

      for (let i = 0; i < length; ++i) {
        for await (const key of storages[i].keys(namespace)) {
          allKeys.add(key);
        }
      }

      for (const key of allKeys.values()) {
        yield key;
      }
    }

    async *values<T extends JsonObject>(namespace: string): AsyncGenerator<T> {
      const mapping = new Map<string, T>();
      const { length } = storages;

      for (let i = 0; i < length; ++i) {
        for await (const [key, value] of storages[i].entries<T>(namespace)) {
          mapping.set(key, value);
        }
      }

      for (const value of mapping.values()) {
        yield value;
      }
    }

    async *entries<T extends JsonObject>(
      namespace: string
    ): AsyncGenerator<Entry<T>> {
      const mapping = new Map<string, T>();
      const { length } = storages;

      for (let i = 0; i < length; ++i) {
        for await (const [key, value] of storages[i].entries<T>(namespace)) {
          mapping.set(key, value);
        }
      }

      for (const entry of mapping.entries()) {
        yield entry;
      }
    }

    async has(namespace: string, key: string) {
      const { length } = storages;

      for (let i = 0; i < length; ++i) {
        if (await storages[i].has(namespace, key)) {
          return true;
        }
      }

      return false;
    }

    async get<T extends JsonObject>(namespace: string, key: string) {
      const { length } = storages;

      for (let i = 0; i < length; ++i) {
        const value = await storages[i].get<T>(namespace, key);

        if (value != null) {
          return value;
        }
      }

      return undefined;
    }

    set<T extends JsonObject>(namespace: string, key: string, value: T) {
      return storages.length > 0
        ? Promise.all(
            storages.map((storage) => storage.set<T>(namespace, key, value))
          ).then(() => Promise.resolve(undefined))
        : Promise.resolve(undefined);
    }

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
              : Promise.reject(
                  new ItemDoesNotExistError('Item does not exist')
                )
          )
        : Promise.reject(new ItemDoesNotExistError('Item does not exist'));
    }

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
    }
  })();
