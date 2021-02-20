import { InvalidSlugError } from './types';
import { buildFilename } from './utils';

describe('buildFilename()', () => {
  it.each([
    [''],
    ['foo;bar'],
    ['/etc/passwd'],
  ])('should throw exception if given namespace is invalid', (namespace) => {
    expect(() => buildFilename('./data', namespace, 'foo')).toThrowError(InvalidSlugError);
  });

  it.each([
    [''],
    ['foo;bar'],
    ['/etc/passwd'],
  ])('should throw exception if given key is invalid', (key) => {
    expect(() => buildFilename('./data', 'foo', key)).toThrowError(InvalidSlugError);
  });

  it('should return an filename if namespace and key are valid', () => {
    expect(buildFilename('./data', 'foo', 'bar')).toEqual('data/foo/bar.json');
  });
});
