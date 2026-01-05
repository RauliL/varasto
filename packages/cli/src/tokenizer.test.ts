import { describe, expect, it } from 'vitest';

import { tokenize } from './tokenizer';

describe('tokenize()', () => {
  it('should split string into whitespace separated tokens', () => {
    expect(tokenize('foo bar\tbaz')).toEqual(['foo', 'bar', 'baz']);
  });

  it('should detect JSON input and treat it as a single token', () => {
    expect(tokenize('get { "foo": [1, 2, 3, 4] }')).toEqual([
      'get',
      '{ "foo": [1, 2, 3, 4] }',
    ]);
  });

  it('should be able to handle additional tokens after JSON input', () => {
    expect(tokenize('get { "foo": "bar" } baz')).toEqual([
      'get',
      '{ "foo": "bar" }',
      'baz',
    ]);
  });

  it('should throw exception if JSON input is not balanced', () => {
    expect(() => tokenize('get { "foo": [1, 2, 3, 4')).toThrow();
  });
});
