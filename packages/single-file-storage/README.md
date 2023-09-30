# @varasto/single-file-storage

[![npm][npm-image]][npm-url]

Implementation of [storage] which stores all data into a single file, in
[flat-file database] kind of fashion. Because of it's design, it's quite
inefficient way of storing data and [fs-storage] should be used instead
whenever possible.

[npm-image]: https://img.shields.io/npm/v/@varasto/single-file-storage.svg
[npm-url]: https://npmjs.org/package/@varasto/single-file-storage
[storage]: https://www.npmjs.com/package/@varasto/storage
[flat-file database]: https://en.wikipedia.org/wiki/Flat-file_database
[fs-storage]: https://www.npmjs.com/package/@varasto/fs-storage

## Installation

```shell
$ npm install --save @varasto/single-file-storage
```

## Usage

The package provides an function called `createSingleFileStorage`, which
returns an storage implementation that is capable of storing JSON objects
into disk, where each object is identified by _namespace_ and _key_, that
must be [valid URL slugs]. These objects are then combined into single
large JSON object that is stored to an file on disk.

[valid url slugs]: https://ihateregex.io/expr/url-slug/

Basic usage of single file storage looks like this:

```TypeScript
import { createSingleFileStorage } from '@varasto/single-file-storage';

const storage = createSingleFileStorage({ path: './data.json' });
```

The function takes an optional configuration object, which supports these
settings:

| Property   | Default value | Description                                              |
| ---------- | ------------- | -------------------------------------------------------- |
| `path`     | `./data.json` | Path to the file where data will be stored into.         |
| `encoding` | `utf-8`       | Character encoding to use when data is stored into disk. |

If `path` does not exist, it will be created when an item is placed into the storage.

### Custom serializers

By default, [JSON.stringify] is used for serializing data written to file
system and [JSON.parse] is used for deserializing data retrieved from file
system. However, you can also use your own custom serialization functions
by passing them as options to the `createSingleFileStorage` function.

[json.stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
[json.parse]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse

```TypeScript
import { createSingleFileStorage } from '@varasto/single-file-storage';
import { JsonObject } from 'type-fest';

const storage = createSingleFileStorage({
  serialize: (data: string): JsonObject => ({}),
  deserialize: (data: JsonObject): string => "",
});
```
