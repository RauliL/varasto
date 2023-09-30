# @varasto/fs-storage

[![npm][npm-image]][npm-url]

Implementation of [storage] which stores data to hard disk.

[npm-image]: https://img.shields.io/npm/v/@varasto/fs-storage.svg
[npm-url]: https://npmjs.org/package/@varasto/fs-storage
[storage]: https://www.npmjs.com/package/@varasto/storage

## Installation

```shell
$ npm install --save @varasto/fs-storage
```

## Usage

The package provides an function called `createFileSystemStorage`, which
returns an storage implementation that is capable of storing JSON objects
into disk, where each object is identified by _namespace_ and _key_, that
must be [valid URL slugs].

[valid url slugs]: https://ihateregex.io/expr/url-slug/

Basic usage of file system storage looks like this:

```TypeScript
import { createFileSystemStorage } from '@varasto/fs-storage';

const storage = createFileSystemStorage({ dir: './data' });
```

The function takes an optional configuration object, which supports these
settings:

| Property   | Default value | Description                                                |
| ---------- | ------------- | ---------------------------------------------------------- |
| `dir`      | `./data`      | Directory where the items will be persisted into.          |
| `encoding` | `utf-8`       | Character encoding to use when items are stored into disk. |

If `dir` does not exist, it will be created when an item is placed into the storage.

### Custom serializers

By default, [JSON.stringify] is used for serializing data written to file
system and [JSON.parse] is used for deserializing data retrieved from file
system. However, you can also use your own custom serialization functions
by passing them as options to the `createFileSystemStorage` function.

[json.stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
[json.parse]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse

```TypeScript
import { createFileSystemStorage } from '@varasto/fs-storage';
import { JsonObject } from 'type-fest';

const storage = createFileSystemStorage({
  serialize: (data: string): JsonObject => ({}),
  deserialize: (data: JsonObject): string => "",
});
```
