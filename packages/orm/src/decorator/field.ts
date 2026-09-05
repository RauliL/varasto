import 'reflect-metadata';

import { ConfigurationError } from '../error.js';
import { isValidFieldType } from '../field-value.js';
import { FieldMetadata, ModelMetadata } from '../metadata/index.js';
import { FieldOptions } from '../options/index.js';
import { FieldConstructor, FieldType } from '../types.js';

const TYPE_MAPPING = new Map<FieldConstructor, FieldType>([
  [Boolean, 'boolean'],
  [Date, 'date'],
  [Number, 'number'],
  [String, 'string'],
]);

const resolveArrayFieldType = (options: FieldOptions): FieldType => {
  if (options.type?.endsWith('[]')) {
    return options.type;
  }

  if (options.items) {
    return `${options.items}[]`;
  }

  throw new ConfigurationError(
    'Array fields require `items` or an array `type` (e.g. "string[]")'
  );
};

export const Field =
  (options: FieldOptions = {}): PropertyDecorator =>
  (target: object, propertyKey: string | symbol) => {
    const modelMetadata = ModelMetadata.getFor(target.constructor);
    let type: FieldType | undefined = options.type;

    if (type && !isValidFieldType(type)) {
      throw new ConfigurationError(`Unsupported field type: ${type}`);
    }

    if (!type) {
      const reflectType = Reflect.getMetadata(
        'design:type',
        target,
        propertyKey
      );

      if (!reflectType) {
        throw new ConfigurationError('Unable to process field type');
      } else if (reflectType === Array) {
        type = resolveArrayFieldType(options);

        if (!isValidFieldType(type)) {
          throw new ConfigurationError(`Unsupported field type: ${type}`);
        }
      } else if (!(type = TYPE_MAPPING.get(reflectType))) {
        throw new ConfigurationError(`Unsupported field type: ${reflectType}`);
      }
    }

    modelMetadata.fields.push(
      new FieldMetadata(modelMetadata, propertyKey, { ...options, type })
    );
  };
