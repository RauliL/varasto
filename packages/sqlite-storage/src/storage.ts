import { ItemDoesNotExistError, Storage } from '@varasto/storage';
import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { JsonObject } from 'type-fest';

import { SqliteStorageOptions } from './types';
import {
  createNamespace,
  doesNamespaceExist,
  getItem,
  validateNamespace,
  validateNamespaceAndKey,
} from './utils';

/**
 * Construct and returns storage implementation that stores values into given
 * SQLite database.
 */
export const createSqliteStorage = async (
  database?: Database,
  options: Partial<SqliteStorageOptions> = {}
): Promise<Storage> => {
  const serialize = options.serialize ?? JSON.stringify;
  const deserialize = <T extends JsonObject>(input: string): T | undefined => {
    try {
      const result = (options.deserialize ?? JSON.parse)(input);

      if (typeof result === 'object') {
        return result as T;
      }
    } catch {}

    return undefined;
  };
  const db =
    database ??
    (await open({
      filename: ':memory:',
      driver: sqlite3.Database,
    }));

  return {
    has: async (namespace: string, key: string): Promise<boolean> => {
      validateNamespaceAndKey(namespace, key);

      if (await doesNamespaceExist(db, namespace)) {
        const result = await db.get(
          `SELECT COUNT(*) FROM "${namespace}" WHERE key = ?`,
          [key]
        );

        return result['COUNT(*)'] > 0;
      }

      return false;
    },

    keys: async (namespace: string): Promise<string[]> => {
      validateNamespace(namespace);

      if (await doesNamespaceExist(db, namespace)) {
        const results = await db.all(`SELECT key FROM "${namespace}"`);

        return results.map((row) => row.key);
      }

      return [];
    },

    values: async <T extends JsonObject>(namespace: string): Promise<T[]> => {
      validateNamespace(namespace);

      if (await doesNamespaceExist(db, namespace)) {
        const results = await db.all(`SELECT value FROM "${namespace}"`);

        return results
          .map((row) => deserialize<T>(row.value))
          .filter((value) => value != null) as T[];
      }

      return [];
    },

    entries: async <T extends JsonObject>(
      namespace: string
    ): Promise<[string, T][]> => {
      validateNamespace(namespace);

      if (await doesNamespaceExist(db, namespace)) {
        const results = await db.all(`SELECT key, value FROM "${namespace}"`);

        return results
          .map((row) => [row.key, deserialize<T>(row.value)])
          .filter((entry) => entry[1] != null) as [string, T][];
      }

      return [];
    },

    get: async <T extends JsonObject>(
      namespace: string,
      key: string
    ): Promise<T | undefined> => {
      return getItem<T>(db, namespace, key, deserialize);
    },

    set: async <T extends JsonObject>(
      namespace: string,
      key: string,
      value: T
    ): Promise<void> => {
      validateNamespaceAndKey(namespace, key);
      await createNamespace(db, namespace);

      await db.run(`INSERT INTO "${namespace}" (key, value) VALUES (?, ?)`, [
        key,
        serialize(value),
      ]);

      return undefined;
    },

    update: async <T extends JsonObject>(
      namespace: string,
      key: string,
      value: Partial<T>
    ): Promise<T> => {
      const oldValue = await getItem<T>(db, namespace, key, deserialize);

      if (oldValue != null) {
        const newValue = { ...oldValue, ...value } as T;

        await db.run(`UPDATE "${namespace}" SET value = ? WHERE key = ?`, [
          serialize(newValue),
          key,
        ]);

        return newValue;
      }

      throw new ItemDoesNotExistError('Item does not exist');
    },

    delete: async (namespace: string, key: string): Promise<boolean> => {
      validateNamespaceAndKey(namespace, key);

      if (await doesNamespaceExist(db, namespace)) {
        const result = await db.run(
          `DELETE FROM "${namespace}" WHERE key = ?`,
          [key]
        );

        return result.changes != null && result.changes > 0;
      }

      return false;
    },
  };
};
