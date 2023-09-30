# @varasto/memory-storage

[![npm][npm-image]][npm-url]

Implementation of an [storage] which stores values in memory instead of hard
disk or remote server.

[npm-image]: https://img.shields.io/npm/v/@varasto/memory-storage.svg
[npm-url]: https://npmjs.org/package/@varasto/memory-storage
[storage]: https://www.npmjs.com/package/@varasto/storage

Because it provides full storage implementation without persistence, it's
useful for writing test cases for libraries/applications that use Varasto
storages for storing data.

## Installation

```sh
$ npm install --save @varasto/memory-storage
```

## Usage

The package provides a class called `MemoryStorage` which is an implementation
of [Storage] type.

Basic usage of the API looks like this:

```TypeScript
import { MemoryStorage } from '@varasto/memory-storage';

const storage = new MemoryStorage();
```

Memory storage instance also has an additional `clear()` method that will
remove either all data from the storage, or items from specified namespace.

```TypeScript
storage.clear(); // Removes all data from the storage.

storage.clear('foo'); // Removes all items from namespace "foo".
```
