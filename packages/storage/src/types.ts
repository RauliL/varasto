import { JsonObject } from 'type-fest';

/**
 * JSON key-value store that persists JSON objects to disk.
 */
export type Storage = {
  /**
   * Tests whether an item identified by given key and namespace exists in the
   * storage.
   */
  has: (namespace: string, key: string) => boolean;

  /**
   * Lists keys stored under given namespace. Returned promise will resolve
   * into empty array even if the namespace does not exist.
   *
   * The promise will fail if an I/O error occurs, or if given namespace or
   * key are invalid.
   */
  keys: (namespace: string) => Promise<string[]>;

  /**
   * Lists all items stored under given namespace. Returned promise will
   * resolve into empty array even if the namespace does not exist.
   *
   * The promise will fail if an I/O error occurs, or if given namespace or
   * key are invalid.
   */
  values: (namespace: string) => Promise<JsonObject[]>;

  /**
   * Lists all items stored under given namespace, alongside their keys.
   * Returned promise will resolve into empty array even if the namespace
   * does not exist.
   *
   * The promise will fail if an I/O error occurs, or if given namespace or
   * key are invalid.
   */
  entries: (namespace: string) => Promise<[string, JsonObject][]>;

  /**
   * Attempts to retrieve an item identified by given key and namespace.
   * Returned promise will resolve into the value, or `undefined` if the
   * item does not exist.
   *
   * The promise will fail if an I/O error occurs, or if given namespace or
   * key are invalid.
   */
  get: (namespace: string, key: string) => Promise<JsonObject | undefined>;

  /**
   * Attempts to store an item identified by given key and namespace.
   *
   * The promise will fail if an I/O error occurs, or if given namespace or
   * key are invalid.
   */
  set: (namespace: string, key: string, value: JsonObject) => Promise<void>;

  /**
   * Attempts to remove an item identified by given key and namespace. Returned
   * promise will resolve into boolean value which tells whether an item with
   * the given namespace and key existed or not.
   *
   * The promise will fail if an I/O error occurs, or if given namespace or
   * key are invalid.
   */
  delete: (namespace: string, key: string) => Promise<boolean>;
};

/**
 * Various options that can be given to the storage instance.
 */
export type StorageOptions = {
  /** Path to the directory where items are being stored. */
  dir: string;
  /** Character encoding to use. Defaults to UTF-8. */
  encoding: string;
};

/**
 * Exception which is thrown if an invalid slug is used as either namespace or
 * key of an item.
 */
export class InvalidSlugError extends Error {
  public constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = InvalidSlugError.name;
  }
}
