export type FieldType = 'boolean' | 'date' | 'number' | 'string';

export type FieldValue = boolean | Date | number | string;

export type OptionalFieldValue = FieldValue | null | undefined;

export type FieldConstructor =
  BooleanConstructor | DateConstructor | NumberConstructor | StringConstructor;

export type Validator = (value: OptionalFieldValue) => void;
