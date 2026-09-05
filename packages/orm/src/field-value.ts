import { ValidationError } from './error.js';
import { FieldType, OptionalFieldValue, ScalarFieldType } from './types.js';

const ARRAY_FIELD_TYPES = new Set<FieldType>([
  'boolean[]',
  'date[]',
  'number[]',
  'string[]',
]);

export const isArrayFieldType = (
  type: FieldType | undefined
): type is `${ScalarFieldType}[]` => type?.endsWith('[]') ?? false;

export const isValidFieldType = (type: FieldType): boolean =>
  ARRAY_FIELD_TYPES.has(type) ||
  type === 'boolean' ||
  type === 'date' ||
  type === 'number' ||
  type === 'string';

export const scalarFieldType = (
  type: `${ScalarFieldType}[]`
): ScalarFieldType => type.slice(0, -2) as ScalarFieldType;

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

  if (typeof value !== 'string') {
    throw new ValidationError('Invalid date value');
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ValidationError('Invalid date value');
  }

  return date;
};

export const serializeFieldValue = (
  type: FieldType | undefined,
  value: OptionalFieldValue
): OptionalFieldValue => {
  if (value == null) {
    return value;
  }

  if (isArrayFieldType(type)) {
    if (!Array.isArray(value)) {
      throw new ValidationError('Expected an array value');
    }

    return value.map((item) =>
      serializeScalarFieldValue(scalarFieldType(type), item)
    ) as OptionalFieldValue;
  }

  if (type) {
    return serializeScalarFieldValue(type, value);
  }

  return value;
};

export const deserializeFieldValue = (
  type: FieldType | undefined,
  value: OptionalFieldValue
): OptionalFieldValue => {
  if (value == null) {
    return value;
  }

  if (isArrayFieldType(type)) {
    if (!Array.isArray(value)) {
      throw new ValidationError('Expected an array value');
    }

    return value.map((item) =>
      deserializeScalarFieldValue(scalarFieldType(type), item)
    ) as OptionalFieldValue;
  }

  if (type) {
    return deserializeScalarFieldValue(type, value);
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
