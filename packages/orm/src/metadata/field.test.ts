import { JsonObject } from 'type-fest';
import { describe, expect, it, vi } from 'vitest';

import { ValidationError } from '../error.js';
import { FieldMetadata } from './field.js';
import { ModelMetadata } from './model.js';

describe('class FieldMetadata', () => {
  const mockModelMetadata = new ModelMetadata(String);

  describe('load()', () => {
    it('should use default value when one is provided and the actual value is missing', () => {
      const metadata = new FieldMetadata(mockModelMetadata, 'foo', {
        default: 'bar',
      });
      const instance = {};

      metadata.load(instance, {});

      expect(instance).toHaveProperty('foo', 'bar');
    });

    it('should deserialize ISO date strings into `Date` instances', () => {
      const metadata = new FieldMetadata(mockModelMetadata, 'createdAt', {
        type: 'date',
      });
      const instance = {};

      metadata.load(instance, { createdAt: '2024-01-15T12:00:00.000Z' });

      expect(instance).toHaveProperty('createdAt');
      expect((instance as { createdAt: Date }).createdAt).toBeInstanceOf(Date);
      expect(
        (instance as { createdAt: Date }).createdAt.toISOString()
      ).toEqual('2024-01-15T12:00:00.000Z');
    });

    it('should throw `ValidationError` if stored date value is invalid', () => {
      const metadata = new FieldMetadata(mockModelMetadata, 'createdAt', {
        type: 'date',
      });

      expect(() => metadata.load({}, { createdAt: 'not-a-date' })).toThrow(
        ValidationError
      );
    });
  });

  describe('save()', () => {
    it('should use default value when one is provided and the actual value is missing', () => {
      const metadata = new FieldMetadata(mockModelMetadata, 'foo', {
        default: 'bar',
      });
      const data: JsonObject = {};

      metadata.save({}, data);

      expect(data).toHaveProperty('foo', 'bar');
    });

    it('should throw `ValidationError` is value is not in the given array of choices', () => {
      const metadata = new FieldMetadata(mockModelMetadata, 'foo', {
        choices: [1, 2, 3, 4, 5],
      });

      expect(() => metadata.save({ foo: 6 }, {})).toThrow(ValidationError);
    });

    it('should run validator functions given to the field', () => {
      const mockValidator = vi.fn();
      const metadata = new FieldMetadata(mockModelMetadata, 'foo', {
        validators: [mockValidator],
      });

      metadata.save({ foo: 'value' }, {});

      expect(mockValidator).toBeCalledWith('value');
    });

    it('should serialize `Date` instances into ISO strings', () => {
      const metadata = new FieldMetadata(mockModelMetadata, 'createdAt', {
        type: 'date',
      });
      const data: JsonObject = {};
      const createdAt = new Date('2024-01-15T12:00:00.000Z');

      metadata.save({ createdAt }, data);

      expect(data).toHaveProperty('createdAt', '2024-01-15T12:00:00.000Z');
    });
  });
});
