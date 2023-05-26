import { createMemoryStorage } from '@varasto/memory-storage';

import { updateAll, updateAllEntries } from './update-all';

describe('update all utilities', () => {
  const storage = createMemoryStorage();

  beforeEach(async () => {
    storage.clear();
    await storage.set('items', '1', { id: 1, status: 0 });
    await storage.set('items', '2', { id: 2, status: 1 });
    await storage.set('items', '3', { id: 3, status: 1 });
    await storage.set('items', '4', { id: 4, status: 0 });
  });

  describe('updateAllEntries()', () => {
    it('should perform an update to all entries that match the given schema', () =>
      updateAll(storage, 'items', { status: 0 }, { status: 2 }).then(
        async (result) => {
          expect(result).toHaveLength(2);
          expect(result).toHaveProperty([0, 'status'], 2);
          expect(result).toHaveProperty([1, 'status'], 2);
          expect(await storage.get('items', '1')).toHaveProperty('status', 2);
          expect(await storage.get('items', '2')).toHaveProperty('status', 1);
          expect(await storage.get('items', '3')).toHaveProperty('status', 1);
          expect(await storage.get('items', '4')).toHaveProperty('status', 2);
        }
      ));
  });

  describe('updateAllEntries()', () => {
    it('should perform an update to all entries that match the given schema', () =>
      updateAllEntries(storage, 'items', { status: 0 }, { status: 2 }).then(
        async (result) => {
          expect(result).toHaveLength(2);
          expect(result).toHaveProperty([0, 1, 'status'], 2);
          expect(result).toHaveProperty([1, 1, 'status'], 2);
          expect(await storage.get('items', '1')).toHaveProperty('status', 2);
          expect(await storage.get('items', '2')).toHaveProperty('status', 1);
          expect(await storage.get('items', '3')).toHaveProperty('status', 1);
          expect(await storage.get('items', '4')).toHaveProperty('status', 2);
        }
      ));
  });
});
