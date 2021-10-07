import { Storage } from '@varasto/storage';
import { isValidSlug } from 'is-valid-slug';
import Memcached from 'memcached';
import { JsonObject } from 'type-fest';

export const createMemcachedStorage = (memcached: Memcached): Storage => {
  const buildKey = (namespace: string, key: string) =>
    new Promise<string>((resolve, reject) => {
      if (!isValidSlug(namespace)) {
        reject();
        return;
      }

      if (!isValidSlug(key)) {
        reject();
        return;
      }

      resolve(`${namespace}::${key}`);
    });

  return {
    keys() {
      return Promise.resolve([]); // TODO
    },

    values() {
      return Promise.resolve([]); // TODO
    },

    entries() {
      return Promise.resolve([]); // TODO
    },

    has() {
      return Promise.resolve(false); // TODO
    },

    get<T extends JsonObject>(namespace: string, key: string) {
      return buildKey(namespace, key).then(
        (key) =>
          new Promise<T | undefined>((resolve, reject) => {
            memcached.get(key, (err, data) => {
              if (err) {
                reject(err);
              } else {
                resolve(data);
              }
            });
          })
      );
    },

    set() {},

    update() {},

    delete() {},
  };
};
