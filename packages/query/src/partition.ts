import { Entry, Storage } from '@varasto/storage';
import match, { Schema } from 'simple-json-match';
import { JsonObject } from 'type-fest';

/**
 * Splits values of entries from given namespace into two arrays depending on
 * whether they match the given schema. Entries that match the schema will be
 * returned first element of returned array, while the remaining entries will
 * be second.
 */
export const partition = async <T extends JsonObject>(
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<[T[], T[]]> => {
  const t: T[] = [];
  const f: T[] = [];

  for await (const value of storage.values<T>(namespace)) {
    (match(value, schema) ? t : f).push(value);
  }

  return [t, f];
};

/**
 * Splits keys of entries from given namespace into two arrays depending on
 * whether they match the given schema. Entries that match the schema will be
 * returned first element of returned array, while the remaining entries will
 * be second.
 */
export const partitionKeys = async (
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<[string[], string[]]> => {
  const t: string[] = [];
  const f: string[] = [];

  for await (const entry of storage.entries(namespace)) {
    (match(entry[1], schema) ? t : f).push(entry[0]);
  }

  return [t, f];
};

/**
 * Splits entries from given namespace into two arrays depending on whether
 * they match the given schema. Entries that match the schema will be returned
 * first element of returned array, while the remaining entries will be second.
 */
export const partitionEntries = async <T extends JsonObject>(
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<[Entry<T>[], Entry<T>[]]> => {
  const t: Entry<T>[] = [];
  const f: Entry<T>[] = [];

  for await (const entry of storage.entries<T>(namespace)) {
    (match(entry[1], schema) ? t : f).push(entry);
  }

  return [t, f];
};
