import {
  Entry,
  InvalidSlugError,
  ItemDoesNotExistError,
  Storage,
} from '@varasto/storage';
import got, { HTTPError } from 'got';
import { JsonObject } from 'type-fest';

import { RemoteStorageOptions } from './types.js';

const getStatusCode = (err: unknown): number | undefined =>
  err instanceof HTTPError ? err.response?.statusCode : undefined;

const errorHandler = (err: unknown) => {
  const status = getStatusCode(err);

  return status === 400
    ? Promise.reject(
        new InvalidSlugError('Given namespace or key is not valid slug')
      )
    : status === 404
      ? Promise.resolve(undefined)
      : Promise.reject(err);
};

export const createRemoteStorage = (
  options: Partial<RemoteStorageOptions> = {}
): Storage => {
  const client = got.extend({
    prefixUrl: options.url ?? 'http://0.0.0.0:3000/',
    username: options.auth?.username,
    password: options.auth?.password,
    retry: { limit: 0 },
  });

  return new (class extends Storage {
    has(namespace: string, key: string): Promise<boolean> {
      return client
        .head(`${namespace}/${key}`)
        .then(() => true)
        .catch((err: unknown) =>
          getStatusCode(err) === 404 ? false : Promise.reject(err)
        );
    }

    async *keys(namespace: string): AsyncGenerator<string> {
      const data = await client
        .get(namespace)
        .json<Record<string, JsonObject>>();

      for (const key of Object.keys(data)) {
        yield key;
      }
    }

    async *values<T extends JsonObject>(namespace: string): AsyncGenerator<T> {
      const data = await client.get(namespace).json<Record<string, T>>();

      for (const value of Object.values(data) as T[]) {
        yield value;
      }
    }

    async *entries<T extends JsonObject>(
      namespace: string
    ): AsyncGenerator<Entry<T>> {
      const data = await client.get(namespace).json<Record<string, T>>();

      for (const key of Object.keys(data)) {
        yield [key, data[key]];
      }
    }

    get<T extends JsonObject>(
      namespace: string,
      key: string
    ): Promise<T | undefined> {
      return client.get(`${namespace}/${key}`).json<T>().catch(errorHandler);
    }

    set<T extends JsonObject>(
      namespace: string,
      key: string,
      value: T
    ): Promise<void> {
      return client
        .post(`${namespace}/${key}`, { json: value })
        .then(() => undefined)
        .catch(errorHandler);
    }

    update<T extends JsonObject>(
      namespace: string,
      key: string,
      value: Partial<T>
    ): Promise<T> {
      return client
        .patch(`${namespace}/${key}`, { json: value })
        .json<T>()
        .catch((err: unknown) => {
          const status = getStatusCode(err);

          return Promise.reject(
            status === 400
              ? new InvalidSlugError(
                  'Given namespace or key is not valid slug'
                )
              : status === 404
                ? new ItemDoesNotExistError('Item does not exist')
                : err
          );
        });
    }

    delete(namespace: string, key: string): Promise<boolean> {
      return client
        .delete(`${namespace}/${key}`)
        .then(() => true)
        .catch((err: unknown) =>
          getStatusCode(err) === 404 ? false : Promise.reject(err)
        );
    }
  })();
};
