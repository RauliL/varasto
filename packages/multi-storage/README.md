# @varasto/multi-storage

[![npm][npm-image]][npm-url]

[Storage] implementation which routes namespaces to one or more other storage
instances using [picomatch] patterns.

[npm-image]: https://img.shields.io/npm/v/@varasto/multi-storage.svg
[npm-url]: https://npmjs.org/package/@varasto/multi-storage
[storage]: https://www.npmjs.com/package/@varasto/storage
[picomatch]: https://github.com/micromatch/picomatch

## Installation

```shell
$ npm install --save @varasto/multi-storage
```

## Usage

The package provides a function called `createMultiStorage` which takes a
configuration object that maps namespace patterns to storage instances. Patterns
are matched with [picomatch]; the first matching pattern wins.

```TypeScript
import { createMemoryStorage } from '@varasto/memory-storage';
import { createMultiStorage } from '@varasto/multi-storage';

const usersStorage = createMemoryStorage();
const postsStorage = createMemoryStorage();
const postsReplica = createMemoryStorage();
const fallbackStorage = createMemoryStorage();

const multiStorage = createMultiStorage({
  users: usersStorage,
  'posts-*': [postsStorage, postsReplica],
  '*': fallbackStorage,
});

// Routed to `usersStorage`.
await multiStorage.set('users', '1', { name: 'Alice' });

// Routed to both `postsStorage` and `postsReplica`.
await multiStorage.set('posts-123', '1', { title: 'Hello' });

// Routed to `fallbackStorage`.
await multiStorage.set('other', '1', { value: 5 });
```

When a pattern maps to an array of storages, reads are merged across them and
writes/updates/deletes are applied to all of them. If no pattern matches the
namespace, the operation is a no-op (and `update` rejects with
`ItemDoesNotExistError`).
