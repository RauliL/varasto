import { createMemoryStorage } from '@varasto/memory-storage';
import { beforeEach, describe, expect, it } from 'vitest';

import { find, findEntry, findKey } from './find';

describe('find utilities', () => {
  const storage = createMemoryStorage();

  beforeEach(async () => {
    storage.clear();
    await storage.set('items', '1', { id: 1, status: 0 });
    await storage.set('items', '2', { id: 2, status: 1 });
    await storage.set('items', '3', { id: 3, status: 1 });
    await storage.set('items', '4', { id: 4, status: 0 });
  });

  describe('find()', () => {
    it('should return first value of entry that matches the schema', () =>
      expect(find(storage, 'items', { status: 0 })).resolves.toEqual({
        id: 1,
        status: 0,
      }));

    it('should return undefined if no entry matches the schema', () =>
      expect(find(storage, 'items', { status: 2 })).resolves.toBeUndefined());
  });

  describe('findKey()', () => {
    it('should return first key of entry that matches the schema', () =>
      expect(findKey(storage, 'items', { status: 1 })).resolves.toBe('2'));

    it('should return undefined if no entry matches the schema', () =>
      expect(
        findKey(storage, 'items', { status: 2 })
      ).resolves.toBeUndefined());
  });

  describe('findEntries()', () => {
    it('should return first entry that matches the schema', () =>
      expect(findEntry(storage, 'items', { status: 1 })).resolves.toEqual([
        '2',
        { id: 2, status: 1 },
      ]));

    it('should return undefined if no entry matches the schema', () =>
      expect(
        findEntry(storage, 'items', { status: 2 })
      ).resolves.toBeUndefined());
  });
});
