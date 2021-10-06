# @varasto/query

Collection of useful query utilities for [Varasto storages] that use
[simple-json-match] schemas for finding entries.

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
findAll(
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<JsonObject[]>
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
): Promise<string[]>
```

Searches for entries from given namespace that match given schema and returns
their keys. If no entries match the given schema, empty array is returned
instead.

#### findAllEntries()

```TypeScript
findAllEntries(
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<[string, JsonObject][]>
```

Searches for entries from given namespace that match given schema and returns
them in an array. If no entries match the given schema, empty array is returned
instead.

### Partition utilities

#### partition()

```TypeScript
partition(
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<[JsonObject[], JsonObject[]]>
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
partitionEntries(
  storage: Storage,
  namespace: string,
  schema: Schema
): Promise<[[string, JsonObject][], [string, JsonObject][]]>
```

Splits entries from given namespace into two arrays depending on whether they
match the given schema. Entries that match the schema will be returned first
element of returned array, while the remaining entries will be second.
