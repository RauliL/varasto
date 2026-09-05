import { FieldDefault, OptionalFieldValue } from './types.js';

export const resolveFieldDefault = (
  defaultValue: FieldDefault | undefined
): OptionalFieldValue => {
  if (defaultValue === undefined) {
    return undefined;
  }

  if (typeof defaultValue === 'function') {
    return defaultValue();
  }

  return defaultValue;
};
