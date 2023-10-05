import { createMemoryStorage } from '@varasto/memory-storage';
import all from 'it-all';

import { Field, Key, Model } from './decorator';
import { ModelDoesNotExistError } from './error';
import { count, exists, find, findAll, get, keys, list } from './query';

describe('query utilities', () => {
  const storage = createMemoryStorage();

  @Model({ namespace: 'users' })
  class User {
    @Key()
    id?: string;

    @Field()
    username: string;

    constructor(id: string, username: string) {
      this.id = id;
      this.username = username;
    }
  }

  beforeEach(() => storage.clear());

  describe('exists()', () => {
    it('should return true if the entry exists', async () => {
      await storage.set('users', '1', { username: 'foo' });

      return expect(exists(storage, User, '1')).resolves.toBe(true);
    });

    it('should return false if the entry does not exist', () =>
      expect(exists(storage, User, '1')).resolves.toBe(false));
  });

  describe('get()', () => {
    it('should return the entry if it exists', async () => {
      await storage.set('users', '1', { username: 'foo' });

      return get(storage, User, '1').then((result) => {
        expect(result).toBeInstanceOf(User);
        expect(result).toMatchObject({
          id: '1',
          username: 'foo',
        });
      });
    });

    it('should fail if the entry does not exist', () =>
      expect(get(storage, User, '1')).rejects.toBeInstanceOf(
        ModelDoesNotExistError
      ));
  });

  describe('count()', () => {
    it('should return the number of entries in the namespace', async () => {
      await storage.set('users', '1', { username: 'foo' });
      await storage.set('users', '2', { username: 'bar' });

      return expect(count(storage, User)).resolves.toEqual(2);
    });

    it('should accept an optional schema and count entries that only match that schema', async () => {
      await storage.set('users', '1', { username: 'foo' });
      await storage.set('users', '2', { username: 'bar' });

      return expect(
        count(storage, User, { username: 'foo' })
      ).resolves.toEqual(1);
    });
  });

  describe('list()', () => {
    it('should return all entries in the namespace', async () => {
      await storage.set('users', '1', { username: 'foo' });
      await storage.set('users', '2', { username: 'bar' });

      return all(list(storage, User)).then((result) => {
        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(User);
        expect(result[1]).toBeInstanceOf(User);
      });
    });
  });

  describe('keys()', () => {
    it('should return keys of entries in the namespace', async () => {
      await storage.set('users', '1', { username: 'foo' });
      await storage.set('users', '2', { username: 'bar' });

      return all(keys(storage, User)).then((result) => {
        expect(result).toHaveLength(2);
        expect(result).toContainEqual('1');
        expect(result).toContainEqual('2');
      });
    });
  });

  describe('find()', () => {
    it('should return first entry matching the given schema', async () => {
      await storage.set('users', '1', { username: 'foo' });

      return expect(
        find(storage, User, { username: 'foo' })
      ).resolves.toMatchObject({
        id: '1',
        username: 'foo',
      });
    });

    it('should return undefined if no entry matches the given schema', () =>
      expect(
        find(storage, User, { username: 'foo' })
      ).resolves.toBeUndefined());
  });

  describe('findAll()', () => {
    it('should return all entries that match the given schema', async () => {
      await storage.set('users', '1', { username: 'foofoo' });
      await storage.set('users', '2', { username: 'barfoo' });
      await storage.set('users', '3', { username: 'barbar' });

      return all(
        findAll(storage, User, { username: { $endsWith: 'foo' } })
      ).then((result) => {
        expect(result).toHaveLength(2);
        expect(result).toContainEqual({ id: '1', username: 'foofoo' });
        expect(result).toContainEqual({ id: '2', username: 'barfoo' });
      });
    });
  });
});
