import { JsonObject } from 'type-fest';

/**
 * Various options that can be given to Web storage instance.
 */
export type WebStorageOptions = {
  /**
   * Custom serialization function used for converting JSON into text that is
   * stored to the Web storage.
   *
   * `JSON.stringify` is used by default.
   */
  serialize?: (data: JsonObject) => string;

  /**
   * Custom deserialization function used for converting data retrieved from
   * Web storage into JSON.
   *
   * `JSON.parse` is used by default.
   */
  deserialize?: (data: string) => JsonObject;
};
