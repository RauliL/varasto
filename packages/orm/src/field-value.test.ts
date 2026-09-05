import { describe, expect, it } from 'vitest';

import { ValidationError } from './error.js';
import {
  deserializeFieldValue,
  isValueAllowedByChoices,
  serializeFieldValue,
} from './field-value.js';

describe('field value utilities', () => {
  describe('serializeFieldValue()', () => {
    it('should serialize `date[]` values into ISO strings', () => {
      const dates = [
        new Date('2024-01-15T12:00:00.000Z'),
        new Date('2024-06-01T00:00:00.000Z'),
      ];

      expect(serializeFieldValue('date[]', dates)).toEqual([
        '2024-01-15T12:00:00.000Z',
        '2024-06-01T00:00:00.000Z',
      ]);
    });

    it('should pass through primitive array values unchanged', () => {
      expect(serializeFieldValue('string[]', ['foo', 'bar'])).toEqual([
        'foo',
        'bar',
      ]);
      expect(serializeFieldValue('number[]', [1, 2, 3])).toEqual([1, 2, 3]);
      expect(serializeFieldValue('boolean[]', [true, false])).toEqual([
        true,
        false,
      ]);
    });

    it('should throw `ValidationError` if an array field value is not an array', () => {
      expect(() => serializeFieldValue('string[]', 'foo')).toThrow(
        ValidationError
      );
    });
  });

  describe('deserializeFieldValue()', () => {
    it('should deserialize ISO strings into `Date` instances for `date[]` fields', () => {
      const result = deserializeFieldValue('date[]', [
        '2024-01-15T12:00:00.000Z',
        '2024-06-01T00:00:00.000Z',
      ]) as Date[];

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Date);
      expect(result[0].toISOString()).toEqual('2024-01-15T12:00:00.000Z');
      expect(result[1].toISOString()).toEqual('2024-06-01T00:00:00.000Z');
    });

    it('should pass through primitive array values unchanged', () => {
      expect(deserializeFieldValue('string[]', ['foo', 'bar'])).toEqual([
        'foo',
        'bar',
      ]);
    });

    it('should throw `ValidationError` if stored date array contains invalid value', () => {
      expect(() =>
        deserializeFieldValue('date[]', ['2024-01-15T12:00:00.000Z', 'nope'])
      ).toThrow(ValidationError);
    });

    it('should throw `ValidationError` if an array field value is not an array', () => {
      expect(() => deserializeFieldValue('string[]', 'foo')).toThrow(
        ValidationError
      );
    });
  });

  describe('isValueAllowedByChoices()', () => {
    it('should require every array element to be included in choices', () => {
      expect(isValueAllowedByChoices(['a', 'b'], ['a', 'b', 'c'])).toBe(true);
      expect(isValueAllowedByChoices(['a', 'd'], ['a', 'b', 'c'])).toBe(false);
    });

    it('should validate scalar values against choices', () => {
      expect(isValueAllowedByChoices('a', ['a', 'b', 'c'])).toBe(true);
      expect(isValueAllowedByChoices('d', ['a', 'b', 'c'])).toBe(false);
    });
  });
});
