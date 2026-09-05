import { validateNamespaceAndKey } from '@varasto/storage';
import { Database } from 'sqlite';
import { JsonObject } from 'type-fest';

export const doesNamespaceExist = (
  db: Database,
  namespace: string
): Promise<boolean> =>
  db
    .get('SELECT COUNT(*) FROM sqlite_master WHERE name = ?', [namespace])
    .then((result) => result['COUNT(*)'] > 0);

export const createNamespace = (db: Database, namespace: string) =>
  db.exec(`
  CREATE TABLE IF NOT EXISTS "${namespace}" (
    key TEXT NOT NULL PRIMARY KEY,
    value TEXT NOT NULL,
    UNIQUE (key) ON CONFLICT REPLACE
  )
`);

export const getItem = async <T extends JsonObject>(
  db: Database,
  namespace: string,
  key: string,
  deserialize: <T extends JsonObject>(input: string) => T | undefined
): Promise<T | undefined> => {
  validateNamespaceAndKey(namespace, key);

  if (await doesNamespaceExist(db, namespace)) {
    const row = await db.get(
      `SELECT value FROM "${namespace}" WHERE key = ?`,
      [key]
    );

    if (row) {
      return deserialize<T>(row.value);
    }
  }

  return undefined;
};
