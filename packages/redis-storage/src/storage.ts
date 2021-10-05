import {
  InvalidSlugError,
  ItemDoesNotExistError,
  Storage,
} from '@varasto/storage';

import { isValidSlug } from 'is-valid-slug';
import { RedisClient } from 'redis';
import { JsonObject } from 'type-fest';

import { RedisStorageOptions } from './types';

/**
 * Creates new Redis storage.
 *
 * @param client Redis client to be used for data gathering.
 * @param options Optional serialization options.
 */
export const createRedisStorage = (
  client: RedisClient,
  options: RedisStorageOptions = {}
): Storage => {
  const serialize = options.serialize ?? JSON.stringify;
  const deserialize = options.deserialize ?? JSON.parse;

  return {
    keys(namespace: string): Promise<string[]> {
      if (!isValidSlug(namespace)) {
        return Promise.reject(
          new InvalidSlugError('Given namespace is not valid slug')
        );
      }

      return new Promise<string[]>((resolve, reject) => {
        client.hkeys(namespace, (err, reply) => {
          if (err) {
            reject(err);
          } else {
            resolve(reply);
          }
        });
      });
    },

    values<T extends JsonObject>(namespace: string): Promise<T[]> {
      if (!isValidSlug(namespace)) {
        return Promise.reject(
          new InvalidSlugError('Given namespace is not valid slug')
        );
      }

      return new Promise<T[]>((resolve, reject) => {
        client.hvals(namespace, (err, reply) => {
          const result: T[] = [];
          let error: Error | undefined;

          if (err) {
            reject(err);
            return;
          }
          reply.forEach((data) => {
            try {
              result.push(deserialize(data));
            } catch (err) {
              error = err;
            }
          });
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
    },

    entries<T extends JsonObject>(namespace: string): Promise<[string, T][]> {
      if (!isValidSlug(namespace)) {
        return Promise.reject(
          new InvalidSlugError('Given namespace is not valid slug')
        );
      }

      return new Promise<[string, T][]>((resolve, reject) => {
        client.hgetall(namespace, (err, reply) => {
          const result: [string, T][] = [];
          let error: Error | undefined;

          if (err) {
            reject(err);
            return;
          }
          if (reply != null) {
            Object.keys(reply).forEach((key) => {
              try {
                result.push([key, deserialize(reply[key])]);
              } catch (err) {
                error = err;
              }
            });
          }
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
    },

    has(namespace: string, key: string): Promise<boolean> {
      if (!isValidSlug(namespace)) {
        return Promise.reject(
          new InvalidSlugError('Given namespace is not valid slug')
        );
      } else if (!isValidSlug(key)) {
        return Promise.reject(
          new InvalidSlugError('Given key is not valid slug')
        );
      }

      return new Promise<boolean>((resolve, reject) => {
        client.hexists(namespace, key, (err, reply) => {
          if (err) {
            reject(err);
          } else {
            resolve(reply === 1);
          }
        });
      });
    },

    get<T extends JsonObject>(
      namespace: string,
      key: string
    ): Promise<T | undefined> {
      if (!isValidSlug(namespace)) {
        return Promise.reject(
          new InvalidSlugError('Given namespace is not valid slug')
        );
      } else if (!isValidSlug(key)) {
        return Promise.reject(
          new InvalidSlugError('Given key is not valid slug')
        );
      }

      return new Promise<T | undefined>((resolve, reject) => {
        client.hmget(namespace, key, (err, reply) => {
          if (err) {
            reject(err);
          } else if (reply.length > 0 && reply[0] != null) {
            try {
              resolve(deserialize(reply[0]));
            } catch (err) {
              reject(err);
            }
          } else {
            resolve(undefined);
          }
        });
      });
    },

    set<T extends JsonObject>(
      namespace: string,
      key: string,
      value: T
    ): Promise<void> {
      if (!isValidSlug(namespace)) {
        return Promise.reject(
          new InvalidSlugError('Given namespace is not valid slug')
        );
      } else if (!isValidSlug(key)) {
        return Promise.reject(
          new InvalidSlugError('Given key is not valid slug')
        );
      }

      return new Promise<void>((resolve, reject) => {
        let data;

        try {
          data = serialize(value);
        } catch (err) {
          reject(err);
          return;
        }

        client.hmset(namespace, key, data, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    },

    update<T extends JsonObject>(
      namespace: string,
      key: string,
      value: Partial<T>
    ): Promise<T> {
      return this.get<T>(namespace, key).then((oldValue) => {
        if (oldValue != null) {
          const result = { ...oldValue, ...value };

          return this.set(namespace, key, result).then(() => result);
        }

        return Promise.reject(
          new ItemDoesNotExistError('Item does not exist')
        );
      });
    },

    delete(namespace: string, key: string): Promise<boolean> {
      if (!isValidSlug(namespace)) {
        return Promise.reject(
          new InvalidSlugError('Given namespace is not valid slug')
        );
      } else if (!isValidSlug(key)) {
        return Promise.reject(
          new InvalidSlugError('Given key is not valid slug')
        );
      }

      return new Promise<boolean>((resolve, reject) => {
        client.hdel(namespace, key, (err, reply) => {
          if (err) {
            reject(err);
          } else {
            resolve(reply > 0);
          }
        });
      });
    },
  };
};
