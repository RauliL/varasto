import { InvalidSlugError } from '@varasto/storage';
import all from 'it-all';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import './test-memfs';
import fs from 'fs';
import { resetVol, setupVol } from './test-memfs';
import {
  buildFilename,
  createNamespace,
  fileExists,
  globNamespace,
  readItem,
  readNamespaceItems,
  writeItem,
} from './utils';

describe('createNamespace()', () => {
  beforeEach(() => {
    setupVol({ data: {} });
  });

  afterEach(() => {
    resetVol();
  });

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
    setupVol({ data: {} });
    fs.chmodSync('data', 0);

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

describe('fileExists()', () => {
  beforeEach(() => {
    setupVol({
      data: {
        foo: {
          '1.json': '{"a":1}',
        },
      },
    });
  });

  afterEach(() => {
    resetVol();
  });

  it('should return true if the file exists', () =>
    expect(fileExists(path.join('data', 'foo', '1.json'))).resolves.toBe(true));

  it('should return false if the file does not exist', () =>
    expect(fileExists(path.join('data', 'foo', '2.json'))).resolves.toBe(false));
});

describe('globNamespace()', () => {
  beforeEach(() => {
    setupVol({
      data: {
        foo: {
          '1.json': '{"a":1}',
          '2.json': '{"a":2}',
          '3.txt': '',
        },
      },
    });
  });

  afterEach(() => {
    resetVol();
  });

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
    setupVol({
      data: {
        foo: {
          '1.json': '{"a":1}',
          '2.json': '"foo"',
          '3.json': '{}',
        },
      },
    });
    fs.chmodSync('data/foo/3.json', 0);
  });

  afterEach(() => {
    resetVol();
  });

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

describe('readNamespaceItems()', () => {
  beforeEach(() => {
    setupVol({
      data: {
        foo: {
          '1.json': '{"a":1}',
          '2.json': '"foo"',
          '3.json': '{"a":3}',
        },
      },
    });
  });

  afterEach(() => {
    resetVol();
  });

  it('should read all valid items from the namespace', async () => {
    const filenames = await globNamespace('data', 'foo');
    const items = await all(readNamespaceItems(filenames, 'utf-8', JSON.parse));

    expect(items).toHaveLength(2);
    expect(items).toContainEqual({
      filename: path.join('data', 'foo', '1.json'),
      value: { a: 1 },
    });
    expect(items).toContainEqual({
      filename: path.join('data', 'foo', '3.json'),
      value: { a: 3 },
    });
  });

  it('should yield nothing if the namespace is empty', async () =>
    expect(all(readNamespaceItems([], 'utf-8', JSON.parse))).resolves.toEqual(
      []
    ));
});

describe('writeItem()', () => {
  beforeEach(() => {
    setupVol({
      data: {
        foo: {
          '1.json': '{"a":1}',
        },
        unwriteable: {},
      },
    });
    fs.chmodSync('data/unwriteable', 0);
  });

  afterEach(() => {
    resetVol();
  });

  it('should write data to the target file atomically', async () => {
    const filename = path.join('data', 'foo', '2.json');

    await writeItem(filename, '{"a":2}', 'utf-8');

    expect(fs.readFileSync(filename, 'utf-8')).toBe('{"a":2}');
  });

  it('should replace existing file contents', async () => {
    const filename = path.join('data', 'foo', '1.json');

    await writeItem(filename, '{"a":4}', 'utf-8');

    expect(fs.readFileSync(filename, 'utf-8')).toBe('{"a":4}');
  });

  it('should not leave temporary files behind', async () => {
    const filename = path.join('data', 'foo', '2.json');

    await writeItem(filename, '{"a":2}', 'utf-8');

    expect(
      fs.readdirSync(path.join('data', 'foo')).some((file) => file.endsWith('.tmp'))
    ).toBe(false);
  });

  it('should fail if the file cannot be written', () =>
    expect(
      writeItem(path.join('data', 'unwriteable', '1.json'), '{"a":1}', 'utf-8')
    ).rejects.toBeInstanceOf(Error));
});
