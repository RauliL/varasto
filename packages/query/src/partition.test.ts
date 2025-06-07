import { createMemoryStorage } from '@varasto/memory-storage';
import { beforeEach, describe, expect, it } from 'vitest';

import { partition, partitionEntries, partitionKeys } from './partition';

describe('partition utilities', () => {
  const storage = createMemoryStorage();

  beforeEach(async () => {
    storage.clear();
    await storage.set('items', '1', { id: 1, status: 0 });
    await storage.set('items', '2', { id: 2, status: 1 });
    await storage.set('items', '3', { id: 3, status: 1 });
    await storage.set('items', '4', { id: 4, status: 0 });
  });

  describe('partition()', () => {
    it('should split values into two arrays based on the schema', () =>
      expect(partition(storage, 'items', { status: 0 })).resolves.toEqual([
        [
          { id: 1, status: 0 },
          { id: 4, status: 0 },
        ],
        [
          { id: 2, status: 1 },
          { id: 3, status: 1 },
        ],
      ]));
  });

  describe('partitionKeys()', () => {
    it('should split keys into two arrays based on the schema', () =>
      expect(partitionKeys(storage, 'items', { status: 0 })).resolves.toEqual([
        ['1', '4'],
        ['2', '3'],
      ]));
  });

  describe('partitionEntries()', () => {
    it('should split entries into two arrays based on the schema', () =>
      expect(
        partitionEntries(storage, 'items', { status: 0 })
      ).resolves.toEqual([
        [
          ['1', { id: 1, status: 0 }],
          ['4', { id: 4, status: 0 }],
        ],
        [
          ['2', { id: 2, status: 1 }],
          ['3', { id: 3, status: 1 }],
        ],
      ]));
  });
});
