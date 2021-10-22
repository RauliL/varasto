# @varasto/storage

Type definitions for Varasto JSON key-value store.

## Installation

```shell
$ npm install --save @varasto/storage
```

## Usage

This package only provides TypeScript type definitions for Varasto storage
implementation and an custom JavaScript error class used to indicate that
an item identifier (either namespace or key) does not pass the slug validation.

Usually you don't need to use or install this package directly, but use an
storage implementation package instead. Below is an list of storage
implementations for different use cases.

| Name             | Description                             |
| ---------------- | --------------------------------------- |
| [cache-storage]  | Acts as an cache for another storage.   |
| [fs-storage]     | Stores data persistently to hard disk.  |
| [memory-storage] | Stores data to memory.                  |
| [multi-storage]  | Stores data to multiple other storages. |
| [remote-storage] | Stores data to remote server.           |
| [redis-storage]  | Stores data to [Redis].                 |
| [web-storage]    | Stores data to browser storage.         |

[cache-storage]: https://www.npmjs.com/package/@varasto/cache-storage
[fs-storage]: https://www.npmjs.com/package/@varasto/fs-storage
[memory-storage]: https://www.npmjs.com/package/@varasto/memory-storage
[multi-storage]: https://www.npmjs.com/package/@varasto/multi-storage
[remote-storage]: https://www.npmjs.com/package/@varasto/remote-storage
[redis-storage]: https://www.npmjs.com/package/@varasto/redis-storage
[web-storage]: https://www.npmjs.com/package/@varasto/web-storage
[redis]: https://redis.io

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

### Updating already existing item

```TypeScript
update(namespace: string, key: string, value: JsonObject): Promise<JsonObject>
```

Attempts to update an already existing item identified by `namespace` and `key`
by shallowly merging with the given new data. Returned promise will resolve
into the new value, or will fail if no such item exists.

### Testing whether an item exists or not

```TypeScript
has(namespace: string, key: string): Promise<boolean>
```

Returns `true` if an item identified by `namespace` and `key` exists in the
storage, or `false` if it doesn't. The promise will fail if an I/O error
occurs while testing whether item exists or not.

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
entries(namespace: string): Promise<[string, JsonObject][]>
```

Returns all items stored under an namespace, with the keys they are identified
by. The promise will fail if an I/O error occurs.
