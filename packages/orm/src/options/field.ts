import {
  EmbeddedClass,
  EnumObject,
  FieldType,
  OptionalFieldValue,
  ScalarFieldType,
  Validator,
} from '../types.js';

/**
 * Various options that can be passed to an model field.
 */
export type FieldOptions = {
  /**
   * Array of values that are valid choices for the field.
   */
  choices?: OptionalFieldValue[];

  /**
   * Default value for the field that will be used when the model instance is
   * stored and the field's value is `undefined`.
   */
  default?: OptionalFieldValue;

  /**
   * TypeScript enum object whose values are accepted for the field. When given,
   * allowed values are derived automatically unless `choices` is also set.
   */
  enum?: EnumObject;

  /**
   * Element type for array fields. Use a scalar field type for primitive arrays
   * or an embedded class for arrays of embedded objects.
   */
  items?: EmbeddedClass | ScalarFieldType;

  /**
   * Embedded class for single embedded object fields.
   */
  of?: EmbeddedClass;

  /**
   * Type of the field. If omitted, it will be determined from the property
   * declaration.
   */
  type?: FieldType;

  /**
   * Array of validator functions that throw `ValidationError` if the given
   * value does not pass the validation.
   */
  validators?: Validator[];
};
