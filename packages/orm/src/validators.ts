import { ValidationError } from './error.js';
import { OptionalFieldValue } from './types.js';

const toComparable = (value: OptionalFieldValue): number | undefined => {
  if (typeof value === 'number') {
    return value;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  return undefined;
};

const boundaryToComparable = (boundary: number | Date): number =>
  boundary instanceof Date ? boundary.getTime() : boundary;

/**
 * Creates an validator function that will throw an validation error with given
 * error message if the value is less than the given minimum value.
 */
export const minValidator =
  (min: number | Date, errorMessage: string) =>
  (value: OptionalFieldValue) => {
    const comparable = toComparable(value);
    const minComparable = boundaryToComparable(min);

    if (comparable === undefined || comparable < minComparable) {
      throw new ValidationError(errorMessage);
    }
  };

/**
 * Creates an validator function that will throw an validation error with given
 * error message if the value is greater than the given maximum value.
 */
export const maxValidator =
  (max: number | Date, errorMessage: string) =>
  (value: OptionalFieldValue) => {
    const comparable = toComparable(value);
    const maxComparable = boundaryToComparable(max);

    if (comparable === undefined || comparable > maxComparable) {
      throw new ValidationError(errorMessage);
    }
  };

/**
 * Creates an validator function that will throw an validation error with given
 * error message if the value is not in the range of given minimum and maximum
 * values.
 */
export const minMaxValidator =
  (min: number | Date, max: number | Date, errorMessage: string) =>
  (value: OptionalFieldValue) => {
    const comparable = toComparable(value);
    const minComparable = boundaryToComparable(min);
    const maxComparable = boundaryToComparable(max);

    if (
      comparable === undefined ||
      comparable < minComparable ||
      comparable > maxComparable
    ) {
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
