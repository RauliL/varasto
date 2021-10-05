# @varasto/cache-storage

Implementation of an [storage] which acts as an cache for another storage.

[storage]: https://www.npmjs.com/package/@varasto/storage

## Installation

```sh
$ npm install --save @varasto/cache-storage
```

## Usage

The package provides an function called `createCacheStorage` which takes
another [Storage] instance as an argument, and optional argument which defines
<abbr title="Time to live">TTL</abbr> in milliseconds for cached entries. If
the TTL argument is omitted, entries are cached indefinitely.

```TypeScript
import { createCacheStorage } from '@varasto/cache-storage';
import { createRemoteStorage } from '@varasto/remote-storage';

const remoteStorage = createRemoteStorage({ url: 'https://example.com' });
// Time to live for cached entries is one minute, or 60000 milliseconds.
const cacheStorage = createCacheStorage(remoteStorage, 60 * 1000);

await remoteStorage.set('foo', 'bar', { value: 5 });

// Entry is not cached yet, so it's retrieved from the remote storage first.
await cacheStorage.get('foo', 'bar');

// This time the entry should come from the cache and not remote storage.
await cacheStorage.get('foo', 'bar');

setTimeout(async () => {
  // Previously cached entry should been expired now, so it's retrieved from
  // the remote storage and cached again.
  await cacheStorage.get('foo', 'bar');
}, 60 * 1000);
```
