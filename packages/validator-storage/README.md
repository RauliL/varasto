# @varasto/validator-storage

[![npm][npm-image]][npm-url]

Implementation of [storage] that performs validation on the inserted data,
using [Zod] schemas.

[npm-image]: https://img.shields.io/npm/v/@varasto/validator-storage.svg
[npm-url]: https://npmjs.org/package/@varasto/validator-storage
[storage]: https://www.npmjs.com/package/@varasto/storage
[zod]: https://zod.dev

## Installation

```bash
$ npm install --save @varasto/validator-storage
```

## Usage

Validator storage acts as an wrapper for another storage. Before data is
allowed to be inserted into the wrapped storage, an validation is performed on
it against [Zod] schema that is mapped to an namespace.

Inserting data to an namespace that is not mapped to a schema is not allowed
and will result in `UnrecognizedNamespaceError`.

```TypeScript
import { z } from 'zod/v4';
import { createRemoteStorage } from '@varasto/remote-storage';
import { createValidatorStorage } from '@varasto/validator-storage';

const personSchema = z.object({
  name: z.string(),
  age: z.number().positive().int()
});

const taskSchema = z.object({
  title: z.string(),
  completed: z.boolean()
});

const namespaces = {
  people: personSchema,
  tasks: taskSchema
};

const remoteStorage = createRemoteStorage({ host: 'https://example.com' });
const validatorStorage = createValidatorStorage(remoteStorage, namespaces);

// This insertion will succeed because the given data matches with task schema.
await validatorStorage.set('tasks', 'eat', { title: 'Eat', done: false });

// This insertion will fail because the given data does not match with person
// schema.
await validatorStorage.set('people', 'john', { name: 'John', age: -5 });

// This insertion will fail because the namespace is not recognized.
await validatorStorage.set('stuff', 'junk', { description: 'Random junk.' });
```
