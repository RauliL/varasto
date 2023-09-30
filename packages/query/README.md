# @varasto/query

[![npm][npm-image]][npm-url]

Collection of useful query and bulk operation utilities for [Varasto storages]
that use [simple-json-match] schemas for finding entries.

[npm-image]: https://img.shields.io/npm/v/@varasto/query.svg
[npm-url]: https://npmjs.org/package/@varasto/query
[varasto storages]: https://www.npmjs.com/package/@varasto/storage
[simple-json-match]: https://www.npmjs.com/package/simple-json-match

## Installation

```sh
$ npm install --save @varasto/query
```

## Usage

The package provides following functions.

### Searching for single entry

#### find()

```TypeScript
find(
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<JsonObject | undefined>
```

Searches for an entry from given namespace that matches given schema and
returns value of first matching result. If no entry in the namespace matches
the schema, `undefined` is returned instead.

#### findKey()

```TypeScript
findKey(
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<string | undefined>
```

Searches for an entry from given namespace that matches given schema and
returns key of first matching result. If no entry in the namespace matches
the schema, `undefined` is returned instead.

#### findEntry()

```TypeScript
findEntry(
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<[string, JsonObject] | undefined>
```

Searches for an entry from given namespace that matches given schema and
returns both key and value of first matching result. If no entry in the
namespace matches the schema, `undefined` is returned instead.

### Searching for multiple entries

#### findAll()

```TypeScript
findAll<T extends JsonObject>(
  storage: Storage,
  namespace: string,
  schema: Schema
): AsyncGenerator<T>
```

Searches for entries from given namespace that match given schema and returns
their values. If no entries match the given schema, empty array is returned
instead.

#### findAllKeys()

```TypeScript
findAllKeys(
  storage: Storage,
  namespace: string,
  schema: Schema
): AsyncGenerator<string>
```

Searches for entries from given namespace that match given schema and returns
their keys. If no entries match the given schema, empty array is returned
instead.

#### findAllEntries()

```TypeScript
findAllEntries<T extends JsonObject>(
  storage: Storage,
  namespace: string,
  schema: Schema
): AsyncGenerator<[string, T]>
```

Searches for entries from given namespace that match given schema and returns
them in an array. If no entries match the given schema, empty array is returned
instead.

### Partition utilities

#### partition()

```TypeScript
partition<T extends JsonObject>(
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<[T[], T[]]>
```

Splits values of entries from given namespace into two arrays depending on
whether they match the given schema. Entries that match the schema will be
returned first element of returned array, while the remaining entries will
be second.

#### partitionKeys()

```TypeScript
partitionKeys(
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<[string[], string[]]>
```

Splits keys of entries from given namespace into two arrays depending on
whether they match the given schema. Entries that match the schema will be
returned first element of returned array, while the remaining entries will
be second.

#### partitionEntries()

```TypeScript
partitionEntries<T extends JsonObject>(
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<[[string, T][], [string, T][]]>
```

Splits entries from given namespace into two arrays depending on whether they
match the given schema. Entries that match the schema will be returned first
element of returned array, while the remaining entries will be second.

### Bulk operations

#### updateAll()

```TypeScript
updateAll<T extends JsonObject>(
  storage: Storage,
  namespace: string,
  schema: Schema,
  value: Partial<T>
): AsyncGenerator<T>
```

Performs an bulk update where all entries from given namespace that match the
given schema are partially updated with given value. Returns updated values or
empty array if no entry matched the given schema.

#### updateAllEntries()

```TypeScript
updateAllEntries<T extends JsonObject>(
  storage: Storage,
  namespace: string,
  schema: Schema,
  value: Partial<T>
): AsyncGenerator<[string, T]>
```

Performs an bulk update where all entries from given namespace that match the
given schema are partially updated with given value. Returns updated entries
(key and value) or empty array if no entry matched the given schema.

#### deleteAll()

```TypeScript
deleteAll(
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<number>
```

Performs an bulk deletion where all entries from the given namespace that match
the given schema are deleted. Returns total number of deleted entries or 0 if
no entry matched the given schema.
