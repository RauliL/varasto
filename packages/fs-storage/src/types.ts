import { JsonObject } from 'type-fest';

/**
 * Various options that can be given to file system storage instance.
 */
export type FileSystemStorageOptions = {
  /**
   * Path to the directory where items are being stored.
   */
  dir: string;

  /**
   * Character encoding to use. Defaults to UTF-8.
   */
  encoding: BufferEncoding;

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
