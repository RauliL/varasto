import { Storage } from '@varasto/storage';
import match, { Schema } from 'simple-json-match';
import { JsonObject } from 'type-fest';

/**
 * Searches for entries from given namespace that match given schema and
 * returns their values. If no entries match the given schema, empty array
 * is returned instead.
 */
export const findAll = <T extends JsonObject>(
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<T[]> =>
  storage
    .values<T>(namespace)
    .then((values) => values.filter((value) => match(value, schema)));

/**
 * Searches for entries from given namespace that match given schema and
 * returns their keys. If no entries match the given schema, empty array is
 * returned instead.
 */
export const findAllKeys = (
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<string[]> =>
  storage
    .entries(namespace)
    .then((entries) =>
      entries
        .filter((entry) => match(entry[1], schema))
        .map((entry) => entry[0])
    );

/**
 * Searches for entries from given namespace that match given schema and
 * returns them in an array. If no entries match the given schema, empty
 * array is returned instead.
 */
export const findAllEntries = <T extends JsonObject>(
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<[string, T][]> =>
  storage
    .entries<T>(namespace)
    .then((entries) => entries.filter((entry) => match(entry[1], schema)));
