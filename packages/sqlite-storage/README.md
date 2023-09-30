# @varasto/sqlite-storage

[![npm][npm-image]][npm-url]

Implementation of [storage] which stores data into [SQLite] database.

Each namespace in the storage is an table in the database, with following kind
of schema:

```SQL
CREATE TABLE IF NOT EXISTS "namespace" (
  key TEXT NOT NULL PRIMARY KEY,
  value TEXT NOT NULL,
  UNIQUE (key) ON CONFLICT REPLACE
)
```

[npm-image]: https://img.shields.io/npm/v/@varasto/sqlite-storage.svg
[npm-url]: https://npmjs.org/package/@varasto/sqlite-storage
[storage]: https://www.npmjs.com/package/@varasto/storage
[sqlite]: https://www.sqlite.org/

## Installation

```shell
$ npm install --save @varasto/sqlite-storage
```

## Usage

The package provides an function called `createSqliteStorage`, which takes an
SQLite database instance provided by [SQLite](node-sqlite) library as argument.
The function then returns an storage implementation that is capable of storing
JSON objects into the database, where each value is identified by _namespace_
and _key_, that must be [valid URL slugs].

[node-sqlite]: https://github.com/kriasoft/node-sqlite
[valid url slugs]: https://ihateregex.io/expr/url-slug/

Basic usage of SQLite storage looks like this:

```TypeScript
import { createSqliteStorage } from '@varasto/sqlite-storage';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { JsonObject } from 'type-fest';

const database = await open({
  filename: './data.db',
  driver: sqlite3.Database,
});
const storage = createSqliteStorage(database);
```

The function also takes an optional configuration object, which supports these
settings:

| Property          | Default value | Description                                                                                           |
| ----------------- | ------------- | ----------------------------------------------------------------------------------------------------- |
| `dropEmptyTables` | `false`       | If `true`, once an namespace is detected to be empty, it's associated table is automatically dropped. |

### Custom serializers

By default, [JSON.stringify] is used for serializing data written to file
system and [JSON.parse] is used for deserializing data retrieved from file
system. However, you can also use your own custom serialization functions
by passing them as options to the `createSqliteStorage` function.

[json.stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
[json.parse]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse

```TypeScript
const storage = createSqliteStorage(
  database,
  {
    serialize: (data: string): JsonObject => ({}),
    deserialize: (data: JsonObject): string => "",
  }
);
```
