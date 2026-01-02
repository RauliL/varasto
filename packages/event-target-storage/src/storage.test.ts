import { createMemoryStorage } from '@varasto/memory-storage';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OperationPreventedError } from './errors';
import { createEventTargetStorage } from './storage';
import { StorageEventType } from './events';

describe('event target storage', () => {
  const backendStorage = createMemoryStorage();
  const createStorage = () => createEventTargetStorage(backendStorage);

  beforeEach(() => backendStorage.clear());

  describe('delete()', () => {
    it('should dispatch pre-delete event', async () => {
      const storage = createStorage();
      const callback = vi.fn();

      storage.addEventListener('pre-delete', callback);

      await storage.delete('foo', 'bar');

      expect(callback).toBeCalled();
      expect(callback.mock.calls[0][0]).toMatchObject({
        type: 'pre-delete',
        namespace: 'foo',
        key: 'bar',
      });
    });

    it('should dispatch post-delete event', async () => {
      const storage = createStorage();
      const callback = vi.fn();

      storage.addEventListener('post-delete', callback);

      await storage.set('foo', 'bar', { value: 1 });
      await storage.delete('foo', 'bar');

      expect(callback).toBeCalled();
      expect(callback.mock.calls[0][0]).toMatchObject({
        type: 'post-delete',
        namespace: 'foo',
        key: 'bar',
        result: true,
      });
      expect(await storage.has('foo', 'bar')).toBe(false);
    });

    it('should reject the promise if pre-delete event was prevented', async () => {
      const storage = createStorage();

      storage.addEventListener('pre-delete', (event) => {
        event.preventDefault();
      });

      await storage.set('foo', 'bar', { value: 1 });

      return expect(storage.delete('foo', 'bar')).rejects.toBeInstanceOf(
        OperationPreventedError
      );
    });
  });

  describe('set()', () => {
    it.each(['pre-set' as StorageEventType, 'post-set' as StorageEventType])(
      'should dispatch pre-set and post-set events',
      async (type) => {
        const storage = createStorage();
        const callback = vi.fn();

        storage.addEventListener(type, callback);
        await storage.set('foo', 'bar', { value: 1 });

        expect(callback).toBeCalled();
        expect(callback.mock.calls[0][0]).toMatchObject({
          type,
          namespace: 'foo',
          key: 'bar',
          value: { value: 1 },
        });
        expect(await storage.has('foo', 'bar')).toBe(true);
      }
    );

    it('should reject the promise if pre-set event was prevented', () => {
      const storage = createStorage();

      storage.addEventListener('pre-set', (event) => {
        event.preventDefault();
      });

      return expect(
        storage.set('foo', 'bar', { value: 1 })
      ).rejects.toBeInstanceOf(OperationPreventedError);
    });
  });

  describe('update()', () => {
    it('should dispatch pre-update event', async () => {
      const storage = createStorage();
      const callback = vi.fn();

      storage.addEventListener('pre-update', callback);
      await storage.set('foo', 'bar', { value: 1 });

      await storage.update('foo', 'bar', { value: 2 });

      expect(callback).toBeCalled();
      expect(callback.mock.calls[0][0]).toMatchObject({
        type: 'pre-update',
        namespace: 'foo',
        key: 'bar',
        value: { value: 2 },
      });
    });

    it('should dispatch post-update event', async () => {
      const storage = createStorage();
      const callback = vi.fn();

      storage.addEventListener('post-update', callback);
      await storage.set('foo', 'bar', { value: 1 });

      await storage.update('foo', 'bar', { value: 2 });

      expect(callback).toBeCalled();
      expect(callback.mock.calls[0][0]).toMatchObject({
        type: 'post-update',
        namespace: 'foo',
        key: 'bar',
        value: { value: 2 },
        result: { value: 2 },
      });
    });

    it('should reject the promise if pre-update event was prevented', async () => {
      const storage = createStorage();

      storage.addEventListener('pre-update', (event) => {
        event.preventDefault();
      });
      await storage.set('foo', 'bar', { value: 1 });

      return expect(
        storage.update('foo', 'bar', { value: 2 })
      ).rejects.toBeInstanceOf(OperationPreventedError);
    });
  });
});
