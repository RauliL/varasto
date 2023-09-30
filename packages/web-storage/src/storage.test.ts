import { InvalidSlugError, ItemDoesNotExistError } from '@varasto/storage';
import all from 'it-all';
import { mockStorage } from 'mock-storage';

import { createWebStorage } from './storage';

const createMockWebStorage = (initialData?: [string, string][]) =>
  createWebStorage(
    mockStorage(initialData ? new Map(initialData) : undefined)
  );

describe('web storage', () => {
  describe('has()', () => {
    it('should return true if item exists in the Web storage', () =>
      expect(
        createMockWebStorage([['foo:bar', '{"id":1}']]).has('foo', 'bar')
      ).resolves.toBe(true));

    it('should return false if item does not exist in the Web storage', () =>
      expect(createMockWebStorage().has('foo', 'bar')).resolves.toBe(false));

    it('should fail if namespace is not valid slug', () =>
      expect(createMockWebStorage().has('f;oo', 'bar')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should fail if key is not valid slug', () =>
      expect(createMockWebStorage().has('foo', 'b;ar')).rejects.toBeInstanceOf(
        InvalidSlugError
      ));
  });

  describe('keys()', () => {
    it('should return keys stored in the Web storage', () =>
      expect(
        all(
          createMockWebStorage([['foo:[[keys]]', '["1","2","3"]']]).keys('foo')
        )
      ).resolves.toEqual(['1', '2', '3']));

    it('should fail if namespace is not valid slug', () =>
      expect(all(createMockWebStorage().keys('f;oo'))).rejects.toBeInstanceOf(
        InvalidSlugError
      ));

    it('should fail if keys cannot be parsed as JSON', () =>
      expect(
        all(createMockWebStorage([['foo:[[keys]]', '["1"']]).keys('foo'))
      ).rejects.toBeInstanceOf(SyntaxError));

    it("should return empty array if keys aren't stored as an array", () =>
      expect(
        all(
          createMockWebStorage([['foo:[[keys]]', '{"foo":"bar"}']]).keys('foo')
        )
      ).resolves.toHaveLength(0));

    it("should return empty array if keys haven't been stored into Web storage", () =>
      expect(all(createMockWebStorage().keys('foo'))).resolves.toHaveLength(
        0
      ));
  });

  describe('values()', () => {
    it('should return values stored in the Web storage', () =>
      expect(
        all(
          createMockWebStorage([
            ['foo:[[keys]]', '["1","2","3"]'],
            ['foo:1', '{"id":1}'],
            ['foo:2', '{"id":2}'],
            ['foo:3', '{"id":3}'],
          ]).values('foo')
        )
      ).resolves.toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]));

    it('should ignore non-existing items', () =>
      expect(
        all(
          createMockWebStorage([
            ['foo:[[keys]]', '["1","2","3"]'],
            ['foo:1', '{"id":1}'],
            ['foo:3', '{"id":3}'],
          ]).values('foo')
        )
      ).resolves.toEqual([{ id: 1 }, { id: 3 }]));
  });

  describe('entries()', () => {
    it('should return entries stored in the Web storage', () =>
      expect(
        all(
          createMockWebStorage([
            ['foo:[[keys]]', '["1","2","3"]'],
            ['foo:1', '{"id":1}'],
            ['foo:2', '{"id":2}'],
            ['foo:3', '{"id":3}'],
          ]).entries('foo')
        )
      ).resolves.toEqual([
        ['1', { id: 1 }],
        ['2', { id: 2 }],
        ['3', { id: 3 }],
      ]));

    it('should ignore non-existing items', () =>
      expect(
        all(
          createMockWebStorage([
            ['foo:[[keys]]', '["1","2","3"]'],
            ['foo:1', '{"id":1}'],
            ['foo:3', '{"id":3}'],
          ]).entries('foo')
        )
      ).resolves.toEqual([
        ['1', { id: 1 }],
        ['3', { id: 3 }],
      ]));
  });

  describe('get()', () => {
    it('should return item stored in the Web storage', () =>
      expect(
        createMockWebStorage([['foo:1', '{"id":1}']]).get('foo', '1')
      ).resolves.toEqual({
        id: 1,
      }));

    it('should return `undefined` if item does not exist in the Web storage', () =>
      expect(createMockWebStorage().get('foo', '1')).resolves.toBeUndefined());

    it('should fail if item cannot be parsed as JSON', () =>
      expect(
        createMockWebStorage([['foo:1', '{"id:1']]).get('foo', '1')
      ).rejects.toBeInstanceOf(SyntaxError));

    it('should return `undefined` if item is `null`', () =>
      expect(
        createMockWebStorage([['foo:1', 'null']]).get('foo', '1')
      ).resolves.toBeUndefined());

    it('should return `undefined` if item is not object', () =>
      expect(
        createMockWebStorage([['foo:1', '1']]).get('foo', '1')
      ).resolves.toBeUndefined());

    it('should allow use of custom deserializer', async () => {
      const webStorage = mockStorage();
      const storage = createWebStorage(webStorage, {
        deserialize: () => ({
          test: 'test',
        }),
      });

      webStorage.setItem('foo:1', '{"id":1}');

      expect(await storage.get('foo', '1')).toEqual({ test: 'test' });
    });
  });

  describe('set()', () => {
    it('should store item into the Web storage', async () => {
      const webStorage = mockStorage();
      const storage = createWebStorage(webStorage);

      await storage.set('foo', '1', { id: 1 });
      await storage.set('foo', '2', { id: 2 });

      expect(webStorage.getItem('foo:1')).toEqual('{"id":1}');
      expect(webStorage.getItem('foo:2')).toEqual('{"id":2}');
      expect(webStorage.getItem('foo:[[keys]]')).toEqual('["1","2"]');
    });

    it('should not store key of an item twice', async () => {
      const webStorage = mockStorage();
      const storage = createWebStorage(webStorage);

      await storage.set('foo', '1', { counter: 0 });
      await storage.set('foo', '1', { counter: 1 });

      expect(webStorage.getItem('foo:[[keys]]')).toEqual('["1"]');
    });

    it('should allow use of custom serializer', async () => {
      const webStorage = mockStorage();
      const storage = createWebStorage(webStorage, {
        serialize: () => 'test',
      });

      await storage.set('foo', '1', { id: 1 });

      expect(webStorage.getItem('foo:1')).toEqual('test');
    });

    it('should fail if the custom serializer throws exception', async () => {
      const webStorage = mockStorage();
      const storage = createWebStorage(webStorage, {
        serialize: () => {
          throw new Error('fail');
        },
      });

      return expect(storage.set('foo', '1', { id: 1 })).rejects.toBeInstanceOf(
        Error
      );
    });
  });

  describe('update()', () => {
    it('should update item stored in Web storage', () =>
      expect(
        createMockWebStorage([['foo:1', '{"id":1,"counter":0}']]).update(
          'foo',
          '1',
          { counter: 1 }
        )
      ).resolves.toEqual({ id: 1, counter: 1 }));

    it('should fail if the item does not exist in the Web storage', () =>
      expect(
        createMockWebStorage().update('foo', '1', { counter: 1 })
      ).rejects.toBeInstanceOf(ItemDoesNotExistError));
  });

  describe('delete()', () => {
    it('should return `true` if item exists in the Web storage', async () => {
      const webStorage = mockStorage(
        new Map([
          ['foo:[[keys]]', '["1","2"]'],
          ['foo:1', '{"id":1}'],
          ['foo:2', '{"id":2}'],
        ])
      );
      const storage = createWebStorage(webStorage);

      expect(await storage.delete('foo', '1')).toBe(true);
      expect(webStorage.getItem('foo:1')).toBeNull();
      expect(webStorage.getItem('foo:[[keys]]')).toEqual('["2"]');
    });

    it('should return `false` if item does not exist in the Web storage', () =>
      expect(createMockWebStorage().delete('foo', '1')).resolves.toBe(false));
  });
});
