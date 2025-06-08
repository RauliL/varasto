import { createMemoryStorage } from '@varasto/memory-storage';
import { describe, expect, it } from 'vitest';

import { deleteAll } from './delete-all';

describe('deleteAll()', () => {
  it('should delete all entries that match the given schema', async () => {
    const storage = createMemoryStorage();

    await storage.set('items', '1', { id: 1, status: 0 });
    await storage.set('items', '2', { id: 2, status: 1 });
    await storage.set('items', '3', { id: 3, status: 1 });
    await storage.set('items', '4', { id: 4, status: 0 });

    return deleteAll(storage, 'items', { status: 0 }).then(async (result) => {
      expect(result).toEqual(2);
      expect(await storage.has('items', '1')).toBe(false);
      expect(await storage.has('items', '2')).toBe(true);
      expect(await storage.has('items', '3')).toBe(true);
      expect(await storage.has('items', '4')).toBe(false);
    });
  });
});
