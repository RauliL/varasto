import { JsonObject } from 'type-fest';

/**
 * JSON key-value store that persists JSON objects identified by namespace and
 * key.
 */
export type Storage = {
  /**
   * Tests whether an item identified by given key and namespace exists in the
   * storage.
   */
  has: (namespace: string, key: string) => Promise<boolean>;

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
  values: <T extends JsonObject>(namespace: string) => Promise<T[]>;

  /**
   * Lists all items stored under given namespace, alongside their keys.
   * Returned promise will resolve into empty array even if the namespace
   * does not exist.
   *
   * The promise will fail if an I/O error occurs, or if given namespace or
   * key are invalid.
   */
  entries: <T extends JsonObject>(namespace: string) => Promise<[string, T][]>;

  /**
   * Attempts to retrieve an item identified by given key and namespace.
   * Returned promise will resolve into the value, or `undefined` if the
   * item does not exist.
   *
   * The promise will fail if an I/O error occurs, or if given namespace or
   * key are invalid.
   */
  get: <T extends JsonObject>(
    namespace: string,
    key: string
  ) => Promise<T | undefined>;

  /**
   * Attempts to store an item identified by given key and namespace.
   *
   * The promise will fail if an I/O error occurs, or if given namespace or
   * key are invalid.
   */
  set: <T extends JsonObject>(
    namespace: string,
    key: string,
    value: T
  ) => Promise<void>;

  /**
   * Attempts to update an item identified by given key and namespace with
   * given data.
   *
   * The promise will fail if an I/O error occurs, or if given namespace or
   * key are invalid or if no item identified by given namespace key exist.
   */
  update: <T extends JsonObject>(
    namespace: string,
    key: string,
    value: Partial<T>
  ) => Promise<T>;

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
