import { createMemoryStorage } from '@varasto/memory-storage';

import { Field, Key, Model } from './decorator';
import { ModelDoesNotExistError } from './error';
import { remove, save } from './storage';

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
});
