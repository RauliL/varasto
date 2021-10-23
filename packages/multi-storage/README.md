# @varasto/multi-storage

[Storage] implementation which retrieves and stores data to multiple other
storage instances.

[storage]: https://www.npmjs.com/package/@varasto/storage

## Installation

```shell
$ npm install --save @varasto/multi-storage
```

## Usage

The package provides an function called `createMultiStorage` which takes
multiple other storage instances as arguments. Data is retrieved from and
stored to storages given as arguments.

```TypeScript
import { createMemoryStorage } from '@varasto/memory-storage';
import { createMultiStorage } from '@varasto/multi-storage';

const storage1 = createMemoryStorage();
const storage2 = createMemoryStorage();

const multiStorage = createMultiStorage(storage1, storage2);

// This will insert the entry to both `storage1` and `storage2`.
await multiStorage.set('foo', 'bar', { value: 5 });
```
