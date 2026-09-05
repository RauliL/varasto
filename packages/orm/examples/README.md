# @varasto/orm examples

Runnable examples demonstrating array fields, embedded types, enumerations,
and date validation.

## Prerequisites

Build the ORM package first:

```bash
cd packages/orm
yarn build
```

## Running an example

From `packages/orm`:

```bash
npx tsx --tsconfig examples/tsconfig.json examples/scalar-arrays.ts
npx tsx --tsconfig examples/tsconfig.json examples/embedded-arrays.ts
npx tsx --tsconfig examples/tsconfig.json examples/enums.ts
npx tsx --tsconfig examples/tsconfig.json examples/date-validators.ts
```

## Examples

| File | Description |
| --- | --- |
| `scalar-arrays.ts` | Arrays of strings, numbers, and dates |
| `embedded-arrays.ts` | Embedded classes in single fields and arrays |
| `enums.ts` | String and numeric enums, including enum arrays |
| `date-validators.ts` | Date fields with min/max validators |
