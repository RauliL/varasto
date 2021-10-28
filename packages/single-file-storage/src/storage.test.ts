import { InvalidSlugError, ItemDoesNotExistError } from '@varasto/storage';
import fs from 'fs';
import mock from 'mock-fs';

import { createSingleFileStorage } from './storage';

describe('single file storage', () => {
  const storage = createSingleFileStorage();

  beforeEach(() => {
    mock();
  });

  afterEach(mock.restore);

  describe('has()', () => {
    it('should return `true` when the item exists', () => {
      mock({ 'data.json': JSON.stringify({ foo: { bar: { id: 1 } } }) });

      return expect(storage.has('foo', 'bar')).resolves.toBe(true);
    });

    it('should return `false` when the item does not exist', () => {
      mock({
        'data.json': JSON.stringify({ foo: {} }),
      });

      return expect(storage.has('foo', 'bar')).resolves.toBe(false);
    });

    it('should return `false` if the file does not exist', () =>
      expect(storage.has('foo', 'bar')).resolves.toBe(false));

    it('should fail if the file cannot be read', () => {
      mock({ 'data.json': mock.file({ mode: 0 }) });

      return expect(storage.has('foo', 'bar')).rejects.toBeInstanceOf(Error);
    });

    it('should return `false` if the file does not contain JSON object', () => {
      mock({ 'data.json': '"foo"' });

      return expect(storage.has('foo', 'bar')).resolves.toBe(false);
    });

    it('should fail if deserialization of the file fails', () => {
      mock({ 'data.json': 'foo' });

      return expect(storage.has('foo', 'bar')).rejects.toBeInstanceOf(
        SyntaxError
      );
    });

    it('should fail if the given namespace is not valid slug', () =>
      expect(storage.has('f;oo', 'bar')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should fail if the given key is not valid slug', () =>
      expect(storage.has('foo', 'b;ar')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));
  });

  describe('keys()', () => {
    it('should return keys of items stored under the namespace', () => {
      mock({
        'data.json': JSON.stringify({ foo: { 1: { id: 1 }, 2: { id: 2 } } }),
      });

      return expect(storage.keys('foo')).resolves.toEqual(['1', '2']);
    });

    it('should return empty array if the namespace does not exist', () => {
      mock({ 'data.json': JSON.stringify({}) });

      return expect(storage.keys('foo')).resolves.toHaveLength(0);
    });

    it('should return empty array if the file does not exist', () =>
      expect(storage.keys('foo')).resolves.toHaveLength(0));
  });

  describe('values()', () => {
    it('should return values of items stored under the namespace', () => {
      mock({
        'data.json': JSON.stringify({ foo: { 1: { id: 1 }, 2: { id: 2 } } }),
      });

      return expect(storage.values('foo')).resolves.toEqual([
        { id: 1 },
        { id: 2 },
      ]);
    });

    it('should return empty array if the namespace does not exist', () => {
      mock({ 'data.json': JSON.stringify({}) });

      return expect(storage.values('foo')).resolves.toHaveLength(0);
    });

    it('should return empty array if the file does not exist', () =>
      expect(storage.values('foo')).resolves.toHaveLength(0));
  });

  describe('entries()', () => {
    it('should return keys and values of items stored under the namespace', () => {
      mock({
        'data.json': JSON.stringify({ foo: { 1: { id: 1 }, 2: { id: 2 } } }),
      });

      return expect(storage.entries('foo')).resolves.toEqual([
        ['1', { id: 1 }],
        ['2', { id: 2 }],
      ]);
    });

    it('should return empty array if the namespace does not exist', () => {
      mock({ 'data.json': JSON.stringify({}) });

      return expect(storage.entries('foo')).resolves.toHaveLength(0);
    });

    it('should return empty array if the file does not exist', () =>
      expect(storage.entries('foo')).resolves.toHaveLength(0));
  });

  describe('get()', () => {
    it('should fail if given namespace is not valid slug', () =>
      expect(storage.get('f;oo', 'bar')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should fail if given key is not valid slug', () =>
      expect(storage.get('foo', 'b;ar')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should return value of the item if it exists', () => {
      mock({ 'data.json': JSON.stringify({ foo: { bar: { id: 1 } } }) });

      return expect(storage.get('foo', 'bar')).resolves.toEqual({ id: 1 });
    });

    it('should return `undefined` if the item does not exist', () => {
      mock({ 'data.json': JSON.stringify({ foo: {} }) });

      return expect(storage.get('foo', 'bar')).resolves.toBeUndefined();
    });

    it('should return `undefined` if the file does not exist', () =>
      expect(storage.get('foo', 'bar')).resolves.toBeUndefined());
  });

  describe('set()', () => {
    it('should fail if given namespace is not valid slug', () =>
      expect(storage.set('f;oo', 'bar', { id: 1 })).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should fail if given key is not valid slug', () =>
      expect(storage.set('foo', 'b;ar', { id: 1 })).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should serialize the item to an file', () =>
      storage.set('foo', 'bar', { id: 1 }).then(() => {
        expect(JSON.parse(fs.readFileSync('data.json').toString())).toEqual({
          foo: { bar: { id: 1 } },
        });
      }));

    it('should fail if an I/O error occurs', () => {
      mock({ 'data.json': mock.file({ mode: 0 }) });

      return expect(
        storage.set('foo', 'bar', { id: 1 })
      ).rejects.toBeInstanceOf(Error);
    });

    it('should fail if serialization of the data fails', () =>
      expect(
        createSingleFileStorage({
          serialize() {
            throw new Error('Failure.');
          },
        }).set('foo', 'bar', { id: 1 })
      ).rejects.toBeInstanceOf(Error));
  });

  describe('update()', () => {
    it('should fail if given namespace is not valid slug', () =>
      expect(
        storage.update('f;oo', 'bar', { counter: 2 })
      ).rejects.toBeInstanceOf(InvalidSlugError));

    it('should fail if given key is not valid slug', () =>
      expect(
        storage.update('foo', 'b;ar', { counter: 2 })
      ).rejects.toBeInstanceOf(InvalidSlugError));

    it('should fail if the item does not exist', () =>
      expect(
        storage.update('foo', 'bar', { counter: 2 })
      ).rejects.toBeInstanceOf(ItemDoesNotExistError));

    it('should serialize the updated item to an file', () => {
      mock({
        'data.json': JSON.stringify({ foo: { bar: { id: 1, counter: 1 } } }),
      });

      return storage.update('foo', 'bar', { counter: 2 }).then((result) => {
        expect(result).toEqual({ id: 1, counter: 2 });
        expect(JSON.parse(fs.readFileSync('data.json').toString())).toEqual({
          foo: {
            bar: {
              id: 1,
              counter: 2,
            },
          },
        });
      });
    });
  });

  describe('delete()', () => {
    it('should fail if given namespace is not valid slug', () =>
      expect(storage.delete('f;oo', 'bar')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should fail if given key is not valid slug', () =>
      expect(storage.delete('foo', 'b;ar')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should remove the item from the file, if it exists', () => {
      mock({
        'data.json': JSON.stringify({
          foo: { bar: { id: 1 } },
        }),
      });

      return storage.delete('foo', 'bar').then((result) => {
        expect(result).toBe(true);
        expect(JSON.parse(fs.readFileSync('data.json').toString())).toEqual({
          foo: {},
        });
      });
    });

    it('should return `false` if the item does not exist', () =>
      expect(storage.delete('foo', 'bar')).resolves.toBe(false));
  });
});
