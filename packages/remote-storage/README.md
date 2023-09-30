# @varasto/remote-storage

[![npm][npm-image]][npm-url]

Storage implementation which retrieves and stores data to an [remote server].
Uses [axios] library as it's HTTP client and works both in Node.js and browser
environments.

[npm-image]: https://img.shields.io/npm/v/@varasto/storage.svg
[npm-url]: https://npmjs.org/package/@varasto/storage
[remote server]: https://www.npmjs.com/package/@varasto/server
[axios]: https://www.npmjs.com/package/axios

## Installation

```sh
$ npm install --save @varasto/remote-storage
```

## Usage

[![npm][npm-image]][npm-url]

The package provies an function called `createRemoteStorage` which returns an
object that is an implementation of [Storage] type and works as an Varasto HTTP
API client.

[npm-image]: https://img.shields.io/npm/v/@varasto/remote-storage.svg
[npm-url]: https://npmjs.org/package/@varasto/remote-storage
[storage]: https://www.npmjs.com/package/@varasto/storage

Basic usage of the API looks like this:

```TypeScript
import { createRemoteStorage } from '@varasto/remote-storage';

const storage = createRemoteStorage({ url: 'https://example.com/api/' });
```

The function takes an configuration object, which supports these settings:

| Property | Default value         | Description                             |
| -------- | --------------------- | --------------------------------------- |
| `url`    | `http://0.0.0.0:3000` | URL where the API can be accessed from. |
| `auth`   |                       | Optional authentication credentials.    |

The `auth` setting, when used, should be a simple object containing `username`
and `password` properties.

```TypeScript
const storage = createRemoteStorage({
  auth: {
    username: 'AzureDiamond',
    password: 'hunter2'
  }
});
```
