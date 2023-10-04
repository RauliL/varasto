import { InvalidSlugError, ItemDoesNotExistError } from '@varasto/storage';
import fs from 'fs';
import mock from 'mock-fs';
import all from 'it-all';
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
        unwriteable: mock.directory({
          items: {
            '1.json': mock.file({
              content: '{"a":1}',
              mode: 555,
            }),
          },
          mode: 555,
        }),
      },
    });
  });

  afterEach(mock.restore);

  describe('has()', () => {
    it('should return true if the item exists', () =>
      expect(storage.has('foo', '1')).resolves.toBe(true));

    it('should return false if the item does not exist', () =>
      expect(storage.has('foo', 'non-existent')).resolves.toBe(false));

    it('should return false if given namespace is not valid slug', () =>
      expect(storage.has('f;o;o', 'bar')).resolves.toBe(false));

    it('should return false if given key is not valid slug', () =>
      expect(storage.has('foo', 'b;a;r')).resolves.toBe(false));
  });

  describe('keys()', () => {
    it('should return keys of all found items', () =>
      all(storage.keys('foo')).then((result) => {
        expect(result).toHaveLength(3);
        expect(result).toContainEqual('1');
        expect(result).toContainEqual('2');
        expect(result).toContainEqual('3');
      }));

    it('should return empty array if the namespace does not contain items', () =>
      expect(all(storage.keys('bar'))).resolves.toEqual([]));
  });

  describe('values()', () => {
    it('should return values of all found items', () =>
      all(storage.values('foo')).then((result) => {
        expect(result).toHaveLength(3);
        expect(result).toContainEqual({ a: 1 });
        expect(result).toContainEqual({ a: 2 });
        expect(result).toContainEqual({ a: 3 });
      }));

    it('should return empty array if the namespace does not contain items', () =>
      expect(all(storage.values('bar'))).resolves.toEqual([]));
  });

  describe('entries', () => {
    it('should return keys and values of all found items', () =>
      all(storage.entries('foo')).then((result) => {
        expect(result).toHaveLength(3);
        expect(result).toContainEqual(['1', { a: 1 }]);
        expect(result).toContainEqual(['2', { a: 2 }]);
        expect(result).toContainEqual(['3', { a: 3 }]);
      }));

    it('should return empty array if the namespace does not contain items', () =>
      expect(all(storage.entries('bar'))).resolves.toEqual([]));
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

    it('should fail if an I/O error occurs', () =>
      expect(storage.set('unwriteable', '1', { a: 1 })).rejects.toBeInstanceOf(
        Error
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

    it('should fail if an I/O error occurs', () =>
      expect(
        storage.update('unwriteable', '1', { a: 2 })
      ).rejects.toBeInstanceOf(Error));
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

    it('should fail if an I/O error occurs', () =>
      expect(storage.delete('unwriteable', '1')).rejects.toBeInstanceOf(
        Error
      ));
  });
});
