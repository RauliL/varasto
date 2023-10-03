import { JsonObject } from 'type-fest';

import { ItemDoesNotExistError } from './errors';
import { Entry, FilterCallback, MapCallback } from './types';

/**
 * JSON key-value store that persists JSON objects identified by namespace and
 * key.
 */
export abstract class Storage {
  /**
   * Lists all items stored under given namespace, alongside their keys.
   * Returned generator should not generate anything if the namespace does not
   * exist.
   *
   * The asynchronous generator will fail if an I/O error occurs, or if given
   * namespace is invalid.
   */
  abstract entries<T extends JsonObject>(
    namespace: string
  ): AsyncGenerator<Entry<T>>;

  /**
   * Lists all keys stored under given namespace. Returned generator should not
   * generate anything if the namespace does not exist.
   *
   * The asynchronous generator will fail if an I/O error occurs, or if given
   * namespace is invalid.
   */
  async *keys(namespace: string): AsyncGenerator<string> {
    for await (const entry of this.entries(namespace)) {
      yield entry[0];
    }
  }

  /**
   * Lists all items stored under given namespace. Returned generator should
   * not generate anything if the namespace does not exist.
   *
   * The asynchronous generator will fail if an I/O error occurs, or if given
   * namespace is invalid.
   */
  async *values<T extends JsonObject>(namespace: string): AsyncGenerator<T> {
    for await (const entry of this.entries<T>(namespace)) {
      yield entry[1];
    }
  }

  /**
   * Tests whether an entry identified by given namespace and key exists in the
   * storage.
   */
  async has(namespace: string, key: string): Promise<boolean> {
    const value = await this.get(namespace, key);

    return value != null;
  }

  /**
   * Attempts to retrieve an item identified by given key and namespace.
   * Returned promise will resolve into the value, or `undefined` if the
   * item does not exist.
   *
   * The promise will fail if an I/O error occurs, or if given namespace or
   * key are invalid.
   */
  async get<T extends JsonObject>(
    namespace: string,
    key: string
  ): Promise<T | undefined> {
    for await (const entry of this.entries<T>(namespace)) {
      if (entry[0] === key) {
        return entry[1];
      }
    }
  }

  /**
   * Returns the first entry from specified namespace to which given callback
   * function returns `true` for, or `undefined` if the callback function does
   * not return `true` for any entry in the namespace.
   *
   * The promise will fail if an I/O error occurs, or if given namespace is not
   * a valid slug.
   */
  async find<T extends JsonObject>(
    namespace: string,
    callback: FilterCallback<T>
  ): Promise<Entry<T> | undefined> {
    for await (const entry of this.entries<T>(namespace)) {
      if (callback(entry[1], entry[0])) {
        return entry;
      }
    }
  }

  /**
   * Goes through all entries from the given namespace, returning ones for
   * which the given callback functions returns `true` for.
   *
   * The promise will fail if an I/O error occurs, or if given namespace is not
   * a valid slug.
   */
  async *filter<T extends JsonObject>(
    namespace: string,
    callback: FilterCallback<T>
  ): AsyncGenerator<Entry<T>> {
    for await (const entry of this.entries<T>(namespace)) {
      if (callback(entry[1], entry[0])) {
        yield entry;
      }
    }
  }

  /**
   * Goes through all entries from the given namespace, passing them to the
   * given callback function and returning whatever the callback function
   * returned.
   *
   * The promise will fail if an I/O error occurs, or if given namespace is not
   * a valid slug.
   */
  async *map<T extends JsonObject, U extends JsonObject = T>(
    namespace: string,
    callback: MapCallback<T, U>
  ): AsyncGenerator<Entry<U>> {
    for await (const [key, value] of this.entries<T>(namespace)) {
      yield [key, callback(value, key)];
    }
  }

  /**
   * Attempts to store an item identified by given key and namespace.
   *
   * The promise will fail if an I/O error occurs, or if given namespace or
   * key are invalid.
   */
  abstract set<T extends JsonObject>(
    namespace: string,
    key: string,
    value: T
  ): Promise<void>;

  /**
   * Attempts to update an item identified by given key and namespace with
   * given data.
   *
   * The promise will fail if an I/O error occurs, or if given namespace or
   * key are invalid or if no item identified by given namespace key exist.
   */
  async update<T extends JsonObject>(
    namespace: string,
    key: string,
    value: Partial<T>
  ): Promise<T> {
    const oldValue = await this.get<T>(namespace, key);

    if (oldValue != null) {
      const newValue = { ...oldValue, ...value };

      await this.set<T>(namespace, key, newValue);

      return newValue;
    }

    throw new ItemDoesNotExistError('Item does not exist');
  }

  /**
   * Attempts to remove an item identified by given key and namespace. Returned
   * promise will resolve into boolean value which tells whether an item with
   * the given namespace and key existed or not.
   *
   * The promise will fail if an I/O error occurs, or if given namespace or
   * key are invalid.
   */
  abstract delete(namespace: string, key: string): Promise<boolean>;
}
