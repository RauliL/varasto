import { createMemoryStorage } from '@varasto/memory-storage';

import { Field, Key, Model } from './decorator';
import { ModelDoesNotExistError } from './error';
import { remove, removeAll, save, updateAll } from './storage';

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
      const mockClean = jest.fn(function () {
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
  });

  describe('updateAll()', () => {
    it('should perform an bulk update on all matching model instances', async () => {
      await storage.set('users', 'mike', { username: 'mike', isActive: true });
      await storage.set('users', 'rick', { username: 'rick', isActive: true });
      await storage.set('users', 'john', { username: 'john', isActive: true });

      return updateAll(
        storage,
        User,
        { username: { $neq: 'mike' } },
        { isActive: false }
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
