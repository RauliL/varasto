import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import mockFileSystem from 'mock-fs';

import { connect } from './index';

describe('connect()', () => {
  describe('http(s)://', () => {
    const mock = new MockAdapter(axios);

    beforeEach(() => {
      mock.reset();
    });

    it('should return a remote storage', async () => {
      mock.onGet('https://example.com/foo/bar').reply(200, { baz: 1 });

      const storage = await connect('https://example.com');

      expect(await storage.get('foo', 'bar')).toEqual({ baz: 1 });
    });

    it('should also support non-encrypted connections', async () => {
      mock.onGet('http://example.com/foo/bar').reply(200, { baz: 1 });

      const storage = await connect('http://example.com');

      expect(await storage.get('foo', 'bar')).toEqual({ baz: 1 });
    });
  });

  describe('file://', () => {
    beforeEach(() => {
      mockFileSystem({
        data: {
          foo: {
            'bar.json': '{baz: 1}',
          },
        },
      });
    });

    it('should return a file storage', async () => {
      const storage = await connect('file:///data');

      expect(await storage.get('foo', 'bar')).toEqual({ baz: 1 });
    });
  });

  describe('memory://', () => {
    it('should return a memory storage', async () => {
      const storage = await connect('memory://');

      await storage.set('foo', 'bar', { baz: 1 });
      expect(await storage.get('foo', 'bar')).toEqual({ baz: 1 });
    });
  });

  it('should fail if URL is invalid', () =>
    expect(connect('invalid')).rejects.toThrow(/invalid/i));

  it('should fail if protocol is not supported', () =>
    expect(connect('ftp://localhost')).rejects.toThrow(/unsupported/i));
});
