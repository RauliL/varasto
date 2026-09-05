import 'reflect-metadata';

import { ConfigurationError } from '../error.js';
import { isValidFieldType } from '../field-value.js';
import { EmbeddedMetadata } from '../metadata/embedded.js';
import { FieldMetadata, ModelMetadata } from '../metadata/index.js';
import { FieldOptions } from '../options/index.js';
import { EmbeddedClass, FieldConstructor, FieldType } from '../types.js';

const TYPE_MAPPING = new Map<FieldConstructor, FieldType>([
  [Boolean, 'boolean'],
  [Date, 'date'],
  [Number, 'number'],
  [String, 'string'],
]);

const isEmbeddedClassReference = (value: unknown): value is EmbeddedClass =>
  typeof value === 'function';

const resolveArrayFieldType = (options: FieldOptions): FieldType => {
  if (options.type?.endsWith('[]')) {
    return options.type;
  }

  if (isEmbeddedClassReference(options.items)) {
    EmbeddedMetadata.requireFor(options.items);

    return 'embedded[]';
  }

  if (options.items) {
    return `${options.items}[]`;
  }

  throw new ConfigurationError(
    'Array fields require `items` or an array `type` (e.g. "string[]")'
  );
};

const resolveEmbeddedFieldType = (options: FieldOptions): FieldType => {
  const embeddedClass = options.of ?? options.items;

  if (!isEmbeddedClassReference(embeddedClass)) {
    throw new ConfigurationError(
      'Embedded fields require `of` or an embedded class in `items`'
    );
  }

  EmbeddedMetadata.requireFor(embeddedClass);

  return 'embedded';
};

export const Field =
  (options: FieldOptions = {}): PropertyDecorator =>
  (target: object, propertyKey: string | symbol) => {
    const modelMetadata = ModelMetadata.getFor(target.constructor);
    let type: FieldType | undefined = options.type;
    const fieldOptions: FieldOptions = { ...options };

    if (type && !isValidFieldType(type)) {
      throw new ConfigurationError(`Unsupported field type: ${type}`);
    }

    if (type === 'embedded') {
      type = resolveEmbeddedFieldType(fieldOptions);
    } else if (type === 'embedded[]') {
      if (!isEmbeddedClassReference(fieldOptions.items)) {
        throw new ConfigurationError(
          'Embedded array fields require an embedded class in `items`'
        );
      }

      EmbeddedMetadata.requireFor(fieldOptions.items);
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
        type = resolveArrayFieldType(fieldOptions);
      } else if (EmbeddedMetadata.isEmbedded(reflectType)) {
        fieldOptions.of = reflectType;
        type = resolveEmbeddedFieldType(fieldOptions);
      } else if (!(type = TYPE_MAPPING.get(reflectType))) {
        throw new ConfigurationError(`Unsupported field type: ${reflectType}`);
      }
    }

    fieldOptions.type = type;

    modelMetadata.fields.push(
      new FieldMetadata(modelMetadata, propertyKey, fieldOptions)
    );
  };
