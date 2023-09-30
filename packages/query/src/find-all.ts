import { Entry, Storage } from '@varasto/storage';
import match, { Schema } from 'simple-json-match';
import { JsonObject } from 'type-fest';

/**
 * Searches for entries from given namespace that match given schema and
 * returns their values. If no entries match the given schema, empty array
 * is returned instead.
 */
export async function* findAll<T extends JsonObject>(
  storage: Storage,
  namespace: string,
  schema: Schema
): AsyncGenerator<T> {
  for await (const value of storage.values<T>(namespace)) {
    if (match(value, schema)) {
      yield value;
    }
  }
}

/**
 * Searches for entries from given namespace that match given schema and
 * returns their keys. If no entries match the given schema, empty array is
 * returned instead.
 */
export async function* findAllKeys(
  storage: Storage,
  namespace: string,
  schema: Schema
): AsyncGenerator<string> {
  for await (const entry of storage.entries(namespace)) {
    if (match(entry[1], schema)) {
      yield entry[0];
    }
  }
}

/**
 * Searches for entries from given namespace that match given schema and
 * returns them in an array. If no entries match the given schema, empty
 * array is returned instead.
 */
export async function* findAllEntries<T extends JsonObject>(
  storage: Storage,
  namespace: string,
  schema: Schema
): AsyncGenerator<Entry<T>> {
  for await (const entry of storage.entries<T>(namespace)) {
    if (match(entry[1], schema)) {
      yield entry;
    }
  }
}
