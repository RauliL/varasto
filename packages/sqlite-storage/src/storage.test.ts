import { InvalidSlugError, ItemDoesNotExistError } from '@varasto/storage';

import { createSqliteStorage } from './storage';

describe('SQLite storage', () => {
  describe('has()', () => {
    it('should return true if the item exists', async () => {
      const storage = await createSqliteStorage();

      await storage.set('a', 'b', {});

      expect(await storage.has('a', 'b')).toBe(true);
    });

    it('should return false if the item does not exist', async () => {
      const storage = await createSqliteStorage();

      expect(await storage.has('a', 'b')).toBe(false);
    });

    it('should fail if given namespace is not valid slug', async () => {
      const storage = await createSqliteStorage();

      return expect(storage.has(';', 'b')).rejects.toBeInstanceOf(
        InvalidSlugError
      );
    });

    it('should fail if given key is not valid slug', async () => {
      const storage = await createSqliteStorage();

      return expect(storage.has('a', ';')).rejects.toBeInstanceOf(
        InvalidSlugError
      );
    });
  });

  describe('get()', () => {
    it('should return value of the item if it does exist', async () => {
      const storage = await createSqliteStorage();

      await storage.set('a', 'b', { value: 5 });

      return expect(storage.get('a', 'b')).resolves.toEqual({ value: 5 });
    });

    it('should return `undefined` if the item does not exist', async () => {
      const storage = await createSqliteStorage();

      return expect(storage.get('a', 'b')).resolves.toBeUndefined();
    });

    it('should fail if given namespace is not valid slug', async () => {
      const storage = await createSqliteStorage();

      return expect(storage.get(';', 'b')).rejects.toBeInstanceOf(
        InvalidSlugError
      );
    });

    it('should fail if given key is not valid slug', async () => {
      const storage = await createSqliteStorage();

      return expect(storage.get('a', ';')).rejects.toBeInstanceOf(
        InvalidSlugError
      );
    });
  });

  describe('set()', () => {
    it("should create new item if it doesn't exist", async () => {
      const storage = await createSqliteStorage();

      await storage.set('a', 'b', { value: 5 });

      return expect(storage.get('a', 'b')).resolves.toEqual({ value: 5 });
    });

    it('should replace existing item if it does exist', async () => {
      const storage = await createSqliteStorage();

      await storage.set('a', 'b', { value: 5 });
      await storage.set('a', 'b', { value: 15 });

      return expect(storage.get('a', 'b')).resolves.toEqual({ value: 15 });
    });

    it('should fail if given namespace is not valid slug', async () => {
      const storage = await createSqliteStorage();

      return expect(
        storage.set(';', 'b', { value: 5 })
      ).rejects.toBeInstanceOf(InvalidSlugError);
    });

    it('should fail if given key is not valid slug', async () => {
      const storage = await createSqliteStorage();

      return expect(
        storage.set('a', ';', { value: 5 })
      ).rejects.toBeInstanceOf(InvalidSlugError);
    });
  });

  describe('update()', () => {
    it('should update item if it does exist', async () => {
      const storage = await createSqliteStorage();

      await storage.set('a', 'b', { a: 1 });
      await storage.update('a', 'b', { b: 2 });

      return expect(storage.get('a', 'b')).resolves.toEqual({ a: 1, b: 2 });
    });

    it('should fail if the item does not exist', async () => {
      const storage = await createSqliteStorage();

      return expect(
        storage.update('a', 'b', { value: 5 })
      ).rejects.toBeInstanceOf(ItemDoesNotExistError);
    });

    it('should fail if given namespace is not valid slug', async () => {
      const storage = await createSqliteStorage();

      return expect(
        storage.update(';', 'b', { value: 5 })
      ).rejects.toBeInstanceOf(InvalidSlugError);
    });

    it('should fail if given key is not valid slug', async () => {
      const storage = await createSqliteStorage();

      return expect(
        storage.update('a', ';', { value: 5 })
      ).rejects.toBeInstanceOf(InvalidSlugError);
    });
  });

  describe('delete()', () => {
    it('should return true if the item does exist', async () => {
      const storage = await createSqliteStorage();

      await storage.set('a', 'b', {});

      return expect(storage.delete('a', 'b')).resolves.toBe(true);
    });

    it('should return false if the item does not exist', async () => {
      const storage = await createSqliteStorage();

      return expect(storage.delete('a', 'b')).resolves.toBe(false);
    });

    it('should fail if given namespace is not valid slug', async () => {
      const storage = await createSqliteStorage();

      return expect(storage.delete(';', 'b')).rejects.toBeInstanceOf(
        InvalidSlugError
      );
    });

    it('should fail if given key is not valid slug', async () => {
      const storage = await createSqliteStorage();

      return expect(storage.delete('a', ';')).rejects.toBeInstanceOf(
        InvalidSlugError
      );
    });
  });

  describe('keys()', () => {
    it('should return keys of all found items', async () => {
      const storage = await createSqliteStorage();

      await storage.set('a', '1', {});
      await storage.set('a', '2', {});
      await storage.set('a', '3', {});

      return storage.keys('a').then((result) => {
        expect(result).toHaveLength(3);
        expect(result).toContainEqual('1');
        expect(result).toContainEqual('2');
        expect(result).toContainEqual('3');
      });
    });

    it('should return empty array if the namespace does not contain items', async () => {
      const storage = await createSqliteStorage();

      return expect(storage.keys('a')).resolves.toEqual([]);
    });

    it('should fail if given namespace is not valid slug', async () => {
      const storage = await createSqliteStorage();

      return expect(storage.keys(';')).rejects.toBeInstanceOf(
        InvalidSlugError
      );
    });
  });

  describe('values()', () => {
    it('should return values of all found items', async () => {
      const storage = await createSqliteStorage();

      await storage.set('a', '1', { value: 1 });
      await storage.set('a', '2', { value: 2 });
      await storage.set('a', '3', { value: 3 });

      return storage.values('a').then((result) => {
        expect(result).toHaveLength(3);
        expect(result).toContainEqual({ value: 1 });
        expect(result).toContainEqual({ value: 2 });
        expect(result).toContainEqual({ value: 3 });
      });
    });

    it('should return empty array if the namespace does not contain items', async () => {
      const storage = await createSqliteStorage();

      return expect(storage.values('a')).resolves.toEqual([]);
    });

    it('should fail if given namespace is not valid slug', async () => {
      const storage = await createSqliteStorage();

      return expect(storage.values(';')).rejects.toBeInstanceOf(
        InvalidSlugError
      );
    });
  });

  describe('entries()', () => {
    it('should return keys and values of all found items', async () => {
      const storage = await createSqliteStorage();

      await storage.set('a', '1', { value: 1 });
      await storage.set('a', '2', { value: 2 });
      await storage.set('a', '3', { value: 3 });

      return storage.entries('a').then((result) => {
        expect(result).toHaveLength(3);
        expect(result).toContainEqual(['1', { value: 1 }]);
        expect(result).toContainEqual(['2', { value: 2 }]);
        expect(result).toContainEqual(['3', { value: 3 }]);
      });
    });

    it('should return empty array if the namespace does not contain items', async () => {
      const storage = await createSqliteStorage();

      return expect(storage.entries('a')).resolves.toEqual([]);
    });

    it('should fail if given namespace is not valid slug', async () => {
      const storage = await createSqliteStorage();

      return expect(storage.entries(';')).rejects.toBeInstanceOf(
        InvalidSlugError
      );
    });
  });
});
