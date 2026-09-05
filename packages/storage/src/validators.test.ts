import { describe, expect, it } from 'vitest';

import { InvalidSlugError } from './errors.js';
import {
  validateKey,
  validateNamespace,
  validateNamespaceAndKey,
} from './validators.js';

describe('validateNamespace()', () => {
  it('should do nothing if given namespace identifier is valid', () => {
    expect(() => validateNamespace('valid')).not.toThrow(InvalidSlugError);
  });

  it('should throw `InvalidSlugError` if given namespace identifier is not valid', () => {
    expect(() => validateNamespace('#invalid#')).toThrow(InvalidSlugError);
  });
});

describe('validateKey()', () => {
  it('should do nothing if given key is valid', () => {
    expect(() => validateKey('valid')).not.toThrow(InvalidSlugError);
  });

  it('should throw `InvalidSlugError` if given key is not valid', () => {
    expect(() => validateKey('#invalid#')).toThrow(InvalidSlugError);
  });
});

describe('validateNamespaceAndKey()', () => {
  it('should do nothing if given namespace identifier and key are valid', () => {
    expect(() => validateNamespaceAndKey('valid', 'valid')).not.toThrow(
      InvalidSlugError
    );
  });

  it('should throw `InvalidSlugError` if given namespace identifier is not valid', () => {
    expect(() => validateNamespaceAndKey('#invalid#', 'valid')).toThrow(
      InvalidSlugError
    );
  });

  it('should throw `InvalidSlugError` if given key is not valid', () => {
    expect(() => validateNamespaceAndKey('valid', '#invalid#')).toThrow(
      InvalidSlugError
    );
  });
});
