import {
  InvalidSlugError,
  ItemDoesNotExistError,
  Storage,
} from '@varasto/storage';
import all from 'it-all';
import format from 'pg-format';
import { IMemoryDb, newDb } from 'pg-mem';
import { JsonObject } from 'type-fest';
import { describe, expect, it } from 'vitest';

import { createPostgresStorage } from './storage';
import { PostgresStorageOptions } from './types';
import { parseValue } from './utils';

describe('Postgres storage', () => {
  const getStorage = (
    options?: PostgresStorageOptions
  ): [Storage, IMemoryDb] => {
    const db = newDb();
    const { Client } = db.adapters.createPg();
    const storage = createPostgresStorage(new Client(), options);

    return [storage, db];
  };
  const insert = (
    db: IMemoryDb,
    namespace: string,
    key: string,
    value: JsonObject
  ) => {
    db.public.none(
      format(
        `
        CREATE TABLE IF NOT EXISTS %I (key TEXT, value TEXT);
        INSERT INTO %I (key, value) VALUES (%L, %L);
      `,
        namespace,
        namespace,
        key,
        JSON.stringify(value)
      )
    );
  };
  const select = (db: IMemoryDb, namespace: string, key: string): JsonObject =>
    parseValue(
      db.public.one(
        format('SELECT value FROM %I WHERE key = %L;', namespace, key)
      ).value
    );

  describe('has()', () => {
    it('should return true if item exists', () => {
      const [storage, db] = getStorage();

      insert(db, 'foo', 'bar', { value: 5 });

      return expect(storage.has('foo', 'bar')).resolves.toBe(true);
    });

    it('should return false if item does not exist', () =>
      expect(getStorage()[0].has('foo', 'bar')).resolves.toBe(false));

    it('should fail if given namespace is not valid slug', () =>
      expect(getStorage()[0].has('f;oo', 'bar')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should fail if given key is not valid slug', () =>
      expect(getStorage()[0].has('foo', 'b;ar')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));
  });

  describe('keys()', () => {
    it('should return keys of all found items', () => {
      const [storage, db] = getStorage();

      insert(db, 'foo', '1', {});
      insert(db, 'foo', '2', {});
      insert(db, 'foo', '3', {});

      return all(storage.keys('foo')).then((result) => {
        expect(result).toHaveLength(3);
        expect(result).toContainEqual('1');
        expect(result).toContainEqual('2');
        expect(result).toContainEqual('3');
      });
    });

    it('should return empty array if the namespace does not contain items', () =>
      expect(all(getStorage()[0].keys('foo'))).resolves.toHaveLength(0));

    it('should fail if given namespace is not valid slug', async () =>
      expect(all(getStorage()[0].keys(';'))).rejects.toBeInstanceOf(
        InvalidSlugError
      ));
  });

  describe('values()', () => {
    it('should return values of all found items', () => {
      const [storage, db] = getStorage();

      insert(db, 'foo', '1', { value: 1 });
      insert(db, 'foo', '2', { value: 2 });
      insert(db, 'foo', '3', { value: 3 });

      return all(storage.values('foo')).then((result) => {
        expect(result).toHaveLength(3);
        expect(result).toContainEqual({ value: 1 });
        expect(result).toContainEqual({ value: 2 });
        expect(result).toContainEqual({ value: 3 });
      });
    });

    it('should return empty array if the namespace does not contain items', () =>
      expect(all(getStorage()[0].values('foo'))).resolves.toHaveLength(0));

    it('should fail if given namespace is not valid slug', async () =>
      expect(all(getStorage()[0].values(';'))).rejects.toBeInstanceOf(
        InvalidSlugError
      ));
  });

  describe('entries()', () => {
    it('should return keys and values of all found items', () => {
      const [storage, db] = getStorage();

      insert(db, 'foo', '1', { value: 1 });
      insert(db, 'foo', '2', { value: 2 });
      insert(db, 'foo', '3', { value: 3 });

      return all(storage.entries('foo')).then((result) => {
        expect(result).toHaveLength(3);
        expect(result).toContainEqual(['1', { value: 1 }]);
        expect(result).toContainEqual(['2', { value: 2 }]);
        expect(result).toContainEqual(['3', { value: 3 }]);
      });
    });

    it('should return empty array if the namespace does not contain items', () =>
      expect(all(getStorage()[0].entries('foo'))).resolves.toHaveLength(0));

    it('should fail if given namespace is not valid slug', async () =>
      expect(all(getStorage()[0].entries(';'))).rejects.toBeInstanceOf(
        InvalidSlugError
      ));
  });

  describe('get()', () => {
    it('should return value of the item if it does exist', () => {
      const [storage, db] = getStorage();

      insert(db, 'foo', 'bar', { value: 'baz' });

      return expect(storage.get('foo', 'bar')).resolves.toEqual({
        value: 'baz',
      });
    });

    it('should return undefined if the item does not exist', () =>
      expect(getStorage()[0].get('foo', 'bar')).resolves.toBeUndefined());

    it('should fail if given namespace is not valid slug', () =>
      expect(getStorage()[0].get('f;oo', 'bar')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should fail if given key is not valid slug', () =>
      expect(getStorage()[0].get('foo', 'b;ar')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));
  });

  describe('set()', () => {
    it("should create new item if it doesn't exist", () => {
      const [storage, db] = getStorage();

      return storage.set('foo', 'bar', { value: 1 }).then(() => {
        expect(select(db, 'foo', 'bar')).toEqual({ value: 1 });
      });
    });

    it('should replace existing item if it does exist', () => {
      const [storage, db] = getStorage();

      insert(db, 'foo', 'bar', { value: 1 });

      return storage.set('foo', 'bar', { value: 2 }).then(() => {
        expect(select(db, 'foo', 'bar')).toEqual({ value: 2 });
      });
    });

    it('should fail if given namespace is not valid slug', () =>
      expect(
        getStorage()[0].set('f;oo', 'bar', { value: 1 })
      ).rejects.toBeInstanceOf(InvalidSlugError));

    it('should fail if given key is not valid slug', () =>
      expect(
        getStorage()[0].set('foo', 'b;ar', { value: 1 })
      ).rejects.toBeInstanceOf(InvalidSlugError));
  });

  describe('update()', () => {
    it('should update item if it does exist', () => {
      const [storage, db] = getStorage();

      insert(db, 'foo', 'bar', { value: 1, flag: true });

      return expect(
        storage.update('foo', 'bar', { value: 2 })
      ).resolves.toEqual({ value: 2, flag: true });
    });

    it('should fail if the item does not exist', () =>
      expect(
        getStorage()[0].update('foo', 'bar', { value: 2 })
      ).rejects.toBeInstanceOf(ItemDoesNotExistError));

    it('should fail if given namespace is not valid slug', () =>
      expect(
        getStorage()[0].update('f;oo', 'bar', { value: 2 })
      ).rejects.toBeInstanceOf(InvalidSlugError));

    it('should fail if given key is not valid slug', () =>
      expect(
        getStorage()[0].update('foo', 'b;ar', { value: 2 })
      ).rejects.toBeInstanceOf(InvalidSlugError));
  });

  describe('delete()', () => {
    it('should return true if the item does exist', () => {
      const [storage, db] = getStorage();

      insert(db, 'foo', 'bar', { value: 1 });

      return storage.delete('foo', 'bar').then((result) => {
        expect(result).toBe(true);
        expect(
          db.public.one("SELECT COUNT(*) FROM foo WHERE key = 'bar';")
        ).toHaveProperty('count', 0);
      });
    });

    it('should return false if the item does not exist', () =>
      expect(getStorage()[0].delete('foo', 'bar')).resolves.toBe(false));

    it('should fail if given namespace is not valid slug', () =>
      expect(getStorage()[0].delete('f;oo', 'bar')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should fail if given namespace is not valid slug', () =>
      expect(getStorage()[0].delete('foo', 'b;ar')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it.each([
      [true, 0],
      [false, 1],
    ])(
      'should drop empty tables when `dropEmptyTables` is true',
      (dropEmptyTables, expectedCount) => {
        const [storage, db] = getStorage({ dropEmptyTables });

        insert(db, 'foo', 'bar', { value: 1 });

        return storage.delete('foo', 'bar').then(() => {
          expect(
            db.public.one(
              "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'foo'"
            )
          ).toHaveProperty('count', expectedCount);
        });
      }
    );
  });
});
