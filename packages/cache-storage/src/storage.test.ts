import { createMemoryStorage } from '@varasto/memory-storage';
import all from 'it-all';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createCacheStorage } from './storage';

const TEN_SECONDS = 10 * 1000;

describe('cache storage', () => {
  const memoryStorage = createMemoryStorage();

  beforeEach(() => {
    memoryStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('keys()', () => {
    it('should cache keys coming from the original storage', async () => {
      const cacheStorage = createCacheStorage(memoryStorage, TEN_SECONDS);

      await memoryStorage.set('foo', 'bar', { value: 5 });

      vi.setSystemTime('2021-10-05T11:00:00.000Z');
      expect(await all(cacheStorage.keys('foo'))).toEqual(['bar']);

      await memoryStorage.delete('foo', 'bar');

      vi.setSystemTime('2021-10-05T11:00:03.000Z');
      expect(await all(cacheStorage.keys('foo'))).toEqual(['bar']);

      vi.setSystemTime('2021-10-05T11:00:10.000Z');
      expect(await all(cacheStorage.keys('foo'))).toEqual([]);
    });
  });

  describe('values()', () => {
    it('should cache values coming from the original storage', async () => {
      const cacheStorage = createCacheStorage(memoryStorage, TEN_SECONDS);

      await memoryStorage.set('foo', 'bar', { value: 5 });

      vi.setSystemTime('2021-10-05T11:00:00.000Z');
      expect(await all(cacheStorage.values('foo'))).toEqual([{ value: 5 }]);

      await memoryStorage.delete('foo', 'bar');

      vi.setSystemTime('2021-10-05T11:00:03.000Z');
      expect(await all(cacheStorage.values('foo'))).toEqual([{ value: 5 }]);

      vi.setSystemTime('2021-10-05T11:00:10.000Z');
      expect(await all(cacheStorage.values('foo'))).toEqual([]);
    });
  });

  describe('entries()', () => {
    it('should cache entries coming from the original store', async () => {
      const cacheStorage = createCacheStorage(memoryStorage, TEN_SECONDS);

      await memoryStorage.set('foo', 'bar', { value: 5 });

      vi.setSystemTime('2021-10-05T11:00:00.000Z');
      expect(await all(cacheStorage.entries('foo'))).toEqual([
        ['bar', { value: 5 }],
      ]);

      await memoryStorage.delete('foo', 'bar');

      vi.setSystemTime('2021-10-05T11:00:03.000Z');
      expect(await all(cacheStorage.entries('foo'))).toEqual([
        ['bar', { value: 5 }],
      ]);

      vi.setSystemTime('2021-10-05T11:00:10.000Z');
      expect(await all(cacheStorage.entries('foo'))).toEqual([]);
    });
  });

  describe('has()', () => {
    it('should use cached entries to determine whether an entry exists or not', async () => {
      const cacheStorage = createCacheStorage(memoryStorage, TEN_SECONDS);

      await memoryStorage.set('foo', 'bar', { value: 5 });

      expect(await cacheStorage.has('foo', 'bar')).toBe(true);

      vi.setSystemTime('2021-10-05T11:00:00.000Z');
      await cacheStorage.get('foo', 'bar');

      await memoryStorage.delete('foo', 'bar');

      expect(await cacheStorage.has('foo', 'bar')).toBe(true);

      vi.setSystemTime('2021-10-05T11:00:10.000Z');
      expect(await cacheStorage.has('foo', 'bar')).toBe(false);
    });
  });

  describe('get()', () => {
    it('should cache entries coming from the original storage', async () => {
      const cacheStorage = createCacheStorage(memoryStorage, TEN_SECONDS);

      await memoryStorage.set('foo', 'bar', { value: 5 });

      vi.setSystemTime('2021-10-05T11:00:00.000Z');
      expect(await cacheStorage.get('foo', 'bar')).toEqual({ value: 5 });

      await memoryStorage.delete('foo', 'bar');

      vi.setSystemTime('2021-10-05T11:00:03.000Z');
      expect(await cacheStorage.get('foo', 'bar')).toEqual({ value: 5 });

      vi.setSystemTime('2021-10-05T11:00:10.000Z');
      expect(await cacheStorage.get('foo', 'bar')).toBeUndefined();
    });
  });

  describe('set()', () => {
    it('should pass the value to the original storage and cache it', async () => {
      const cacheStorage = createCacheStorage(memoryStorage, TEN_SECONDS);

      vi.setSystemTime('2021-10-05T11:00:00.000Z');
      await cacheStorage.set('foo', 'bar', { value: 5 });
      expect(await memoryStorage.get('foo', 'bar')).toEqual({ value: 5 });

      await memoryStorage.delete('foo', 'bar');
      vi.setSystemTime('2021-10-05T11:00:03.000Z');
      expect(await cacheStorage.get('foo', 'bar')).toEqual({ value: 5 });
    });
  });

  describe('update()', () => {
    it('should pass the update to the original storage and cache result', async () => {
      const cacheStorage = createCacheStorage(memoryStorage, TEN_SECONDS);

      await memoryStorage.set('foo', 'bar', { value: 5 });

      vi.setSystemTime('2021-10-05T11:00:00.000Z');
      await cacheStorage.update('foo', 'bar', { anotherValue: 6 });

      expect(await memoryStorage.get('foo', 'bar')).toEqual({
        value: 5,
        anotherValue: 6,
      });

      await memoryStorage.delete('foo', 'bar');

      vi.setSystemTime('2021-10-05T11:00:05.000Z');
      expect(await cacheStorage.get('foo', 'bar')).toEqual({
        value: 5,
        anotherValue: 6,
      });

      vi.setSystemTime('2021-10-05T11:00:10.000Z');
      expect(await cacheStorage.get('foo', 'bar')).toBeUndefined();
    });
  });

  describe('delete()', () => {
    it('should remove the cached entry', async () => {
      const cacheStorage = createCacheStorage(memoryStorage, TEN_SECONDS);

      vi.setSystemTime('2021-10-05T11:00:00.000Z');
      await cacheStorage.set('foo', 'bar', { value: 5 });
      await cacheStorage.delete('foo', 'bar');

      expect(await cacheStorage.has('foo', 'bar')).toBe(false);
    });
  });
});
