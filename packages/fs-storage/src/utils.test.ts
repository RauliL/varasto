import { InvalidSlugError } from '@varasto/storage';
import fs from 'fs';
import mock from 'mock-fs';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  buildFilename,
  createNamespace,
  globNamespace,
  readItem,
} from './utils';

describe('createNamespace()', () => {
  beforeEach(() => {
    mock({ data: {} });
  });

  afterEach(mock.restore);

  it('should fail if given namespace is not valid slug', () =>
    expect(createNamespace('data', 'f;oo')).rejects.toBeInstanceOf(
      InvalidSlugError
    ));

  it('should succeed if the directory already exists', () =>
    expect(createNamespace('data', 'foo')).resolves.toBeUndefined());

  it("should create the directory if it doesn't exist", async () => {
    await createNamespace('data', 'foo');

    expect(fs.statSync(path.join('data', 'foo')).isDirectory()).toBe(true);
  });

  it('should fail if the directory cannot be created', () => {
    mock({ data: mock.directory({ mode: 0 }) });

    return expect(createNamespace('data', 'foo')).rejects.toBeInstanceOf(
      Error
    );
  });
});

describe('buildFilename()', () => {
  it.each([[''], ['foo;bar'], ['/etc/passwd']])(
    'should throw exception if given namespace is invalid',
    (namespace) => {
      expect(() => buildFilename('./data', namespace, 'foo')).toThrowError(
        InvalidSlugError
      );
    }
  );

  it.each([[''], ['foo;bar'], ['/etc/passwd']])(
    'should throw exception if given key is invalid',
    (key) => {
      expect(() => buildFilename('./data', 'foo', key)).toThrowError(
        InvalidSlugError
      );
    }
  );

  it('should return an filename if namespace and key are valid', () => {
    expect(buildFilename('./data', 'foo', 'bar')).toEqual('data/foo/bar.json');
  });
});

describe('globNamespace()', () => {
  beforeEach(() => {
    mock({
      data: {
        foo: {
          '1.json': '{"a":1}',
          '2.json': '{"a":2}',
          '3.txt': '',
        },
      },
    });
  });

  afterEach(mock.restore);

  it('should fail if given namespace is not valid slug', () =>
    expect(globNamespace('data', 'f;oo')).rejects.toBeInstanceOf(
      InvalidSlugError
    ));

  it('should return filenames of all ".json" files from the directory', () =>
    globNamespace('data', 'foo').then((matches) => {
      expect(matches).toHaveLength(2);
      expect(matches).toContain(path.join('data', 'foo', '1.json'));
      expect(matches).toContain(path.join('data', 'foo', '2.json'));
    }));

  it('should return empty array if the directory does not exist', () =>
    expect(globNamespace('data', 'bar')).resolves.toHaveLength(0));
});

describe('readItem()', () => {
  beforeEach(() => {
    mock({
      data: {
        foo: {
          '1.json': '{"a":1}',
          '2.json': '"foo"',
          '3.json': mock.file({ mode: 0 }),
        },
      },
    });
  });

  afterEach(mock.restore);

  it('should return `undefined` if the file does not exist', () =>
    expect(
      readItem(path.join('data', 'foo', '4.json'), 'utf-8', JSON.parse)
    ).resolves.toBeUndefined());

  it('should fail if the file cannot be read', () =>
    expect(
      readItem(path.join('data', 'foo', '3.json'), 'utf-8', JSON.parse)
    ).rejects.toBeInstanceOf(Error));

  it('should return deserialized object if the file exists', () =>
    expect(
      readItem(path.join('data', 'foo', '1.json'), 'utf-8', JSON.parse)
    ).resolves.toEqual({ a: 1 }));

  it('should return `undefined` if the JSON file does not have an object', () =>
    expect(
      readItem(path.join('data', 'foo', '2.json'), 'utf-8', JSON.parse)
    ).resolves.toBeUndefined());

  it('should fail if the deserializer function throws an exception', () =>
    expect(
      readItem(path.join('data', 'foo', '1.json'), 'utf-8', () => {
        throw new SyntaxError('Failure.');
      })
    ).rejects.toBeInstanceOf(SyntaxError));
});
