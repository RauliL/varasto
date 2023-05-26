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
export const count = <T extends Object>(
  storage: Storage,
  modelClass: Class<T>
): Promise<number> =>
  ModelMetadata.requireFor<T>(modelClass)
    .then((metadata) => storage.keys(metadata.namespace))
    .then((keys) => keys.length);

/**
 * Returns keys of model instances stored in given storage.
 */
export const keys = <T extends Object>(
  storage: Storage,
  modelClass: Class<T>
): Promise<string[]> =>
  ModelMetadata.requireFor<T>(modelClass).then((metadata) =>
    storage.keys(metadata.namespace)
  );

/**
 * Returns all model instances stored in given storage.
 */
export const list = <T extends Object>(
  storage: Storage,
  modelClass: Class<T>
): Promise<T[]> =>
  ModelMetadata.requireFor<T>(modelClass).then((metadata) =>
    storage
      .entries(metadata.namespace)
      .then((data) => data.map(([key, data]) => metadata.load(key, data)))
  );

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
export const findAll = <T extends Object>(
  storage: Storage,
  modelClass: Class<T>,
  schema: Schema
): Promise<T[]> =>
  ModelMetadata.requireFor<T>(modelClass).then((metadata) =>
    findAllEntries(storage, metadata.namespace, schema).then((entries) =>
      entries.map((entry) => metadata.load(entry[0], entry[1]))
    )
  );
