import { Class } from 'type-fest';

import { EnumObject } from './enum.js';

export type ScalarFieldType = 'boolean' | 'date' | 'number' | 'string';

export type FieldType =
  | ScalarFieldType
  | `${ScalarFieldType}[]`
  | 'embedded'
  | 'embedded[]'
  | 'enum'
  | 'enum[]';

export type ScalarFieldValue = boolean | Date | number | string;

export type FieldValue =
  ScalarFieldValue | ScalarFieldValue[] | object | object[];

export type OptionalFieldValue = FieldValue | null | undefined;

export type FieldConstructor =
  BooleanConstructor | DateConstructor | NumberConstructor | StringConstructor;

export type EmbeddedClass = Class<object>;

export type { EnumObject };

export type Validator = (value: OptionalFieldValue) => void;
