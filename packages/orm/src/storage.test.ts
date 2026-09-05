import { createMemoryStorage } from '@varasto/memory-storage';
import all from 'it-all';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Field, Key, Model } from './decorator/index.js';
import { ConfigurationError, ModelDoesNotExistError } from './error.js';
import { get } from './query.js';
import { remove, removeAll, save, updateAll } from './storage.js';

describe('storage utilities', () => {
  const storage = createMemoryStorage();

  @Model({ namespace: 'users' })
  class User {
    @Key()
    id?: string;

    @Field()
    username: string;

    @Field({ default: true })
    isActive: boolean;

    constructor(username: string = 'mike', isActive: boolean = true) {
      this.username = username;
      this.isActive = isActive;
    }
  }

  beforeEach(() => storage.clear());

  describe('save()', () => {
    it("should automatically assign new key for an entry if it doesn't have one", async () => {
      const user = new User('mike', false);

      await save(storage, user);

      expect(user.id).not.toHaveLength(0);

      return expect(
        storage.get('users', user.id ?? '')
      ).resolves.toMatchObject({
        username: 'mike',
        isActive: false,
      });
    });

    it('should use pre-existing key of entry when it has one', async () => {
      const user = new User('mike', false);

      user.id = 'mike';

      await save(storage, user);

      expect(user.id).toEqual('mike');

      return expect(storage.get('users', 'mike')).resolves.toMatchObject({
        username: 'mike',
        isActive: false,
      });
    });

    it('should call `clean` method if the model class has one', async () => {
      const mockClean = vi.fn(function () {
        this.username = 'not mike';
      });
      const user = new User();

      Reflect.set(user, 'clean', mockClean);

      await save(storage, user);

      expect(mockClean).toBeCalled();
      expect(user.username).toEqual('not mike');
    });

    it("should use default value of an field, when it's actual value is `undefined`", async () => {
      const user = new User();

      user.id = 'mike';
      Reflect.deleteProperty(user, 'isActive');

      await save(storage, user);

      expect(user.isActive).toBe(true);

      return expect(storage.get('users', 'mike')).resolves.toHaveProperty(
        'isActive',
        true
      );
    });

    it('should serialize and deserialize `Date` field values', async () => {
      @Model({ namespace: 'events' })
      class Event {
        @Key()
        id?: string;

        @Field()
        createdAt: Date;

        constructor(createdAt: Date) {
          this.createdAt = createdAt;
        }
      }

      const createdAt = new Date('2024-01-15T12:00:00.000Z');
      const event = new Event(createdAt);

      await save(storage, event);

      expect(event.id).not.toHaveLength(0);
      expect(await storage.get('events', event.id ?? '')).toEqual({
        createdAt: '2024-01-15T12:00:00.000Z',
      });

      const loaded = await get(storage, Event, event.id ?? '');

      expect(loaded.createdAt).toBeInstanceOf(Date);
      expect(loaded.createdAt.toISOString()).toEqual(
        '2024-01-15T12:00:00.000Z'
      );
    });

    it('should serialize and deserialize array field values', async () => {
      @Model({ namespace: 'articles' })
      class Article {
        @Key()
        id?: string;

        @Field({ items: 'string' })
        tags: string[];

        @Field({ type: 'date[]' })
        publishedAt: Date[];

        constructor(tags: string[], publishedAt: Date[]) {
          this.tags = tags;
          this.publishedAt = publishedAt;
        }
      }

      const article = new Article(
        ['typescript', 'orm'],
        [
          new Date('2024-01-15T12:00:00.000Z'),
          new Date('2024-06-01T00:00:00.000Z'),
        ]
      );

      await save(storage, article);

      expect(await storage.get('articles', article.id ?? '')).toEqual({
        tags: ['typescript', 'orm'],
        publishedAt: ['2024-01-15T12:00:00.000Z', '2024-06-01T00:00:00.000Z'],
      });

      const loaded = await get(storage, Article, article.id ?? '');

      expect(loaded.tags).toEqual(['typescript', 'orm']);
      expect(loaded.publishedAt).toHaveLength(2);
      expect(loaded.publishedAt[0]).toBeInstanceOf(Date);
      expect(loaded.publishedAt[1].toISOString()).toEqual(
        '2024-06-01T00:00:00.000Z'
      );
    });
  });

  describe('updateAll()', () => {
    it('should perform an bulk update on all matching model instances', async () => {
      await storage.set('users', 'mike', { username: 'mike', isActive: true });
      await storage.set('users', 'rick', { username: 'rick', isActive: true });
      await storage.set('users', 'john', { username: 'john', isActive: true });

      return all(
        updateAll(
          storage,
          User,
          { username: { $neq: 'mike' } },
          { isActive: false }
        )
      ).then(async (result) => {
        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(User);
        expect(result[1]).toBeInstanceOf(User);
        expect(result).toMatchObject({
          0: { isActive: false },
          1: { isActive: false },
        });
        expect(await storage.get('users', 'mike')).toHaveProperty(
          'isActive',
          true
        );
        expect(await storage.get('users', 'rick')).toHaveProperty(
          'isActive',
          false
        );
        expect(await storage.get('users', 'john')).toHaveProperty(
          'isActive',
          false
        );
      });
    });
  });

  describe('remove()', () => {
    it("should throw `ModelDoesNotExistError` error if the model instance doesn't have a key", async () => {
      const user = new User();

      return expect(remove(storage, user)).rejects.toBeInstanceOf(
        ModelDoesNotExistError
      );
    });

    it('should throw `ModelDoesNotExistError` error if the model instance does not exist in the storeage', async () => {
      const user = new User();

      user.id = 'mike';

      return expect(remove(storage, user)).rejects.toBeInstanceOf(
        ModelDoesNotExistError
      );
    });

    it("should remove the model instance from the storage, if it's there", async () => {
      const user = new User();

      user.id = 'mike';

      await save(storage, user);
      await remove(storage, user);

      return expect(storage.has('users', 'mike')).resolves.toBe(false);
    });

    it('should throw `ConfigurationError` if the model class has no key property set', () => {
      @Model()
      class ModelWithoutKey {
        @Field()
        id: string;

        constructor(id: string = '') {
          this.id = id;
        }
      }

      return expect(
        remove(storage, new ModelWithoutKey())
      ).rejects.toBeInstanceOf(ConfigurationError);
    });
  });

  describe('removeAll()', () => {
    it('should remove all model instances that match the given schema', async () => {
      await storage.set('users', 'mike', { username: 'mike', isActive: true });
      await storage.set('users', 'rick', { username: 'rick', isActive: true });
      await storage.set('users', 'john', { username: 'john', isActive: true });

      return removeAll(storage, User, { username: { $neq: 'mike' } }).then(
        async (result) => {
          expect(result).toEqual(2);
          expect(await storage.has('users', 'mike')).toBe(true);
          expect(await storage.has('users', 'rick')).toBe(false);
          expect(await storage.has('users', 'john')).toBe(false);
        }
      );
    });
  });
});
