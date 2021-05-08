import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { createClient } from './client';

const MOCK_DATA_JOHN = {
  name: 'John',
  address: '323 Southern Avenue',
};
const MOCK_DATA_JANE = {
  name: 'Jane',
  address: '1200 Main Street',
};

describe('createClient()', () => {
  const mock = new MockAdapter(axios);
  const client = createClient({ url: 'https://example.com' });

  beforeEach(() => {
    mock.reset();
  });

  describe('list()', () => {
    it('should handle successful response from the server', () => {
      mock.onGet('https://example.com/foo').reply(200, {
        1: MOCK_DATA_JOHN,
        2: MOCK_DATA_JANE,
      });

      return expect(client.list('foo')).resolves.toEqual({
        1: MOCK_DATA_JOHN,
        2: MOCK_DATA_JANE,
      });
    });

    it('should handle erroneous response from the server', () => {
      mock.onGet('https://example.com/foo').reply(500, {
        error: 'Unable to retrieve items.',
      });

      return expect(client.list('foo')).rejects.toBeInstanceOf(Error);
    });
  });

  describe('get()', () => {
    it('should handle successful response from the server', () => {
      mock.onGet('https://example.com/foo/bar').reply(200, MOCK_DATA_JOHN);

      return expect(client.get('foo', 'bar')).resolves.toEqual(MOCK_DATA_JOHN);
    });

    it('should return undefined if the item does not exist', () => {
      mock.onGet('https://example.com/foo/bar').reply(404, {
        error: 'Item does not exist.',
      });

      return expect(client.get('foo', 'bar')).resolves.toBeUndefined();
    });

    it('should handle erroneous response from the server', () => {
      mock.onGet('https://example.com/foo/bar').reply(500, {
        error: 'Unable to retrieve item.',
      });

      return expect(client.get('foo', 'bar')).rejects.toBeInstanceOf(Error);
    });
  });

  describe('set()', () => {
    it('should handle successful response from the server', () => {
      mock.onPost('https://example.com/foo/bar').reply(201, MOCK_DATA_JOHN);

      return expect(client.set('foo', 'bar', MOCK_DATA_JOHN)).resolves.toEqual(
        MOCK_DATA_JOHN
      );
    });

    it('should handle erroneous response from the server', () => {
      mock.onPost('https://example.com/foo/bar').reply(500, {
        error: 'Unable to store item.',
      });

      return expect(
        client.set('foo', 'bar', MOCK_DATA_JOHN)
      ).rejects.toBeInstanceOf(Error);
    });
  });

  describe('patch()', () => {
    it('should handle successful response from the server', () => {
      mock.onPatch('https://example.com/foo/bar').reply(201, {
        ...MOCK_DATA_JOHN,
        counter: 1,
      });

      return expect(
        client.patch('foo', 'bar', { counter: 1 })
      ).resolves.toEqual({
        ...MOCK_DATA_JOHN,
        counter: 1,
      });
    });

    it('should return undefined if the item does not exist', () => {
      mock.onPatch('https://example.com/foo/bar').reply(404, {
        error: 'Item does not exist.',
      });

      return expect(
        client.patch('foo', 'bar', { counter: 1 })
      ).resolves.toBeUndefined();
    });

    it('should handle erroneous response from the server', () => {
      mock.onPatch('https://example.com/foo/bar').reply(500, {
        error: 'Unable to store item.',
      });

      return expect(
        client.patch('foo', 'bar', MOCK_DATA_JOHN)
      ).rejects.toBeInstanceOf(Error);
    });
  });

  describe('delete()', () => {
    it('should handle successful response from the server', () => {
      mock.onDelete('https://example.com/foo/bar').reply(201, MOCK_DATA_JOHN);

      return expect(client.delete('foo', 'bar')).resolves.toEqual(
        MOCK_DATA_JOHN
      );
    });

    it('should return undefined if the item does not exist', () => {
      mock.onDelete('https://example.com/foo/bar').reply(404, {
        error: 'Item does not exist.',
      });

      return expect(client.delete('foo', 'bar')).resolves.toBeUndefined();
    });

    it('should handle erroneous response from the server', () => {
      mock.onDelete('https://example.com/foo/bar').reply(500, {
        error: 'Unable to delete item.',
      });

      return expect(client.delete('foo', 'bar')).rejects.toBeInstanceOf(Error);
    });
  });
});
