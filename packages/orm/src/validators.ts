import { ValidationError } from './error.js';
import { OptionalFieldValue } from './types.js';

/**
 * Creates an validator function that will throw an validation error with given
 * error message if the value is less than the given minimum value.
 */
export const minValidator =
  (min: number, errorMessage: string) => (value: OptionalFieldValue) => {
    if (typeof value !== 'number' || value < min) {
      throw new ValidationError(errorMessage);
    }
  };

/**
 * Creates an validator function that will throw an validation error with given
 * error message if the value is greater than the given maximum value.
 */
export const maxValidator =
  (max: number, errorMessage: string) => (value: OptionalFieldValue) => {
    if (typeof value !== 'number' || value > max) {
      throw new ValidationError(errorMessage);
    }
  };

/**
 * Creates an validator function that will throw an validation error with given
 * error message if the value is not in the range of given minimum and maximum
 * values.
 */
export const minMaxValidator =
  (min: number, max: number, errorMessage: string) =>
  (value: OptionalFieldValue) => {
    if (typeof value !== 'number' || value < min || value > max) {
      throw new ValidationError(errorMessage);
    }
  };

/**
 * Creates an validator function that will throw an validation error with given
 * error message if the value does not match given regular expression.
 */
export const regexpValidator =
  (pattern: RegExp, errorMessage: string) => (value: OptionalFieldValue) => {
    if (typeof value !== 'string' || !pattern.test(value)) {
      throw new ValidationError(errorMessage);
    }
  };
