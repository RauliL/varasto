import { ItemDoesNotExistError, Storage } from '@varasto/storage';
import { Client } from 'pg';
import { JsonObject } from 'type-fest';

import { PostgresStorageOptions } from './types';
import {
  createNamespace,
  doesNamespaceExist,
  getItem,
  hasItem,
  validateNamespace,
  validateNamespaceAndKey,
} from './utils';

/**
 * Creates new PostgreSQL storage with given PostgreSQL client and options.
 */
export const createPostgresStorage = (
  client: Client,
  options: Partial<PostgresStorageOptions> = {}
): Storage => ({
  has: async (namespace: string, key: string): Promise<boolean> => {
    return hasItem(client, namespace, key);
  },

  keys: async (namespace: string): Promise<string[]> => {
    validateNamespace(namespace);

    if (await doesNamespaceExist(client, namespace)) {
      const result = await client.query(`SELECT key FROM "${namespace}"`);

      return result.rows.map((row) => row.key);
    }

    return [];
  },

  values: async <T extends JsonObject>(namespace: string): Promise<T[]> => {
    validateNamespace(namespace);

    if (await doesNamespaceExist(client, namespace)) {
      const result = await client.query(`SELECT value FROM "${namespace}"`);

      return result.rows.map((row) => row.value);
    }

    return [];
  },

  entries: async <T extends JsonObject>(
    namespace: string
  ): Promise<[string, T][]> => {
    validateNamespace(namespace);

    if (await doesNamespaceExist(client, namespace)) {
      const result = await client.query(
        `SELECT key, value FROM "${namespace}"`
      );

      return result.rows.map((row) => [row.key, row.value]);
    }

    return [];
  },

  get: async <T extends JsonObject>(
    namespace: string,
    key: string
  ): Promise<T | undefined> => {
    return getItem<T>(client, namespace, key);
  },

  set: async <T extends JsonObject>(
    namespace: string,
    key: string,
    value: T
  ): Promise<void> => {
    let query: string;

    validateNamespaceAndKey(namespace, key);
    createNamespace(client, namespace);

    if (await hasItem(client, namespace, key)) {
      query = `UPDATE "${namespace}" SET value = $2 WHERE key = $1`;
    } else {
      query = `INSERT INTO "${namespace}"(key, value) VALUES($1, $2)`;
    }

    await client.query(query, [key, JSON.stringify(value)]);
  },

  update: async <T extends JsonObject>(
    namespace: string,
    key: string,
    value: Partial<T>
  ): Promise<T> => {
    const oldValue = await getItem<T>(client, namespace, key);

    if (oldValue != null) {
      const newValue = { ...oldValue, ...value };

      await client.query(
        `UPDATE "${namespace}" SET value = $1 WHERE key = $2`,
        [JSON.stringify(newValue), key]
      );

      return newValue;
    }

    throw new ItemDoesNotExistError('Item does not exist');
  },

  delete: async (namespace: string, key: string): Promise<boolean> => {
    validateNamespaceAndKey(namespace, key);

    if (await doesNamespaceExist(client, namespace)) {
      const result = await client.query(
        `DELETE FROM "${namespace}" WHERE key = $1`,
        [key]
      );

      if (result.rowCount > 0) {
        if (options.dropEmptyTables) {
          const rowCountResult = await client.query(
            `SELECT COUNT(*) FROM "${namespace}"`
          );

          if (rowCountResult.rows?.[0]?.count == 0) {
            await client.query(`DROP TABLE "${namespace}"`);
          }
        }

        return true;
      }
    }

    return false;
  },
});
