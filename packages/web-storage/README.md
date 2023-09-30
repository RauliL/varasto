# @varasto/web-storage

[![npm][npm-image]][npm-url]

Implementation of an [Varasto storage] which stores values in browser's
[local storage] or [session storage].

[npm-image]: https://img.shields.io/npm/v/@varasto/web-storage.svg
[npm-url]: https://npmjs.org/package/@varasto/web-storage
[varasto storage]: https://www.npmjs.com/package/@varasto/storage
[local storage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
[session storage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage

## Installation

```shell
$ npm install --save @varasto/web-storage
```

## Usage

The package provides an function called `createWebStorage` which takes an
[Storage] object as an argument.

[storage]: https://developer.mozilla.org/en-US/docs/Web/API/Storage

```TypeScript
import { createWebStorage } from '@varasto/web-storage';

const storage = createWebStorage(window.sessionStorage);
```

### Custom serializers

By default, [JSON.stringify] is used for serializing data passed to the Web
storage and [JSON.parse] is used for deserializing data retrieved from the
Web storage. However, you can also use your own custom serialization functions
by passing them as options to the `WebStorage` constructor.

[json.stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
[json.parse]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse

```TypeScript
import { createWebStorage } from '@varasto/web-storage';
import { JsonObject } from 'type-fest';

const storage = createWebStorage(window.sessionStorage, {
  serialize: (data: string): JsonObject => ({}),
  deserialize: (data: JsonObject): string => "",
});
```
