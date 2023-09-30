import {
  Entry,
  InvalidSlugError,
  ItemDoesNotExistError,
  Storage,
} from '@varasto/storage';
import fs from 'fs';
import { isValidSlug } from 'is-valid-slug';
import { JsonObject } from 'type-fest';

import { SingleFileStorageOptions } from './types';

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

  const getNamespace = (namespace: string) =>
    new Promise<Namespace>((resolve, reject) => {
      if (isValidSlug(namespace)) {
        getContainer()
          .then((container) => resolve(container[namespace] ?? {}))
          .catch(reject);
      } else {
        reject(new InvalidSlugError('Given namespace is not valid slug'));
      }
    });

  const getItem = <T extends JsonObject>(
    namespace: string,
    key: string
  ): Promise<T | undefined> =>
    getNamespace(namespace).then((namespace) =>
      isValidSlug(key)
        ? (namespace[key] as T | undefined)
        : Promise.reject(new InvalidSlugError('Given key is not valid slug'))
    );

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
    has(namespace: string, key: string): Promise<boolean> {
      return getNamespace(namespace).then((namespace) =>
        isValidSlug(key)
          ? namespace[key] != null
          : Promise.reject(new InvalidSlugError('Given key is not valid slug'))
      );
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

    set<T extends JsonObject>(
      namespace: string,
      key: string,
      value: T
    ): Promise<void> {
      if (!isValidSlug(namespace)) {
        return Promise.reject(
          new InvalidSlugError('Given namespace is not valid slug')
        );
      }

      if (!isValidSlug(key)) {
        return Promise.reject(
          new InvalidSlugError('Given key is not valid slug')
        );
      }

      return getContainer().then((container) => {
        let namespaceContainer = container[namespace];

        if (!namespaceContainer) {
          namespaceContainer = {};
          container[namespace] = namespaceContainer;
        }
        namespaceContainer[key] = value;

        return serializeContainer(container);
      });
    }

    update<T extends JsonObject>(
      namespace: string,
      key: string,
      value: Partial<T>
    ): Promise<T> {
      if (!isValidSlug(namespace)) {
        return Promise.reject(
          new InvalidSlugError('Given namespace is not valid slug')
        );
      }

      if (!isValidSlug(key)) {
        return Promise.reject(
          new InvalidSlugError('Given key is not valid slug')
        );
      }

      return getContainer().then((container) => {
        const namespaceContainer = container[namespace];

        if (namespaceContainer) {
          const oldValue = namespaceContainer[key];

          if (oldValue != null) {
            const newValue = { ...oldValue, ...value } as T;

            namespaceContainer[key] = newValue;

            return serializeContainer(container).then(() => newValue);
          }
        }

        return Promise.reject(
          new ItemDoesNotExistError('Item does not exist')
        );
      });
    }

    delete(namespace: string, key: string): Promise<boolean> {
      if (!isValidSlug(namespace)) {
        return Promise.reject(
          new InvalidSlugError('Given namespace is not valid slug')
        );
      }

      if (!isValidSlug(key)) {
        return Promise.reject(
          new InvalidSlugError('Given key is not valid slug')
        );
      }

      return getContainer().then((container) => {
        const namespaceContainer = container[namespace];

        if (namespaceContainer) {
          const value = namespaceContainer[key];

          if (value != null) {
            delete namespaceContainer[key];

            return serializeContainer(container).then(() => true);
          }
        }

        return false;
      });
    }
  })();
};
