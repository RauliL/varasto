import axios, { AxiosError } from 'axios';

import { Client, ClientOptions } from './types';

const errorHandler = (err: AxiosError) =>
  err.response?.status === 404
    ? Promise.resolve(undefined)
    : Promise.reject(err);

/**
 * Constructs new API client.
 */
export const createClient = (options: Partial<ClientOptions> = {}): Client => {
  const client = axios.create({
    baseURL: options.url ?? 'http://0.0.0.0:3000',
    auth: options.auth,
  });

  return {
    list: (namespace) =>
      client.get(`/${namespace}`).then((response) => response.data),

    get: (namespace, key) =>
      client
        .get(`/${namespace}/${key}`)
        .then((response) => response.data)
        .catch(errorHandler),

    set: (namespace, key, value) =>
      client
        .post(`/${namespace}/${key}`, value)
        .then((response) => response.data)
        .catch(errorHandler),

    patch: (namespace, key, value) =>
      client
        .patch(`/${namespace}/${key}`, value)
        .then((response) => response.data)
        .catch(errorHandler),

    delete: (namespace, key) =>
      client
        .delete(`/${namespace}/${key}`)
        .then((response) => response.data)
        .catch(errorHandler),
  };
};
