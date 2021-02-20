const VALID_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Tests whether given string is an valid slug or not.
 */
export const isValidSlug = (input: string): boolean =>
  VALID_SLUG_PATTERN.test(input);
