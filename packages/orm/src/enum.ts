import { ConfigurationError } from './error.js';
import { OptionalFieldValue } from './types.js';

export type EnumObject = Record<string, string | number>;

export const isEnumReference = (value: unknown): value is EnumObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Returns the runtime values of a TypeScript enum object, omitting reverse
 * mapping entries present in numeric enums.
 */
export const getEnumValues = (
  enumObject: EnumObject
): Array<string | number> =>
  Object.entries(enumObject)
    .filter(([key]) => Number.isNaN(Number(key)))
    .map(([, value]) => value);

export const applyEnumConfiguration = (options: {
  choices?: OptionalFieldValue[];
  enum?: EnumObject;
}): void => {
  if (!options.enum) {
    return;
  }

  const values = getEnumValues(options.enum);

  if (values.length === 0) {
    throw new ConfigurationError('Enum has no values');
  }

  if (!options.choices) {
    options.choices = values;
  }
};
