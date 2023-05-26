import { Storage } from '@varasto/storage';
import { Schema } from 'simple-json-match';

import { findAllKeys } from './find-all';

/**
 * Performs an bulk deletion where all entries from the given namespace that
 * match the given schema are deleted. Returns total number of deleted entries
 * or 0 if no entry matched the given schema.
 */
export const deleteAll = (
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<number> =>
  findAllKeys(storage, namespace, schema).then((keys) =>
    Promise.all(keys.map((key) => storage.delete(namespace, key))).then(
      () => keys.length
    )
  );
