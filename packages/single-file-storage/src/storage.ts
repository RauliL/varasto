import {
  Entry,
  ItemDoesNotExistError,
  Storage,
  validateKey,
  validateNamespace,
  validateNamespaceAndKey,
} from '@varasto/storage';
import fs from 'fs';
import { JsonObject } from 'type-fest';

import { SingleFileStorageOptions } from './types.js';

type Namespace = Record<string, JsonObject>;
type Container = Record<string, Namespace>;

/**
 * Creates new single file storage with given options.
 *
 * @param options Options for the storage, such as custom character encoding
 *                and serializers.
 */
export const createSingleFileStorage = (
  options: Partial<SingleFileStorageOptions> = {}
): Storage => {
  const path = options.path ?? './data.json';
  const encoding = options.encoding ?? 'utf-8';
  const deserialize = options.deserialize ?? JSON.parse;
  const serialize = options.serialize ?? JSON.stringify;

  const getContainer = () =>
    new Promise<Container>((resolve, reject) => {
      fs.readFile(path, encoding, (err, text) => {
        if (err) {
          if (err.code === 'ENOENT') {
            resolve({});
          } else {
            reject(err);
          }
          return;
        }

        try {
          const container = deserialize(text);

          if (typeof container === 'object') {
            resolve(container);
          } else {
            resolve({});
          }
        } catch (err) {
          reject(err);
        }
      });
    });

  const getNamespace = async (namespace: string): Promise<Namespace> => {
    validateNamespace(namespace);

    const container = await getContainer();

    return container[namespace] ?? {};
  };

  const getItem = async <T extends JsonObject>(
    namespace: string,
    key: string
  ): Promise<T | undefined> => {
    validateKey(key);

    return (await getNamespace(namespace))[key] as T | undefined;
  };

  const serializeContainer = (container: Container) =>
    new Promise<void>((resolve, reject) => {
      let text: string;

      try {
        text = serialize(container);
      } catch (err) {
        reject(err);
        return;
      }

      fs.writeFile(path, text, encoding, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

  return new (class extends Storage {
    async has(namespace: string, key: string): Promise<boolean> {
      validateKey(key);

      const ns = await getNamespace(namespace);

      return ns[key] != null;
    }

    async *entries<T extends JsonObject>(
      namespace: string
    ): AsyncGenerator<Entry<T>> {
      const ns = await getNamespace(namespace);

      for (const key of Object.keys(ns)) {
        yield [key, ns[key] as T];
      }
    }

    get<T extends JsonObject>(
      namespace: string,
      key: string
    ): Promise<T | undefined> {
      return getItem(namespace, key);
    }

    async set<T extends JsonObject>(
      namespace: string,
      key: string,
      value: T
    ): Promise<void> {
      validateNamespaceAndKey(namespace, key);

      const container = await getContainer();
      let namespaceContainer = container[namespace];

      if (!namespaceContainer) {
        namespaceContainer = {};
        container[namespace] = namespaceContainer;
      }
      namespaceContainer[key] = value;

      return serializeContainer(container);
    }

    async update<T extends JsonObject>(
      namespace: string,
      key: string,
      value: Partial<T>
    ): Promise<T> {
      validateNamespaceAndKey(namespace, key);

      const container = await getContainer();
      const namespaceContainer = container[namespace];

      if (namespaceContainer) {
        const oldValue = namespaceContainer[key];

        if (oldValue != null) {
          const newValue = { ...oldValue, ...value } as T;

          namespaceContainer[key] = newValue;

          return serializeContainer(container).then(() => newValue);
        }
      }

      throw new ItemDoesNotExistError('Item does not exist');
    }

    async delete(namespace: string, key: string): Promise<boolean> {
      validateNamespaceAndKey(namespace, key);

      const container = await getContainer();
      const namespaceContainer = container[namespace];

      if (namespaceContainer) {
        const value = namespaceContainer[key];

        if (value != null) {
          delete namespaceContainer[key];

          return serializeContainer(container).then(() => true);
        }
      }

      return false;
    }
  })();
};
