import { describe, expect, it } from 'vitest';

import { open } from '.';

describe('open()', () => {
  const expectStorage = (result: object) => {
    ['entries', 'keys', 'get', 'set', 'delete', 'update'].forEach((method) => {
      expect(Reflect.get(result, method)).toBeInstanceOf(Function);
    });
  };

  it('should construct in-memory storage when protocol is "memory:"', async () => {
    const result = await open('memory:');

    expectStorage(result);
    expect(result).toHaveProperty('clear');
  });

  it('should reject if given input cannot be parsed as URL', () =>
    expect(open('foo bar')).rejects.toBeInstanceOf(Error));

  it('should reject if URL protocol is unrecognized', () =>
    expect(open('unknown://')).rejects.toBeInstanceOf(Error));
});
