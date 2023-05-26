# @varasto/validator-storage

Implementation of [storage] that performs validation on the inserted data,
using [Yup] schemas.

[storage]: https://www.npmjs.com/package/@varasto/storage
[yup]: https://github.com/jquense/yup

## Installation

```bash
$ npm install --save @varasto/validator-storage
```

## Usage

Validator storage acts as an wrapper for another storage. Before data is
allowed to be inserted into the wrapped storage, an validation is performed on
it against Yup schema that is mapped to an namespace.

Inserting data to an namespace that is not mapped to a schema is not allowed
and will result in `UnrecognizedNamespaceError`.

```TypeScript
import * as Yup from 'yup';
import { createRemoteStorage } from '@varasto/remote-storage';
import { createValidatorStorage } from '@varasto/validator-storage';

const personSchema = Yup.object({
  name: Yup.string().required(),
  age: Yup.number().required().positive().integer()
});

const taskSchema = Yup.object({
  title: Yup.string().required(),
  completed: Yup.boolean().required()
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
