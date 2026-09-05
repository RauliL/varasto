export type ScalarFieldType = 'boolean' | 'date' | 'number' | 'string';

export type FieldType = ScalarFieldType | `${ScalarFieldType}[]`;

export type ScalarFieldValue = boolean | Date | number | string;

export type FieldValue = ScalarFieldValue | ScalarFieldValue[];

export type OptionalFieldValue = FieldValue | null | undefined;

export type FieldConstructor =
  BooleanConstructor | DateConstructor | NumberConstructor | StringConstructor;

export type Validator = (value: OptionalFieldValue) => void;
