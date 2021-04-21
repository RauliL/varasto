import { JsonObject } from 'type-fest';

/**
 * Authentication credentials for an API client.
 */
export type ClientAuthentication = {
  username: string;
  password: string;
};

/**
 * Various options that can be given to an API client.
 */
export type ClientOptions = {
  /** URL of the server. */
  url: string;
  /** Optional authentication credentials. */
  auth?: ClientAuthentication;
};

/**
 * API client for Varasto servers.
 */
export type Client = {
  /**
   * Connects to the server and retrieves all items from an namespace.
   *
   * @param namespace Namespace to retrieve all items from.
   * @return Promise that resolves to an mapping where keys are mapped
   *         to value of the item.
   */
  list: <T extends JsonObject = JsonObject>(
    namespace: string,
  ) => Promise<Record<string, T>>;

  /**
   * Connects to the server and attempts to retrieve item identified by given
   * namespace and key.
   *
   * @param namespace Namespace where the item is stored into.
   * @param key Key of the item.
   * @return Promise that will resolve into value of the item, or undefined if
   *         the item does not exist.
   */
  get: <T extends JsonObject = JsonObject>(
    namespace: string,
    key: string,
  ) => Promise<T|undefined>;

  /**
   * Connects to the server and attempts to create an item identified by given
   * namespace and key.
   *
   * Existing items with the same namespace and key will be overwritten.
   *
   * @param namespace Namespace where the item will be stored item.
   * @param key Key of the item.
   * @param value Value to be stored.
   * @return Promise that will resolve into stored value of the item.
   */
  set: <T extends JsonObject = JsonObject>(
    namespace: string,
    key: string,
    value: T,
  ) => Promise<JsonObject>;

  /**
   * Connects to the server and attempts to do an partial update to an item
   * that already exists, identified by given namespace and key.
   *
   * @param namespace Namespace where the item is stored into.
   * @param key Key of the item.
   * @param value Data that will be patched into the item.
   * @return Promise that will resolve into value of the item after the
   *         partial update, or undefined if the item does not exist.
   */
  patch: <T extends JsonObject = JsonObject>(
    namespace: string,
    key: string,
    value: Partial<T>,
  ) => Promise<T|undefined>;

  /**
   * Connects to the server and attempts to remove an item identified by given
   * namespace and key.
   *
   * @param namespace Namespace where the item is stored into.
   * @param key Key of the item.
   * @return Promise that will resolve into value of the removed item, or
   *         undefined if the item does not exist.
   */
  delete: <T extends JsonObject = JsonObject>(
    namespace: string,
    key: string,
  ) => Promise<T|undefined>;
};
