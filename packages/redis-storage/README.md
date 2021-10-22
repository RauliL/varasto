# @varasto/redis-storage

Implementation of [storage] that uses [Redis] as backend for storing data.

[storage]: https://www.npmjs.com/package/@varasto/storage
[redis]: https://redis.io

## Installation

```shell
$ npm install --save @varasto/redis-storage
```

## Usage

The package provides an function called `createRedisStorage` which takes an
Redis client as an argument.

```TypeScript
import { createClient } from 'redis';
import { createRedisStorage } from '@varasto/redis-storage';

const client = createClient({ host: 'example.com' });
const storage = createRedisStorage(client);
```

### Custom serializers

By default, [JSON.stringify] is used for serializing data passed to Redis and
[JSON.parse] is used for deserializing coming from Redis. However you can also
use your own custom serialization functions by passing them as options to the
`createRedisStorage` function.

[json.stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
[json.parse]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse

```TypeScript
import { createClient } from 'redis';
import { createRedisStorage } from '@varasto/redis-storage';
import { JsonObject } from 'type-fest';

const client = createClient({ host: 'example.com' });
const storage = createRedisStorage(client, {
  serialize: (data: string): JsonObject => {},
  deserialize: (data: JsonObject): string => "",
});
```
