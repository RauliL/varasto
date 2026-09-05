import { JsonObject } from 'type-fest';

import { ValidationError } from './error.js';
import { EmbeddedMetadata } from './metadata/embedded.js';
import { FieldOptions } from './options/index.js';
import {
  EmbeddedClass,
  FieldType,
  OptionalFieldValue,
  ScalarFieldType,
} from './types.js';

const ARRAY_FIELD_TYPES = new Set<FieldType>([
  'boolean[]',
  'date[]',
  'enum[]',
  'number[]',
  'string[]',
  'embedded[]',
]);

const isEmbeddedClassReference = (value: unknown): value is EmbeddedClass =>
  typeof value === 'function';

export const isArrayFieldType = (
  type: FieldType | undefined
): type is `${ScalarFieldType}[]` | 'embedded[]' =>
  type === 'boolean[]' ||
  type === 'date[]' ||
  type === 'number[]' ||
  type === 'string[]' ||
  type === 'embedded[]';

export const isValidFieldType = (type: FieldType): boolean =>
  ARRAY_FIELD_TYPES.has(type) ||
  type === 'boolean' ||
  type === 'date' ||
  type === 'embedded' ||
  type === 'enum' ||
  type === 'number' ||
  type === 'string';

export const scalarFieldType = (
  type: `${ScalarFieldType}[]` | 'embedded[]'
): ScalarFieldType | 'embedded' =>
  type.slice(0, -2) as ScalarFieldType | 'embedded';

const getEmbeddedClass = (options: Readonly<FieldOptions>): EmbeddedClass => {
  const embeddedClass = options.of ?? options.items;

  if (!isEmbeddedClassReference(embeddedClass)) {
    throw new ValidationError('Embedded field is missing embedded class');
  }

  return embeddedClass;
};

const serializeScalarFieldValue = (
  type: ScalarFieldType,
  value: OptionalFieldValue
): OptionalFieldValue => {
  if (type === 'date' && value instanceof Date) {
    return value.toISOString();
  }

  return value;
};

const deserializeScalarFieldValue = (
  type: ScalarFieldType,
  value: OptionalFieldValue
): OptionalFieldValue => {
  if (type !== 'date' || value == null) {
    return value;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value !== 'string') {
    throw new ValidationError('Invalid date value');
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ValidationError('Invalid date value');
  }

  return date;
};

const serializeEmbeddedValue = (
  options: Readonly<FieldOptions>,
  value: OptionalFieldValue
): JsonObject => {
  if (typeof value !== 'object' || value == null || Array.isArray(value)) {
    throw new ValidationError('Expected an embedded object value');
  }

  return EmbeddedMetadata.requireFor(getEmbeddedClass(options)).save(value);
};

const deserializeEmbeddedValue = (
  options: Readonly<FieldOptions>,
  value: OptionalFieldValue
): object => {
  if (typeof value !== 'object' || value == null || Array.isArray(value)) {
    throw new ValidationError('Expected an embedded object value');
  }

  return EmbeddedMetadata.requireFor(getEmbeddedClass(options)).load(
    value as JsonObject
  );
};

export const serializeFieldValue = (
  options: Readonly<FieldOptions>,
  value: OptionalFieldValue
): OptionalFieldValue => {
  if (value == null) {
    return value;
  }

  if (options.type === 'embedded') {
    return serializeEmbeddedValue(options, value);
  }

  if (options.type === 'embedded[]') {
    if (!Array.isArray(value)) {
      throw new ValidationError('Expected an array value');
    }

    const metadata = EmbeddedMetadata.requireFor(getEmbeddedClass(options));

    return value.map((item) =>
      metadata.save(item as object)
    ) as OptionalFieldValue;
  }

  if (options.type === 'enum[]') {
    if (!Array.isArray(value)) {
      throw new ValidationError('Expected an array value');
    }

    return value;
  }

  if (options.type === 'enum') {
    return value;
  }

  if (isArrayFieldType(options.type)) {
    if (!Array.isArray(value)) {
      throw new ValidationError('Expected an array value');
    }

    const itemType = scalarFieldType(options.type);

    if (itemType === 'embedded') {
      throw new ValidationError('Embedded field is missing embedded class');
    }

    return value.map((item) =>
      serializeScalarFieldValue(itemType, item)
    ) as OptionalFieldValue;
  }

  if (options.type) {
    return serializeScalarFieldValue(options.type, value);
  }

  return value;
};

export const deserializeFieldValue = (
  options: Readonly<FieldOptions>,
  value: OptionalFieldValue
): OptionalFieldValue => {
  if (value == null) {
    return value;
  }

  if (options.type === 'embedded') {
    return deserializeEmbeddedValue(options, value);
  }

  if (options.type === 'embedded[]') {
    if (!Array.isArray(value)) {
      throw new ValidationError('Expected an array value');
    }

    const metadata = EmbeddedMetadata.requireFor(getEmbeddedClass(options));

    return value.map((item) =>
      metadata.load(item as JsonObject)
    ) as OptionalFieldValue;
  }

  if (options.type === 'enum[]') {
    if (!Array.isArray(value)) {
      throw new ValidationError('Expected an array value');
    }

    return value;
  }

  if (options.type === 'enum') {
    return value;
  }

  if (isArrayFieldType(options.type)) {
    if (!Array.isArray(value)) {
      throw new ValidationError('Expected an array value');
    }

    const itemType = scalarFieldType(options.type);

    if (itemType === 'embedded') {
      throw new ValidationError('Embedded field is missing embedded class');
    }

    return value.map((item) =>
      deserializeScalarFieldValue(itemType, item)
    ) as OptionalFieldValue;
  }

  if (options.type) {
    return deserializeScalarFieldValue(options.type, value);
  }

  return value;
};

export const isValueAllowedByChoices = (
  value: OptionalFieldValue,
  choices: OptionalFieldValue[]
): boolean => {
  if (Array.isArray(value)) {
    return value.every((item) => choices.includes(item));
  }

  return choices.includes(value);
};
