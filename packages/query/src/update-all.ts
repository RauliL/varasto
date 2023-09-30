import { Entry, Storage } from '@varasto/storage';
import { Schema } from 'simple-json-match';
import { JsonObject } from 'type-fest';

import { findAllKeys } from './find-all';

/**
 * Performs an bulk update where all entries from given namespace that match
 * the given schema are partially updated with given value. Returns updated
 * values or empty array if no entry matched the given schema.
 */
export async function* updateAll<T extends JsonObject>(
  storage: Storage,
  namespace: string,
  schema: Schema,
  value: Partial<T>
): AsyncGenerator<T> {
  for await (const key of findAllKeys(storage, namespace, schema)) {
    yield await storage.update<T>(namespace, key, value);
  }
}

/**
 * Performs an bulk update where all entries from given namespace that match
 * the given schema are partially updated with given value. Returns updated
 * entries (key and value) or empty array if no entry matched the given schema.
 */
export async function* updateAllEntries<T extends JsonObject>(
  storage: Storage,
  namespace: string,
  schema: Schema,
  value: Partial<T>
): AsyncGenerator<Entry<T>> {
  for await (const key of findAllKeys(storage, namespace, schema)) {
    yield [key, await storage.update<T>(namespace, key, value)];
  }
}
