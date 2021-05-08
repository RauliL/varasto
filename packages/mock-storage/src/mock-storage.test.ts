import { InvalidSlugError } from '@varasto/storage';

import { createMockStorage } from './mock-storage';

describe('mock storage', () => {
  const storage = createMockStorage();

  beforeEach(() => {
    storage.clear();
  });

  describe('has()', () => {
    it('should return false if item does not exist', () => {
      expect(storage.has('foo', 'bar')).toBe(false);
    });

    it('should return true if item does exist', async () => {
      await storage.set('foo', 'bar', { foo: 'bar' });
      expect(storage.has('foo', 'bar')).toBe(true);
    });
  });

  describe('get()', () => {
    it('should be able to retrieve items', async () => {
      expect(await storage.get('foo', 'bar')).toBeUndefined();
      await storage.set('foo', 'bar', { test: true });
      expect(await storage.get('foo', 'bar')).toEqual({ test: true });
    });

    it('should fail if namespace is not valid slug', () =>
      expect(storage.get('f;o;o', 'bar')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should fail if key is not valid slug', () =>
      expect(storage.get('foo', 'b;a;r')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));
  });

  describe('set()', () => {
    it('should be able to store items', async () => {
      expect(storage.has('foo', 'bar')).toBe(false);
      await storage.set('foo', 'bar', { test: true });
      expect(storage.has('foo', 'bar')).toBe(true);
    });

    it('should fail if namespace is not valid slug', () =>
      expect(
        storage.set('f;o;o', 'bar', { foo: 'bar' })
      ).rejects.toBeInstanceOf(InvalidSlugError));

    it('should fail if key is not valid slug', () =>
      expect(
        storage.set('foo', 'b;a;r', { foo: 'bar' })
      ).rejects.toBeInstanceOf(InvalidSlugError));
  });

  describe('delete()', () => {
    it('should be able to remove items', async () => {
      expect(await storage.delete('foo', 'bar')).toBe(false);
      await storage.set('foo', 'bar', { test: true });
      expect(await storage.delete('foo', 'bar')).toBe(true);
      expect(storage.has('foo', 'bar')).toBe(false);
    });

    it('should fail if namespace is not valid slug', () =>
      expect(storage.delete('f;o;o', 'bar')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should fail if key is not valid slug', () =>
      expect(storage.delete('foo', 'b;a;r')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));
  });

  describe('clear()', () => {
    it('should be able to clear all data', async () => {
      await storage.set('ns1', 'key', { foo: 'bar' });
      await storage.set('ns2', 'key', { foo: 'bar' });
      storage.clear();
      expect(storage.has('ns1', 'key')).toBe(false);
      expect(storage.has('ns2', 'key')).toBe(false);
    });
  });

  describe('keys()', () => {
    it('should be able to list keys', async () => {
      await storage.set('foo', 'bar', { a: 1 });
      await storage.set('foo', 'baz', { b: 2 });

      const result = await storage.keys('foo');

      expect(result).toHaveLength(2);
      expect(result).toContain('bar');
      expect(result).toContain('baz');

      expect(await storage.keys('bar')).toHaveLength(0);
    });

    it('should fail if namespace is not valid slug', () =>
      expect(storage.keys('f;o;o')).rejects.toBeInstanceOf(InvalidSlugError));
  });

  describe('values()', () => {
    it('should be able to list values', async () => {
      await storage.set('foo', 'bar', { a: 1 });
      await storage.set('foo', 'baz', { b: 2 });

      const result = await storage.values('foo');

      expect(result).toHaveLength(2);
      expect(result).toContainEqual({ a: 1 });
      expect(result).toContainEqual({ b: 2 });

      expect(await storage.values('bar')).toHaveLength(0);
    });

    it('should fail if namespace is not valid slug', () =>
      expect(storage.values('f;o;o')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));
  });

  describe('entries()', () => {
    it('should be able to list entries', async () => {
      await storage.set('foo', 'bar', { a: 1 });
      await storage.set('foo', 'baz', { b: 2 });

      const result = await storage.entries('foo');

      expect(result).toHaveLength(2);
      expect(result).toContainEqual(['bar', { a: 1 }]);
      expect(result).toContainEqual(['baz', { b: 2 }]);

      expect(await storage.entries('bar')).toHaveLength(0);
    });

    it('should fail if namespace is not valid slug', () =>
      expect(storage.entries('f;o;o')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));
  });
});
