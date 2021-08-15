import { JsonObject } from 'type-fest';

/**
 * Various options that can be given to Redis storage instance.
 */
export type RedisStorageOptions = {
  /**
   * Custom serialization function used for converting JSON into text that is
   * stored to Redis.
   *
   * `JSON.stringify` is used by default.
   */
  serialize?: (data: JsonObject) => string;

  /**
   * Custom deserialization function used for converting data coming from Redis
   * into JSON.
   *
   * `JSON.parse` is used by default.
   */
  deserialize?: (data: string) => JsonObject;
};
