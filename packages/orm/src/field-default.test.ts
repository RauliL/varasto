import { describe, expect, it, vi } from 'vitest';

import { resolveFieldDefault } from './field-default.js';

describe('resolveFieldDefault()', () => {
  it('should return static default values as-is', () => {
    expect(resolveFieldDefault('active')).toEqual('active');
    expect(resolveFieldDefault(null)).toBeNull();
  });

  it('should invoke factory functions to produce default values', () => {
    const factory = vi.fn(() => new Date('2024-01-15T12:00:00.000Z'));

    expect(resolveFieldDefault(factory)).toEqual(
      new Date('2024-01-15T12:00:00.000Z')
    );
    expect(factory).toBeCalledTimes(1);
  });

  it('should return undefined when no default is configured', () => {
    expect(resolveFieldDefault(undefined)).toBeUndefined();
  });
});
