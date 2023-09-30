import { Entry, Storage } from '@varasto/storage';
import { JsonObject } from 'type-fest';
import { AnySchema } from 'yup';

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

  const getSchema = (namespace: string): AnySchema => {
    namespaceCheck(namespace);

    return mapping[namespace];
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
      await getSchema(namespace).validate(value);

      return storage.set(namespace, key, value);
    }

    async update<T extends JsonObject>(
      namespace: string,
      key: string,
      value: Partial<T>
    ): Promise<T> {
      const schema = getSchema(namespace);
      const oldValue = await storage.get<T>(namespace, key);
      const newValue = { ...oldValue, ...value } as T;

      await schema.validate(newValue);
      await storage.set(namespace, key, newValue);

      return newValue;
    }

    async delete(namespace: string, key: string): Promise<boolean> {
      namespaceCheck(namespace);

      return storage.delete(namespace, key);
    }
  })();
};
