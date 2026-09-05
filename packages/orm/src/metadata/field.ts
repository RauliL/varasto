/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { JsonObject } from 'type-fest';
import { ValidationError } from '../error.js';
import {
  deserializeFieldValue,
  isValueAllowedByChoices,
  serializeFieldValue,
} from '../field-value.js';

import { FieldOptions } from '../options/index.js';
import { OptionalFieldValue } from '../types.js';
import { EmbeddedField } from './embedded.js';

export interface FieldOwner {
  readonly fields: EmbeddedField[];
  readonly target: Function;
}

export class FieldMetadata implements EmbeddedField {
  public readonly owner: FieldOwner;
  public readonly propertyName: string | symbol;
  public readonly options: Readonly<FieldOptions>;

  public constructor(
    owner: FieldOwner,
    propertyName: string | symbol,
    options: Readonly<FieldOptions>
  ) {
    this.owner = owner;
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
      deserializeFieldValue(this.options, value)
    );
  }

  public save<T extends object>(instance: T, data: JsonObject) {
    let value = Reflect.get(instance, this.propertyName) as OptionalFieldValue;

    if (value === undefined) {
      value = this.options.default;
      Reflect.set(instance, this.propertyName, value);
    }

    // TODO: Validate type.

    if (
      this.options.choices &&
      !isValueAllowedByChoices(value, this.options.choices)
    ) {
      throw new ValidationError(
        'Given value is not included in the accepted list of values'
      );
    }

    this.options.validators?.forEach((validator) => validator(value));

    Reflect.set(
      data,
      this.propertyName,
      serializeFieldValue(this.options, value)
    );
  }
}
