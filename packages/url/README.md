# @varasto/url

[![npm][npm-image]][npm-url]

Allows connecting to various types of [Varasto storages] based on [URL].

[npm-image]: https://img.shields.io/npm/v/@varasto/cli.svg
[npm-url]: https://npmjs.org/package/@varasto/cli
[Varasto storages]: https://www.npmjs.com/package/@varasto/storage
[URL]: https://en.wikipedia.org/wiki/URL

## Installation

```sh
$ npm install --save @varasto/url
```

## Usage

The package provides an function called `open` which takes URL as an argument
and returns [promise] that resolves into Varasto storage, based on the contents
of the given URL.

[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise

```TypeScript
import { open } from '@varasto/url';

const storage = await open('file:///path/to/storage/data');

await storage.set('foo', 'bar', { baz: 1 });
```

### Supported protocols

| Protocol            | Example                                       | Storage implementation      |
| ------------------- | --------------------------------------------- | --------------------------- |
| `file`              | `file://./directory`                          | [@varasto/fs-storage]       |
| `http`, `https`     | `https://user:pass@localhost:8080/`           | [@varasto/remote-storage]   |
| `memory`            | `memory://`                                   | [@varasto/memory-storage]   |
| `postgres`          | `postgres://user:pass@localhost:381/database` | [@varasto/postgres-storage] |
| `redis`             | `redis://1`                                   | [@varasto/redis-storage]    |
| `sqlite`, `sqlite3` | `sqlite://file.sqlite`                        | [@varasto/sqlite-storage]   |

[@varasto/fs-storage]: https://www.npmjs.com/package/@varasto/fs-storage
[@varasto/memory-storage]: https://www.npmjs.com/package/@varasto/memory-storage
[@varasto/postgres-storage]: https://www.npmjs.com/package/@varasto/postgres-storage
[@varasto/remote-storage]: https://www.npmjs.com/package/@varasto/remote-storage
[@varasto/redis-storage]: https://www.npmjs.com/package/@varasto/redis-storage
[@varasto/sqlite-storage]: https://www.npmjs.com/package/@varasto/sqlite-storage
