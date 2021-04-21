# @varasto/client

Node.js client library for Varasto JSON key-value store. Uses [axios] for
connecting to the server. Can be used both in Node.js as well as browser
environments. Even though Varasto API is a simple CRUD that can be used
with any HTTP client, this library provides simpler way to use it, as well
as nice TypeScript support.

[axios]: https://github.com/axios/axios

## Installation

```bash
$ npm install --save @varasto/client
```

## Usage

The package provides an function called `createClient`, which returns an
object that is capable of accessing an Varasto HTTP API.

Basic usage of the API client looks like this:

```TypeScript
import { createClient } from '@varasto/client';

const client = createClient({ url: 'https://example.com/api/' });
```

The function takes an optional configuration object, which supports these
settings:

| Property | Default value         | Description                             |
| -------- | --------------------- | --------------------------------------- |
| `url`    | `http://0.0.0.0:3000` | URL where the API can be accessed from. |
| `auth`   |                       | Optional authentication credentials.    |

The `auth` setting, when used, should be a simple object containing `username`
and `password` properties.

```TypeScript
const client = createClient({
  auth: {
    username: 'AzureDiamond',
    password: 'hunter2'
  }
});
```

### Storing items

```TypeScript
set(namespace: string, key: string, value: JsonObject): Promise<JsonObject>
```

Attempts to connect to the server and store an item identified by `namespace`
and `key`.

### Retrieving items

```TypeScript
get(namespace: string, key: string): Promise<JsonObject|undefined>
```

Attempts to connect to the server and retrieve an item identified by
`namespace` and `key`. Returned promise will resolve into value of the item,
or `undefined` if the item does not exist.

### Updating items

```TypeScript
patch(namespace: string, key: string, value: JsonObject): Promise<JsonObject|undefined>
```

Attempts to connect to the server and perform an partial update to an item
identified by `namespace` and `key`. Returned promise will resolve into value
of the updated item after the update, or `undefined` if the item does not
exist.

### Removing items

```TypeScript
delete(name: string, key: string): Promise<JsonObject|undefined>
```

Attempts to connect to the server and remove an item identified by `namespace`
and `key`. Returned promise will resolve into value of the removed item, or
`undefined` if the item does not exist.

### Listing entries stored in a namespace

```TypeScript
list(namespace: string): Promise<{ [key: string]: JsonObject }>
```

Attempts to connect to the server and retrieve all items from `namespace`.
Returned promise will be an record where each key of an item is mapped to the
value of the item.
