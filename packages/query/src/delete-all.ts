import { Storage } from '@varasto/storage';
import { Schema } from 'simple-json-match';

import { findAllKeys } from './find-all';

/**
 * Performs an bulk deletion where all entries from the given namespace that
 * match the given schema are deleted. Returns total number of deleted entries
 * or 0 if no entry matched the given schema.
 */
export async function deleteAll(
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<number> {
  let result = 0;

  for await (const key of findAllKeys(storage, namespace, schema)) {
    if (await storage.delete(namespace, key)) {
      ++result;
    }
  }

  return result;
}
