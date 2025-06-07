import { InvalidSlugError, ItemDoesNotExistError } from '@varasto/storage';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import all from 'it-all';
import { beforeEach, describe, expect, it } from 'vitest';

import { createRemoteStorage } from './storage';

const MOCK_DATA_JOHN = {
  name: 'John',
  address: '323 Southern Avenue',
};
const MOCK_DATA_JANE = {
  name: 'Jane',
  address: '1200 Main Street',
};

describe('remote storage', () => {
  const mock = new MockAdapter(axios);
  const storage = createRemoteStorage({ url: 'https://example.com' });

  beforeEach(() => {
    mock.reset();
  });

  describe('has()', () => {
    it('should handle successful response from the server', () => {
      mock.onHead('https://example.com/people/john').reply(200);

      return expect(storage.has('people', 'john')).resolves.toBe(true);
    });

    it('should return false if the item does not exist', () => {
      mock.onHead('https://example.com/people/john').reply(404);

      return expect(storage.has('people', 'john')).resolves.toBe(false);
    });

    it('should handle erroneous response from the server', () => {
      mock.onHead('https://example.com/people/john').reply(500);

      return expect(storage.has('people', 'john')).rejects.toBeInstanceOf(
        Error
      );
    });
  });

  describe('keys()', () => {
    it('should handle successful response from the server', () => {
      mock.onGet('https://example.com/people').reply(200, {
        john: MOCK_DATA_JOHN,
        jane: MOCK_DATA_JANE,
      });

      return expect(all(storage.keys('people'))).resolves.toEqual([
        'john',
        'jane',
      ]);
    });

    it('should handle erroneous response from the server', () => {
      mock
        .onGet('https://example.com/people')
        .reply(500, { error: 'Unable to retrieve items.' });

      return expect(all(storage.keys('people'))).rejects.toBeInstanceOf(Error);
    });
  });

  describe('values()', () => {
    it('should handle successful response from the server', () => {
      mock.onGet('https://example.com/people').reply(200, {
        john: MOCK_DATA_JOHN,
        jane: MOCK_DATA_JANE,
      });

      return expect(all(storage.values('people'))).resolves.toEqual([
        MOCK_DATA_JOHN,
        MOCK_DATA_JANE,
      ]);
    });

    it('should handle erroneous response from the server', () => {
      mock
        .onGet('https://example.com/people')
        .reply(500, { error: 'Unable to retrieve items.' });

      return expect(all(storage.values('people'))).rejects.toBeInstanceOf(
        Error
      );
    });
  });

  describe('entries()', () => {
    it('should handle successful response from the server', () => {
      mock.onGet('https://example.com/people').reply(200, {
        john: MOCK_DATA_JOHN,
        jane: MOCK_DATA_JANE,
      });

      return expect(all(storage.entries('people'))).resolves.toEqual([
        ['john', MOCK_DATA_JOHN],
        ['jane', MOCK_DATA_JANE],
      ]);
    });

    it('should handle erroneous response from the server', () => {
      mock
        .onGet('https://example.com/people')
        .reply(500, { error: 'Unable to retrieve items.' });

      return expect(all(storage.entries('people'))).rejects.toBeInstanceOf(
        Error
      );
    });
  });

  describe('get()', () => {
    it('should handle successful response from the server', () => {
      mock.onGet('https://example.com/people/john').reply(200, MOCK_DATA_JOHN);

      return expect(storage.get('people', 'john')).resolves.toEqual(
        MOCK_DATA_JOHN
      );
    });

    it('should return undefined if the item does not exist', () => {
      mock.onGet('https://example.com/people/john').reply(404);

      return expect(storage.get('people', 'john')).resolves.toBeUndefined();
    });

    it('should handle erroneous response from the server', () => {
      mock
        .onGet('https://example.com/people/john')
        .reply(500, { error: 'Unable to retrieve item.' });

      return expect(storage.get('people', 'john')).rejects.toBeInstanceOf(
        Error
      );
    });
  });

  describe('set()', () => {
    it('should handle successful response from the server', () => {
      mock
        .onPost('https://example.com/people/john')
        .reply(201, MOCK_DATA_JOHN);

      return expect(
        storage.set('people', 'john', MOCK_DATA_JOHN)
      ).resolves.toBeUndefined();
    });

    it('should handle erroneous response from the server', () => {
      mock
        .onPost('https://example.com/people/john')
        .reply(500, { error: 'Unable to store item.' });

      return expect(
        storage.set('people', 'john', MOCK_DATA_JOHN)
      ).rejects.toBeInstanceOf(Error);
    });
  });

  describe('update()', () => {
    it('should handle successful response from the server', () => {
      mock.onPatch('https://example.com/people/john').reply(201, {
        ...MOCK_DATA_JOHN,
        address: '324 Northern Avenue',
      });

      return expect(
        storage.update('people', 'john', { address: '324 Northern Avenue' })
      ).resolves.toEqual({
        ...MOCK_DATA_JOHN,
        address: '324 Northern Avenue',
      });
    });

    it('should handle 400 response from the server', () => {
      mock
        .onPatch('https://example.com/p;eople/john')
        .reply(400, { error: 'Given namespace is not valid slug.' });

      return expect(
        storage.update('p;eople', 'john', { address: '324 Northern Avenue' })
      ).rejects.toBeInstanceOf(InvalidSlugError);
    });

    it('should handle 404 response from the server', () => {
      mock
        .onPatch('https://example.com/people/john')
        .reply(404, { error: 'Item does not exist.' });

      return expect(
        storage.update('people', 'john', { address: '324 Northern Avenue' })
      ).rejects.toBeInstanceOf(ItemDoesNotExistError);
    });

    it('should handle other erroneous response from the server', () => {
      mock
        .onPatch('https://example.com/people/john')
        .reply(500, { error: 'Unable to store item.' });

      return expect(
        storage.update('people', 'john', { address: '324 Northern Avenue' })
      ).rejects.toBeInstanceOf(Error);
    });
  });

  describe('delete()', () => {
    it('should handle successful response from the server', () => {
      mock
        .onDelete('https://example.com/people/john')
        .reply(201, MOCK_DATA_JOHN);

      return expect(storage.delete('people', 'john')).resolves.toBe(true);
    });

    it('should return false if the item does not exist', () => {
      mock.onDelete('https://example.com/people/john').reply(404);

      return expect(storage.delete('people', 'john')).resolves.toBe(false);
    });

    it('should handle erroneous response from the server', () => {
      mock
        .onDelete('https://example.com/people/john')
        .reply(500, { error: 'Unable to remove item.' });

      return expect(storage.delete('people', 'john')).rejects.toBeInstanceOf(
        Error
      );
    });
  });
});
