import { createMemoryStorage } from '@varasto/memory-storage';

import { findAll, findAllEntries, findAllKeys } from './find-all';

describe('find all utilities', () => {
  const storage = createMemoryStorage();

  beforeEach(async () => {
    storage.clear();
    await storage.set('items', '1', { id: 1, status: 0 });
    await storage.set('items', '2', { id: 2, status: 1 });
    await storage.set('items', '3', { id: 3, status: 1 });
    await storage.set('items', '4', { id: 4, status: 0 });
  });

  describe('findAll()', () => {
    it('should return values of all entries that match the schema', () =>
      expect(findAll(storage, 'items', { status: 1 })).resolves.toEqual([
        { id: 2, status: 1 },
        { id: 3, status: 1 },
      ]));

    it('should return empty array if no entry matches the schema', () =>
      expect(findAll(storage, 'items', { status: 2 })).resolves.toHaveLength(
        0
      ));
  });

  describe('findAllKeys()', () => {
    it('should return keys of all entries that match the schema', () =>
      expect(findAllKeys(storage, 'items', { status: 1 })).resolves.toEqual([
        '2',
        '3',
      ]));

    it('should return empty array if no entry matches the schema', () =>
      expect(
        findAllKeys(storage, 'items', { status: 2 })
      ).resolves.toHaveLength(0));
  });

  describe('findAllEntries()', () => {
    it('should return all entries that match the schema', () =>
      expect(findAllEntries(storage, 'items', { status: 1 })).resolves.toEqual(
        [
          ['2', { id: 2, status: 1 }],
          ['3', { id: 3, status: 1 }],
        ]
      ));

    it('should return empty array if no entry matches the schema', () =>
      expect(
        findAllEntries(storage, 'items', { status: 2 })
      ).resolves.toHaveLength(0));
  });
});
