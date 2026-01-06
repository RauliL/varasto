import { JsonObject } from 'type-fest';
import { ValidationError } from '../error';

import { FieldOptions } from '../options';
import { ModelMetadata } from './model';

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
    let value = Reflect.get(data, this.propertyName) as
      | string
      | number
      | boolean
      | null
      | undefined;

    if (value === undefined) {
      value = this.options.default;
    }

    // TODO: Validate type.

    // TODO: Validate choices also here?

    Reflect.set(instance, this.propertyName, value);
  }

  public save<T extends object>(instance: T, data: JsonObject) {
    let value = Reflect.get(instance, this.propertyName) as
      | string
      | number
      | boolean
      | null
      | undefined;

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

    Reflect.set(data, this.propertyName, value);
  }
}
