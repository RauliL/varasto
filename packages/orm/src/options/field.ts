/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldType } from '../types';

/**
 * Various options that can be passed to an model field.
 */
export type FieldOptions = {
  /**
   * Array of values that are valid choices for the field.
   */
  choices?: any[];

  /**
   * Default value for the field that will be used when the model instance is
   * stored and the field's value is `undefined`.
   */
  default?: boolean | number | string | null;

  /**
   * Type of the field. If omitted, it will be determined from the property
   * declaration.
   */
  type?: FieldType;

  /**
   * Array of validator functions that throw `ValidationError` if the given
   * value does not pass the validation.
   */
  validators?: Array<(value: any) => void>;
};
