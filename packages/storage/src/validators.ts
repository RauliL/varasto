import { isValidSlug } from 'is-valid-slug';

import { InvalidSlugError } from './errors.js';

/**
 * Checks whether given namespace identifier is valid and if it's not throws
 * instance of `InvalidSlugError`.
 */
export const validateNamespace = (namespace: string) => {
  if (!isValidSlug(namespace)) {
    throw new InvalidSlugError('Given namespace is not valid slug');
  }
};

/**
 * Checks whether given key is valid and if it's not throws instance of
 * `InvalidSlugError`.
 */
export const validateKey = (key: string) => {
  if (!isValidSlug(key)) {
    throw new InvalidSlugError('Given key is not valid slug');
  }
};

/**
 * Checks that both given namespace identifier and key are valid and if either
 * of them are not throws instance of `InvalidSlugError`.
 */
export const validateNamespaceAndKey = (namespace: string, key: string) => {
  validateNamespace(namespace);
  validateKey(key);
};
