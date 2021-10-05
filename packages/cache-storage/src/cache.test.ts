import MockDate from 'mockdate';

import { Cache } from './cache';

describe('class Cache', () => {
  afterAll(() => MockDate.reset());

  describe('get()', () => {
    it('should always return entries without expiration timestamp', () => {
      const cache = new Cache<string>(undefined);

      MockDate.set('2021-10-05T11:00:00.000Z');
      cache.set('foo', 'bar');

      expect(cache.get('foo')).toEqual('bar');
    });

    it('should return non-expired entry', () => {
      const cache = new Cache<string>(10 * 1000);

      MockDate.set('2021-10-05T11:00:00.000Z');
      cache.set('foo', 'bar');

      MockDate.set('2021-10-05T11:00:05.000Z');
      expect(cache.get('foo')).toEqual('bar');
    });

    it('should not return expired entry', () => {
      const cache = new Cache<string>(10 * 1000);

      MockDate.set('2021-10-05T11:00:00.000Z');
      cache.set('foo', 'bar');

      MockDate.set('2021-10-05T11:00:15.000Z');
      expect(cache.get('foo')).toBeUndefined();
    });
  });

  describe('set()', () => {
    it('should set expiry date to entry when TTL is given', () => {
      const cache = new Cache<string>(10 * 1000);

      MockDate.set('2021-10-05T11:00:00.000Z');
      cache.set('foo', 'bar');

      expect(Reflect.get(cache, 'storage').get('foo')).toHaveProperty(
        'expires',
        1633431610000
      );
    });

    it('should not set expiry date to entry when TTL is omitted', () => {
      const cache = new Cache<string>(undefined);

      MockDate.set('2021-10-05T11:00:00.000Z');
      cache.set('foo', 'bar');

      expect(Reflect.get(cache, 'storage').get('foo')).toHaveProperty(
        'expires',
        undefined
      );
    });
  });

  describe('delete()', () => {
    it('should delete an entry from the cache', () => {
      const cache = new Cache<string>(undefined);

      cache.set('foo', 'bar');
      expect(cache.get('foo')).toEqual('bar');

      cache.delete('foo');
      expect(cache.get('foo')).toBeUndefined();
    });
  });
});
