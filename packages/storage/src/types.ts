import { JsonObject } from 'type-fest';

/**
 * Represents an entry in key-value store.
 */
export type Entry<T extends JsonObject> = [string, T];

/**
 * Callback function for `find` and `filter` methods in the `Storage` class.
 */
export type FilterCallback<T extends JsonObject> = (
  value: T,
  key: string
) => boolean;

/**
 * Callback function for `map` method in the `Storage` class.
 */
export type MapCallback<T extends JsonObject, U extends JsonObject = T> = (
  value: T,
  key: string
) => U;
