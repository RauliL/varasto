import { JsonObject } from 'type-fest';
import { ValidationError } from '../error.js';

import { FieldOptions } from '../options/index.js';
import { ModelMetadata } from './model.js';
import { FieldType, OptionalFieldValue } from '../types.js';

const serializeFieldValue = (
  type: FieldType,
  value: OptionalFieldValue
): OptionalFieldValue => {
  if (type === 'date' && value instanceof Date) {
    return value.toISOString();
  }

  return value;
};

const deserializeFieldValue = (
  type: FieldType,
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

export class FieldMetadata {
  public readonly model: ModelMetadata;
  public readonly propertyName: string | symbol;
  public readonly options: Readonly<FieldOptions>;

  public constructor(
    model: ModelMetadata,
    propertyName: string | symbol,
    options: Readonly<FieldOptions>
  ) {
    this.model = model;
    this.propertyName = propertyName;
    this.options = options;
  }

  public load<T extends object>(instance: T, data: JsonObject) {
    let value = Reflect.get(data, this.propertyName) as OptionalFieldValue;

    if (value === undefined) {
      value = this.options.default;
    }

    // TODO: Validate type.

    // TODO: Validate choices also here?

    Reflect.set(
      instance,
      this.propertyName,
      deserializeFieldValue(this.options.type!, value)
    );
  }

  public save<T extends object>(instance: T, data: JsonObject) {
    let value = Reflect.get(instance, this.propertyName) as OptionalFieldValue;

    if (value === undefined) {
      value = this.options.default;
      Reflect.set(instance, this.propertyName, value);
    }

    // TODO: Validate type.

    if (this.options.choices && !this.options.choices.includes(value)) {
      throw new ValidationError(
        'Given value is not included in the accepted list of values'
      );
    }

    this.options.validators?.forEach((validator) => validator(value));

    Reflect.set(
      data,
      this.propertyName,
      serializeFieldValue(this.options.type!, value)
    );
  }
}
