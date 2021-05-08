# @varasto/storage

Low level API for the Varasto JSON key-value store.

## Installation

```bash
$ npm install --save @varasto/storage
```

## Usage

The package provides an function called `createStorage`, which returns an
object that is capable of storing JSON objects into disk, where each object
is identified by _namespace_ and _key_, that must be [valid URL slugs].

[valid url slugs]: https://ihateregex.io/expr/url-slug/

Basic usage of storage looks like this:

```TypeScript
import { createStorage } from '@varasto/storage';

const storage = createStorage({ dir: './data' });
```

The function takes an optional configuration object, which supports these
settings:

| Property   | Default value | Description                                                    |
| ---------- | ------------- | -------------------------------------------------------------- |
| `dir`      | `./data`      | Directory where the items will be persisted into.              |
| `encoding` | `utf-8`       | Character encoding to use when items are stored onto the disk. |

If `dir` does not exist, it will be created when an item is stored into the
storage.

### Storing items

```TypeScript
set(namespace: string, key: string, value: JsonObject): Promise<void>
```

Attempts to store an item identified by `namespace` and `key`. Returned
promise will fail if an I/O error occurs while storing the item.

### Retrieving items

```TypeScript
get(namespace: string, key: string): Promise<JsonObject|undefined>
```

Attempts to retrieve an item identified by `namespace` and `key`. Returned
promise will either resolve into the value, or `undefined` if item with the
given identifier does not exist. The promise will fail if an I/O error
occurs while retrieving the item.

### Removing items

```TypeScript
delete(namespace: string, key: string): Promise<boolean>
```

Attempts to remove an item identified by `namespace` and `key`. Returned
promise will resolve into a boolean value which tells whether an value with
the given identifier existed or not. The promise will fail if an I/O error
occurs while removing the item.

### Listing keys stored in a namespace

```TypeScript
keys(namespace: string): Promise<string[]>
```

Returns keys of all items stored under an namespace. The promise will fail if
an I/O error occurs while listing the keys.

### Listing values stored in a namespace

```TypeScript
values(namespace: string): Promise<JsonObject[]>
```

Returns all items stored under an namespace. The promise will fail if an I/O
error occurs.

### Listing entries stored in a namespace

```TypeScript
values(namespace: string): Promise<[string, JsonObject][]>
```

Returns all items stored under an namespace, with the keys they are identified
by. The promise will fail if an I/O error occurs.
