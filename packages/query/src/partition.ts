import { Storage } from '@varasto/storage';
import p from 'lodash.partition';
import match, { Schema } from 'simple-json-match';
import { JsonObject } from 'type-fest';

/**
 * Splits values of entries from given namespace into two arrays depending on
 * whether they match the given schema. Entries that match the schema will be
 * returned first element of returned array, while the remaining entries will
 * be second.
 */
export const partition = <T extends JsonObject>(
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<[T[], T[]]> =>
  storage
    .values<T>(namespace)
    .then((values) => p(values, (value) => match(value, schema)));

/**
 * Splits keys of entries from given namespace into two arrays depending on
 * whether they match the given schema. Entries that match the schema will be
 * returned first element of returned array, while the remaining entries will
 * be second.
 */
export const partitionKeys = (
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<[string[], string[]]> =>
  storage.entries(namespace).then((entries) => {
    const [a, b] = p(entries, (entry) => match(entry[1], schema));

    return [a.map((entry) => entry[0]), b.map((entry) => entry[0])];
  });

/**
 * Splits entries from given namespace into two arrays depending on whether
 * they match the given schema. Entries that match the schema will be returned
 * first element of returned array, while the remaining entries will be second.
 */
export const partitionEntries = <T extends JsonObject>(
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<[[string, T][], [string, T][]]> =>
  storage
    .entries<T>(namespace)
    .then((entries) => p(entries, (entry) => match(entry[1], schema)));
