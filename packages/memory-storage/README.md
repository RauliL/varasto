# @varasto/memory-storage

Implementation of an [storage] which stores values in memory instead of hard
disk or remote server.

[storage]: https://www.npmjs.com/package/@varasto/storage

Because it provides full storage implementation without persistence, it's
useful for writing test cases for libraries/applications that use Varasto
storages for storing data.

## Installation

```sh
$ npm install --save @varasto/memory-storage
```

## Usage

The package provides an function called `createMemoryStorage` which returns an
object that is implementation of [Storage] type.

Basic usage of the API looks like this:

```TypeScript
import { createMemoryStorage } from '@varasto/memory-storage';

const storage = createMemoryStorage();
```

Memory storage instance also has an additional `clear()` method that will
remove either all data from the storage, or items from specified namespace.

```TypeScript
storage.clear(); // Removes all data from the storage.

storage.clear('foo'); // Removes all items from namespace "foo".
```
