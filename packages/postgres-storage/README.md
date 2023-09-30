# @varasto/postgres-storage

[![npm][npm-image]][npm-url]

Implementation of [storage] which stores data into [PostgreSQL] database. Still
considered to be somewhat experimental.

The way it works is that each namespace is an table in the database, and each
entry in the database is a row in that table with a key and JSON value.

Library called [pg] is used to communicate with the PostgreSQL server.

[npm-image]: https://img.shields.io/npm/v/@varasto/postgres-storage.svg
[npm-url]: https://npmjs.org/package/@varasto/postgres-storage
[storage]: https://www.npmjs.com/package/@varasto/storage
[postgresql]: https://www.postgresql.org/
[pg]: https://www.npmjs.com/package/pg

## Installation

```shell
$ npm install --save @varasto/postgres-storage
```

## Usage

The package provides an function called `createPostgresStorage` which takes an
PostgreSQL client as an argument. The function then returns an storage
implementation which is capable of storing JSON objects into the database,
where each value is identified by _namespace_ and _key_ that must be [valid URL
slugs].

[valid url slugs]: https://ihateregex.io/expr/url-slug/

```TypeScript
import { Client } from 'pg';
import { createPostgresStorage } from '@varasto/postgres-storage';

const client = new Client({
  user: 'dbuser',
  host: 'database.server.com',
  database: 'mydb',
  password: 'secretpassword',
  port: 3211,
});

await client.connect();

const storage = createPostgresStorage(client);
```

The function takes an optional configuration object, which supports these
settings:

| Property          | Default value | Description                                                                                           |
| ----------------- | ------------- | ----------------------------------------------------------------------------------------------------- |
| `dropEmptyTables` | `false`       | If `true`, once an namespace is detected to be empty, it's associated table is automatically dropped. |
