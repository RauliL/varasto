import matchImport, { Schema } from 'simple-json-match';

export type { Schema };

export const match = matchImport as unknown as (
  input: import('simple-json-match').JSONType,
  schema: Schema
) => boolean;
