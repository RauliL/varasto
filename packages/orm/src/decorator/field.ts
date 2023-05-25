import 'reflect-metadata';

import { ConfigurationError } from '../error';
import { FieldMetadata, ModelMetadata } from '../metadata';
import { FieldType } from '../types';

const TYPE_MAPPING = new Map<Function, FieldType>([
  [Boolean, 'boolean'],
  [Number, 'number'],
  [String, 'string'],
]);

/**
 * Various options that can be passed to an model field.
 */
export type FieldOptions = {
  /**
   * Default value for the field that will be used when the model instance is
   * stored and the field's value is `undefined`.
   */
  default: boolean | number | string | null;

  /**
   * Type of the field. If omitted, it will be determined from the property
   * declaration.
   */
  type: FieldType;
};

export const Field =
  (options: Partial<FieldOptions> = {}): PropertyDecorator =>
  (target: Object, propertyKey: string | symbol) => {
    const modelMetadata = ModelMetadata.getFor(target.constructor);
    let type: FieldType | undefined = options.type;

    if (!type) {
      const reflectType = Reflect.getMetadata(
        'design:type',
        target,
        propertyKey
      );

      if (!reflectType) {
        throw new ConfigurationError('Unable to process field type');
      } else if (!(type = TYPE_MAPPING.get(reflectType))) {
        throw new ConfigurationError(`Unsupported field type: ${reflectType}`);
      }
    }

    modelMetadata.fields.push(
      new FieldMetadata(modelMetadata, propertyKey, type, options.default)
    );
  };
