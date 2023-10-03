# @varasto/storage

[![npm][npm-image]][npm-url]

Type definitions for Varasto JSON key-value store.

[npm-image]: https://img.shields.io/npm/v/@varasto/storage.svg
[npm-url]: https://npmjs.org/package/@varasto/storage

- [Installation](#installation)
- [Usage](#usage)
  - [Storing items](#storing-items)
  - [Retrieving items](#retrieving-items)
  - [Removing items](#removing-items)
  - [Searching for entries](#searching-for-entries)
  - [Updating already existing item](#updating-already-existing-item)
  - [Testing whether an item exists or not](#testing-whether-an-item-exists-or-not)
  - [Listing keys stored in a namespace](#listing-keys-stored-in-a-namespace)
  - [Listing values stored in a namespace](#listing-values-stored-in-a-namespace)
  - [Listing entries stored in a namespace](#listing-entries-stored-in-a-namespace)
  - [Filtering entries stored in a namespace](#filtering-entries-stored-in-a-namespace)
  - [Map operation](#map-operation)

## Installation

```shell
$ npm install --save @varasto/storage
```

## Usage

This package provides abstract base class for Varasto storage implementations
as well as error classes to indicate that an item identifier (either namespace
or key) does not pass the slug validation or that an item being updated does
not exist.

Usually you don't need to use or install this package directly, but use an
storage implementation package instead. Below is an list of storage
implementations for different use cases.

| Name                  | Description                               |
| --------------------- | ----------------------------------------- |
| [cache-storage]       | Acts as an cache for another storage.     |
| [fs-storage]          | Stores data persistently to hard disk.    |
| [memory-storage]      | Stores data to memory.                    |
| [multi-storage]       | Stores data to multiple other storages.   |
| [postgres-storage]    | Stores data to [PostgreSQL] database.     |
| [remote-storage]      | Stores data to remote server.             |
| [redis-storage]       | Stores data to [Redis].                   |
| [single-file-storage] | Stores data to a single file.             |
| [sqlite-storage]      | Stores data to [SQLite] database.         |
| [validator-storage]   | Acts as an validator for another storage. |
| [web-storage]         | Stores data to browser storage.           |

[cache-storage]: https://www.npmjs.com/package/@varasto/cache-storage
[fs-storage]: https://www.npmjs.com/package/@varasto/fs-storage
[memory-storage]: https://www.npmjs.com/package/@varasto/memory-storage
[multi-storage]: https://www.npmjs.com/package/@varasto/multi-storage
[postgres-storage]: https://www.npmjs.com/package/@varasto/postgres-storage
[remote-storage]: https://www.npmjs.com/package/@varasto/remote-storage
[redis-storage]: https://www.npmjs.com/package/@varasto/redis-storage
[single-file-storage]: https://www.npmjs.com/package/@varasto/single-file-storage
[sqlite-storage]: https://www.npmjs.com/package/@varasto/sqlite-storage
[validator-storage]: https://www.npmjs.com/package/@varasto/validator-storage
[web-storage]: https://www.npmjs.com/package/@varasto/web-storage
[postgresql]: https://www.postgresql.org
[redis]: https://redis.io
[sqlite]: https://www.sqlite.org/

### Storing items

```TypeScript
set<T extends JsonObject>(
  namespace: string,
  key: string,
  value: T
): Promise<void>
```

Attempts to store an item identified by `namespace` and `key`. Returned
promise will fail if an I/O error occurs while storing the item.

### Retrieving items

```TypeScript
get<T extends JsonObject>(
  namespace: string,
  key: string
): Promise<T | undefined>
```

Attempts to retrieve an item identified by `namespace` and `key`. Returned
promise will either resolve into the value, or `undefined` if item with the
given identifier does not exist. The promise will fail if an I/O error
occurs while retrieving the item.

### Removing items

```TypeScript
delete(
  namespace: string,
  key: string
): Promise<boolean>
```

Attempts to remove an item identified by `namespace` and `key`. Returned
promise will resolve into a boolean value which tells whether an value with
the given identifier existed or not. The promise will fail if an I/O error
occurs while removing the item.

### Searching for entries

```TypeScript
find<T extends JsonObject>(
  namespace: string,
  callback: (value: T, key: string) => boolean
): Promise<[string, T | undefined]>
```

Returns the first entry from specified namespace to which given callback
function returns `true` for, or `undefined` if the callback function does not
return `true` for any entry in the namespace.

The promise will fail if an I/O error occurs, or if given namespace is not a
valid slug.

### Updating already existing item

```TypeScript
update<T extends JsonObject>(
  namespace: string,
  key: string,
  value: Partial<T>
): Promise<T>
```

Attempts to update an already existing item identified by `namespace` and `key`
by shallowly merging with the given new data. Returned promise will resolve
into the new value, or will fail if no such item exists.

### Testing whether an item exists or not

```TypeScript
has(
  namespace: string,
  key: string
): Promise<boolean>
```

Returns `true` if an item identified by `namespace` and `key` exists in the
storage, or `false` if it doesn't. The promise will fail if an I/O error
occurs while testing whether item exists or not.

### Listing keys stored in a namespace

```TypeScript
keys(
  namespace: string
): AsyncGenerator<string>
```

Lists keys of all items stored under an namespace. The promise will fail if an
I/O error occurs while listing the keys.

### Listing values stored in a namespace

```TypeScript
values<T extends JsonObject>(
  namespace: string
): AsyncGenerator<T>
```

Lists all items stored under an namespace. The promise will fail if an I/O
error occurs.

### Listing entries stored in a namespace

```TypeScript
entries<T extends JsonObject>(
  namespace: string
): AsyncGenerator<[string, T]>
```

Lists all items stored under an namespace, with the keys they are identified
by. The promise will fail if an I/O error occurs.

### Filtering entries stored in a namespace

```TypeScript
filter<T extends JsonObject>(
  namespace: string,
  callback: (value: T, key: string) => boolean
): AsyncGenerator<[string, T]>
```

Goes through all entries from the given namespace, returning ones for which
the given callback functions returns `true` for.

The promise will fail if an I/O error occurs, or if given namespace is not a
valid slug.

### Map operation

```TypeScript
map<T extends JsonObject, U extends JsonObject>(
  namespace: string,
  callback: (value: T, key: string) => U
): AsyncGenerator<[string, U]>
```

Goes through all entries from the given namespace, passing them to the given
callback function and returning whatever the callback function returned.

The promise will fail if an I/O error occurs, or if given namespace is not a
valid slug.
