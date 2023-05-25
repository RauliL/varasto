import { Storage } from '@varasto/storage';
import { JsonObject } from 'type-fest';
import { v4 as uuid } from 'uuid';

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
): Promise<void> =>
  ModelMetadata.requireFor<T>(instance.constructor).then((metadata) => {
    const data: JsonObject = {};
    let key: string;

    if (!metadata.keyPropertyName) {
      return Promise.reject(
        new ConfigurationError(`Model ${metadata.target} has no key property.`)
      );
    }
    key = Reflect.get(instance, metadata.keyPropertyName);
    if (!key) {
      key = (metadata.keyGenerator ?? uuid)();
      Reflect.set(instance, metadata.keyPropertyName, key);
    }
    metadata.save(instance, data);

    return storage.set(metadata.namespace ?? '', key, data);
  });

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
    let key: string;

    if (!metadata.keyPropertyName) {
      return Promise.reject(
        new ConfigurationError(`Model ${metadata.target} has no key property.`)
      );
    }

    if (!(key = Reflect.get(instance, metadata.keyPropertyName))) {
      return Promise.reject(
        new ModelDoesNotExistError('Model instance has no key.')
      );
    }

    return storage.delete(metadata.namespace ?? '', key).then((result) => {
      if (!result) {
        return Promise.reject(
          new ModelDoesNotExistError('Model instance does not exist.')
        );
      }
      Reflect.set(instance, metadata.keyPropertyName!, undefined);
    });
  });
