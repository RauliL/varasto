import { JsonObject } from 'type-fest';
import { ValidationError } from '../error';

import { FieldMetadata } from './field';
import { ModelMetadata } from './model';

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
      const mockValidator = jest.fn();
      const metadata = new FieldMetadata(mockModelMetadata, 'foo', {
        validators: [mockValidator],
      });

      metadata.save({ foo: 'value' }, {});

      expect(mockValidator).toBeCalledWith('value');
    });
  });
});
