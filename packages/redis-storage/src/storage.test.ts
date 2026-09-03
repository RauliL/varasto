import { InvalidSlugError, ItemDoesNotExistError } from '@varasto/storage';
import { RedisClientType } from '@redis/client';
import all from 'it-all';
import { beforeEach, describe, expect, it } from 'vitest';

import { createRedisStorage } from './storage';

const createMockClient = (): RedisClientType => {
  const hashes = new Map<string, Map<string, string>>();

  const getHash = (key: string): Map<string, string> => {
    let hash = hashes.get(key);

    if (hash == null) {
      hash = new Map();
      hashes.set(key, hash);
    }

    return hash;
  };

  return {
    del: async (key: string) => (hashes.delete(key) ? 1 : 0),
    hDel: async (key: string, field: string) =>
      getHash(key).delete(field) ? 1 : 0,
    hExists: async (key: string, field: string) =>
      getHash(key).has(field) ? 1 : 0,
    hGet: async (key: string, field: string) =>
      getHash(key).get(field) ?? null,
    hGetAll: async (key: string) => Object.fromEntries(getHash(key)),
    hKeys: async (key: string) => [...getHash(key).keys()],
    hSet: async (key: string, field: string, value: string) => {
      getHash(key).set(field, value);
      return 1;
    },
    hVals: async (key: string) => [...getHash(key).values()],
  } as RedisClientType;
};

describe('Redis storage', () => {
  const client = createMockClient();
  const storage = createRedisStorage(client);

  beforeEach(async () => {
    await client.del('namespace');
  });

  describe('keys()', () => {
    it('should fail if given namespace is not valid slug', () =>
      expect(all(storage.keys('n;amespace'))).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should return keys of an namespace', async () => {
      await client.hSet('namespace', 'a', '{"a":1}');
      await client.hSet('namespace', 'b', '{"b":1}');
      await client.hSet('namespace', 'c', '{"c":1}');

      await expect(all(storage.keys('namespace'))).resolves.toEqual([
        'a',
        'b',
        'c',
      ]);
    });

    it('should return empty array if namespace if empty', () =>
      expect(all(storage.keys('namespace'))).resolves.toEqual([]));
  });

  describe('values()', () => {
    it('should fail if given namespace is not valid slug', () =>
      expect(all(storage.values('n;amespace'))).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should return values of an namespace', async () => {
      await client.hSet('namespace', 'a', '{"a":1}');
      await client.hSet('namespace', 'b', '{"b":1}');
      await client.hSet('namespace', 'c', '{"c":1}');

      const values = await all(storage.values('namespace'));

      expect(values).toHaveLength(3);
      expect(values).toContainEqual({ a: 1 });
      expect(values).toContainEqual({ b: 1 });
      expect(values).toContainEqual({ c: 1 });
    });

    it('should fail if one of the values cannot be deserialized', async () => {
      await client.hSet('namespace', 'a', '{"a":1}');
      await client.hSet('namespace', 'b', 'fail');
      await client.hSet('namespace', 'c', '{"c":1}');

      await expect(all(storage.values('namespace'))).rejects.toBeInstanceOf(
        Error
      );
    });

    it('should return empty array if namespace is empty', () =>
      expect(all(storage.values('namespace'))).resolves.toEqual([]));
  });

  describe('entries', () => {
    it('should fail if given namespace is not valid slug', () =>
      expect(all(storage.entries('n;amespace'))).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should return key-value entries of an namespace', async () => {
      await client.hSet('namespace', 'a', '{"a":1}');
      await client.hSet('namespace', 'b', '{"b":1}');
      await client.hSet('namespace', 'c', '{"c":1}');

      const entries = await all(storage.entries('namespace'));

      expect(entries).toHaveLength(3);
      expect(entries).toContainEqual(['a', { a: 1 }]);
      expect(entries).toContainEqual(['b', { b: 1 }]);
      expect(entries).toContainEqual(['c', { c: 1 }]);
    });

    it('should fail if one of the entries cannot be deserialized', async () => {
      await client.hSet('namespace', 'a', '{"a":1}');
      await client.hSet('namespace', 'b', 'fail');
      await client.hSet('namespace', 'c', '{"c":1}');

      await expect(all(storage.entries('namespace'))).rejects.toBeInstanceOf(
        Error
      );
    });

    it('should return empty array if namespace is empty', () =>
      expect(all(storage.entries('namespace'))).resolves.toEqual([]));
  });

  describe('has()', () => {
    it('should fail if given namespace is not valid slug', () =>
      expect(storage.has('n;amespace', 'key')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should fail if given key is not valid slug', () =>
      expect(storage.has('namespace', 'k;ey')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should detect if an item exists', async () => {
      await client.hSet('namespace', 'key', '{"a":1}');

      await expect(storage.has('namespace', 'key')).resolves.toBe(true);
    });

    it('should detect if an item does not exist', async () => {
      const client = createMockClient();
      const storage = createRedisStorage(client);

      await client.hSet('namespace', 'key', '{"a":1}');

      await expect(storage.has('key', 'namespace')).resolves.toBe(false);
    });
  });

  describe('get()', () => {
    it('should fail if given namespace is not valid slug', () =>
      expect(storage.get('n;amespace', 'key')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should fail if given key is not valid slug', () =>
      expect(storage.get('namespace', 'k;ey')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should be able to retrieve an item', async () => {
      await client.hSet('namespace', 'key', '{"a":1}');

      await expect(storage.get('namespace', 'key')).resolves.toEqual({
        a: 1,
      });
    });

    it('should return `undefined` if an item does not exist', () =>
      expect(storage.get('namespace', 'key')).resolves.toBeUndefined());

    it('should fail if an item cannot be deserialized', async () => {
      await client.hSet('namespace', 'key', 'fail');

      await expect(storage.get('namespace', 'key')).rejects.toBeInstanceOf(
        Error
      );
    });
  });

  describe('set()', () => {
    it('should fail if given namespace is not valid slug', () =>
      expect(
        storage.set('n;amespace', 'key', { a: 1 })
      ).rejects.toBeInstanceOf(InvalidSlugError));

    it('should fail if given key is not valid slug', () =>
      expect(
        storage.set('namespace', 'k;ey', { a: 1 })
      ).rejects.toBeInstanceOf(InvalidSlugError));

    it('should be able to add items', async () => {
      await storage.set('namespace', 'key', { a: 1 });

      await expect(client.hGet('namespace', 'key')).resolves.toEqual(
        JSON.stringify({ a: 1 })
      );
    });
  });

  describe('update()', () => {
    it('should fail if given namespace is not valid slug', () =>
      expect(
        storage.update('n;amespace', 'key', { a: 1 })
      ).rejects.toBeInstanceOf(InvalidSlugError));

    it('should fail if given key is not valid slug', () =>
      expect(
        storage.update('namespace', 'k;ey', { a: 1 })
      ).rejects.toBeInstanceOf(InvalidSlugError));

    it('should be able to update already existing item', async () => {
      await client.hSet('namespace', 'key', JSON.stringify({ a: 1 }));

      await expect(
        storage.update('namespace', 'key', { b: 2 })
      ).resolves.toEqual({ a: 1, b: 2 });
    });

    it('should fail if an item does not exist', () =>
      expect(
        storage.update('namespace', 'key', { b: 2 })
      ).rejects.toBeInstanceOf(ItemDoesNotExistError));
  });

  describe('delete()', () => {
    it('should fail if given namespace is not valid slug', () =>
      expect(storage.delete('n;amespace', 'key')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should fail if given key is not valid slug', () =>
      expect(storage.delete('namespace', 'k;ey')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should return true if the deleted item existed', async () => {
      await client.hSet('namespace', 'key', '{"a":1}');

      await expect(storage.delete('namespace', 'key')).resolves.toBe(true);
    });

    it('should return false if the deleted item did not exist', () =>
      expect(storage.delete('namespace', 'key')).resolves.toBe(false));
  });

  describe('custom serializers', () => {
    const storage = createRedisStorage(client, {
      serialize: () => 'foo',
      deserialize: () => ({ a: 1 }),
    });

    it('should be able to serialize data with custom serializer', async () => {
      await storage.set('namespace', 'key', { a: 1 });

      await expect(client.hGet('namespace', 'key')).resolves.toEqual('foo');
    });

    it('should be able to deserialize data with custom deserializer', async () => {
      await client.hSet('namespace', 'key', 'foo');

      await expect(storage.get('namespace', 'key')).resolves.toEqual({
        a: 1,
      });
    });
  });
});
