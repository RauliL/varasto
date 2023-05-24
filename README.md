# Varasto

Varasto is minimalistic namespaced key-value store that can store JSON objects
identified by namespace and key. Objects can be persisted on disk or remote
server.

Varasto comes with an [HTTP interface] that can be run as standalone server or
embedded to another [Express.js] application.

[http interface]: https://www.npmjs.com/package/@varasto/server
[express.js]: https://expressjs.com

## Storage backend implementations

| Package                        | Description                               |
| ------------------------------ | ----------------------------------------- |
| [@varasto/cache-storage]       | Acts as an cache for another storage.     |
| [@varasto/fs-storage]          | Persists data to hard disk.               |
| [@varasto/memory-storage]      | Data is stored in memory. No persistence. |
| [@varasto/multi-storage]       | Data is stored to multiple storages.      |
| [@varasto/remote-storage]      | Data is stored to remote server.          |
| [@varasto/redis-storage]       | Data is stored to [Redis].                |
| [@varasto/single-file-storage] | Data is stored to single file.            |
| [@varasto/single-sqlite]       | Data is stored to [SQLite] database.      |
| [@varasto/web-storage]         | Data is stored to browser storage.        |

[@varasto/cache-storage]: https://www.npmjs.com/package/@varasto/cache-storage
[@varasto/fs-storage]: https://www.npmjs.com/package/@varasto/fs-storage
[@varasto/memory-storage]: https://www.npmjs.com/package/@varasto/memory-storage
[@varasto/multi-storage]: https://www.npmjs.com/package/@varasto/multi-storage
[@varasto/remote-storage]: https://www.npmjs.com/package/@varasto/remote-storage
[@varasto/redis-storage]: https://www.npmjs.com/package/@varasto/redis-storage
[@varasto/single-file-storage]: https://www.npmjs.com/package/@varasto/single-file-storage
[@varasto/sqlite-storage]: https://www.npmjs.com/package/@varasto/sqlite-storage
[@varasto/web-storage]: https://www.npmjs.com/package/@varasto/web-storage
[redis]: https://redis.io
