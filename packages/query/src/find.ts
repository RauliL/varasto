import { Storage } from '@varasto/storage';
import match, { Schema } from 'simple-json-match';
import { JsonObject } from 'type-fest';

/**
 * Searches for an entry from given namespace that matches given schema and
 * returns value of first matching result. If no entry in the namespace matches
 * the schema, `undefined` is returned instead.
 */
export const find = <T extends JsonObject>(
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<T | undefined> =>
  storage
    .values<T>(namespace)
    .then((values) => values.find((value) => match(value, schema)));

/**
 * Searches for an entry from given namespace that matches given schema and
 * returns key of first matching result. If no entry in the namespace matches
 * the schema, `undefined` is returned instead.
 */
export const findKey = (
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<string | undefined> =>
  storage
    .entries(namespace)
    .then((entries) => entries.find((entry) => match(entry[1], schema))?.[0]);

/**
 * Searches for an entry from given namespace that matches given schema and
 * returns both key and value of first matching result. If no entry in the
 * namespace matches the schema, `undefined` is returned instead.
 */
export const findEntry = <T extends JsonObject>(
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<[string, T] | undefined> =>
  storage
    .entries<T>(namespace)
    .then((entries) => entries.find((entry) => match(entry[1], schema)));
