import { InvalidSlugError, ItemDoesNotExistError } from '@varasto/storage';
import fs from 'fs';
import mock from 'mock-fs';
import path from 'path';

import { createFileSystemStorage } from './storage';

describe('file system storage', () => {
  const storage = createFileSystemStorage({ dir: 'data' });

  beforeEach(() => {
    mock({
      data: {
        foo: {
          '1.json': '{"a":1}',
          '2.json': '{"a":2}',
          '3.json': '{"a":3}',
        },
      },
    });
  });

  afterEach(mock.restore);

  describe('has()', () => {
    it('should return true if the item exists', () =>
      expect(storage.has('foo', '1')).resolves.toBe(true));

    it('should return false if the item does not exist', () =>
      expect(storage.has('foo', 'non-existent')).resolves.toBe(false));
  });

  describe('keys()', () => {
    it('should return keys of all found items', () =>
      expect(storage.keys('foo')).resolves.toEqual(['1', '2', '3']));

    it('should return empty array if the namespace does not contain items', () =>
      expect(storage.keys('bar')).resolves.toEqual([]));
  });

  describe('values()', () => {
    it('should return values of all found items', () =>
      expect(storage.values('foo')).resolves.toEqual([
        { a: 1 },
        { a: 2 },
        { a: 3 },
      ]));

    it('should return empty array if the namespace does not contain items', () =>
      expect(storage.values('bar')).resolves.toEqual([]));
  });

  describe('entries', () => {
    it('should return keys and values of all found items', () =>
      expect(storage.entries('foo')).resolves.toEqual([
        ['1', { a: 1 }],
        ['2', { a: 2 }],
        ['3', { a: 3 }],
      ]));

    it('should return empty array if the namespace does not contain items', () =>
      expect(storage.entries('bar')).resolves.toEqual([]));
  });

  describe('get()', () => {
    it('should return value of the item if it does exist', () =>
      expect(storage.get('foo', '1')).resolves.toEqual({ a: 1 }));

    it('should return `undefined` if the item does not exist', () =>
      expect(storage.get('foo', '4')).resolves.toBeUndefined());

    it('should fail if given namespace is not valid slug', () =>
      expect(storage.get('f;oo', '1')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should fail if given key is not valid slug', () =>
      expect(storage.get('foo', 'b;ar')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));
  });

  describe('set()', () => {
    it("should create new item if it doesn't exist", async () => {
      await storage.set('foo', '1', { a: 4 });

      expect(
        JSON.parse(
          fs.readFileSync(path.join('data', 'foo', '1.json')).toString()
        )
      ).toEqual({ a: 4 });
    });

    it('should replace existing item if it does exist', async () => {
      await storage.set('foo', '4', { a: 4 });

      expect(
        JSON.parse(
          fs.readFileSync(path.join('data', 'foo', '4.json')).toString()
        )
      ).toEqual({ a: 4 });
    });

    it('should fail if given namespace is not valid slug', () =>
      expect(storage.set('f;oo', 'bar', { a: 1 })).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should fail if given key is not valid slug', () =>
      expect(storage.set('foo', 'b;ar', { a: 1 })).rejects.toBeInstanceOf(
        InvalidSlugError
      ));
  });

  describe('update()', () => {
    it('should update item if it does exist', async () => {
      await storage.update('foo', '1', { b: 1 });

      expect(
        JSON.parse(
          fs.readFileSync(path.join('data', 'foo', '1.json')).toString()
        )
      ).toEqual({ a: 1, b: 1 });
    });

    it('should fail if the item does not exist', () =>
      expect(storage.update('foo', '4', { b: 1 })).rejects.toBeInstanceOf(
        ItemDoesNotExistError
      ));

    it('should fail if given namespace is not valid slug', () =>
      expect(storage.update('f;oo', 'bar', { a: 1 })).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should fail if given key is not valid slug', () =>
      expect(storage.update('foo', 'b;ar', { a: 1 })).rejects.toBeInstanceOf(
        InvalidSlugError
      ));
  });

  describe('delete()', () => {
    it('should return false if the item does not exist', () =>
      expect(storage.delete('foo', '4')).resolves.toBe(false));

    it('should delete the item if it does exist', () =>
      storage.delete('foo', '1').then((result) => {
        expect(result).toBe(true);
        expect(fs.existsSync(path.join('data', 'foo', '1.json'))).toBe(false);
      }));

    it('should fail if given namespace is not valid slug', () =>
      expect(storage.delete('f;oo', 'bar')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should fail if given key is not valid slug', () =>
      expect(storage.delete('foo', 'b;ar')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));
  });
});
