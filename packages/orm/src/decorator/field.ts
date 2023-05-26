import 'reflect-metadata';

import { ConfigurationError } from '../error';
import { FieldMetadata, ModelMetadata } from '../metadata';
import { FieldOptions } from '../options';
import { FieldType } from '../types';

const TYPE_MAPPING = new Map<Function, FieldType>([
  [Boolean, 'boolean'],
  [Number, 'number'],
  [String, 'string'],
]);

export const Field =
  (options: FieldOptions = {}): PropertyDecorator =>
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
      new FieldMetadata(modelMetadata, propertyKey, { ...options, type })
    );
  };
