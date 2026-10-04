import { createMemoryStorage } from '@varasto/memory-storage';
import { ItemDoesNotExistError } from '@varasto/storage';
import all from 'it-all';
import { beforeEach, describe, expect, it } from 'vitest';

import { createMultiStorage } from './storage.js';

describe('multi storage', () => {
  const memoryStorage1 = createMemoryStorage();
  const memoryStorage2 = createMemoryStorage();
  const multiStorage = createMultiStorage({
    '*': [memoryStorage1, memoryStorage2],
  });

  beforeEach(() => {
    memoryStorage1.clear();
    memoryStorage2.clear();
  });

  describe('keys()', () => {
    it('should collect keys from given storages', async () => {
      await memoryStorage1.set('items', '1', { id: 1 });
      await memoryStorage1.set('items', '2', { id: 2 });
      await memoryStorage1.set('items', '3', { id: 3 });
      await memoryStorage2.set('items', '4', { id: 4 });

      expect(await all(multiStorage.keys('items'))).toEqual([
        '1',
        '2',
        '3',
        '4',
      ]);
    });

    it('should return empty array if no storages match', async () => {
      expect(await all(createMultiStorage({}).keys('items'))).toEqual([]);
    });
  });

  describe('values()', () => {
    it('should collect values from given storages', async () => {
      await memoryStorage1.set('items', '1', { id: 1 });
      await memoryStorage1.set('items', '2', { id: 2 });
      await memoryStorage1.set('items', '3', { id: 3 });
      await memoryStorage2.set('items', '4', { id: 4 });

      expect(await all(multiStorage.values('items'))).toEqual([
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
      ]);
    });

    it('should return empty array if no storages match', async () => {
      expect(await all(createMultiStorage({}).values('items'))).toEqual([]);
    });
  });

  describe('entries()', () => {
    it('should collect entries from given storages', async () => {
      await memoryStorage1.set('items', '1', { id: 1 });
      await memoryStorage1.set('items', '2', { id: 2 });
      await memoryStorage1.set('items', '3', { id: 3 });
      await memoryStorage1.set('items', '4', { id: 4 });
      await memoryStorage2.set('items', '4', { id: 4 });
      await memoryStorage2.set('items', '5', { id: 5 });

      expect(await all(multiStorage.entries('items'))).toEqual([
        ['1', { id: 1 }],
        ['2', { id: 2 }],
        ['3', { id: 3 }],
        ['4', { id: 4 }],
        ['5', { id: 5 }],
      ]);
    });

    it('should return empty array if no storages match', async () => {
      expect(await all(createMultiStorage({}).entries('items'))).toEqual([]);
    });
  });

  describe('has()', () => {
    it('should return true if any of the storages has the entry', async () => {
      await memoryStorage2.set('items', '1', { id: 1 });

      expect(await multiStorage.has('items', '1')).toBe(true);
    });

    it('should return false if none of the storages have the entry', async () => {
      expect(await multiStorage.has('items', '1')).toBe(false);
    });
  });

  describe('get()', () => {
    it('should return first matching entry from the given storages', async () => {
      await memoryStorage2.set('items', '1', { id: 1 });

      expect(await multiStorage.get('items', '1')).toEqual({ id: 1 });
    });

    it('should return undefined if none of the storages have the entry', async () => {
      expect(await multiStorage.get('items', '1')).toBeUndefined();
    });
  });

  describe('set()', () => {
    it('should store the entry to all given storages', async () => {
      await multiStorage.set('items', '1', { id: 1 });

      expect(await memoryStorage1.get('items', '1')).toEqual({ id: 1 });
      expect(await memoryStorage2.get('items', '1')).toEqual({ id: 1 });
    });
  });

  describe('update()', () => {
    it('should update the entry to all given storages', async () => {
      await memoryStorage1.set('items', '1', { value: 1 });
      await memoryStorage2.set('items', '1', { value: 2 });

      expect(await multiStorage.update('items', '1', { id: 1 })).toEqual({
        id: 1,
        value: 1,
      });
      expect(await memoryStorage1.get('items', '1')).toEqual({
        id: 1,
        value: 1,
      });
      expect(await memoryStorage2.get('items', '1')).toEqual({
        id: 1,
        value: 2,
      });
    });
  });

  describe('delete()', () => {
    it('should delete the entry from all given storages', async () => {
      await memoryStorage1.set('items', '1', { id: 1 });
      await memoryStorage2.set('items', '2', { id: 2 });

      expect(await multiStorage.delete('items', '1')).toBe(true);
      expect(await memoryStorage1.has('items', '1')).toBe(false);
      expect(await memoryStorage2.has('items', '1')).toBe(false);
    });

    it('should return false if none of the given storages has the entry', async () => {
      expect(await multiStorage.delete('items', '1')).toBe(false);
    });
  });

  describe('namespace routing', () => {
    const usersStorage = createMemoryStorage();
    const postsStorage = createMemoryStorage();
    const postsReplica = createMemoryStorage();
    const fallbackStorage = createMemoryStorage();
    const routedStorage = createMultiStorage({
      users: usersStorage,
      'posts-*': [postsStorage, postsReplica],
      '*': fallbackStorage,
    });

    beforeEach(() => {
      usersStorage.clear();
      postsStorage.clear();
      postsReplica.clear();
      fallbackStorage.clear();
    });

    it('should route exact namespace matches', async () => {
      await routedStorage.set('users', '1', { name: 'Alice' });

      expect(await usersStorage.get('users', '1')).toEqual({ name: 'Alice' });
      expect(await fallbackStorage.has('users', '1')).toBe(false);
    });

    it('should route parameterized patterns', async () => {
      await routedStorage.set('posts-123', '1', { title: 'Hello' });

      expect(await postsStorage.get('posts-123', '1')).toEqual({
        title: 'Hello',
      });
      expect(await postsReplica.get('posts-123', '1')).toEqual({
        title: 'Hello',
      });
      expect(await fallbackStorage.has('posts-123', '1')).toBe(false);
    });

    it('should use catch-all as fallback', async () => {
      await routedStorage.set('other', '1', { value: 1 });

      expect(await fallbackStorage.get('other', '1')).toEqual({ value: 1 });
      expect(await usersStorage.has('other', '1')).toBe(false);
      expect(await postsStorage.has('other', '1')).toBe(false);
    });

    it('should use the first matching pattern', async () => {
      const first = createMemoryStorage();
      const second = createMemoryStorage();
      const storage = createMultiStorage({
        items: first,
        '*': second,
      });

      await storage.set('items', '1', { id: 1 });

      expect(await first.get('items', '1')).toEqual({ id: 1 });
      expect(await second.has('items', '1')).toBe(false);
    });

    it('should no-op when no pattern matches', async () => {
      const storage = createMultiStorage({
        users: usersStorage,
      });

      await storage.set('items', '1', { id: 1 });

      expect(await storage.get('items', '1')).toBeUndefined();
      expect(await storage.has('items', '1')).toBe(false);
      expect(await storage.delete('items', '1')).toBe(false);
      expect(await all(storage.keys('items'))).toEqual([]);
      await expect(
        storage.update('items', '1', { id: 2 })
      ).rejects.toBeInstanceOf(ItemDoesNotExistError);
    });
  });
});
