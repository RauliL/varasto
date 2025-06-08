import { describe, expect, it } from 'vitest';

import { ValidationError } from './error';
import {
  maxValidator,
  minMaxValidator,
  minValidator,
  regexpValidator,
} from './validators';

describe('validator functions', () => {
  describe('minValidator()', () => {
    it('should do nothing if given value is greater than the minimum value', () => {
      expect(() => minValidator(5, '')(10)).not.toThrow();
    });

    it('should throw error if given value is less than the minimum value', () => {
      expect(() => minValidator(5, '')(4)).toThrow(ValidationError);
    });
  });

  describe('maxValidator()', () => {
    it('should do nothing if given value is less than the maximum value', () => {
      expect(() => maxValidator(5, '')(2)).not.toThrow();
    });

    it('should throw error if given value is greater than the maximum value', () => {
      expect(() => maxValidator(5, '')(10)).toThrow(ValidationError);
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
