import { describe, expect, it } from 'vitest';

import { ValidationError } from './error.js';
import {
  maxValidator,
  minMaxValidator,
  minValidator,
  regexpValidator,
} from './validators.js';

describe('validator functions', () => {
  describe('minValidator()', () => {
    it('should do nothing if given value is greater than the minimum value', () => {
      expect(() => minValidator(5, '')(10)).not.toThrow();
    });

    it('should throw error if given value is less than the minimum value', () => {
      expect(() => minValidator(5, '')(4)).toThrow(ValidationError);
    });

    it('should accept `Date` values and boundaries', () => {
      const min = new Date('2024-01-01T00:00:00.000Z');
      const valid = new Date('2024-06-01T00:00:00.000Z');
      const invalid = new Date('2023-06-01T00:00:00.000Z');

      expect(() => minValidator(min, '')(valid)).not.toThrow();
      expect(() => minValidator(min, '')(invalid)).toThrow(ValidationError);
    });
  });

  describe('maxValidator()', () => {
    it('should do nothing if given value is less than the maximum value', () => {
      expect(() => maxValidator(5, '')(2)).not.toThrow();
    });

    it('should throw error if given value is greater than the maximum value', () => {
      expect(() => maxValidator(5, '')(10)).toThrow(ValidationError);
    });

    it('should accept `Date` values and boundaries', () => {
      const max = new Date('2024-12-31T00:00:00.000Z');
      const valid = new Date('2024-06-01T00:00:00.000Z');
      const invalid = new Date('2025-06-01T00:00:00.000Z');

      expect(() => maxValidator(max, '')(valid)).not.toThrow();
      expect(() => maxValidator(max, '')(invalid)).toThrow(ValidationError);
    });
  });

  describe('minMaxValidator()', () => {
    it('should do nothing if given value is within the range', () => {
      expect(() => minMaxValidator(5, 10, '')(7)).not.toThrow();
    });

    it.each([4, 11])(
      'should throw error if given value is not within the range',
      (value) => {
        expect(() => minMaxValidator(5, 10, '')(value)).toThrow(
          ValidationError
        );
      }
    );

    it('should accept `Date` values and boundaries', () => {
      const min = new Date('2024-01-01T00:00:00.000Z');
      const max = new Date('2024-12-31T00:00:00.000Z');
      const valid = new Date('2024-06-01T00:00:00.000Z');
      const tooEarly = new Date('2023-06-01T00:00:00.000Z');
      const tooLate = new Date('2025-06-01T00:00:00.000Z');

      expect(() => minMaxValidator(min, max, '')(valid)).not.toThrow();
      expect(() => minMaxValidator(min, max, '')(tooEarly)).toThrow(
        ValidationError
      );
      expect(() => minMaxValidator(min, max, '')(tooLate)).toThrow(
        ValidationError
      );
    });
  });

  describe('regexpValidator()', () => {
    it('should do nothing if given value matches with the pattern', () => {
      expect(() => regexpValidator(/^b+$/, '')('bbb')).not.toThrow();
    });

    it('should throw error if given value does not match with the pattern', () => {
      expect(() => regexpValidator(/^b+$/, '')('aaa')).toThrow(
        ValidationError
      );
    });

    it('should throw error if value is not a string', () => {
      expect(() => regexpValidator(/^b+$/, '')(5)).toThrow(ValidationError);
    });
  });
});
