import { Entry, Storage } from '@varasto/storage';
import match, { Schema } from 'simple-json-match';
import { JsonObject } from 'type-fest';

/**
 * Searches for an entry from given namespace that matches given schema and
 * returns value of first matching result. If no entry in the namespace matches
 * the schema, `undefined` is returned instead.
 */
export async function find<T extends JsonObject>(
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<T | undefined> {
  for await (const value of storage.values<T>(namespace)) {
    if (match(value, schema)) {
      return value;
    }
  }
}

/**
 * Searches for an entry from given namespace that matches given schema and
 * returns key of first matching result. If no entry in the namespace matches
 * the schema, `undefined` is returned instead.
 */
export async function findKey(
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<string | undefined> {
  for await (const entry of storage.entries(namespace)) {
    if (match(entry[1], schema)) {
      return entry[0];
    }
  }
}

/**
 * Searches for an entry from given namespace that matches given schema and
 * returns both key and value of first matching result. If no entry in the
 * namespace matches the schema, `undefined` is returned instead.
 */
export async function findEntry<T extends JsonObject>(
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<Entry<T> | undefined> {
  for await (const entry of storage.entries<T>(namespace)) {
    if (match(entry[1], schema)) {
      return entry;
    }
  }
}
