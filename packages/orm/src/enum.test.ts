import { describe, expect, it } from 'vitest';

import { getEnumValues, isEnumReference } from './enum.js';

enum StringStatus {
  Active = 'active',
  Inactive = 'inactive',
}

enum NumericPriority {
  Low = 0,
  Medium = 1,
  High = 2,
}

describe('enum utilities', () => {
  describe('isEnumReference()', () => {
    it('should return true for enum objects', () => {
      expect(isEnumReference(StringStatus)).toBe(true);
    });

    it('should return false for non-enum values', () => {
      expect(isEnumReference(null)).toBe(false);
      expect(isEnumReference([])).toBe(false);
      expect(isEnumReference('active')).toBe(false);
    });
  });

  describe('getEnumValues()', () => {
    it('should return string enum values', () => {
      expect(getEnumValues(StringStatus)).toEqual(['active', 'inactive']);
    });

    it('should return numeric enum values without reverse mapping keys', () => {
      expect(getEnumValues(NumericPriority)).toEqual([0, 1, 2]);
    });
  });
});
