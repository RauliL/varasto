import { Class } from 'type-fest';

export type ScalarFieldType = 'boolean' | 'date' | 'number' | 'string';

export type FieldType =
  ScalarFieldType | `${ScalarFieldType}[]` | 'embedded' | 'embedded[]';

export type ScalarFieldValue = boolean | Date | number | string;

export type FieldValue =
  ScalarFieldValue | ScalarFieldValue[] | object | object[];

export type OptionalFieldValue = FieldValue | null | undefined;

export type FieldConstructor =
  BooleanConstructor | DateConstructor | NumberConstructor | StringConstructor;

export type EmbeddedClass = Class<object>;

export type Validator = (value: OptionalFieldValue) => void;
