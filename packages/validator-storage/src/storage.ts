import { Entry, Storage } from '@varasto/storage';
import { JsonObject } from 'type-fest';
import { ZodType } from 'zod/v4';

import { UnrecognizedNamespaceError } from './errors';
import { NamespaceMapping } from './types';

export const createValidatorStorage = (
  storage: Storage,
  mapping: Readonly<NamespaceMapping>
): Storage => {
  const namespaceCheck = (namespace: string) => {
    if (!Object.prototype.hasOwnProperty.call(mapping, namespace)) {
      throw new UnrecognizedNamespaceError(namespace);
    }
  };

  const getSchema = <T extends JsonObject>(namespace: string): ZodType<T> => {
    namespaceCheck(namespace);

    return mapping[namespace] as ZodType<T>;
  };

  return new (class extends Storage {
    async has(namespace: string, key: string): Promise<boolean> {
      namespaceCheck(namespace);

      return storage.has(namespace, key);
    }

    async *keys(namespace: string): AsyncGenerator<string> {
      namespaceCheck(namespace);

      for await (const key of storage.keys(namespace)) {
        yield key;
      }
    }

    async *values<T extends JsonObject>(namespace: string): AsyncGenerator<T> {
      namespaceCheck(namespace);

      for await (const value of storage.values<T>(namespace)) {
        yield value;
      }
    }

    async *entries<T extends JsonObject>(
      namespace: string
    ): AsyncGenerator<Entry<T>> {
      namespaceCheck(namespace);

      for await (const entry of storage.entries<T>(namespace)) {
        yield entry;
      }
    }

    async get<T extends JsonObject>(
      namespace: string,
      key: string
    ): Promise<T | undefined> {
      namespaceCheck(namespace);

      return storage.get(namespace, key);
    }

    async set<T extends JsonObject>(
      namespace: string,
      key: string,
      value: T
    ): Promise<void> {
      return storage.set(namespace, key, getSchema<T>(namespace).parse(value));
    }

    async update<T extends JsonObject>(
      namespace: string,
      key: string,
      value: Partial<T>
    ): Promise<T> {
      const schema = getSchema<T>(namespace);
      const oldValue = await storage.get<T>(namespace, key);
      const newValue = schema.parse({ ...oldValue, ...value } as T);

      await storage.set(namespace, key, newValue);

      return newValue;
    }

    async delete(namespace: string, key: string): Promise<boolean> {
      namespaceCheck(namespace);

      return storage.delete(namespace, key);
    }
  })();
};
