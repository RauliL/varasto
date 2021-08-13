# @varasto/fs-storage

Implementation of [storage] which stores data to hard disk.

[storage]: https://www.npmjs.com/package/@varasto/storage

## Installation

```sh
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
