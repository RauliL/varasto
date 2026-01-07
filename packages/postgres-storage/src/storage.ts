import { Entry, ItemDoesNotExistError, Storage } from '@varasto/storage';
import { Client } from 'pg';
import format from 'pg-format';
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
): Storage =>
  new (class PostgresStorage extends Storage {
    async has(namespace: string, key: string): Promise<boolean> {
      return hasItem(client, namespace, key);
    }

    async *keys(namespace: string): AsyncGenerator<string> {
      validateNamespace(namespace);

      if (await doesNamespaceExist(client, namespace)) {
        const result = await client.query(
          format('SELECT key FROM %I', namespace)
        );

        for (const row of result.rows) {
          yield row.key;
        }
      }
    }

    async *values<T extends JsonObject>(namespace: string): AsyncGenerator<T> {
      validateNamespace(namespace);

      if (await doesNamespaceExist(client, namespace)) {
        const result = await client.query(
          format('SELECT value FROM %I', namespace)
        );

        for (const row of result.rows) {
          yield JSON.parse(row.value);
        }
      }
    }

    async *entries<T extends JsonObject>(
      namespace: string
    ): AsyncGenerator<Entry<T>> {
      validateNamespace(namespace);

      if (await doesNamespaceExist(client, namespace)) {
        const result = await client.query(
          format('SELECT key, value FROM %I', namespace)
        );

        for (const row of result.rows) {
          yield [row.key, JSON.parse(row.value)];
        }
      }
    }

    async get<T extends JsonObject>(
      namespace: string,
      key: string
    ): Promise<T | undefined> {
      return getItem<T>(client, namespace, key);
    }

    async set<T extends JsonObject>(
      namespace: string,
      key: string,
      value: T
    ): Promise<void> {
      let query: string;

      validateNamespaceAndKey(namespace, key);
      await createNamespace(client, namespace);
      if (await hasItem(client, namespace, key)) {
        query = format(
          'UPDATE %I SET value = %L WHERE key = %L',
          namespace,
          JSON.stringify(value),
          key
        );
      } else {
        query = format(
          'INSERT INTO %I(key, value) VALUES(%L, %L)',
          namespace,
          key,
          JSON.stringify(value)
        );
      }
      await client.query(query);
    }

    async update<T extends JsonObject>(
      namespace: string,
      key: string,
      value: Partial<T>
    ): Promise<T> {
      const oldValue = await getItem<T>(client, namespace, key);

      if (oldValue != null) {
        const newValue = { ...oldValue, ...value };

        await client.query(
          format(
            'UPDATE %I set value = %L WHERE key = %L',
            namespace,
            JSON.stringify(newValue),
            key
          )
        );

        return newValue;
      }

      throw new ItemDoesNotExistError('Item does not exist');
    }

    async delete(namespace: string, key: string): Promise<boolean> {
      validateNamespaceAndKey(namespace, key);

      if (await doesNamespaceExist(client, namespace)) {
        const result = await client.query(
          format('DELETE FROM %I WHERE key = %L', namespace, key)
        );

        if (result.rowCount != null && result.rowCount > 0) {
          if (options.dropEmptyTables) {
            const rowCountResult = await client.query(
              format('SELECT COUNT(*) FROM %I', namespace)
            );

            if (rowCountResult.rows?.[0]?.count == 0) {
              await client.query(format('DROP TABLE %I', namespace));
            }
          }

          return true;
        }
      }

      return false;
    }
  })();
