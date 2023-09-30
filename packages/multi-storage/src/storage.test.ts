import { createMemoryStorage } from '@varasto/memory-storage';
import all from 'it-all';

import { createMultiStorage } from './storage';

describe('multi storage', () => {
  const memoryStorage1 = createMemoryStorage();
  const memoryStorage2 = createMemoryStorage();
  const multiStorage = createMultiStorage(memoryStorage1, memoryStorage2);

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

    it('should return empty array if no storages are given', async () => {
      expect(await all(createMultiStorage().keys('items'))).toEqual([]);
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

    it('should return empty array if no storages are given', async () => {
      expect(await all(createMultiStorage().values('items'))).toEqual([]);
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

    it('should return empty array if no storages are given', async () => {
      expect(await all(createMultiStorage().entries('items'))).toEqual([]);
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
});
