import {
  InvalidSlugError,
  ItemDoesNotExistError,
  Storage,
} from '@varasto/storage';

import axios, { AxiosError } from 'axios';
import { JsonObject } from 'type-fest';

import { RemoteStorageOptions } from './types';

const errorHandler = (err: AxiosError) =>
  err.response?.status === 400
    ? Promise.reject(
        new InvalidSlugError('Given namespace or key is not valid slug')
      )
    : err.response?.status === 404
    ? Promise.resolve(undefined)
    : Promise.reject(err);

export const createRemoteStorage = (
  options: Partial<RemoteStorageOptions> = {}
): Storage => {
  const client = axios.create({
    baseURL: options.url ?? 'http://0.0.0.0:3000/',
    auth: options.auth,
  });

  return {
    has(namespace: string, key: string): Promise<boolean> {
      return client
        .head(`/${namespace}/${key}`)
        .then(() => true)
        .catch((err: AxiosError) =>
          err.response?.status === 404 ? false : Promise.reject(err)
        );
    },

    keys(namespace: string): Promise<string[]> {
      return client
        .get<Record<string, JsonObject>>(`/${namespace}`)
        .then((response) => Object.keys(response.data));
    },

    values(namespace: string): Promise<JsonObject[]> {
      return client
        .get<Record<string, JsonObject>>(`/${namespace}`)
        .then((response) => Object.values(response.data));
    },

    entries(namespace: string): Promise<[string, JsonObject][]> {
      return client
        .get<Record<string, JsonObject>>(`/${namespace}`)
        .then((response) => {
          const result: Array<[string, JsonObject]> = [];

          Object.keys(response.data).forEach((key) => {
            result.push([key, response.data[key]]);
          });

          return result;
        });
    },

    get(namespace: string, key: string): Promise<JsonObject | undefined> {
      return client
        .get<JsonObject>(`/${namespace}/${key}`)
        .then((response) => response.data)
        .catch(errorHandler);
    },

    set(namespace: string, key: string, value: JsonObject): Promise<void> {
      return client
        .post(`/${namespace}/${key}`, value)
        .then(() => undefined)
        .catch(errorHandler);
    },

    update(
      namespace: string,
      key: string,
      value: JsonObject
    ): Promise<JsonObject> {
      return client
        .patch<JsonObject>(`${namespace}/${key}`, value)
        .then((response) => response.data)
        .catch((err) =>
          Promise.reject(
            err.response?.status === 400
              ? new InvalidSlugError(
                  'Given namespace or key is not valid slug'
                )
              : err.response?.status === 404
              ? new ItemDoesNotExistError('Item does not exist')
              : err
          )
        );
    },

    delete(namespace: string, key: string): Promise<boolean> {
      return client
        .delete(`/${namespace}/${key}`)
        .then(() => true)
        .catch((err: AxiosError) =>
          err.response?.status === 404 ? false : Promise.reject(err)
        );
    },
  };
};
