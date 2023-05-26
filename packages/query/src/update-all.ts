import { Storage } from '@varasto/storage';
import { Schema } from 'simple-json-match';
import { JsonObject } from 'type-fest';

import { findAllKeys } from './find-all';

/**
 * Performs an bulk update where all entries from given namespace that match
 * the given schema are partially updated with given value. Returns updated
 * values or empty array if no entry matched the given schema.
 */
export const updateAll = <T extends JsonObject>(
  storage: Storage,
  namespace: string,
  schema: Schema,
  value: Partial<T>
): Promise<T[]> =>
  findAllKeys(storage, namespace, schema).then((keys) =>
    Promise.all(keys.map((key) => storage.update<T>(namespace, key, value)))
  );

/**
 * Performs an bulk update where all entries from given namespace that match
 * the given schema are partially updated with given value. Returns updated
 * entries (key and value) or empty array if no entry matched the given schema.
 */
export const updateAllEntries = <T extends JsonObject>(
  storage: Storage,
  namespace: string,
  schema: Schema,
  value: Partial<T>
): Promise<[string, T][]> =>
  findAllKeys(storage, namespace, schema).then(
    (keys) =>
      Promise.all(
        keys.map((key) =>
          storage
            .update<T>(namespace, key, value)
            .then((value) => [key, value])
        )
      ) as Promise<[string, T][]>
  );
