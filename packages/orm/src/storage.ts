import { findAllEntries, findAllKeys } from '@varasto/query';
import { Storage } from '@varasto/storage';
import { Schema } from 'simple-json-match';
import { Class } from 'type-fest';

import { ConfigurationError, ModelDoesNotExistError } from './error';
import { ModelMetadata } from './metadata';

/**
 * Stores given model instance into given storage.
 *
 * If the model instance does not have it's key set, one will be generated for
 * it.
 */
export const save = <T extends Object>(
  storage: Storage,
  instance: T
): Promise<T> =>
  ModelMetadata.requireFor<T>(instance.constructor).then((metadata) =>
    metadata.save(storage, instance)
  );

/**
 * Performs an bulk update an all model instances that match the given schema,
 * returning the updated instances.
 */
export async function* updateAll<T extends Object>(
  storage: Storage,
  modelClass: Class<T>,
  schema: Schema,
  data: Partial<T>
): AsyncGenerator<T> {
  const metadata = await ModelMetadata.requireFor<T>(modelClass);

  for await (const entry of findAllEntries(
    storage,
    metadata.namespace,
    schema
  )) {
    const instance = metadata.load<T>(entry[0], entry[1]);

    Object.assign(instance, data);
    yield metadata.save<T>(storage, instance);
  }
}

/**
 * Removes given model instance from the given storage. If the given model
 * instance does not exist in the storage, the promise will fail with
 * `ModelDoesNotExistError`.
 */
export const remove = <T extends Object>(
  storage: Storage,
  instance: T
): Promise<void> =>
  ModelMetadata.requireFor<T>(instance.constructor).then((metadata) => {
    let key: string | undefined;

    if (!metadata.keyPropertyName) {
      return Promise.reject(
        new ConfigurationError(`Model ${metadata.target} has no key property.`)
      );
    }

    // Ensure that the model instance has a key.
    key = Reflect.get(instance, metadata.keyPropertyName) as
      | string
      | undefined;
    if (!key) {
      return Promise.reject(
        new ModelDoesNotExistError('Model instance has no key.')
      );
    }

    return storage.delete(metadata.namespace, key).then((result) => {
      if (!result) {
        return Promise.reject(
          new ModelDoesNotExistError('Model instance does not exist.')
        );
      }
      Reflect.set(instance, metadata.keyPropertyName!, undefined);
    });
  });

/**
 * Performs an bulk removal on all model instances that match the given schema,
 * returning the number of removed instances.
 */
export async function removeAll<T extends Object>(
  storage: Storage,
  modelClass: Class<T>,
  schema: Schema
): Promise<number> {
  const metadata = await ModelMetadata.requireFor<T>(modelClass);
  const { namespace } = metadata;
  let result = 0;

  for await (const key of findAllKeys(storage, namespace, schema)) {
    if (await storage.delete(namespace, key)) {
      ++result;
    }
  }

  return result;
}
