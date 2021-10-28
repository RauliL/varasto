import { JsonObject } from 'type-fest';

/**
 * Various options that can be given to single file storage instance.
 */
export type SingleFileStorageOptions = {
  /**
   * Path to the file where data will be stored into.
   */
  path: string;

  /**
   * Character encoding to use. Defaults to UTF-8.
   */
  encoding: string;

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
