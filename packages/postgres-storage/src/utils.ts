import { InvalidSlugError } from '@varasto/storage';
import { isValidSlug } from 'is-valid-slug';
import { Client } from 'pg';
import format from 'pg-format';
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

export const doesNamespaceExist = async (
  client: Client,
  namespace: string
): Promise<boolean> => {
  const result = await client.query(
    format(
      `
      SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = %L;
  `,
      namespace
    )
  );

  return result.rows.length > 0;
};

export const createNamespace = async (
  client: Client,
  namespace: string
): Promise<void> => {
  if (await doesNamespaceExist(client, namespace)) {
    return;
  }

  await client.query(
    format(
      `
    CREATE TABLE %I (
      key TEXT PRIMARY KEY NOT NULL,
      value JSONB NOT NULL,
      UNIQUE (key)
    )
  `,
      namespace
    )
  );
};

export const hasItem = async (
  client: Client,
  namespace: string,
  key: string
): Promise<boolean> => {
  validateNamespaceAndKey(namespace, key);

  if (await doesNamespaceExist(client, namespace)) {
    const result = await client.query(
      format('SELECT COUNT(*) FROM %I WHERE key = %L', namespace, key)
    );

    return result.rows?.[0]?.count > 0;
  }

  return false;
};

export const parseValue = <T extends JsonObject>(input: string | T): T =>
  typeof input === 'string' ? JSON.parse(input) : input;

export const getItem = async <T extends JsonObject>(
  client: Client,
  namespace: string,
  key: string
): Promise<T | undefined> => {
  validateNamespaceAndKey(namespace, key);

  if (await doesNamespaceExist(client, namespace)) {
    const result = await client.query(
      format('SELECT value FROM %I WHERE key = %L', namespace, key)
    );

    if (result.rows.length > 0) {
      return parseValue<T>(result.rows[0].value);
    }
  }

  return undefined;
};
