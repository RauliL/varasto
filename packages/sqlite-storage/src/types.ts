import { JsonObject } from 'type-fest';

/**
 * Various options that can be given to SQLite storage instance.
 */
export type SqliteStorageOptions = {
  /**
   * If set as `true`, tables associated to namespaces will be automatically
   * dropped once they are detected to be empty, i.e. no longer contain any
   * entries.
   */
  dropEmptyTables: boolean;

  /**
   * Custom serialization function used for converting JSON into text that is
   * stored to file system.
   *
   * `JSON.stringify` is used by default.
   */
  serialize: (data: JsonObject) => string;

  /**
   * Custom deserialization function used for converting data retrieved from
   * file system into JSON.
   *
   * `JSON.parse` is used by default.
   */
  deserialize: (data: string) => JsonObject;
};
