import {
  Entry,
  InvalidSlugError,
  ItemDoesNotExistError,
  Storage,
} from '@varasto/storage';
import { RedisClientType } from '@redis/client';

import { isValidSlug } from 'is-valid-slug';
import { JsonObject } from 'type-fest';

import { RedisStorageOptions } from './types';

/**
 * Creates new Redis storage.
 *
 * @param client Redis client to be used for data gathering.
 * @param options Optional serialization options.
 */
export const createRedisStorage = (
  client: RedisClientType,
  options: RedisStorageOptions = {}
): Storage => {
  const serialize = options.serialize ?? JSON.stringify;
  const deserialize = options.deserialize ?? JSON.parse;

  return new (class extends Storage {
    async *keys(namespace: string): AsyncGenerator<string> {
      if (!isValidSlug(namespace)) {
        throw new InvalidSlugError('Given namespace is not valid slug');
      }

      for (const key of await client.hKeys(namespace)) {
        yield key;
      }
    }

    async *values<T extends JsonObject>(namespace: string): AsyncGenerator<T> {
      if (!isValidSlug(namespace)) {
        throw new InvalidSlugError('Given namespace is not valid slug');
      }

      for (const data of await client.hVals(namespace)) {
        yield deserialize(data);
      }
    }

    async *entries<T extends JsonObject>(
      namespace: string
    ): AsyncGenerator<Entry<T>> {
      if (!isValidSlug(namespace)) {
        throw new InvalidSlugError('Given namespace is not valid slug');
      }

      const reply = await client.hGetAll(namespace);

      for (const [key, data] of reply instanceof Map
        ? reply
        : Object.entries(reply)) {
        yield [key, deserialize(data)];
      }
    }

    async has(namespace: string, key: string): Promise<boolean> {
      if (!isValidSlug(namespace)) {
        throw new InvalidSlugError('Given namespace is not valid slug');
      } else if (!isValidSlug(key)) {
        throw new InvalidSlugError('Given key is not valid slug');
      }

      return (await client.hExists(namespace, key)) === 1;
    }

    async get<T extends JsonObject>(
      namespace: string,
      key: string
    ): Promise<T | undefined> {
      if (!isValidSlug(namespace)) {
        throw new InvalidSlugError('Given namespace is not valid slug');
      } else if (!isValidSlug(key)) {
        throw new InvalidSlugError('Given key is not valid slug');
      }

      const reply = await client.hGet(namespace, key);

      if (reply != null) {
        return deserialize(reply);
      }

      return undefined;
    }

    async set<T extends JsonObject>(
      namespace: string,
      key: string,
      value: T
    ): Promise<void> {
      if (!isValidSlug(namespace)) {
        throw new InvalidSlugError('Given namespace is not valid slug');
      } else if (!isValidSlug(key)) {
        throw new InvalidSlugError('Given key is not valid slug');
      }

      await client.hSet(namespace, key, serialize(value));
    }

    async update<T extends JsonObject>(
      namespace: string,
      key: string,
      value: Partial<T>
    ): Promise<T> {
      const oldValue = await this.get<T>(namespace, key);

      if (oldValue != null) {
        const result = { ...oldValue, ...value };

        await this.set<T>(namespace, key, result);

        return result;
      }

      throw new ItemDoesNotExistError('Item does not exist');
    }

    async delete(namespace: string, key: string): Promise<boolean> {
      if (!isValidSlug(namespace)) {
        throw new InvalidSlugError('Given namespace is not valid slug');
      } else if (!isValidSlug(key)) {
        throw new InvalidSlugError('Given key is not valid slug');
      }

      return (await client.hDel(namespace, key)) > 0;
    }
  })();
};
