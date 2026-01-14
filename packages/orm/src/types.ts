export type FieldType = 'boolean' | 'number' | 'string';

export type FieldValue = boolean | number | string;

export type OptionalFieldValue = FieldValue | null | undefined;

export type FieldConstructor =
  BooleanConstructor | NumberConstructor | StringConstructor;

export type Validator = (value: OptionalFieldValue) => void;
