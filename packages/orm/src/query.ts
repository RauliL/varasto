import { findAllEntries, findEntry } from '@varasto/query';
import { Storage } from '@varasto/storage';
import { Schema } from 'simple-json-match';
import { Class } from 'type-fest';

import { ModelDoesNotExistError } from './error';
import { ModelMetadata } from './metadata';

/**
 * Tests whether an model instance with given key exists in the given storage.
 */
export const exists = <T extends Object>(
  storage: Storage,
  modelClass: Class<T>,
  key: string
): Promise<boolean> =>
  ModelMetadata.requireFor<T>(modelClass).then((metadata) =>
    storage.has(metadata.namespace, key)
  );

/**
 * Attempts to retrieve an model instance from the given storage. If an
 * instance with the given key does not exist, the promise will fail with
 * `ModelDoesNotExistError`.
 */
export const get = <T extends Object>(
  storage: Storage,
  modelClass: Class<T>,
  key: string
): Promise<T> =>
  ModelMetadata.requireFor<T>(modelClass).then((metadata) =>
    storage.get(metadata.namespace, key).then((data) => {
      if (data) {
        return metadata.load<T>(key, data);
      }

      return Promise.reject(
        new ModelDoesNotExistError(
          `No ${metadata.target} with key '${key}' found`
        )
      );
    })
  );

/**
 * Returns the total number of model instances stored in given storage.
 *
 * If an optional schema is given, only model instances that match that schema
 * are counted.
 */
export async function count<T extends Object>(
  storage: Storage,
  modelClass: Class<T>
): Promise<number> {
  const metadata = await ModelMetadata.requireFor<T>(modelClass);
  let result = 0;

  for await (const key of storage.keys(metadata.namespace)) {
    ++result;
  }

  return result;
}

/**
 * Returns keys of model instances stored in given storage.
 */
export async function* keys<T extends Object>(
  storage: Storage,
  modelClass: Class<T>
): AsyncGenerator<string> {
  const metadata = await ModelMetadata.requireFor<T>(modelClass);

  for await (const key of storage.keys(metadata.namespace)) {
    yield key;
  }
}

/**
 * Returns all model instances stored in given storage.
 */
export async function* list<T extends Object>(
  storage: Storage,
  modelClass: Class<T>
): AsyncGenerator<T> {
  const metadata = await ModelMetadata.requireFor<T>(modelClass);

  for await (const [key, data] of storage.entries(metadata.namespace)) {
    yield metadata.load<T>(key, data);
  }
}

/**
 * Searches for the first model instance from given storage that matches the
 * given schema. If no model instance that matches the schema is found,
 * undefined is returned instead.
 */
export const find = <T extends Object>(
  storage: Storage,
  modelClass: Class<T>,
  schema: Schema
): Promise<T | undefined> =>
  ModelMetadata.requireFor<T>(modelClass).then((metadata) =>
    findEntry(storage, metadata.namespace, schema).then((entry) =>
      entry ? metadata.load<T>(entry[0], entry[1]) : undefined
    )
  );

/**
 * Searches for all model instances from given storages that match the given
 * schema.
 */
export async function* findAll<T extends Object>(
  storage: Storage,
  modelClass: Class<T>,
  schema: Schema
): AsyncGenerator<T> {
  const metadata = await ModelMetadata.requireFor<T>(modelClass);

  for await (const [key, data] of findAllEntries(
    storage,
    metadata.namespace,
    schema
  )) {
    yield metadata.load<T>(key, data);
  }
}
