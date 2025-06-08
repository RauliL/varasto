import { InvalidSlugError, ItemDoesNotExistError } from '@varasto/storage';
import all from 'it-all';
import { createClient } from 'redis';
import { beforeEach, describe, expect, it } from 'vitest';

import { createRedisStorage } from './storage';

describe('Redis storage', () => {
  const client = createClient();
  const storage = createRedisStorage(client);

  beforeEach(() => {
    client.del('namespace');
  });

  describe('keys()', () => {
    it('should fail if given namespace is not valid slug', () =>
      expect(all(storage.keys('n;amespace'))).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should return keys of an namespace', () => {
      client.hset('namespace', 'a', '{"a":1}');
      client.hset('namespace', 'b', '{"b":1}');
      client.hset('namespace', 'c', '{"c":1}');

      return expect(all(storage.keys('namespace'))).resolves.toEqual([
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

    it('should return values of an namespace', () => {
      client.hset('namespace', 'a', '{"a":1}');
      client.hset('namespace', 'b', '{"b":1}');
      client.hset('namespace', 'c', '{"c":1}');

      return all(storage.values('namespace')).then((values) => {
        expect(values).toHaveLength(3);
        expect(values).toContainEqual({ a: 1 });
        expect(values).toContainEqual({ b: 1 });
        expect(values).toContainEqual({ c: 1 });
      });
    });

    it('should fail if one of the values cannot be deserialized', () => {
      client.hset('namespace', 'a', '{"a":1}');
      client.hset('namespace', 'b', 'fail');
      client.hset('namespace', 'c', '{"c":1}');

      return expect(all(storage.values('namespace'))).rejects.toBeInstanceOf(
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

    it('should return key-value entries of an namespace', () => {
      client.hset('namespace', 'a', '{"a":1}');
      client.hset('namespace', 'b', '{"b":1}');
      client.hset('namespace', 'c', '{"c":1}');

      return all(storage.entries('namespace')).then((entries) => {
        expect(entries).toHaveLength(3);
        expect(entries).toContainEqual(['a', { a: 1 }]);
        expect(entries).toContainEqual(['b', { b: 1 }]);
        expect(entries).toContainEqual(['c', { c: 1 }]);
      });
    });

    it('should fail if one of the entries cannot be deserialized', () => {
      client.hset('namespace', 'a', '{"a":1}');
      client.hset('namespace', 'b', 'fail');
      client.hset('namespace', 'c', '{"c":1}');

      return expect(all(storage.entries('namespace'))).rejects.toBeInstanceOf(
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

    it('should detect if an item exists', () => {
      client.hmset('namespace', 'key', '{"a":1}');

      return expect(storage.has('namespace', 'key')).resolves.toBe(true);
    });

    it('should detect if an item does not exist', () => {
      const client = createClient();
      const storage = createRedisStorage(client);

      client.hmset('namespace', 'key', '{"a":1}');

      return expect(storage.has('key', 'namespace')).resolves.toBe(false);
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

    it('should be able to retrieve an item', () => {
      client.hmset('namespace', 'key', '{"a":1}');

      return expect(storage.get('namespace', 'key')).resolves.toEqual({
        a: 1,
      });
    });

    it('should return `undefined` if an item does not exist', () =>
      expect(storage.get('namespace', 'key')).resolves.toBeUndefined());

    it('should fail if an item cannot be deserialized', () => {
      client.hmset('namespace', 'key', 'fail');

      return expect(storage.get('namespace', 'key')).rejects.toBeInstanceOf(
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
      expect.assertions(3);
      expect(await storage.set('namespace', 'key', { a: 1 })).toBeUndefined();

      return new Promise((resolve) => {
        client.hget('namespace', 'key', (err, reply) => {
          expect(err).toBeFalsy();
          expect(reply).toEqual(JSON.stringify({ a: 1 }));
          resolve(undefined);
        });
      });
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

    it('should be able to update already existing item', () => {
      client.hmset('namespace', 'key', JSON.stringify({ a: 1 }));

      return expect(
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

    it('should return true if the deleted item existed', () => {
      client.hset('namespace', 'key', '{"a":1}');

      return expect(storage.delete('namespace', 'key')).resolves.toBe(true);
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

      return new Promise((resolve) => {
        client.hmget('namespace', 'key', (err, reply) => {
          expect(err).toBeFalsy();
          expect(reply).toEqual(['foo']);
          resolve(undefined);
        });
      });
    });

    it('should be able to deserialize data with custom deserializer', () => {
      client.hmset('namespace', 'key', 'foo');

      return expect(storage.get('namespace', 'key')).resolves.toEqual({
        a: 1,
      });
    });
  });
});
