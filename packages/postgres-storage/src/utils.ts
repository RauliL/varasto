import { InvalidSlugError } from '@varasto/storage';
import { isValidSlug } from 'is-valid-slug';
import { Client } from 'pg';
import { JsonObject } from 'type-fest';

export const validateNamespace = (namespace: string) => {
  if (!isValidSlug(namespace)) {
    throw new InvalidSlugError('Given namespace is not valid slug');
  }
};

export const validateNamespaceAndKey = (namespace: string, key: string) => {
  validateNamespace(namespace);
  if (!isValidSlug(key)) {
    throw new InvalidSlugError('Given key is not valid slug');
  }
};

export const doesNamespaceExist = (
  client: Client,
  namespace: string
): Promise<boolean> =>
  client
    .query(
      `
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = '${namespace}'
    );
    `
    )
    .then((result) => result.rows?.[0]?.exists === true);

export const createNamespace = (client: Client, namespace: string) =>
  client.query(`
    CREATE TABLE IF NOT EXISTS "${namespace}" (
      key TEXT PRIMARY KEY NOT NULL,
      value JSONB NOT NULL,
      UNIQUE (key)
    )
  `);

export const hasItem = async (
  client: Client,
  namespace: string,
  key: string
): Promise<boolean> => {
  validateNamespaceAndKey(namespace, key);

  if (await doesNamespaceExist(client, namespace)) {
    const result = await client.query(
      `SELECT COUNT(*) FROM "${namespace}" WHERE key = $1`,
      [key]
    );

    return result.rows?.[0]?.count > 0;
  }

  return false;
};

export const getItem = async <T extends JsonObject>(
  client: Client,
  namespace: string,
  key: string
): Promise<T | undefined> => {
  validateNamespaceAndKey(namespace, key);

  if (await doesNamespaceExist(client, namespace)) {
    const result = await client.query(
      `SELECT value FROM "${namespace}" WHERE key = $1`,
      [key]
    );

    if (result.rows.length > 0) {
      return result.rows[0].value;
    }
  }

  return undefined;
};
